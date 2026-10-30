import { prisma } from './db';
import { journeys } from './intelligence';
import { formatRelativeTime, getReadableEventName } from './customer-memory';

export interface GeminiAnswerResult {
  ok: boolean;
  answer: string;
  model: string;
  sources?: Array<{ type: string; title: string; detail: string }>;
  contextStats?: {
    usersCount: number;
    eventsCount: number;
    stalledCount: number;
  };
  error?: string;
}

/**
 * Queries Google Gemini 2.5 Flash over the live ground-truth telemetry
 * and customer memory stored for a project in PostgreSQL.
 */
export async function askGeminiAboutData(
  projectId: string,
  question: string
): Promise<GeminiAnswerResult> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();

  if (!apiKey) {
    return {
      ok: false,
      answer: 'Gemini API key is not configured. Please add GEMINI_API_KEY to your .env file.',
      model: 'none',
      error: 'GEMINI_API_KEY missing',
    };
  }

  // 1. Fetch live ground-truth context from PostgreSQL
  const [trialUsers, userJourneys, recentEvents, projectRecord] = await Promise.all([
    prisma.trialUser.findMany({
      where: { projectId },
      select: {
        id: true,
        externalUserId: true,
        email: true,
        attributes: true,
        createdAt: true,
      },
      take: 20,
      orderBy: { createdAt: 'desc' },
    }),
    journeys(projectId),
    prisma.activationEvent.findMany({
      where: { projectId },
      orderBy: { occurredAt: 'desc' },
      take: 25,
      select: {
        id: true,
        name: true,
        occurredAt: true,
        properties: true,
        trialUser: {
          select: { externalUserId: true },
        },
      },
    }),
    prisma.project.findUnique({
      where: { id: projectId },
      select: { name: true, slug: true },
    }),
  ]);

  const stalledJourneys = userJourneys.filter(
    (j) => j.onboardingDiagnosis?.isBroke || Boolean(j.blocker)
  );

  // 2. Synthesize context payload for Gemini
  const userSummaries = userJourneys.slice(0, 10).map((j) => {
    const act = j.customerMemory?.activitySummary;
    const diag = j.onboardingDiagnosis;
    return {
      userId: j.userId,
      email: j.email || 'N/A',
      state: j.state,
      archetype: diag?.archetype || 'general',
      timeSpent: act?.totalTimeSpent || '< 1 min',
      activeWindow: act?.activeTimeWindow || 'recently',
      lovedFeature: act?.lovedFeature || 'App features',
      lastAction: j.lastAction?.readableName || 'N/A',
      lastActionTime: j.lastAction?.relativeTime || 'recently',
      isStalled: Boolean(diag?.isBroke || j.blocker),
      stalledReason: diag?.brokeAt || j.blocker || null,
      executiveStory: act?.executiveStory || j.customerMemory?.summary || 'No story available',
      interests: j.customerMemory?.interests || [],
      techStack: j.customerMemory?.techStack || [],
    };
  });

  const recentTelemetry = recentEvents.map((e) => ({
    event: getReadableEventName(e.name),
    user: e.trialUser.externalUserId,
    time: formatRelativeTime(e.occurredAt.toISOString()),
    properties: e.properties ? JSON.parse(e.properties) : {},
  }));

  const systemContext = {
    workspace: projectRecord?.name || 'Default Workspace',
    totalTrackedUsers: trialUsers.length,
    stalledUsersCount: stalledJourneys.length,
    totalRecentEvents: recentEvents.length,
    users: userSummaries,
    recentLiveEvents: recentTelemetry.slice(0, 12),
  };

  const prompt = `You are DealMemory AI, the autonomous product analytics & customer memory assistant in the DealMemory console.
You analyze real, live application telemetry received from the founder's site.

Here is the exact real-time telemetry and user memory data currently in the database:
${JSON.stringify(systemContext, null, 2)}

User Question: "${question}"

Instructions:
1. Answer the question directly, factually, and with executive clarity based strictly on the ground-truth data provided.
2. If citing a specific user (e.g. sarah@acme.inc), structure the response cleanly:
   - Clear telemetry breakdown (Active Dwell Time, Top Feature Affinity, Last Action, and Onboarding Status).
   - A cohesive 2-3 sentence **Executive Summary** that reads like a senior product leader explaining what the user did, what they loved, and their current state.
   - A concrete **Recommended Next Step** for the founder.
3. Crucially distinguish between real friction vs. normal session completion:
   - If no error or blocker occurred, report Onboarding Status as "Healthy · No friction detected". Never state that onboarding "broke" or "halted" if the user was using features happily.
   - Only flag onboarding friction if an actual error event (e.g. connection failed) or incomplete setup attempt occurred.
4. Keep the tone professional, natural, and founder-focused. Avoid robotic phrasing or repeating the user's email multiple times.`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 800,
          },
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.warn('Gemini API status:', response.status);

      // Graceful ground-truth fallback if Gemini quota is exhausted (e.g. 429) or offline
      const relevantUser =
        userSummaries.find((u) =>
          question.toLowerCase().includes(u.userId.toLowerCase()) ||
          question.toLowerCase().includes(u.userId.split('@')[0].toLowerCase())
        ) || userSummaries[0];

      let fallbackAnswer = '';
      if (relevantUser) {
        const cleanWindow = relevantUser.activeWindow.replace(/^around\s+/i, '');
        const cleanLoved = relevantUser.lovedFeature.replace(/^Loved:\s*/i, '');
        const targetFeature = cleanLoved.replace(/\s*\([^)]*\)/, '').trim();
        const isFalseAlarm =
          relevantUser.stalledReason === 'First value not reached' &&
          (relevantUser.lastAction === 'Feature Used' ||
            relevantUser.lastAction === 'First Value Reached' ||
            relevantUser.archetype === 'creator');
        const hasRealFriction = Boolean(relevantUser.isStalled && relevantUser.stalledReason && !isFalseAlarm);
        const effectiveReason = isFalseAlarm ? null : relevantUser.stalledReason;

        fallbackAnswer =
          `### Telemetry Intelligence: **${relevantUser.userId}**\n\n` +
          `• **Active Dwell Time**: ${relevantUser.timeSpent} (${cleanWindow})\n` +
          `• **Top Feature Affinity**: ${cleanLoved}\n` +
          `• **Last Recorded Action**: ${relevantUser.lastAction} (${relevantUser.lastActionTime})\n` +
          `• **Onboarding Status**: ${hasRealFriction && effectiveReason ? `Friction detected (${effectiveReason})` : 'Healthy · No friction detected'}\n\n` +
          `**Executive Summary**:\n${relevantUser.executiveStory}\n\n` +
          `**Recommended Next Step**:\n` +
          (hasRealFriction && effectiveReason
            ? `Send an in-app prompt or reach out directly to resolve: "${effectiveReason}".`
            : `Reach out with tailored tips or advanced workflows for ${targetFeature}.`);
      } else {
        fallbackAnswer = `DealMemory observed ${trialUsers.length} user profiles and ${recentEvents.length} telemetry events across your workspace. ${stalledJourneys.length} user(s) currently experience onboarding friction.`;
      }

      return {
        ok: true,
        answer: fallbackAnswer,
        model: 'dealmemory-telemetry-engine',
        contextStats: {
          usersCount: trialUsers.length,
          eventsCount: recentEvents.length,
          stalledCount: stalledJourneys.length,
        },
        sources: userSummaries.map((u) => ({
          type: 'user_journey',
          title: u.userId,
          detail: `${u.timeSpent} active · ${u.lovedFeature} · Last: ${u.lastAction}`,
        })),
      };
    }

    const data = await response.json();
    const candidateText =
      data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
      'No response generated by Gemini.';

    return {
      ok: true,
      answer: candidateText,
      model: 'gemini-2.5-flash',
      contextStats: {
        usersCount: trialUsers.length,
        eventsCount: recentEvents.length,
        stalledCount: stalledJourneys.length,
      },
      sources: userSummaries.map((u) => ({
        type: 'user_journey',
        title: u.userId,
        detail: `${u.timeSpent} active · ${u.lovedFeature} · Last: ${u.lastAction}`,
      })),
    };
  } catch (err: any) {
    console.error('Gemini API call failed', err);
    return {
      ok: false,
      answer: `Failed to connect to Gemini API: ${err.message}`,
      model: 'gemini-2.5-flash',
      error: err.message,
    };
  }
}

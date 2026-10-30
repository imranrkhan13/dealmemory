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
1. Answer the question directly, factually, and concisely based strictly on the ground-truth data provided.
2. If citing users, cite their actual ID (e.g. usr_sarah), what they loved, how much time they spent, and their active time window.
3. If they asked about drop-offs or onboarding friction, specify the exact event or error where they stalled and provide a concrete outreach recommendation for the founder.
4. Format using clean markdown with bullet points or bold text where helpful. Keep it concise (under 250 words unless specifically asked for a full breakdown).
5. If the question asks for an outreach draft, craft a personalized message referencing the user's specific dwell time, favorite feature, and stalled step.`;

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
      console.error('Gemini API request failed:', response.status, errText);
      return {
        ok: false,
        answer: `Gemini API error (${response.status}): Unable to generate response.`,
        model: 'gemini-2.5-flash',
        error: errText,
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

import { NextRequest } from 'next/server';
import { predictConversionProbability, discoverFunnels, identifyAtRiskUsers, predictNextAction, buildUserPredictionSummary, behavioralClustering } from '@/lib/predictive-analytics';
import { getProjectPlanState } from '@/lib/billing';

export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  const { projectId } = params;

  if (!projectId) {
    return new Response(
      JSON.stringify({ error: 'projectId is required' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Get plan state to understand limits
  const planState = await getProjectPlanState(projectId);

  // 1. Conversion probabilities for all users in this project
  const intelligenceModule = await import('@/lib/intelligence'); const allJourneys = await intelligenceModule.journeys(projectId); const userIdsSet = new Set(); allJourneys.forEach((j: any) => { const uid = j.userId; if (uid) userIdsSet.add(uid); }); const userIds = Array.from(userIdsSet);

  const conversionScores: any[] = [];
  for (const userId of userIds as string[]) {
    const { probability, factors } = predictConversionProbability(userId, projectId);
    conversionScores.push({
      userId,
      conversionProbability: probability,
      atRisk: probability < 0.3,
      confidence: 'medium',
      ...factors,
    });
  }

  // 2. Discover automatic funnels
  const funnelDiscovery = discoverFunnels(projectId, 5);

  // 3. Identify at-risk users
  const atRiskUsers = identifyAtRiskUsers(projectId, 0.3);

  // 4. Predict next actions for at-risk users (top 3)
  const nextActionPredictions = atRiskUsers
    .slice(0, 3)
    .map((user) => predictNextAction(user.userId, projectId));

  // 5. Behavioral clustering
  const clustering = behavioralClustering(projectId, 4);

  // 6. Build summary for any specific user (if query param provided)
  const searchParams = request.nextUrl.searchParams;
  const targetUserId = searchParams.get('userId');
  let userSummary: ReturnType<typeof buildUserPredictionSummary> | null = null;

  if (targetUserId) {
    try {
      userSummary = buildUserPredictionSummary(targetUserId, projectId);
    } catch (e) {
      // User not found, continue without summary
    }
  }

  return new Response(
    JSON.stringify({
      projectId,
      planState,
      conversionScores,
      funnelDiscovery,
      atRiskUsers: atRiskUsers.slice(0, 10), // top 10 at-risk
      nextActionPredictions,
      clustering,
      userSummary,
      metadata: {
        totalUsers: userIds.length,
        generatedAt: new Date().toISOString(),
      },
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}
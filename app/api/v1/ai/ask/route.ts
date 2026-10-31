export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { ownedProject, scopeError } from '@/lib/project-scope';
import { askGeminiAboutData } from '@/lib/gemini';
import { getPlanState } from '@/lib/billing';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await requireAuth();
    const url = new URL(req.url);
    const requestedProject = url.searchParams.get('projectId');
    const project = await ownedProject(userId, requestedProject);

    if (!project) {
      return NextResponse.json({ ok: false, error: 'Project not found' }, { status: 404 });
    }

    const plan = await getPlanState(userId);
    if (!plan.isPro) {
      return NextResponse.json(
        {
          ok: false,
          code: 'pro_required',
          error: 'The AI copilot is part of the Growth Pro plan.',
        },
        { status: 402 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const question = typeof body.question === 'string' ? body.question.trim() : '';

    if (!question) {
      return NextResponse.json(
        { ok: false, error: 'Question is required' },
        { status: 400 }
      );
    }

    const result = await askGeminiAboutData(project.id, question);
    return NextResponse.json(result);
  } catch (err) {
    return scopeError(err);
  }
}

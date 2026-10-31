'use client';

import {
  Brain,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Target,
  Sparkles,
} from 'lucide-react';
import { analyzeJourney } from '@/lib/journey-analysis';

type Props = {
  journey: any;
};

export default function AIAnalysis({ journey }: Props) {
  const analysis = analyzeJourney(journey);

  const badgeColor =
    analysis.health === 'healthy'
      ? 'border-success/40 bg-success-tint text-success'
      : analysis.health === 'warning'
      ? 'border-warn/40 bg-warn-tint text-warn'
      : 'border-danger/40 bg-danger-tint text-danger';

  const Icon =
    analysis.health === 'healthy'
      ? CheckCircle2
      : analysis.health === 'warning'
      ? AlertTriangle
      : XCircle;

  return (
    <div className="rounded-card border border-line bg-white  overflow-hidden">
      <div className="border-b border-line px-6 py-4 flex items-center gap-3.5 bg-paper">
        <div className="h-10 w-10 rounded-lg bg-accent-tint border border-line flex items-center justify-center">
          <Brain size={20} className="text-accent" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-ink">DealMemory AI Analysis</h2>
          <p className="text-xs text-ink-soft">Intelligent synthesis of customer intent and blockers</p>
        </div>
      </div>

      <div className="space-y-6 p-6">
        <div>
          <p className="text-xs uppercase font-mono tracking-wider text-ink-soft">
            User Goal
          </p>
          <div className="mt-2 flex items-center gap-2 text-ink">
            <Target size={17} className="text-accent shrink-0" />
            <span className="font-medium text-sm">{analysis.goal}</span>
          </div>
        </div>

        <div>
          <p className="text-xs uppercase font-mono tracking-wider text-ink-soft">
            AI Summary
          </p>
          <p className="mt-2 text-sm text-ink-soft leading-relaxed">
            {analysis.summary}
          </p>
        </div>

        {analysis.problem && (
          <div>
            <p className="text-xs uppercase font-mono tracking-wider text-ink-soft">
              Problem Detected
            </p>
            <div className="mt-2 rounded-lg border border-danger/40 bg-danger-tint p-4">
              <p className="font-medium text-sm text-danger">
                {analysis.problem}
              </p>
            </div>
          </div>
        )}

        <div>
          <p className="text-xs uppercase font-mono tracking-wider text-ink-soft">
            AI Recommendation
          </p>
          <div className="mt-2 rounded-lg border border-line bg-accent-tint p-4">
            <div className="flex gap-3">
              <Sparkles className="mt-0.5 text-accent shrink-0" size={17} />
              <p className="text-sm leading-relaxed text-accent">
                {analysis.recommendation}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg bg-paper border border-line p-4">
          <div className="flex items-center gap-2.5">
            <Icon
              size={18}
              className={
                analysis.health === 'healthy'
                  ? 'text-success'
                  : analysis.health === 'warning'
                  ? 'text-warn'
                  : 'text-danger'
              }
            />
            <span className={`rounded-full px-3 py-1 text-xs font-medium border ${badgeColor}`}>
              {analysis.health.toUpperCase()}
            </span>
          </div>

          <div className="text-right">
            <p className="text-[11px] font-mono uppercase tracking-wider text-ink-faint">
              Confidence
            </p>
            <p className="text-lg font-bold font-mono text-ink">
              {analysis.confidence}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

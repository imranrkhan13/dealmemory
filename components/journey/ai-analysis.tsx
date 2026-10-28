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
      ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
      : analysis.health === 'warning'
      ? 'border-amber-500/20 bg-amber-500/10 text-amber-400'
      : 'border-rose-500/20 bg-rose-500/10 text-rose-400';

  const Icon =
    analysis.health === 'healthy'
      ? CheckCircle2
      : analysis.health === 'warning'
      ? AlertTriangle
      : XCircle;

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-zinc-900/60 backdrop-blur-xl shadow-xl overflow-hidden">
      <div className="border-b border-white/[0.08] px-6 py-4 flex items-center gap-3.5 bg-zinc-950/40">
        <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
          <Brain size={20} className="text-indigo-400" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-white">DealMemory AI Analysis</h2>
          <p className="text-xs text-zinc-400">Intelligent synthesis of customer intent and blockers</p>
        </div>
      </div>

      <div className="space-y-6 p-6">
        <div>
          <p className="text-xs uppercase font-mono tracking-wider text-zinc-500">
            User Goal
          </p>
          <div className="mt-2 flex items-center gap-2 text-zinc-200">
            <Target size={17} className="text-indigo-400 shrink-0" />
            <span className="font-medium text-sm">{analysis.goal}</span>
          </div>
        </div>

        <div>
          <p className="text-xs uppercase font-mono tracking-wider text-zinc-500">
            AI Summary
          </p>
          <p className="mt-2 text-sm text-zinc-300 leading-relaxed">
            {analysis.summary}
          </p>
        </div>

        {analysis.problem && (
          <div>
            <p className="text-xs uppercase font-mono tracking-wider text-zinc-500">
              Problem Detected
            </p>
            <div className="mt-2 rounded-xl border border-rose-500/20 bg-rose-500/10 p-4">
              <p className="font-medium text-sm text-rose-300">
                {analysis.problem}
              </p>
            </div>
          </div>
        )}

        <div>
          <p className="text-xs uppercase font-mono tracking-wider text-zinc-500">
            AI Recommendation
          </p>
          <div className="mt-2 rounded-xl border border-indigo-500/20 bg-indigo-500/10 p-4">
            <div className="flex gap-3">
              <Sparkles className="mt-0.5 text-indigo-400 shrink-0" size={17} />
              <p className="text-sm leading-relaxed text-indigo-200">
                {analysis.recommendation}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl bg-zinc-950/60 border border-white/[0.06] p-4">
          <div className="flex items-center gap-2.5">
            <Icon
              size={18}
              className={
                analysis.health === 'healthy'
                  ? 'text-emerald-400'
                  : analysis.health === 'warning'
                  ? 'text-amber-400'
                  : 'text-rose-400'
              }
            />
            <span className={`rounded-full px-3 py-1 text-xs font-medium border ${badgeColor}`}>
              {analysis.health.toUpperCase()}
            </span>
          </div>

          <div className="text-right">
            <p className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">
              Confidence
            </p>
            <p className="text-lg font-bold font-mono text-white">
              {analysis.confidence}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

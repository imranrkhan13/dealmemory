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
      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
      : analysis.health === 'warning'
      ? 'border-amber-200 bg-amber-50 text-amber-700'
      : 'border-rose-200 bg-rose-50 text-rose-700';

  const Icon =
    analysis.health === 'healthy'
      ? CheckCircle2
      : analysis.health === 'warning'
      ? AlertTriangle
      : XCircle;

  return (
    <div className="rounded-2xl border border-sky-100 bg-white shadow-sm overflow-hidden">
      <div className="border-b border-slate-100 px-6 py-4 flex items-center gap-3.5 bg-slate-50/50">
        <div className="h-10 w-10 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center">
          <Brain size={20} className="text-sky-600" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-slate-900">DealMemory AI Analysis</h2>
          <p className="text-xs text-slate-500">Intelligent synthesis of customer intent and blockers</p>
        </div>
      </div>

      <div className="space-y-6 p-6">
        <div>
          <p className="text-xs uppercase font-mono tracking-wider text-slate-500">
            User Goal
          </p>
          <div className="mt-2 flex items-center gap-2 text-slate-800">
            <Target size={17} className="text-sky-600 shrink-0" />
            <span className="font-medium text-sm">{analysis.goal}</span>
          </div>
        </div>

        <div>
          <p className="text-xs uppercase font-mono tracking-wider text-slate-500">
            AI Summary
          </p>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
            {analysis.summary}
          </p>
        </div>

        {analysis.problem && (
          <div>
            <p className="text-xs uppercase font-mono tracking-wider text-slate-500">
              Problem Detected
            </p>
            <div className="mt-2 rounded-xl border border-rose-200 bg-rose-50 p-4">
              <p className="font-medium text-sm text-rose-800">
                {analysis.problem}
              </p>
            </div>
          </div>
        )}

        <div>
          <p className="text-xs uppercase font-mono tracking-wider text-slate-500">
            AI Recommendation
          </p>
          <div className="mt-2 rounded-xl border border-sky-200 bg-sky-50/80 p-4">
            <div className="flex gap-3">
              <Sparkles className="mt-0.5 text-sky-600 shrink-0" size={17} />
              <p className="text-sm leading-relaxed text-sky-950">
                {analysis.recommendation}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl bg-slate-50 border border-slate-200 p-4">
          <div className="flex items-center gap-2.5">
            <Icon
              size={18}
              className={
                analysis.health === 'healthy'
                  ? 'text-emerald-600'
                  : analysis.health === 'warning'
                  ? 'text-amber-600'
                  : 'text-rose-600'
              }
            />
            <span className={`rounded-full px-3 py-1 text-xs font-medium border ${badgeColor}`}>
              {analysis.health.toUpperCase()}
            </span>
          </div>

          <div className="text-right">
            <p className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
              Confidence
            </p>
            <p className="text-lg font-bold font-mono text-slate-900">
              {analysis.confidence}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

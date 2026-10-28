import {
  Sparkles,
  AlertTriangle,
  ArrowRight,
  Brain,
  Zap,
} from "lucide-react";
import Link from "next/link";

interface CopilotSummaryProps {
  totalUsers: number;
  stuckUsers: number;
  activationRate: number;
  topBlocker: string;
}

export default function CopilotSummary({
  totalUsers,
  stuckUsers,
  activationRate,
  topBlocker,
}: CopilotSummaryProps) {
  const estimatedRecovery = stuckUsers * 49;

  return (
    <section className="relative mt-8 overflow-hidden rounded-3xl border border-sky-200 bg-gradient-to-br from-sky-50/90 via-white to-blue-50/60 p-7 sm:p-9 shadow-sm">
      {/* Background ambient light */}
      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-sky-400/10 blur-3xl pointer-events-none" />
      <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-blue-400/10 blur-3xl pointer-events-none" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-300 to-transparent" />

      <div className="relative">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/20">
              <Brain className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-sky-700">
                  AI Memory Synthesis
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-semibold text-sky-800 border border-sky-200">
                  <Sparkles size={10} /> Copilot
                </span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Activation Intelligence
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-sky-200 bg-white px-4 py-2 text-right shadow-xs">
              <p className="text-[11px] uppercase tracking-wider text-slate-500 font-medium">Activation Rate</p>
              <p className="text-xl font-bold text-slate-900 tabular-nums">{activationRate}%</p>
            </div>
          </div>
        </div>

        <div className="mt-7 grid gap-6 lg:grid-cols-2">
          {/* Diagnostic Narrative */}
          <div className="rounded-2xl border border-sky-100 bg-white p-6 shadow-xs">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 font-mono">
              Observed Synthesis
            </p>
            <p className="mt-3 text-base leading-7 text-slate-700">
              DealMemory analyzed <span className="font-semibold text-slate-900">{totalUsers}</span> trial user journeys. 
              The primary drop-off bottleneck is currently:
            </p>
            <div className="mt-3 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-sm text-amber-900">
              <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-900">{topBlocker}</p>
                <p className="mt-1 text-xs text-amber-700">
                  Affecting {stuckUsers} users before they reached first meaningful value.
                </p>
              </div>
            </div>
          </div>

          {/* Revenue Opportunity / Copilot Action */}
          <div className="rounded-2xl border border-sky-100 bg-white p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-sky-700 flex items-center gap-1.5 font-mono">
                  <Zap size={14} /> Recovery Strategy
                </p>
                <span className="text-xs font-mono text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  +${estimatedRecovery}/mo MRR opp.
                </span>
              </div>
              <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                Resume user sessions where friction occurred. Users stuck on setup convert 3.2× higher when guided directly through reconnection rather than restarting from zero.
              </p>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href="/journeys"
                className="btn btn-primary text-xs py-2 px-4 inline-flex items-center gap-2"
              >
                Inspect stuck journeys <ArrowRight size={13} />
              </Link>
              <Link
                href="/events"
                className="btn text-xs py-2 px-4 text-slate-700 hover:text-sky-700 hover:bg-sky-50"
              >
                View event stream
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

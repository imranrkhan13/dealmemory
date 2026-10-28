import {
  Sparkles,
  AlertTriangle,
  TrendingUp,
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
    <section className="relative mt-8 overflow-hidden rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/70 via-zinc-900/90 to-purple-950/50 p-7 sm:p-9 shadow-2xl backdrop-blur-2xl">
      {/* Background ambient light */}
      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />
      <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-400/50 to-transparent" />

      <div className="relative">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white shadow-lg shadow-indigo-500/30">
              <Brain className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-300">
                  AI Memory Synthesis
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/20 px-2 py-0.5 text-[10px] font-semibold text-indigo-300 border border-indigo-500/30">
                  <Sparkles size={10} /> Copilot
                </span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Activation Intelligence
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-white/[0.08] bg-zinc-900/80 px-4 py-2 text-right backdrop-blur">
              <p className="text-[11px] uppercase tracking-wider text-zinc-400 font-medium">Activation Rate</p>
              <p className="text-xl font-bold text-white tabular-nums">{activationRate}%</p>
            </div>
          </div>
        </div>

        <div className="mt-7 grid gap-6 lg:grid-cols-2">
          {/* Diagnostic Narrative */}
          <div className="rounded-2xl border border-white/[0.08] bg-zinc-950/60 p-6 backdrop-blur-xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Observed Synthesis
            </p>
            <p className="mt-3 text-base leading-7 text-zinc-200">
              DealMemory analyzed <span className="font-semibold text-white">{totalUsers}</span> trial user journeys. 
              The primary drop-off bottleneck is currently:
            </p>
            <div className="mt-3 flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3.5 text-sm text-amber-200">
              <AlertTriangle className="h-5 w-5 shrink-0 text-amber-400 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-300">{topBlocker}</p>
                <p className="mt-1 text-xs text-amber-200/80">
                  Affecting {stuckUsers} users before they reached first meaningful value.
                </p>
              </div>
            </div>
          </div>

          {/* Revenue Opportunity / Copilot Action */}
          <div className="rounded-2xl border border-white/[0.08] bg-zinc-950/60 p-6 backdrop-blur-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                  <Zap size={14} /> Recovery Strategy
                </p>
                <span className="text-xs font-mono text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                  +${estimatedRecovery}/mo MRR opp.
                </span>
              </div>
              <p className="mt-3 text-sm text-zinc-300 leading-relaxed">
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
                className="btn text-xs py-2 px-4 text-zinc-300 hover:text-white"
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

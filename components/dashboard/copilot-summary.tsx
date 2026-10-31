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
    <section className="relative mt-8 overflow-hidden rounded-card border border-line from-accent-tint via-white to-accent-tint p-7 sm:p-9 ">
      {/* Background ambient light */}
      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-accent  pointer-events-none" />
      <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-accent  pointer-events-none" />
      <div className="absolute inset-x-0 top-0 h-px from-transparent via-sky-300 to-transparent" />

      <div className="relative">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-card from-sky-500 to-blue-600 text-white  shadow-sky-500/20">
              <Brain className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-accent">
                  AI Memory Synthesis
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-accent-tint px-2 py-0.5 text-[10px] font-semibold text-accent border border-line">
                  <Sparkles size={10} /> Copilot
                </span>
              </div>
              <h2 className="text-[26px] font-medium leading-tight tracking-[-0.025em] text-ink">
                Activation Intelligence
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-lg border border-line bg-white px-4 py-2 text-right ">
              <p className="text-[11px] uppercase tracking-wider text-ink-soft font-medium">Activation Rate</p>
              <p className="text-[20px] font-medium text-ink tabular-nums">{activationRate}%</p>
            </div>
          </div>
        </div>

        <div className="mt-7 grid gap-6 lg:grid-cols-2">
          {/* Diagnostic Narrative */}
          <div className="rounded-card border border-line bg-white p-6 ">
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-soft font-mono">
              Observed Synthesis
            </p>
            <p className="mt-3 text-base leading-7 text-ink-soft">
              DealMemory analyzed <span className="font-semibold text-ink">{totalUsers}</span> trial user journeys. 
              The primary drop-off bottleneck is currently:
            </p>
            <div className="mt-3 flex items-start gap-3 rounded-lg border border-warn/40 bg-warn-tint p-3.5 text-sm text-warn">
              <AlertTriangle className="h-5 w-5 shrink-0 text-warn mt-0.5" />
              <div>
                <p className="font-semibold text-warn">{topBlocker}</p>
                <p className="mt-1 text-xs text-warn">
                  Affecting {stuckUsers} users before they reached first meaningful value.
                </p>
              </div>
            </div>
          </div>

          {/* Revenue Opportunity / Copilot Action */}
          <div className="rounded-card border border-line bg-white p-6  flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-accent flex items-center gap-1.5 font-mono">
                  <Zap size={14} /> Recovery Strategy
                </p>
                <span className="text-xs font-mono text-success font-semibold bg-success-tint px-2.5 py-0.5 rounded-full border border-success/40">
                  +${estimatedRecovery}/mo MRR opp.
                </span>
              </div>
              <p className="mt-3 text-sm text-ink-soft leading-relaxed">
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
                className="btn text-xs py-2 px-4 text-ink-soft hover:text-accent hover:bg-accent-tint"
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

import Link from 'next/link';
import { Check } from 'lucide-react';

const VALUE_POINTS = [
  'Every trial user reconstructed as one readable timeline',
  'The exact step where onboarding broke — named, not averaged',
  'Ask the AI copilot what happened, and what to do next',
];

export function AuthShell({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f6f7fb] text-[#0b1015]">
      {/* ambient blurred colour fields */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-40 -top-52 h-[540px] w-[540px] rounded-full bg-[#0562ef]/15 blur-[130px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-60 -right-48 h-[600px] w-[600px] rounded-full bg-[#8ab4ff]/25 blur-[150px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/3 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-[#dbe7ff]/40 blur-[120px]"
      />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-8 sm:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 self-start rounded-md outline-none focus-visible:ring-2 focus-visible:ring-[#0562ef]"
          aria-label="dealmemory home"
        >
          <span className="grid h-6 w-6 place-items-center rounded-[7px] bg-[#0b1015]" aria-hidden="true">
            <span className="flex items-end gap-[2.5px]">
              <span className="h-2.5 w-[3px] rounded-[1px] bg-[#f5f5f5]" />
              <span className="h-3.5 w-[3px] rounded-[1px] bg-[#8ab4ff]" />
            </span>
          </span>
          <span className="text-[17px] font-semibold tracking-[-0.02em] text-[#0b1015]">
            dealmemory
            <span className="ml-0.5 align-super text-[9px] font-medium tracking-normal text-[#9b9ea2]">™</span>
          </span>
        </Link>

        <div className="grid flex-1 items-center gap-10 py-10 lg:grid-cols-[1fr_430px] lg:gap-16 lg:py-14">
          {/* Left: value proposition (desktop only) */}
          <div className="hidden lg:block">
            <span className="eyebrow">Product memory engine</span>
            <h2 className="mt-4 max-w-md text-[34px] font-semibold leading-[1.08] tracking-[-0.03em] text-[#0b1015]">
              Pick up exactly where the last session ended.
            </h2>
            <p className="mt-4 max-w-md text-[14px] leading-relaxed text-[#555b61]">
              DealMemory keeps the goal a user arrived with, the blocker that stopped them, and the
              action that recovers the trial — across sessions, tabs, and days.
            </p>

            <ul className="mt-7 space-y-3">
              {VALUE_POINTS.map((point) => (
                <li key={point} className="flex items-start gap-2.5 text-[13.5px] leading-relaxed text-[#3a4048]">
                  <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-[#eff4ff]">
                    <Check size={11} className="text-[#0562ef]" strokeWidth={3} />
                  </span>
                  {point}
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-black/10 pt-5 font-mono text-[11px] uppercase tracking-[0.05em] text-[#9b9ea2]">
              <span>Free tier · no card</span>
              <span>5 minute install</span>
              <span>No session replay</span>
            </div>
          </div>

          {/* Right: frosted glass form card */}
          <div className="w-full rounded-2xl border border-white/70 bg-white/60 p-6 shadow-[0_24px_60px_-24px_rgba(11,16,21,0.22)] backdrop-blur-2xl sm:p-8">
            <h1 className="text-[24px] font-semibold leading-tight tracking-[-0.025em] text-[#0b1015]">
              {title}
            </h1>
            <p className="mt-2 text-[13.5px] leading-relaxed text-[#555b61]">{subtitle}</p>

            <div className="mt-7">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AuthField({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block mono-label">{label}</span>
      <input {...props} className="input auth-field-input" />
    </label>
  );
}

export function AuthButton({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button {...props} className="btn btn--primary auth-submit">
      {children}
    </button>
  );
}

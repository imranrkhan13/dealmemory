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
    // NOTE: the stylesheet scopes dark auth styles under `.dark-auth`.
    <div className="auth-dark dark-auth relative min-h-screen overflow-hidden bg-[#0b0b0d] text-[#f5f5f5]">
      {/* ambient glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-40 -top-52 h-[540px] w-[540px] rounded-full bg-[#5b86f5]/20 blur-[140px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-60 -right-48 h-[600px] w-[600px] rounded-full bg-[#5b86f5]/10 blur-[160px]"
      />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-8 sm:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 self-start rounded-md outline-none focus-visible:ring-2 focus-visible:ring-[#5b86f5]"
          aria-label="dealmemory home"
        >
          <span className="grid h-6 w-6 place-items-center rounded-[7px] bg-[#f5f5f5]" aria-hidden="true">
            <span className="flex items-end gap-[2.5px]">
              <span className="h-2.5 w-[3px] rounded-[1px] bg-[#0b0b0d]" />
              <span className="h-3.5 w-[3px] rounded-[1px] bg-[#5b86f5]" />
            </span>
          </span>
          <span className="text-[17px] font-semibold tracking-[-0.02em] text-[#f5f5f5]">
            dealmemory
            <span className="ml-0.5 align-super text-[9px] font-medium tracking-normal text-white/40">™</span>
          </span>
        </Link>

        <div className="grid flex-1 items-center gap-10 py-10 lg:grid-cols-[1fr_430px] lg:gap-16 lg:py-14">
          {/* Left: value proposition (desktop only) */}
          <div className="hidden lg:block">
            <span className="eyebrow">Product memory engine</span>
            <h2 className="mt-4 max-w-md text-[34px] font-semibold leading-[1.08] tracking-[-0.03em] text-[#f5f5f5]">
              Pick up exactly where the last session ended.
            </h2>
            <p className="mt-4 max-w-md text-[14px] leading-relaxed text-[#9ba0a6]">
              DealMemory keeps the goal a user arrived with, the blocker that stopped them, and the
              action that recovers the trial — across sessions, tabs, and days.
            </p>

            <ul className="mt-7 space-y-3">
              {VALUE_POINTS.map((point) => (
                <li key={point} className="flex items-start gap-2.5 text-[13.5px] leading-relaxed text-[#c9cdd2]">
                  <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-[#5b86f5]/20">
                    <Check size={11} className="text-[#8ab4ff]" strokeWidth={3} />
                  </span>
                  {point}
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-white/10 pt-5 font-mono text-[11px] uppercase tracking-[0.05em] text-white/35">
              <span>Free tier · no card</span>
              <span>5 minute install</span>
              <span>No session replay</span>
            </div>
          </div>

          {/* Right: form card */}
          <div className="w-full rounded-2xl border border-white/10 bg-[#0e0e11]/85 p-6 shadow-[0_28px_64px_-28px_rgba(0,0,0,0.9)] backdrop-blur-sm sm:p-8">
            <h1 className="text-[24px] font-semibold leading-tight tracking-[-0.025em] text-[#f5f5f5]">
              {title}
            </h1>
            <p className="mt-2 text-[13.5px] leading-relaxed text-[#9ba0a6]">{subtitle}</p>

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

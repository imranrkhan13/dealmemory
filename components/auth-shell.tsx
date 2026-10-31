import Link from 'next/link';

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
    <div className="auth-dark min-h-screen bg-[#0a0a0a] text-[#f5f5f5]">
      <div className="mx-auto flex min-h-screen w-full max-w-[420px] flex-col justify-center px-5 py-14">
        <Link href="/" className="mb-12 inline-flex items-center gap-2 self-start" aria-label="dealmemory home">
          <span className="grid h-6 w-6 place-items-center rounded-[7px] bg-[#f5f5f5]" aria-hidden="true">
            <span className="flex items-end gap-[2.5px]">
              <span className="h-2.5 w-[3px] rounded-[1px] bg-[#0a0a0a]" />
              <span className="h-3.5 w-[3px] rounded-[1px] bg-[#2f86ff]" />
            </span>
          </span>
          <span className="text-[17px] font-semibold tracking-[-0.02em] text-[#f5f5f5]">
            dealmemory
            <span className="ml-0.5 align-super text-[9px] font-medium tracking-normal text-white/40">™</span>
          </span>
        </Link>

        <h1 className="text-[27px] font-semibold leading-tight tracking-[-0.025em] text-[#f5f5f5]">{title}</h1>
        <p className="mt-2 text-[14px] leading-relaxed text-[#a2a2a2]">{subtitle}</p>

        <div className="mt-8">{children}</div>
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
      <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.08em] text-white/45">
        {label}
      </span>
      <input
        {...props}
        className="h-11 w-full rounded-lg border border-white/15 bg-[#0a0a0a] px-3.5 text-[13px] text-[#f5f5f5] placeholder:text-white/30 transition-colors focus:border-[#2f86ff] focus:outline-none"
      />
    </label>
  );
}

export function AuthButton({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className="flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-[#2f86ff] bg-[#2f86ff] px-4 text-[13px] font-medium text-white transition-colors hover:border-[#1d6fe8] hover:bg-[#1d6fe8] disabled:opacity-50"
    >
      {children}
    </button>
  );
}

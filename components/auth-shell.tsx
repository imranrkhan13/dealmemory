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
    <div className="auth-dark min-h-screen bg-[#0b0b0d] text-[#f5f5f5]">
      <div className="page-wrap">
        <Link href="/" className="mb-10 inline-flex items-center gap-2 self-start" aria-label="dealmemory home">
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

        <h1 className="text-[27px] font-semibold leading-tight tracking-[-0.025em] text-[#f5f5f5]">{title}</h1>
        <p className="mt-2 text-[14px] leading-relaxed text-[#9ba0a6]">{subtitle}</p>

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
      <span className="mb-1.5 block mono-label">{label}</span>
      <input
        {...props}
        className="input input--mono"
        style={{ paddingTop: '0.5rem', paddingBottom: '0.5rem' }}
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
      className="btn btn--primary"
    >
      {children}
    </button>
  );
}

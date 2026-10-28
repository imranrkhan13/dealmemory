'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { Brain, Menu, X, Sparkles, LogOut, ShieldCheck, ChevronRight } from 'lucide-react';
import { usePathname } from 'next/navigation';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession();
  const pathname = usePathname();

  const toggleMenu = () => setIsOpen(!isOpen);
  const signInHref = `/auth/signin?callbackUrl=${encodeURIComponent(pathname || '/overview')}`;

  const navLinks = [
    { href: '/overview', label: 'Overview' },
    { href: '/events', label: 'Events' },
    { href: '/journeys', label: 'Journeys' },
    { href: '/sdk', label: 'SDK' },
    { href: '/settings', label: 'Connect' },
    { href: '/demo', label: 'Demo' },
    { href: '/pricing', label: 'Pricing' },
  ];

  const isLinkActive = (href: string) => {
    if (href === '/overview' && (pathname === '/overview' || pathname === '/dashboard/overview')) return true;
    return pathname === href || pathname?.startsWith(`${href}/`);
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-3 sm:px-6">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between rounded-2xl border border-white/[0.08] bg-zinc-950/80 px-4 shadow-2xl shadow-black/60 backdrop-blur-xl transition-all duration-300">
        
        {/* Logo / Brand */}
        <Link href="/" className="flex items-center gap-2.5 font-medium tracking-tight text-white group">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 shadow-md shadow-indigo-500/25 transition-transform duration-200 group-hover:scale-105">
            <Brain size={17} className="text-white" />
            <div className="absolute -inset-0.5 rounded-xl bg-indigo-500/30 blur-xs -z-10 group-hover:bg-indigo-500/50 transition-colors" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-sm tracking-tight text-white">DealMemory</span>
            <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/25">
              <Sparkles size={9} /> AI
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden items-center gap-1 rounded-xl bg-zinc-900/40 p-1 border border-white/[0.04] md:flex">
          {navLinks.map((link) => {
            const active = isLinkActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                  active
                    ? 'text-white bg-white/[0.1] shadow-xs border border-white/[0.08]'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.04]'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Action / Auth */}
        <div className="hidden items-center gap-3 md:flex">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-medium">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Synced</span>
          </div>

          {session ? (
            <div className="flex items-center gap-2.5 pl-2 border-l border-white/[0.08]">
              <div className="text-right">
                <p className="text-xs font-semibold text-zinc-200 leading-tight">
                  {session.user?.name || session.user?.email?.split('@')[0]}
                </p>
                <p className="text-[10px] text-zinc-500 font-mono leading-tight">
                  {session.user?.email}
                </p>
              </div>

              <button
                onClick={() => signOut()}
                title="Sign out"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] bg-zinc-900/80 text-zinc-400 hover:text-white hover:border-white/[0.15] transition-colors"
              >
                <LogOut size={13} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                className="px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-white transition-colors"
                href={signInHref}
              >
                Sign in
              </Link>
              <Link
                className="btn btn-primary text-xs py-1.5 px-3.5"
                href="/signup"
              >
                Get started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle Button */}
        <button
          onClick={toggleMenu}
          className="grid h-8 w-8 place-items-center rounded-lg border border-white/[0.08] bg-zinc-900/80 text-zinc-300 hover:text-white md:hidden transition-colors"
          aria-label="Toggle Navigation Menu"
        >
          {isOpen ? <X size={16} /> : <Menu size={16} />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {isOpen && (
        <div className="mt-2 mx-auto max-w-7xl rounded-2xl border border-white/[0.08] bg-zinc-950/95 p-4 shadow-2xl backdrop-blur-2xl md:hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col gap-1 text-sm font-medium text-zinc-300">
            {navLinks.map((link) => {
              const active = isLinkActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs transition-colors ${
                    active
                      ? 'bg-white/10 text-white font-semibold'
                      : 'hover:bg-white/[0.05] text-zinc-400 hover:text-white'
                  }`}
                >
                  <span>{link.label}</span>
                  {active && <ChevronRight size={13} className="text-indigo-400" />}
                </Link>
              );
            })}

            <div className="my-2 border-t border-white/[0.08]" />

            {session ? (
              <div className="flex items-center justify-between p-2">
                <div>
                  <p className="text-xs font-semibold text-white">{session.user?.name}</p>
                  <p className="text-[11px] text-zinc-400">{session.user?.email}</p>
                </div>
                <button
                  onClick={() => signOut()}
                  className="rounded-lg border border-white/10 bg-zinc-900 px-2.5 py-1 text-xs text-zinc-300 hover:text-white"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 pt-1">
                <Link
                  className="btn text-center text-xs justify-center"
                  href={signInHref}
                  onClick={() => setIsOpen(false)}
                >
                  Sign in
                </Link>
                <Link
                  className="btn btn-primary text-center text-xs justify-center"
                  href="/signup"
                  onClick={() => setIsOpen(false)}
                >
                  Get started
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#09090b] text-[#f4f4f5] selection:bg-indigo-500/30 selection:text-indigo-200">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 pt-24 pb-20">
        {children}
      </main>
    </div>
  );
}

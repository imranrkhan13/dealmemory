'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  KeyRound,
  Users,
  Zap,
  BookOpen,
  ChevronDown,
  LogOut,
  Menu,
  X,
  ArrowRight,
  ExternalLink,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { usePlan } from '@/components/use-plan';

interface Project {
  id: string;
  name: string;
}

function Mark({ className = '' }: { className?: string }) {
  return (
    <span
      className={`grid h-6 w-6 shrink-0 place-items-center rounded-[7px] bg-ink ${className}`}
      aria-hidden="true"
    >
      <span className="flex items-end gap-[2.5px]">
        <span className="h-2.5 w-[3px] rounded-[1px] bg-white/85" />
        <span className="h-3.5 w-[3px] rounded-[1px] bg-[#6c96ff]" />
      </span>
    </span>
  );
}

function Wordmark() {
  return (
    <span className="flex items-center gap-2">
      <Mark />
      <span className="text-[15px] font-semibold tracking-[-0.015em] text-ink">
        dealmemory
        <span className="ml-0.5 align-super text-[9px] font-medium tracking-normal text-ink-faint">
          ™
        </span>
      </span>
    </span>
  );
}

const publicLinks = [
  { href: '/docs', label: 'Docs' },
  { href: '/pricing', label: 'Pricing' },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const { plan, isPro } = usePlan();
  const pathname = usePathname();
  const [project, setProject] = useState<Project | null>(null);
  const [projectMenuOpen, setProjectMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('dealmemory_sidebar_collapsed');
      if (saved !== null) setSidebarCollapsed(saved === 'true');
    } catch {}
  }, []);

  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('dealmemory_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const isConsoleRoute =
    pathname?.startsWith('/overview') ||
    pathname?.startsWith('/events') ||
    pathname?.startsWith('/journeys') ||
    pathname?.startsWith('/settings') ||
    pathname?.startsWith('/dashboard');

  useEffect(() => {
    if (session) {
      fetch('/api/projects', { cache: 'no-store' })
        .then((r) => r.json())
        .then((d) => {
          if (Array.isArray(d?.projects) && d.projects[0]) setProject(d.projects[0]);
        })
        .catch(() => {});
    }
  }, [session]);

  const userName = session?.user?.name || session?.user?.email?.split('@')[0] || 'Imran Khan';
  const userEmail = session?.user?.email || 'imran@dealmemory.ai';
  const userInitials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  /* ── Public layout ───────────────────────────────────────────────── */
  if (!isConsoleRoute) {
    return (
      <div className="min-h-screen">
        <header className="header header--sticky">
          <Link href="/" className="flex items-center gap-2" aria-label="dealmemory home">
            <Mark />
            <span className="text-[15px] font-semibold tracking-[-0.015em] text-ink">
              dealmemory
              <span className="ml-0.5 align-super text-[9px] font-medium tracking-normal text-ink-faint">
                ™
              </span>
            </span>
          </Link>

          <nav className="nav" aria-label="Main">
            {publicLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`nav-item ${active ? 'nav-item--active' : ''}`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex shrink-0 items-center gap-1.5">
            {session ? (
              <>
                <Link href="/overview" className="btn btn--primary btn--text">
                  Console
                  <ArrowRight size={13} />
                </Link>
                <button
                  onClick={() => signOut()}
                  title="Sign out"
                  className="btn btn--icon"
                  aria-label="Sign out"
                >
                  <LogOut size={14} />
                </button>
              </>
            ) : (
              <div className="flex shrink-0 items-center gap-1.5">
                <Link href="/auth/signin" className="nav-item">
                  Sign in
                </Link>
                <Link href="/signup" className="btn btn--primary">
                  Get started
                </Link>
              </div>
            )}
          </div>

          <button
            onClick={() => setMobileNavOpen((v) => !v)}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-ink-soft transition-colors hover:bg-paper hover:text-ink md:hidden"
            aria-label="Toggle menu"
          >
            {mobileNavOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </header>

        <main className="mx-auto max-w-[1240px] px-4 pb-20 pt-10 sm:px-6 md:pt-14">
          {children}
        </main>

        <footer className="border-t border-line">
          <div className="mx-auto flex max-w-[1240px] flex-col gap-3 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="flex items-center gap-2.5">
              <Mark className="h-5 w-5 rounded-[6px]" />
              <span className="text-[13px] text-ink-soft">
                dealmemory — product memory for SaaS trials
              </span>
            </div>
            <div className="flex items-center gap-4 text-[12px] text-ink-faint">
              <Link href="/docs" className="nav-item">
                Docs
              </Link>
              <Link href="/pricing" className="nav-item">
                Pricing
              </Link>
              <Link href="/auth/signin" className="nav-item">
                Sign in
              </Link>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  /* ── Console layout ──────────────────────────────────────────────── */
  const navItems = [
    { label: 'Overview', href: '/overview', icon: Home, active: pathname === '/overview' || pathname === '/dashboard' },
    { label: 'Customer Journeys', href: '/journeys', icon: Users, active: pathname?.startsWith('/journeys') },
    { label: 'Live Events', href: '/events', icon: Zap, active: pathname === '/events' },
    { label: 'API Keys & Setup', href: '/settings', icon: KeyRound, active: pathname === '/settings' },
    { label: 'Docs & SDK', href: '/docs', icon: BookOpen, active: pathname === '/docs' || pathname === '/sdk' },
  ];

  const current = navItems.find((item) => item.active);

  return (
    <div className="min-h-screen bg-canvas text-ink">
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-ink/30 md:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-line bg-white transition-[width,transform] duration-200 ease-out ${
          sidebarCollapsed ? 'md:w-[64px]' : 'md:w-[232px]'
        } ${mobileSidebarOpen ? 'w-[232px] translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        {/* Brand + collapse */}
        <div
          className={`flex h-14 items-center border-b border-line ${
            sidebarCollapsed ? 'md:justify-center justify-between px-3' : 'justify-between px-3.5'
          }`}
        >
          <Link href="/overview" aria-label="dealmemory console">
            <span className={`flex items-center gap-2 ${sidebarCollapsed ? 'md:hidden' : ''}`}>
              <Mark />
              <span className="text-[14px] font-semibold tracking-[-0.015em] text-ink">
                dealmemory
                <span className="ml-0.5 align-super text-[8px] font-medium tracking-normal text-ink-faint">
                  ™
                </span>
              </span>
            </span>
            <span className={sidebarCollapsed ? 'hidden md:block' : 'hidden'}>
              <Mark />
            </span>
          </Link>

          <button
            onClick={toggleSidebar}
            title={sidebarCollapsed ? 'Expand sidebar (⌘B)' : 'Collapse sidebar (⌘B)'}
            className="hidden h-7 w-7 items-center justify-center rounded-md text-ink-faint transition-colors hover:bg-paper hover:text-ink md:flex"
          >
            {sidebarCollapsed ? <PanelLeftOpen size={15} /> : <PanelLeftClose size={15} />}
          </button>

          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="flex h-7 w-7 items-center justify-center rounded-md text-ink-faint hover:bg-paper hover:text-ink md:hidden"
            aria-label="Close navigation"
          >
            <X size={16} />
          </button>
        </div>

        {/* Workspace switcher */}
        <div className={`${sidebarCollapsed ? 'px-2 py-2.5' : 'px-3 py-2.5'} border-b border-line`}>
          <div className="relative">
            <button
              onClick={() => setProjectMenuOpen(!projectMenuOpen)}
              className={`flex w-full items-center rounded-md border border-line transition-colors hover:border-line-strong hover:bg-paper ${
                sidebarCollapsed ? 'md:justify-center md:px-0 justify-between px-2' : 'justify-between px-2'
              } py-1.5`}
              title={project?.name || 'Workspace'}
            >
              <span className={`flex min-w-0 items-center gap-2 ${sidebarCollapsed ? 'md:hidden' : ''}`}>
                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-[5px] bg-accent-tint font-mono text-[10px] font-semibold text-accent">
                  {project?.name ? project.name[0].toUpperCase() : 'W'}
                </span>
                <span className="truncate text-[13px] font-medium text-ink">
                  {project?.name || 'Workspace'}
                </span>
              </span>
              <span className={sidebarCollapsed ? 'hidden md:grid' : 'hidden'}>
                <span className="grid h-6 w-6 place-items-center rounded-[5px] bg-accent-tint font-mono text-[10px] font-semibold text-accent">
                  {project?.name ? project.name[0].toUpperCase() : 'W'}
                </span>
              </span>
              <ChevronDown
                size={13}
                className={`shrink-0 text-ink-faint ${sidebarCollapsed ? 'md:hidden' : ''}`}
              />
            </button>

            {projectMenuOpen && (
              <div
                className={`absolute mt-1 z-50 w-56 rounded-card border border-line bg-white p-1 shadow-md ${
                  sidebarCollapsed ? 'left-full ml-2 top-0' : 'left-0'
                }`}
              >
                <p className="px-2 py-1.5 font-mono text-[10px] uppercase tracking-[0.06em] text-ink-soft">
                  Workspace
                </p>
                <div className="flex items-center gap-2 rounded-md bg-paper px-2 py-1.5">
                  <span className="grid h-5 w-5 place-items-center rounded-[5px] bg-accent-tint font-mono text-[10px] font-semibold text-accent">
                    {project?.name ? project.name[0].toUpperCase() : 'W'}
                  </span>
                  <span className="truncate text-[13px] font-medium text-ink">
                    {project?.name || 'Default Workspace'}
                  </span>
                </div>
                <div className="my-1 h-px border-b border-line" />
                <Link
                  href="/settings"
                  onClick={() => setProjectMenuOpen(false)}
                  className="block rounded-md px-2 py-1.5 text-[13px] text-ink-soft transition-colors hover:bg-paper hover:text-ink"
                >
                  Manage keys &amp; settings
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-2 py-3">
          <p
            className={`px-2 pb-1.5 font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-ink-faint ${
              sidebarCollapsed ? 'md:hidden' : ''
            }`}
          >
            Console
          </p>
          <nav className="space-y-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.href} className="group relative">
                  <Link
                    href={item.href}
                    onClick={() => setMobileSidebarOpen(false)}
                    aria-current={item.active ? 'page' : undefined}
                    className={`flex items-center rounded-md text-[13px] transition-colors ${
                      sidebarCollapsed ? 'md:justify-center md:px-0 gap-2.5 px-2' : 'gap-2.5 px-2'
                    } py-1.5 ${
                      item.active
                        ? 'bg-paper font-medium text-ink'
                        : 'text-ink-soft hover:bg-paper hover:text-ink'
                    }`}
                  >
                    <Icon
                      size={15}
                      className={`shrink-0 ${item.active ? 'text-ink' : 'text-ink-faint group-hover:text-ink'}`}
                    />
                    <span className={`truncate ${sidebarCollapsed ? 'md:hidden' : ''}`}>
                      {item.label}
                    </span>
                  </Link>

                  {sidebarCollapsed && (
                    <div className="pointer-events-none absolute left-full top-1/2 z-50 ml-2 hidden -translate-y-1/2 md:group-hover:block">
                      <div className="whitespace-nowrap rounded-md bg-ink px-2 py-1 text-[11px] font-medium text-white shadow-md">
                        {item.label}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {!sidebarCollapsed && (
            <>
              <p className="mt-5 px-2 pb-1.5 font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-ink-faint">
                Resources
              </p>
              <a
                href="https://supermemory.ai"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-[13px] text-ink-soft transition-colors hover:bg-paper hover:text-ink"
              >
                <ExternalLink size={15} className="shrink-0 text-ink-faint" />
                <span className="truncate">Supermemory</span>
              </a>
            </>
          )}
        </div>

        {/* Footer */}
        <div className={`border-t border-line ${sidebarCollapsed ? 'p-2' : 'p-2.5'} space-y-2`}>
          {!sidebarCollapsed ? (
            <Link
              href={isPro ? '/settings' : '/pricing'}
              className="flex items-center gap-2.5 rounded-md border border-line bg-white px-2.5 py-2 transition-colors hover:border-line-strong hover:bg-paper"
            >
              <div className="flex min-w-0 items-center gap-2">
                <span className="font-mono text-[10px] uppercase tracking-[0.06em] text-ink-soft">
                  Plan
                </span>
                {isPro ? (
                  <span className="inline-flex items-center gap-1 rounded-[4px] bg-accent-tint px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.04em] text-accent">
                    Pro
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-[4px] border border-line px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.04em] text-ink-soft transition-colors hover:border-accent-line hover:text-accent">
                    Starter
                  </span>
                )}
              </div>
              <p className="mt-1 text-[11px] leading-snug text-ink-faint">
                {isPro
                  ? 'Unlimited projects & events'
                  : plan
                  ? `${plan.usage.eventsThisMonth.toLocaleString()} of 10,000 events this month`
                  : 'Upgrade for unlimited ingestion'}
              </p>
            </Link>
          ) : null}

          <div className="rounded-md border border-line bg-paper px-2.5 py-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-[0.06em] text-ink-soft">
                System
              </span>
              <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.06em] text-success">
                <span className="h-1.5 w-1.5 rounded-full bg-success" />
                Live
              </span>
            </div>
            <p className="mt-1 text-[11px] leading-snug text-ink-faint">
              PostgreSQL &amp; Gemini 2.5 Flash
            </p>
          </div>

          <div className="relative">
            {!sidebarCollapsed ? (
              <div className="flex items-center justify-between gap-1 rounded-md px-1 py-1 transition-colors hover:bg-paper">
                <div className="flex min-w-0 items-center gap-2">
                  <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-ink font-mono text-[10px] font-semibold text-white">
                    {userInitials}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-[12px] font-medium text-ink">{userName}</p>
                    <p className="truncate font-mono text-[10px] text-ink-faint">{userEmail}</p>
                  </div>
                </div>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex h-6 w-6 items-center justify-center rounded text-ink-faint transition-colors hover:bg-muted hover:text-ink"
                  title="Account"
                  aria-label="Account menu"
                >
                  ⋯
                </button>
              </div>
            ) : (
              <div className="group relative flex justify-center">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="grid h-8 w-8 place-items-center rounded-full bg-ink font-mono text-[10px] font-semibold text-white"
                  title={`${userName} (${userEmail})`}
                >
                  {userInitials}
                </button>
                <div className="pointer-events-none absolute left-full top-1/2 z-50 ml-2 hidden -translate-y-1/2 md:group-hover:block">
                  <div className="whitespace-nowrap rounded-md bg-ink px-2 py-1.5 text-[11px] text-white shadow-md">
                    <p className="font-medium">{userName}</p>
                    <p className="font-mono text-[10px] text-white/60">{userEmail}</p>
                  </div>
                </div>
              </div>
            )}

            {userMenuOpen && (
              <div
                className={`absolute bottom-10 z-50 w-48 rounded-card border border-line bg-white p-1 shadow-md ${
                  sidebarCollapsed ? 'left-12' : 'right-0'
                }`}
              >
                <Link
                  href="/settings"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2 rounded-md px-2 py-1.5 text-[13px] text-ink-soft transition-colors hover:bg-paper hover:text-ink"
                >
                  <KeyRound size={13} />
                  Workspace &amp; keys
                </Link>
                <div className="my-1 h-px border-t border-line" />
                <button
                  onClick={() => signOut()}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-[13px] text-danger transition-colors hover:bg-danger-tint"
                >
                  <LogOut size={13} />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main column */}
      <div
        className={`flex min-h-screen flex-col transition-[padding] duration-200 ease-out ${
          sidebarCollapsed ? 'md:pl-[64px]' : 'md:pl-[232px]'
        }`}
      >
        <header className="header header--sticky">
          <div className="flex min-w-0 items-center gap-2">
            <button
              onClick={toggleSidebar}
              title={sidebarCollapsed ? 'Expand sidebar (⌘B)' : 'Collapse sidebar (⌘B)'}
              className="hidden h-7 w-7 items-center justify-center rounded-md text-ink-faint transition-colors hover:bg-paper hover:text-ink md:flex"
            >
              {sidebarCollapsed ? <PanelLeftOpen size={15} /> : <PanelLeftClose size={15} />}
            </button>
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-ink-soft hover:bg-paper hover:text-ink md:hidden"
              aria-label="Open navigation"
            >
              <Menu size={16} />
            </button>

            <span className="flex shrink-0 items-center md:hidden" aria-hidden="true">
              <Mark className="h-5 w-5 rounded-[6px]" />
            </span>

            <span className="flex min-w-0 items-center gap-1.5 text-[13px]">
              <span className="hidden font-mono text-[11px] uppercase tracking-[0.06em] text-ink-faint sm:inline">
                Console
              </span>
              <span className="hidden text-ink-faint sm:inline">/</span>
              <span className="truncate font-medium text-ink">{current?.label ?? 'Overview'}</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.06em] text-success">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              Ingest live
            </span>
            <Link href="/docs" className="nav-item">
              Documentation
            </Link>
          </div>
        </header>

        <main className="flex-1 px-4 py-7 md:px-8 md:py-8">
          <div className="mx-auto w-full max-w-[1180px]">{children}</div>
        </main>
      </div>
    </div>
  );
}

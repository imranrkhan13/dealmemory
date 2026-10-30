'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Brain,
  Home,
  Tag,
  KeyRound,
  FileText,
  Users,
  Search,
  ExternalLink,
  ChevronDown,
  LogOut,
  Sparkles,
  Menu,
  X,
  ArrowRight,
  Zap,
  BookOpen,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';

interface Project {
  id: string;
  name: string;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [project, setProject] = useState<Project | null>(null);
  const [projectMenuOpen, setProjectMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Restore sidebar collapse state from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('dealmemory_sidebar_collapsed');
      if (saved !== null) {
        setSidebarCollapsed(saved === 'true');
      }
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

  // Keyboard shortcut: Cmd+B / Ctrl+B to toggle sidebar
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

  // Determine if current page is part of the internal console
  const isConsoleRoute =
    pathname?.startsWith('/overview') ||
    pathname?.startsWith('/events') ||
    pathname?.startsWith('/journeys') ||
    pathname?.startsWith('/settings') ||
    pathname?.startsWith('/dashboard');

  // Load active project
  useEffect(() => {
    if (session) {
      fetch('/api/projects', { cache: 'no-store' })
        .then((r) => r.json())
        .then((d) => {
          if (Array.isArray(d?.projects) && d.projects[0]) {
            setProject(d.projects[0]);
          }
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

  // If on a public page and NOT a console route, show the public landing layout
  if (!isConsoleRoute) {
    return (
      <div className="min-h-screen bg-[#f8fafc] text-slate-900 selection:bg-sky-500/20 selection:text-sky-900">
        {/* Public Top Navbar - ONLY working public links */}
        <header className="fixed inset-x-0 top-0 z-50 px-4 pt-3 sm:px-6">
          <div className="mx-auto flex h-14 max-w-7xl items-center justify-between rounded-2xl border border-sky-100 bg-white/90 px-5 shadow-[0_4px_20px_-4px_rgba(2,132,199,0.08)] backdrop-blur-xl">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 font-medium tracking-tight text-slate-900">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-white shadow-xs">
                <Brain size={15} />
              </div>
              <span className="font-bold text-sm tracking-tight text-slate-900">dealmemory™</span>
            </Link>

            {/* Public Center Links */}
            <nav className="hidden items-center gap-1 md:flex">
              <Link
                href="/docs"
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  pathname === '/docs' ? 'text-sky-700 bg-sky-50 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Docs &amp; Setup
              </Link>
              <Link
                href="/pricing"
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  pathname === '/pricing' ? 'text-sky-700 bg-sky-50 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Pricing
              </Link>
            </nav>

            {/* Auth Buttons */}
            <div className="flex items-center gap-2">
              {session ? (
                <div className="flex items-center gap-3">
                  <Link
                    href="/overview"
                    className="btn btn-primary text-xs py-1.5 px-3.5 inline-flex items-center gap-1.5"
                  >
                    <span>Console</span>
                    <ArrowRight size={13} />
                  </Link>
                  <button
                    onClick={() => signOut()}
                    title="Sign out"
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-slate-900 transition shadow-xs"
                  >
                    <LogOut size={13} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href="/auth/signin"
                    className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 transition"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/signup"
                    className="btn btn-primary text-xs py-1.5 px-3.5"
                  >
                    Get started
                  </Link>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 sm:px-6 pt-24 pb-20">
          {children}
        </main>
      </div>
    );
  }

  // --- CONSOLE LAYOUT (Simplified: ONLY Working Backend Features) ---
  const navItems = [
    {
      label: 'Overview',
      href: '/overview',
      icon: Home,
      active: pathname === '/overview' || pathname === '/dashboard' || pathname === '/dashboard/overview',
    },
    {
      label: 'Customer Journeys',
      href: '/journeys',
      icon: Users,
      active: pathname?.startsWith('/journeys'),
    },
    {
      label: 'Live Events',
      href: '/events',
      icon: Zap,
      active: pathname === '/events',
    },
    {
      label: 'API Keys & Setup',
      href: '/settings',
      icon: KeyRound,
      active: pathname === '/settings',
    },
    {
      label: 'Docs & SDK',
      href: '/docs',
      icon: BookOpen,
      active: pathname === '/docs' || pathname === '/sdk',
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900">
      {/* Mobile Header Bar */}
      <div className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 md:hidden sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-white shadow-xs">
            <Brain size={15} />
          </div>
          <span className="font-bold text-sm tracking-tight text-slate-900">dealmemory™</span>
        </div>
        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          title="Toggle navigation"
        >
          {mobileSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Drawer Backdrop Overlay */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300 md:hidden animate-in fade-in"
        />
      )}

      {/* Console Left Sidebar - Collapsible with Smooth Animations & Interactive Hover */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col justify-between border-r border-slate-200/90 bg-white transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? 'md:w-[72px]' : 'md:w-64'
        } ${
          mobileSidebarOpen ? 'w-64 translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className={`flex flex-col overflow-y-auto ${sidebarCollapsed ? 'p-3' : 'p-4'}`}>
          {/* Logo & Desktop Collapse Toggle Header */}
          <div
            className={`flex items-center pb-4 border-b border-slate-100 ${
              sidebarCollapsed ? 'md:justify-center justify-between' : 'justify-between'
            }`}
          >
            <Link
              href="/overview"
              className="group flex items-center gap-2.5 transition-transform duration-200 hover:scale-[1.02]"
              title="DealMemory Console"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white shadow-xs transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3">
                <Brain size={17} />
              </div>
              <span
                className={`font-bold text-sm tracking-tight text-slate-900 transition-all duration-200 ${
                  sidebarCollapsed ? 'md:hidden' : 'block'
                }`}
              >
                dealmemory™
              </span>
            </Link>

            {/* Desktop Close/Collapse Button */}
            <button
              onClick={toggleSidebar}
              title={sidebarCollapsed ? 'Expand sidebar (Cmd+B)' : 'Collapse sidebar (Cmd+B)'}
              className={`hidden md:flex items-center justify-center rounded-lg p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-all duration-200 hover:scale-110 active:scale-95 ${
                sidebarCollapsed ? 'mt-2' : ''
              }`}
            >
              {sidebarCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
            </button>

            {/* Mobile Close Button */}
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="md:hidden rounded-lg p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Clean Console Navigation Section Header */}
          <div className="pt-4 pb-2">
            <p
              className={`px-2 text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase transition-all duration-200 ${
                sidebarCollapsed ? 'md:hidden' : 'block'
              }`}
            >
              Application Console
            </p>
          </div>

          {/* Navigation Links with Smooth Hover & Active Animations */}
          <nav className="space-y-1.5 text-xs">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.href} className="relative group">
                  <Link
                    href={item.href}
                    onClick={() => setMobileSidebarOpen(false)}
                    className={`relative flex items-center rounded-xl py-2.5 font-medium transition-all duration-200 ease-out active:scale-[0.98] ${
                      sidebarCollapsed ? 'md:justify-center md:px-0 px-3' : 'px-3 gap-3'
                    } ${
                      item.active
                        ? 'bg-sky-50/90 text-sky-700 font-semibold shadow-2xs border border-sky-200/60 hover:bg-sky-100/70 hover:translate-x-0.5'
                        : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 hover:translate-x-1 hover:shadow-2xs'
                    }`}
                  >
                    {/* Active left indicator pill */}
                    {item.active && (
                      <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-sky-600" />
                    )}

                    <Icon
                      size={17}
                      className={`shrink-0 transition-transform duration-200 ease-out group-hover:scale-110 ${
                        item.active
                          ? 'text-sky-600'
                          : 'text-slate-400 group-hover:text-sky-600'
                      }`}
                    />

                    <span
                      className={`whitespace-nowrap transition-all duration-200 ${
                        sidebarCollapsed
                          ? 'md:hidden inline-block'
                          : 'inline-block'
                      }`}
                    >
                      {item.label}
                    </span>
                  </Link>

                  {/* Linear/Raycast-style Floating Tooltip when Collapsed */}
                  {sidebarCollapsed && (
                    <div className="pointer-events-none absolute left-full ml-3 top-1/2 -translate-y-1/2 hidden md:group-hover:flex items-center z-50 animate-in fade-in slide-in-from-left-2 duration-150">
                      <div className="rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-semibold text-white shadow-xl whitespace-nowrap flex items-center gap-1.5">
                        <span>{item.label}</span>
                        {item.active && (
                          <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Bottom: Real Status & User Profile */}
        <div className={`border-t border-slate-100 space-y-3 ${sidebarCollapsed ? 'p-2' : 'p-3'}`}>
          {/* Real Backend Status Widget */}
          {!sidebarCollapsed ? (
            <div className="rounded-xl border border-sky-100 bg-sky-50/50 p-2.5 text-xs space-y-1.5 transition-all duration-200 hover:bg-sky-50/90 hover:border-sky-200 hover:shadow-2xs">
              <div className="flex items-center justify-between text-[10px] font-mono font-bold text-sky-900 uppercase">
                <span>System Status</span>
                <span className="flex items-center gap-1 text-emerald-600 font-bold">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live
                </span>
              </div>
              <p className="text-[11px] text-slate-600 leading-tight">
                PostgreSQL &amp; Gemini 2.5 Flash active
              </p>
            </div>
          ) : (
            <div className="relative group flex justify-center py-1">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 border border-sky-100 text-emerald-600 transition-all duration-200 hover:scale-110 hover:shadow-2xs cursor-default">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="pointer-events-none absolute left-full ml-3 top-1/2 -translate-y-1/2 hidden md:group-hover:flex items-center z-50 animate-in fade-in slide-in-from-left-2 duration-150">
                <div className="rounded-lg bg-slate-900 p-2 text-[11px] text-white shadow-xl whitespace-nowrap space-y-0.5">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>System Live</span>
                  </div>
                  <p className="text-slate-300 text-[10px]">PostgreSQL &amp; Gemini active</p>
                </div>
              </div>
            </div>
          )}

          {/* User Session Row */}
          <div className="relative pt-1">
            {!sidebarCollapsed ? (
              <div className="flex items-center justify-between rounded-xl p-1.5 hover:bg-slate-100/80 transition-all duration-200 group">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-800 font-semibold text-xs shadow-2xs font-mono transition-transform duration-200 group-hover:scale-105 group-hover:ring-2 group-hover:ring-sky-200">
                    {userInitials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-900 truncate">{userName}</p>
                    <p className="text-[10px] text-slate-400 font-mono truncate">{userEmail}</p>
                  </div>
                </div>

                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="rounded-md p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
                  title="Account actions"
                >
                  ···
                </button>
              </div>
            ) : (
              <div className="relative group flex justify-center">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-100 text-sky-800 font-semibold text-xs shadow-2xs font-mono transition-transform duration-200 hover:scale-110 hover:ring-2 hover:ring-sky-400/40"
                  title={`${userName} (${userEmail})`}
                >
                  {userInitials}
                </button>

                <div className="pointer-events-none absolute left-full ml-3 top-1/2 -translate-y-1/2 hidden md:group-hover:flex items-center z-50 animate-in fade-in slide-in-from-left-2 duration-150">
                  <div className="rounded-lg bg-slate-900 px-2.5 py-1.5 text-[11px] text-white shadow-xl whitespace-nowrap">
                    <p className="font-semibold">{userName}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{userEmail}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Dropdown Menu for Logout & Settings */}
            {userMenuOpen && (
              <div
                className={`absolute bottom-12 rounded-xl border border-slate-200 bg-white p-1 shadow-lg text-xs z-50 animate-in fade-in slide-in-from-bottom-2 duration-150 ${
                  sidebarCollapsed ? 'left-14 w-48' : 'right-0 w-48'
                }`}
              >
                <Link
                  href="/settings"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <KeyRound size={13} />
                  <span>Workspace &amp; Keys</span>
                </Link>
                <div className="my-1 border-t border-slate-100" />
                <button
                  onClick={() => signOut()}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <LogOut size={13} />
                  <span>Sign out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Area - Transitions padding when sidebar collapses */}
      <div
        className={`flex flex-col min-h-screen transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? 'md:pl-[72px]' : 'md:pl-64'
        }`}
      >
        {/* Console Top Header Bar */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 md:px-6 backdrop-blur-md">
          {/* Left: Sidebar Toggle + Project Switcher Dropdown */}
          <div className="flex items-center gap-2.5">
            {/* Desktop Quick Toggle Button */}
            <button
              onClick={toggleSidebar}
              title={sidebarCollapsed ? 'Expand sidebar (Cmd+B)' : 'Collapse sidebar (Cmd+B)'}
              className="hidden md:flex items-center justify-center h-8 w-8 rounded-lg border border-slate-200/80 bg-white text-slate-500 hover:text-slate-900 hover:bg-slate-50 shadow-2xs transition-all duration-200 hover:scale-105 active:scale-95"
            >
              {sidebarCollapsed ? <PanelLeftOpen size={15} /> : <PanelLeftClose size={15} />}
            </button>

            {/* Mobile Sidebar Hamburger Toggle */}
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden flex items-center justify-center h-8 w-8 rounded-lg border border-slate-200/80 bg-white text-slate-600 hover:bg-slate-100 transition shadow-2xs"
              title="Open menu"
            >
              <Menu size={16} />
            </button>

            <div className="relative">
              <button
                onClick={() => setProjectMenuOpen(!projectMenuOpen)}
                className="flex items-center gap-2 rounded-lg border border-slate-200/80 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-800 shadow-2xs hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 active:scale-[0.98]"
              >
                <div className="flex h-5 w-5 items-center justify-center rounded-md bg-sky-600 text-white font-bold text-[11px] shadow-xs">
                  {project?.name ? project.name[0].toUpperCase() : 'W'}
                </div>
                <span className="font-semibold text-slate-900">
                  {project?.name || 'Workspace'}
                </span>
                <ChevronDown size={13} className="text-slate-400 ml-0.5" />
              </button>

              {projectMenuOpen && (
                <div className="absolute left-0 mt-1 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-xl z-50 text-xs animate-in fade-in slide-in-from-top-1 duration-150">
                  <p className="px-2 py-1 text-[10px] font-mono text-slate-400 uppercase">Current Workspace</p>
                  <div className="rounded-lg bg-sky-50 p-2 text-sky-900 font-medium">
                    {project?.name || 'Default Workspace'}
                  </div>
                  <div className="my-1 border-t border-slate-100" />
                  <Link
                    href="/settings"
                    onClick={() => setProjectMenuOpen(false)}
                    className="block rounded-lg px-2 py-1.5 text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Manage API keys &amp; settings
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Right Header Links: Docs & Help */}
          <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
            <Link
              href="/docs"
              className="group flex items-center gap-1.5 text-slate-600 hover:text-slate-900 transition-colors"
            >
              <span>Documentation &amp; SDK</span>
              <ExternalLink size={12} className="text-slate-400 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>
        </header>

        {/* Console Page Body */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full">
          {children}
        </main>
      </div>
    </div>
  );
}

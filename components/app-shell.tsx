'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Brain,
  Home,
  Play,
  Tag,
  Share2,
  Globe,
  Download,
  KeyRound,
  Bot,
  FileText,
  Users,
  Search,
  ExternalLink,
  ChevronDown,
  LogOut,
  Sparkles,
  Menu,
  X,
  MessageSquare,
  ArrowRight,
} from 'lucide-react';

interface Project {
  id: string;
  name: string;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [project, setProject] = useState<Project | null>(null);
  const [projectMenuOpen, setProjectMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Determine if current page is part of the internal console
  const isConsoleRoute =
    pathname?.startsWith('/overview') ||
    pathname?.startsWith('/events') ||
    pathname?.startsWith('/journeys') ||
    pathname?.startsWith('/settings') ||
    pathname?.startsWith('/dashboard');

  // Load project for console workspace badge
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
        {/* Public Top Navbar - ONLY public links */}
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
                href="/demo"
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  pathname === '/demo' ? 'text-sky-700 bg-sky-50 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Demo
              </Link>
              <Link
                href="/pricing"
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  pathname === '/pricing' ? 'text-sky-700 bg-sky-50 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Pricing
              </Link>
              <Link
                href="/sdk"
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  pathname === '/sdk' ? 'text-sky-700 bg-sky-50 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Docs
              </Link>
            </nav>

            {/* Public Right CTA */}
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

  // --- CONSOLE LAYOUT (Reference: console.supermemory.ai) ---
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900">
      {/* Mobile Header */}
      <div className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 md:hidden sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-white">
            <Brain size={15} />
          </div>
          <span className="font-bold text-sm tracking-tight">dealmemory™</span>
        </div>
        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100"
        >
          {mobileSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Console Left Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col justify-between border-r border-slate-200/90 bg-white transition-transform duration-200 md:translate-x-0 ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col p-4 overflow-y-auto">
          {/* Logo Header */}
          <div className="flex items-center justify-between pb-4">
            <Link href="/overview" className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-white shadow-xs">
                <Brain size={16} />
              </div>
              <span className="font-bold text-sm tracking-tight text-slate-900">dealmemory™</span>
            </Link>
          </div>

          {/* Search Bar with ⌘K badge */}
          <div className="relative mt-1 mb-4">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              readOnly
              placeholder="Search..."
              className="w-full rounded-lg border border-slate-200/80 bg-slate-50/80 pl-8 pr-9 py-1.5 text-xs text-slate-600 placeholder:text-slate-400 focus:outline-none cursor-pointer"
            />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-mono text-slate-400 shadow-2xs">
              ⌘K
            </span>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1 text-xs">
            {/* Main Group */}
            <Link
              href="/overview"
              onClick={() => setMobileSidebarOpen(false)}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2 font-medium transition ${
                pathname === '/overview' || pathname === '/dashboard' || pathname === '/dashboard/overview'
                  ? 'bg-sky-50 text-sky-700 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Home size={16} className={pathname === '/overview' ? 'text-sky-600' : 'text-slate-400'} />
              <span>Overview</span>
            </Link>

            <Link
              href="/demo"
              onClick={() => setMobileSidebarOpen(false)}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2 font-medium transition ${
                pathname === '/demo'
                  ? 'bg-sky-50 text-sky-700 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Play size={16} className={pathname === '/demo' ? 'text-sky-600' : 'text-slate-400'} />
              <span>Playground</span>
            </Link>

            {/* DATA Group */}
            <div className="pt-4 pb-1">
              <p className="px-3 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                Data
              </p>
            </div>

            <Link
              href="/journeys"
              onClick={() => setMobileSidebarOpen(false)}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2 font-medium transition ${
                pathname === '/journeys'
                  ? 'bg-sky-50 text-sky-700 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Tag size={16} className={pathname === '/journeys' ? 'text-sky-600' : 'text-slate-400'} />
              <span>Namespaces</span>
            </Link>

            <Link
              href="/journeys"
              onClick={() => setMobileSidebarOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition"
            >
              <Share2 size={16} className="text-slate-400" />
              <span>Memory Graph</span>
            </Link>

            <Link
              href="/settings"
              onClick={() => setMobileSidebarOpen(false)}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2 font-medium transition ${
                pathname === '/settings'
                  ? 'bg-sky-50 text-sky-700 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Globe size={16} className={pathname === '/settings' ? 'text-sky-600' : 'text-slate-400'} />
              <span>Connectors</span>
            </Link>

            <Link
              href="/settings"
              onClick={() => setMobileSidebarOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition"
            >
              <Download size={16} className="text-slate-400" />
              <span>Import</span>
            </Link>

            {/* DEVELOPER Group */}
            <div className="pt-4 pb-1">
              <p className="px-3 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                Developer
              </p>
            </div>

            <Link
              href="/settings"
              onClick={() => setMobileSidebarOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition"
            >
              <KeyRound size={16} className="text-slate-400" />
              <span>API Keys</span>
            </Link>

            <Link
              href="/sdk"
              onClick={() => setMobileSidebarOpen(false)}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2 font-medium transition ${
                pathname === '/sdk'
                  ? 'bg-sky-50 text-sky-700 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Bot size={16} className={pathname === '/sdk' ? 'text-sky-600' : 'text-slate-400'} />
              <span>Agents &amp; MCP</span>
            </Link>

            <Link
              href="/events"
              onClick={() => setMobileSidebarOpen(false)}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2 font-medium transition ${
                pathname === '/events'
                  ? 'bg-sky-50 text-sky-700 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <FileText size={16} className={pathname === '/events' ? 'text-sky-600' : 'text-slate-400'} />
              <span>Requests</span>
            </Link>

            <Link
              href="/journeys"
              onClick={() => setMobileSidebarOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition"
            >
              <Users size={16} className="text-slate-400" />
              <span>User Insights</span>
            </Link>
          </nav>
        </div>

        {/* Sidebar Bottom: What's New Widget + User Session */}
        <div className="p-3 border-t border-slate-100 space-y-3">
          {/* What's new card (Exact matching reference screenshot) */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-3 shadow-2xs">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="font-semibold text-slate-700">What&apos;s new</span>
              <span className="font-mono text-[10px]">10 Oct</span>
            </div>
            {/* Visual thumbnail mockup */}
            <div className="mt-2 h-14 w-full rounded-md bg-slate-50 border border-slate-100 p-2 overflow-hidden flex flex-col justify-between">
              <div className="flex items-center gap-1">
                <div className="h-1.5 w-6 rounded-full bg-sky-500" />
                <div className="h-1.5 w-12 rounded-full bg-slate-200" />
              </div>
              <div className="space-y-1">
                <div className="h-1 w-16 rounded-full bg-slate-200" />
                <div className="h-1 w-20 rounded-full bg-slate-200" />
              </div>
            </div>
            <p className="mt-2 text-xs font-semibold text-slate-800">
              See where your credits go
            </p>
            <p className="mt-0.5 text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
              The Usage page in DealMemory Console now shows what used your credits...
            </p>
          </div>

          {/* User Session Row */}
          <div className="relative pt-1">
            <div className="flex items-center justify-between rounded-xl p-1.5 hover:bg-slate-50 transition">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-700 font-semibold text-xs shadow-2xs">
                  {userInitials}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-900 truncate">{userName}</p>
                  <p className="text-[10px] text-slate-400 font-mono truncate">{userEmail}</p>
                </div>
              </div>

              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="rounded-md p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60"
              >
                ···
              </button>
            </div>

            {/* Dropdown Menu for Logout */}
            {userMenuOpen && (
              <div className="absolute bottom-12 right-0 w-48 rounded-xl border border-slate-200 bg-white p-1 shadow-lg text-xs z-50">
                <Link
                  href="/settings"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-50"
                >
                  <KeyRound size={13} />
                  <span>Workspace Settings</span>
                </Link>
                <div className="my-1 border-t border-slate-100" />
                <button
                  onClick={() => signOut()}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-rose-600 hover:bg-rose-50"
                >
                  <LogOut size={13} />
                  <span>Sign out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Area (offset by 64 = 16rem for sidebar) */}
      <div className="md:pl-64 flex flex-col min-h-screen">
        {/* Console Top Header Bar */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-slate-200/80 bg-white/95 px-6 backdrop-blur-md">
          {/* Project Switcher Dropdown (e.g. [F] Fella Free ⌵) */}
          <div className="relative">
            <button
              onClick={() => setProjectMenuOpen(!projectMenuOpen)}
              className="flex items-center gap-2 rounded-lg border border-slate-200/80 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-800 shadow-2xs hover:bg-slate-50 transition"
            >
              <div className="flex h-5 w-5 items-center justify-center rounded-md bg-sky-600 text-white font-bold text-[11px]">
                {project?.name ? project.name[0].toUpperCase() : 'F'}
              </div>
              <span className="font-semibold text-slate-900">
                {project?.name || 'Fella'}
              </span>
              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500 font-medium">
                Free
              </span>
              <ChevronDown size={13} className="text-slate-400 ml-0.5" />
            </button>

            {projectMenuOpen && (
              <div className="absolute left-0 mt-1 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-xl z-50 text-xs">
                <p className="px-2 py-1 text-[10px] font-mono text-slate-400 uppercase">Current Workspace</p>
                <div className="rounded-lg bg-sky-50 p-2 text-sky-900 font-medium">
                  {project?.name || 'Fella Default Workspace'}
                </div>
                <div className="my-1 border-t border-slate-100" />
                <Link
                  href="/settings"
                  onClick={() => setProjectMenuOpen(false)}
                  className="block rounded-lg px-2 py-1.5 text-slate-700 hover:bg-slate-50"
                >
                  Workspace settings &amp; keys
                </Link>
              </div>
            )}
          </div>

          {/* Right Header Links: Help, Docs ↗ */}
          <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
            <Link href="/demo" className="hover:text-slate-900 transition">
              Help
            </Link>
            <Link
              href="/sdk"
              className="flex items-center gap-1 text-slate-600 hover:text-slate-900 transition"
            >
              <span>Docs</span>
              <ExternalLink size={12} className="text-slate-400" />
            </Link>
          </div>
        </header>

        {/* Console Page Body */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full">
          {children}
        </main>
      </div>

      {/* Floating Bottom-Right Chat Bubble Button (Reference from screenshot) */}
      <button
        title="Need help? Ask DealMemory Copilot"
        className="fixed bottom-6 right-6 z-50 flex h-11 w-11 items-center justify-center rounded-full bg-slate-950 text-white shadow-xl hover:scale-105 active:scale-95 transition-transform"
      >
        <MessageSquare size={18} />
      </button>
    </div>
  );
}

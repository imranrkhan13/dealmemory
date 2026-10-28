'use client';

import { useEffect, useState, useMemo } from 'react';
import { AppShell } from '@/components/app-shell';
import ProjectGate from '@/components/project-gate';
import { Activity, Search, Filter, Clock3, User, Globe, ChevronDown, ChevronRight, Copy, Check, Terminal } from 'lucide-react';

type Event = {
  id: string;
  name: string;
  userId?: string;
  anonymousId: string;
  url?: string;
  occurredAt: string;
  properties: Record<string, string | number | boolean | null>;
};

export default function EventsPage() {
  return (
    <AppShell>
      <ProjectGate>
        <EventsView />
      </ProjectGate>
    </AppShell>
  );
}

function EventsView() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const projectsResponse = await fetch('/api/projects', { cache: 'no-store' });
        const projectsData = await projectsResponse.json();
        const project = Array.isArray(projectsData?.projects) ? projectsData.projects[0] : null;
        if (!project?.id) {
          setEvents([]);
          return;
        }

        const eventsResponse = await fetch(`/api/v1/events/recent?projectId=${encodeURIComponent(project.id)}&limit=500`, { cache: 'no-store' });
        const eventsData = await eventsResponse.json();
        if (!eventsResponse.ok) throw new Error(eventsData?.error ?? 'Could not load events');
        setEvents(Array.isArray(eventsData?.events) ? eventsData.events : []);
      } catch (reason) {
        setError(reason instanceof Error ? reason.message : 'Could not load events');
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, []);

  const eventTypes = useMemo(() => {
    const set = new Set<string>();
    events.forEach((e) => set.add(e.name));
    return Array.from(set);
  }, [events]);

  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      const matchesSearch =
        search === '' ||
        e.name.toLowerCase().includes(search.toLowerCase()) ||
        (e.userId && e.userId.toLowerCase().includes(search.toLowerCase())) ||
        e.anonymousId.toLowerCase().includes(search.toLowerCase()) ||
        (e.url && e.url.toLowerCase().includes(search.toLowerCase()));

      const matchesFilter = selectedFilter === 'all' || e.name === selectedFilter;

      return matchesSearch && matchesFilter;
    });
  }, [events, search, selectedFilter]);

  const copyText = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch {}
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="eyebrow">
              <Activity size={13} /> Telemetry Log
            </span>
            <span className="text-xs font-mono text-zinc-500">Live Stream</span>
          </div>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Event Explorer
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Real-time feed of captured user actions, milestones, and property payloads.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto rounded-xl border border-white/[0.08] bg-zinc-900/60 px-4 py-2 backdrop-blur">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-semibold text-zinc-300 tabular-nums">
            {events.length} observed events
          </span>
        </div>
      </div>

      {/* Controls: Search & Category Chips */}
      <div className="flex flex-col gap-3 rounded-2xl border border-white/[0.08] bg-zinc-900/60 p-4 shadow-xl backdrop-blur-xl">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search events by name, user ID, anonymous ID, or URL..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full !pl-10 !pr-4 !py-2.5 text-xs !bg-zinc-950/70 border border-white/[0.08] rounded-xl text-white placeholder-zinc-500 focus:border-indigo-500"
          />
        </div>

        {eventTypes.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                selectedFilter === 'all'
                  ? 'bg-white text-zinc-950 font-semibold'
                  : 'bg-zinc-950/60 text-zinc-400 hover:text-white border border-white/[0.06]'
              }`}
            >
              All ({events.length})
            </button>
            {eventTypes.map((type) => {
              const count = events.filter((e) => e.name === type).length;
              return (
                <button
                  key={type}
                  onClick={() => setSelectedFilter(type)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                    selectedFilter === type
                      ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                      : 'bg-zinc-950/60 text-zinc-400 hover:text-white border border-white/[0.06]'
                  }`}
                >
                  {type.replace(/_/g, ' ')} ({count})
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Status Messages */}
      {loading && (
        <div className="py-20 text-center text-xs text-zinc-400 flex items-center justify-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          Loading recent event telemetry…
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-5 text-sm text-rose-300">
          {error}
        </div>
      )}

      {/* Events List */}
      {!loading && !error && filteredEvents.length > 0 && (
        <div className="space-y-3">
          {filteredEvents.map((event) => {
            const isExpanded = expandedId === event.id;
            const propKeys = Object.keys(event.properties);
            const userIdentifier = event.userId ?? event.anonymousId;

            return (
              <div
                key={event.id}
                className="overflow-hidden rounded-2xl border border-white/[0.08] bg-zinc-900/60 shadow-xl backdrop-blur-xl transition hover:border-white/[0.14]"
              >
                <div
                  onClick={() => setExpandedId(isExpanded ? null : event.id)}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 cursor-pointer hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500/20 to-violet-500/20 border border-indigo-500/30 text-indigo-400">
                      <Activity size={15} />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-white capitalize">
                          {event.name.replace(/_/g, ' ')}
                        </span>
                        <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] font-mono text-zinc-400">
                          {userIdentifier}
                        </span>
                      </div>

                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-zinc-400 font-mono">
                        {event.url && (
                          <span className="flex items-center gap-1 text-zinc-500 truncate max-w-sm">
                            <Globe size={11} /> {event.url}
                          </span>
                        )}
                        <span>·</span>
                        <span>{propKeys.length} properties</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 text-xs text-zinc-400 shrink-0">
                    <time className="font-mono text-[11px] text-zinc-500">
                      {new Date(event.occurredAt).toLocaleString()}
                    </time>
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-950/60 text-zinc-400">
                      {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </div>
                  </div>
                </div>

                {/* Expanded Details Drawer */}
                {isExpanded && (
                  <div className="border-t border-white/[0.06] bg-zinc-950/80 p-5 space-y-4 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                        Event Payload JSON
                      </p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          copyText(JSON.stringify(event, null, 2), event.id);
                        }}
                        className="btn text-xs py-1 px-2.5 inline-flex items-center gap-1.5"
                      >
                        {copiedId === event.id ? (
                          <>
                            <Check size={12} className="text-emerald-400" /> Copied
                          </>
                        ) : (
                          <>
                            <Copy size={12} /> Copy JSON
                          </>
                        )}
                      </button>
                    </div>

                    <pre className="rounded-xl border border-white/[0.06] bg-zinc-900/90 p-4 font-mono text-xs text-indigo-200 overflow-x-auto leading-relaxed">
                      {JSON.stringify(event, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {!loading && !error && filteredEvents.length === 0 && (
        <div className="rounded-2xl border border-white/[0.08] bg-zinc-900/40 p-12 text-center">
          <Terminal size={32} className="mx-auto text-zinc-600 mb-3" />
          <h3 className="font-semibold text-white text-base">No matching events</h3>
          <p className="mt-1 text-xs text-zinc-400 max-w-md mx-auto">
            {events.length === 0
              ? "No events have been captured yet. Install the SDK snippet in your product to begin recording user milestones."
              : "No events matched your current search filters. Try clearing your search query."}
          </p>
        </div>
      )}
    </div>
  );
}

'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import {
  Activity,
  Search,
  Globe,
  ChevronDown,
  ChevronRight,
  Copy,
  Check,
  Terminal,
  Sparkles,
  RefreshCw,
  Zap,
} from 'lucide-react';

type Event = {
  id: string;
  name: string;
  userId?: string;
  anonymousId: string;
  url?: string;
  occurredAt: string;
  properties: Record<string, string | number | boolean | null>;
};

function safeFormatDateTime(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'recently';
    return d.toLocaleString();
  } catch {
    return 'recently';
  }
}

export default function EventsView() {
  const [events, setEvents] = useState<Event[]>([]);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadEvents = useCallback(async (isPolling = false) => {
    try {
      if (!isPolling) setLoading(true);
      const projectsResponse = await fetch('/api/projects', { cache: 'no-store' });
      const projectsData = await projectsResponse.json();
      const project = Array.isArray(projectsData?.projects) ? projectsData.projects[0] : null;
      if (!project?.id) {
        setEvents([]);
        return;
      }
      setProjectId(project.id);

      const eventsResponse = await fetch(
        `/api/v1/events/recent?projectId=${encodeURIComponent(project.id)}&limit=500`,
        { cache: 'no-store' }
      );
      const eventsData = await eventsResponse.json();
      if (!eventsResponse.ok) {
        console.warn('Events recent fetch warning:', eventsResponse.status, eventsData);
        if (eventsResponse.status === 401) {
          throw new Error('Authentication required. Please sign in.');
        }
        if (eventsResponse.status === 403) {
          throw new Error('Access restricted to project owner.');
        }
        setEvents([]);
        setError(null);
        return;
      }
      setEvents(Array.isArray(eventsData?.events) ? eventsData.events : []);
      setError(null);
    } catch (reason) {
      if (!isPolling) {
        setError(reason instanceof Error ? reason.message : 'Could not load events');
      }
    } finally {
      if (!isPolling) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadEvents();
    const interval = setInterval(() => {
      void loadEvents(true);
    }, 5000);
    return () => clearInterval(interval);
  }, [loadEvents]);

  const handleSimulate = async () => {
    if (!projectId || simulating) return;
    try {
      setSimulating(true);
      const res = await fetch(`/api/v1/demo/simulate?projectId=${encodeURIComponent(projectId)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      if (res.ok) {
        await loadEvents();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSimulating(false);
    }
  };

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
          <span className="eyebrow">Telemetry log</span>
          <h1 className="mt-2 text-[28px] font-medium leading-tight tracking-[-0.025em] text-ink">
            Live events
          </h1>
          <p className="mt-1 max-w-2xl text-[13px] text-ink-soft">
            Real-time feed of captured user actions, milestones, and property payloads.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            onClick={handleSimulate}
            disabled={simulating}
            className="btn btn-outline text-xs py-2 px-3.5 inline-flex items-center gap-1.5 bg-white  hover:border-accent-line"
          >
            {simulating ? (
              <RefreshCw size={12} className="animate-spin text-accent" />
            ) : (
              <Sparkles size={12} className="text-accent" />
            )}
            <span>{simulating ? 'Simulating…' : 'Simulate Events'}</span>
          </button>

          <div className="flex items-center gap-2 rounded-md border border-line bg-white px-2.5 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            <span className="font-mono text-[11px] text-ink-soft tabular-nums">
              {events.length} events
            </span>
          </div>
        </div>
      </div>

      {/* Controls: Search & Category Chips */}
      <div className="flex flex-col gap-3 rounded-card border border-line bg-white p-4 ">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint" />
          <input
            type="text"
            placeholder="Search events by name, user ID, anonymous ID, or URL..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full !pl-10 !pr-4 !py-2.5 text-xs !bg-paper border border-line rounded-lg text-ink placeholder-slate-400 focus:border-accent"
          />
        </div>

        {eventTypes.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                selectedFilter === 'all'
                  ? 'bg-accent text-white font-semibold '
                  : 'bg-paper text-ink-soft hover:text-accent hover:bg-accent-tint border border-line'
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
                      ? 'bg-accent text-white font-semibold '
                      : 'bg-paper text-ink-soft hover:text-accent hover:bg-accent-tint border border-line'
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
        <div className="py-20 text-center text-xs text-ink-soft flex items-center justify-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          Loading recent event telemetry…
        </div>
      )}

      {error && (
        <div className="rounded-card border border-danger/40 bg-danger-tint p-5 text-sm text-danger flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={() => void loadEvents()}
            className="text-xs font-semibold text-danger underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Events List */}
      {!loading && !error && filteredEvents.length > 0 && (
        <div className="divide-y divide-line overflow-hidden rounded-card border border-line bg-white">
          {filteredEvents.map((event) => {
            const isExpanded = expandedId === event.id;
            const propKeys = Object.keys(event.properties || {});
            const userIdentifier = event.userId ?? event.anonymousId;

            return (
              <div key={event.id}>
                <div
                  onClick={() => setExpandedId(isExpanded ? null : event.id)}
                  className="flex cursor-pointer flex-col justify-between gap-3 px-4 py-3 transition-colors hover:bg-paper sm:flex-row sm:items-center"
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center text-ink-faint">
                      <Activity size={14} />
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[13px] font-medium capitalize text-ink">
                          {event.name.replace(/_/g, ' ')}
                        </span>
                        <span className="tag-mono">{userIdentifier}</span>
                      </div>

                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-ink-soft font-mono">
                        {event.url && (
                          <span className="flex items-center gap-1 text-ink-soft truncate max-w-sm">
                            <Globe size={11} /> {event.url}
                          </span>
                        )}
                        <span>·</span>
                        <span>{propKeys.length} properties</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center justify-between gap-3 text-xs text-ink-soft sm:justify-end">
                    <time className="font-mono text-[10px] tabular-nums text-ink-faint">
                      {safeFormatDateTime(event.occurredAt)}
                    </time>
                    <div className="flex h-6 w-6 items-center justify-center text-ink-faint">
                      {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </div>
                  </div>
                </div>

                {/* Expanded Details Drawer */}
                {isExpanded && (
                  <div className="space-y-4 border-t border-line bg-paper p-4">
                    <div className="flex items-center justify-between">
                      <p className="mono-label">Event payload</p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          copyText(JSON.stringify(event, null, 2), event.id);
                        }}
                        className="btn text-xs py-1 px-2.5 inline-flex items-center gap-1.5"
                      >
                        {copiedId === event.id ? (
                          <>
                            <Check size={12} className="text-success" /> Copied
                          </>
                        ) : (
                          <>
                            <Copy size={12} /> Copy JSON
                          </>
                        )}
                      </button>
                    </div>

                    <pre className="overflow-x-auto rounded-lg border border-ink bg-ink p-4 font-mono text-[11px] leading-relaxed text-[#cfd6df]">
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
        <div className="rounded-card border border-line bg-white p-12 text-center ">
          <Terminal size={32} className="mx-auto text-ink-faint mb-3" />
          <h3 className="font-medium text-[14px] text-ink">No telemetry events captured yet</h3>
          <p className="mt-1 text-xs text-ink-soft max-w-md mx-auto">
            {events.length === 0
              ? 'Your live ingestion pipeline is ready. Send a test event or click Simulate below to populate your live feed.'
              : 'No events matched your current search filters. Try clearing your search query.'}
          </p>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleSimulate}
              disabled={simulating}
              className="btn btn-primary text-xs py-2.5 px-4 inline-flex items-center gap-2"
            >
              {simulating ? (
                <RefreshCw size={13} className="animate-spin text-white" />
              ) : (
                <Zap size={13} className="text-accent" />
              )}
              <span>{simulating ? 'Simulating…' : 'Simulate Live Event Sequence'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

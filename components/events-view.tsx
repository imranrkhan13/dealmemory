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
        if (eventsResponse.status === 401 || eventsResponse.status === 403) {
          throw new Error(eventsData?.error ?? 'Authentication required');
        }
        setEvents([]);
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
          <div className="flex items-center gap-2">
            <span className="eyebrow">
              <Activity size={13} /> Telemetry Log
            </span>
            <span className="text-xs font-mono text-slate-400">Live Stream</span>
          </div>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Live Events
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Real-time feed of captured user actions, milestones, and property payloads.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            onClick={handleSimulate}
            disabled={simulating}
            className="btn btn-outline text-xs py-2 px-3.5 inline-flex items-center gap-1.5 bg-white shadow-2xs hover:border-sky-300"
          >
            {simulating ? (
              <RefreshCw size={12} className="animate-spin text-sky-600" />
            ) : (
              <Sparkles size={12} className="text-sky-600" />
            )}
            <span>{simulating ? 'Simulating…' : 'Simulate Events'}</span>
          </button>

          <div className="flex items-center gap-2 rounded-xl border border-sky-100 bg-white px-3.5 py-2 shadow-xs">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-slate-700 tabular-nums">
              {events.length} events
            </span>
          </div>
        </div>
      </div>

      {/* Controls: Search & Category Chips */}
      <div className="flex flex-col gap-3 rounded-2xl border border-sky-100 bg-white p-4 shadow-sm">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search events by name, user ID, anonymous ID, or URL..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full !pl-10 !pr-4 !py-2.5 text-xs !bg-slate-50/70 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:border-sky-500"
          />
        </div>

        {eventTypes.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                selectedFilter === 'all'
                  ? 'bg-sky-600 text-white font-semibold shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:text-sky-700 hover:bg-sky-50 border border-slate-200'
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
                      ? 'bg-sky-600 text-white font-semibold shadow-xs'
                      : 'bg-slate-50 text-slate-600 hover:text-sky-700 hover:bg-sky-50 border border-slate-200'
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
        <div className="py-20 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
          Loading recent event telemetry…
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700 flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={() => void loadEvents()}
            className="text-xs font-semibold text-rose-800 underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Events List */}
      {!loading && !error && filteredEvents.length > 0 && (
        <div className="space-y-3">
          {filteredEvents.map((event) => {
            const isExpanded = expandedId === event.id;
            const propKeys = Object.keys(event.properties || {});
            const userIdentifier = event.userId ?? event.anonymousId;

            return (
              <div
                key={event.id}
                className="overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-sm transition hover:border-sky-300"
              >
                <div
                  onClick={() => setExpandedId(isExpanded ? null : event.id)}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 cursor-pointer hover:bg-sky-50/30 transition-colors"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-sky-50 border border-sky-200 text-sky-600">
                      <Activity size={15} />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-slate-900 capitalize">
                          {event.name.replace(/_/g, ' ')}
                        </span>
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-mono text-slate-600">
                          {userIdentifier}
                        </span>
                      </div>

                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500 font-mono">
                        {event.url && (
                          <span className="flex items-center gap-1 text-slate-500 truncate max-w-sm">
                            <Globe size={11} /> {event.url}
                          </span>
                        )}
                        <span>·</span>
                        <span>{propKeys.length} properties</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 text-xs text-slate-500 shrink-0">
                    <time className="font-mono text-[11px] text-slate-500">
                      {safeFormatDateTime(event.occurredAt)}
                    </time>
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-500">
                      {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </div>
                  </div>
                </div>

                {/* Expanded Details Drawer */}
                {isExpanded && (
                  <div className="border-t border-slate-100 bg-slate-50/70 p-5 space-y-4 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-600 font-mono">
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
                            <Check size={12} className="text-emerald-600" /> Copied
                          </>
                        ) : (
                          <>
                            <Copy size={12} /> Copy JSON
                          </>
                        )}
                      </button>
                    </div>

                    <pre className="rounded-xl border border-slate-800 bg-slate-900 p-4 font-mono text-xs text-sky-200 overflow-x-auto leading-relaxed shadow-inner">
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
        <div className="rounded-2xl border border-sky-100 bg-white p-12 text-center shadow-sm">
          <Terminal size={32} className="mx-auto text-slate-300 mb-3" />
          <h3 className="font-semibold text-slate-900 text-base">No telemetry events captured yet</h3>
          <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto">
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
                <Zap size={13} className="text-sky-200" />
              )}
              <span>{simulating ? 'Simulating…' : 'Simulate Live Event Sequence'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

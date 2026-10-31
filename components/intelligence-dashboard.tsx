"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, RotateCcw } from "lucide-react";
type J = {
  userId: string;
  events: any[];
  state: string;
  recommendation: string;
  blocker?: string;
  inactiveHours: number;
};
const steps = [
  ["trial_started", "Trial started"],
  ["repository_connected", "Connected repository"],
  ["first_map_generated", "Generated first map"],
  ["checkout_started", "Checkout started"],
  ["payment_completed", "Paid"],
];
export default function IntelligenceDashboard() {
  const [d, setD] = useState<any>();
  const [filter, setFilter] = useState("");
  const load = () =>
    fetch("/api/v1/journeys")
      .then((r) => r.json())
      .then(setD);
  useEffect(() => {
    load();
  }, []);
  if (!d)
    return (
      <main className="mx-auto max-w-6xl p-8 text-sm text-[text-ink-soft]">
        Loading demo tenant…
      </main>
    );
  const all = d.journeys as J[];
  const attention = (
    filter ? all.filter((j) => j.events.some((e) => e.name === filter)) : all
  ).filter((j) => ["stuck", "active", "checkout_started"].includes(j.state));
  const oauth = all.filter((j) => j.blocker === "GitHub authorization failed");
  return (
    <main className="mx-auto max-w-6xl px-5 py-9">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-[text-accent]">
            Overview · RepoMap demo tenant
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            See where trials lose momentum.
          </h1>
          <p className="mt-2 text-sm text-[text-ink-soft]">
            DealMemory turns product events and user context into the next best
            intervention.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-[text-ink-soft]">
            Last event received: demo data
          </span>
          <button
            className="btn"
            onClick={async () => {
              await fetch("/api/v1/demo/reset", { method: "POST" });
              await load();
            }}
          >
            <RotateCcw size={15} /> Reset demo
          </button>
        </div>
      </div>
      <section className="mt-10">
        <div className="flex justify-between">
          <h2 className="font-semibold">Activation funnel</h2>
          {filter && (
            <button
              className="text-sm text-[text-accent]"
              onClick={() => setFilter("")}
            >
              Clear filter
            </button>
          )}
        </div>
        <div className="mt-4 flex overflow-x-auto border-y border-[border-line] bg-white">
          {steps.map(([key, label], i) => {
            const count = all.filter((j) =>
              j.events.some((e) => e.name === key),
            ).length;
            return (
              <button
                onClick={() => setFilter(key)}
                className={`min-w-[150px] flex-1 border-r border-[border-line] p-4 text-left ${filter === key ? "bg-[bg-accent-tint]" : ""}`}
                key={key}
              >
                <p className="text-xs text-[text-ink-soft]">
                  {i + 1}. {label}
                </p>
                <p className="mt-2 text-2xl font-bold">{count}</p>
                <p className="mt-1 text-xs text-[text-ink-soft]">
                  {Math.round((count / all.length) * 100)}% of trials
                </p>
              </button>
            );
          })}
        </div>
      </section>
      <section className="mt-10 border-l-2 border-[text-warn] bg-white p-6">
        <p className="text-sm font-semibold text-[text-warn]">Primary insight</p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight">
          GitHub authorization is the largest activation blocker: {oauth.length}{" "}
          of {all.length} trial users stopped there.
        </h2>
        <p className="mt-4 text-sm text-[text-ink-soft]">
          Affected users: {oauth.length} · Last observed event: github
          connection failed · Intervention: show reconnect-GitHub guide.
        </p>
        <Link
          className="btn mt-5"
          href={`/journeys/${oauth[0]?.userId ?? "user_maya"}`}
        >
          View affected journeys <ArrowRight size={15} />
        </Link>
      </section>
      <section className="mt-10">
        <h2 className="font-semibold">Users needing attention</h2>
        <div className="mt-4 overflow-x-auto border-y border-[border-line] bg-white">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="border-b border-[border-line] text-xs uppercase text-[text-ink-soft]">
              <tr>
                {[
                  "User",
                  "Current stage",
                  "Last event",
                  "Time inactive",
                  "Blocker",
                  "Recommended next action",
                  "Status",
                ].map((x) => (
                  <th className="px-4 py-3 font-medium" key={x}>
                    {x}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {attention.map((j) => {
                const last = j.events[j.events.length - 1];
                return (
                  <tr
                    className="border-b border-[border-line] last:border-0"
                    key={j.userId}
                  >
                    <td className="px-4 py-4 font-medium">
                      <Link href={`/journeys/${j.userId}`}>
                        {j.userId.replace("user_", "")}
                      </Link>
                    </td>
                    <td className="px-4 py-4">
                      {j.events.some((e) => e.name === "repository_connected")
                        ? "Repository connected"
                        : "Setup"}
                    </td>
                    <td className="px-4 py-4 text-[text-ink-soft]">
                      {last.name.replaceAll("_", " ")}
                    </td>
                    <td className="px-4 py-4 text-[text-ink-soft]">
                      {j.inactiveHours}h
                    </td>
                    <td className="px-4 py-4 text-[text-warn]">
                      {j.blocker ?? "—"}
                    </td>
                    <td className="px-4 py-4 text-[text-accent]">
                      {j.recommendation}
                    </td>
                    <td className="px-4 py-4 capitalize">
                      {j.state.replace("_", " ")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
      <section className="mt-10">
        <h2 className="font-semibold">Similar blockers</h2>
        <div className="mt-4 grid gap-px overflow-hidden border border-[border-line] bg-[border-line] md:grid-cols-2">
          <div className="bg-white p-5">
            <p className="font-medium">
              {oauth.length} users failed GitHub authorization in the last 7
              days
            </p>
            <p className="mt-2 text-sm text-[text-ink-soft]">
              Trigger an in-app OAuth recovery template.
            </p>
          </div>
          <div className="bg-white p-5">
            <p className="font-medium">
              {
                all.filter((j) => j.blocker === "First map not generated")
                  .length
              }{" "}
              users connected a repository but never generated a first map
            </p>
            <p className="mt-2 text-sm text-[text-ink-soft]">
              Make first-map generation the only next action.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

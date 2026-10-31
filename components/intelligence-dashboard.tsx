// @ts-nocheck
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, RotateCcw, AlertTriangle, BarChart3, Zap, Sparkles } from "lucide-react";
import { predictConversionProbability, discoverFunnels, identifyAtRiskUsers, predictNextAction, behavioralClustering, buildUserPredictionSummary } from "@/lib/predictive-analytics";
import { formatRelativeTime } from "@/lib/customer-memory";

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
  const [projectId, setProjectId] = useState("");

  const load = async () => {
    const r = await fetch("/api/v1/journeys");
    const data = await r.json();
    setD(data);
    if (data?.journeys && data.journeys.length > 0) {
      setProjectId(data.journeys[0].userId?.split("@")[0] || "");
    }
  };

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
  const userIdsSet = new Set();
  for (const j of all) { userIdsSet.add(j.userId); }
  const userIds = Array.from(userIdsSet);

  // Pre-compute predictive analytics
  const conversionScores: any[] = [];
  for (const userId of userIds as string[]) {
    const { probability, factors } = predictConversionProbability(userId, projectId || "demo");
    conversionScores.push({
      userId,
      conversionProbability: probability,
      atRisk: probability < 0.3,
      confidence: 'medium',
      positiveFactors: factors?.positive || [],
      negativeFactors: factors?.negative || [],
    });
  }

  const funnelDiscovery = discoverFunnels(projectId || "demo", 5);
  const atRiskUsers = identifyAtRiskUsers(projectId || "demo", 0.3);
  const clustering = behavioralClustering(projectId || "demo", 4);

  // Predict next actions for top 3 at-risk users
  const nextActionPredictions = atRiskUsers
    .slice(0, 3)
    .map((user) => predictNextAction(user.userId, projectId || "demo"));

  // Build user summaries (limited set)
  const userSummaries = userIds.slice(0, 20).map((userId: string) =>
    buildUserPredictionSummary(userId, projectId || "demo")
  );

  // At-risk users simplified table data
  const atRiskRows = atRiskUsers
    .slice(0, 7)
    .map((user, idx) => ({
      userId: user.userId,
      probability: user.probability,
      lastAction: user.lastAction,
      inactiveHours: user.inactiveHours,
      recommendation: user.recommendation,
    }));

  // If a specific user was queried for summary
  const targetUserId =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("userId")
      : null;
  let userSummary: ReturnType<typeof buildUserPredictionSummary> | null = null;

  if (targetUserId) {
    try {
      userSummary = buildUserPredictionSummary(targetUserId, projectId || "demo");
    } catch (e) {
      // User not found, continue without summary
    }
  }

  // Render helper: conversion status
  const getProbClass = (prob: number) =>
    prob > 0.6 ? "bg-success-tint text-success" : prob > 0.3 ? "bg-warning-tint text-warning" : "bg-danger-tint text-danger";

  // Render helper: get first name from userId
  const getUserDisplayName = (uid: string) => uid.split("_")[0] || uid;

  return (
    <main className="mx-auto max-w-6xl px-5 py-9">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-[text-accent]">
            Overview · {projectId === "" ? "RepoMap demo tenant" : projectId}
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

      {/* --- PREDICTIVE INSIGHTS --- */}
      <section className="mt-10 bg-white rounded-card border border-line p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h2 className="font-semibold text-[text-accent] mb-3">Conversion Probability</h2>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {conversionScores.map((score, i) => (
                <div
                  key={i}
                  className={
                    score.conversionProbability > 0.6
                      ? "bg-success-tint text-success"
                      : score.conversionProbability > 0.3
                      ? "bg-warning-tint text-warning"
                      : "bg-danger-tint text-danger"
                  }
                >
                  {getUserDisplayName(score.userId)}:{" "}
                  {Math.round(score.conversionProbability * 100)}%
                  {score.atRisk && <span className="font-medium text-danger ml-1">At Risk</span>}
                </div>
              ))}
            </div>

            <h3 className="font-medium text-[text-accent] mt-3">Top Blockers</h3>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {"GitHub authorization failed,First value not reached,Checkout not completed"
                .split(",")
                .map((blocker) => {
                  const count = all.filter((j: J) => j.blocker === blocker).length;
                  const color =
                    blocker === "GitHub authorization failed"
                      ? "bg-danger-tint"
                      : blocker === "First value not reached"
                      ? "bg-warning-tint"
                      : "bg-success-tint";
                  return (
                    <div
                      key={blocker}
                      className={`rounded px-2.5 py-1.5 text-[0.8em] uppercase font-mono ${color} text-danger`}
                    >
                      {blocker.split(" ")[0]}: {count}
                    </div>
                  );
                })}
            </div>
          </div>

          <div>
            <h2 className="font-semibold text-[text-accent] mb-3">At-Risk Users</h2>
            <p className="text-sm text-[text-ink-soft] mb-3">
              Users with &lt; 30% conversion probability
            </p>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {atRiskRows.map((user, idx) => (
                <div
                  key={idx}
                  className={
                    user.probability < 0.1
                      ? "bg-danger-tint text-danger"
                      : "bg-warning-tint text-warning"
                  }
                >
                  <span className="font-medium text-[text-ink]">
                    {getUserDisplayName(user.userId)}
                  </span>
                  <span className="w-16 text-right">
                    {Math.round(user.probability * 100)}% • {user.inactiveHours}h inactive
                  </span>
                  <span className="flex-1 truncate">
                    {user.lastAction}
                  </span>
                  <span className="text-[text-accent] text-[0.75em]">
                    {user.recommendation.slice(0, 20)}…
                  </span>
                </div>
              ))}
              {atRiskUsers.length === 0 && (
                <p className="text-[text-ink-soft] text-xs">
                  No at-risk users — great activation health!
                </p>
              )}
            </div>

            <h3 className="font-medium text-[text-accent] mt-3">Next Actions</h3>
            <div className="space-y-2 text-[0.75em]">
              {nextActionPredictions.map((pred, i) => (
                <div key={i} className="flex items-center gap-1">
                  <Zap size={8} className="text-[text-accent]" />
                  <span className="flex-1 truncate">
                    {pred.nextAction} ({pred.probability}% probability)
                  </span>
                  <span className="text-[text-ink-soft]">
                    ({pred.similarUsers} similar users)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* --- FUNNEL DISCOVERY --- */}
      <section className="mt-10 bg-white rounded-card border border-line p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h2 className="font-semibold text-[text-accent] mb-3">Automatic Funnel</h2>
            <p className="text-sm text-[text-ink-soft] mb-4">
              Most common 3-step conversion path
            </p>
            {funnelDiscovery.topFunnel ? (
              <div>
                <p className="text-[0.8em] uppercase tracking-wider text-[text-accent] mb-1">
                  Top funnel ({Math.round(funnelDiscovery.topFunnel.conversionRate * 100)}% conversion)
                </p>
                <p className="text-[0.9em] leading-relaxed">
                  {funnelDiscovery.topFunnel.label}
                </p>
                <p className="text-xs text-[text-ink-soft]">
                  Based on {funnelDiscovery.topFunnel.count} users
                </p>
              </div>
            ) : (
              <p className="text-[text-ink-soft]">
                Not enough data for funnel analysis.
              </p>
            )}
          </div>

          <div>
            <h2 className="font-semibold text-[text-accent] mb-3">Behavioral Clusters</h2>
            <p className="text-sm text-[text-ink-soft] mb-4">
              User segments based on event patterns
            </p>
            {clustering.clusters && clustering.clusters.length > 0 ? (
              <div>
                {clustering.clusters.map((cluster, ci) => (
                  <div
                    key={ci}
                    className={
                      cluster.name === "Activated"
                        ? "bg-success-tint text-success"
                        : cluster.name === "Friction Stall"
                        ? "bg-danger-tint text-danger"
                        : "bg-accent-tint text-white"
                    }
                  >
                    <span className="w-3">{ci + 1}</span>
                    <span className="font-medium">{cluster.name}</span>
                    <span className="ml-auto text-[text-ink-soft]">
                      {cluster.users.length} users
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[text-ink-soft]">
                Not enough data for clustering.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* --- CLASSIC FUNNEL --- */}
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
          {steps.map((step, i) => {
            const [key, label] = step;
            const count = all.filter(
              (j: J) => j.events.some((e: any) => e.name === key),
            ).length;
            return (
              <button
                onClick={() => setFilter(key)}
                className={`min-w-[140px] flex-1 border-r border-[border-line] p-3 text-left ${filter === key ? "bg-[bg-accent-tint]" : ""}`}
                key={key}
              >
                <p className="text-xs text-[text-ink-soft]">
                  {i + 1}. {label}
                </p>
                <p className="mt-1 text-2xl font-bold">{count}</p>
                <p className="mt-0.5 text-xs text-[text-ink-soft]">
                  {Math.round((count / all.length) * 100)}% of trials
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {/* --- INSIGHTS --- */}
      <section className="mt-10 border-l-2 border-[text-warn] bg-white p-6">
        <p className="text-sm font-semibold text-[text-warn]">
          Primary insight
        </p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight">
          GitHub authorization is the largest activation blocker:{" "}
          {all.filter((j: J) => j.blocker === "GitHub authorization failed")
            .length} {" "}of{" "}{all.length} trial users stopped there.
        </h2>
        <p className="mt-4 text-sm text-[text-ink-soft]">
          Affected users:{" "}
          {all.filter((j: J) => j.blocker === "GitHub authorization failed")
            .length} · Last observed event: github connection failed ·
          Intervention: show reconnect-GitHub guide.
        </p>
        <Link
          className="btn mt-5"
          href={`/journeys/${all.filter((j: J) => j.blocker === "GitHub authorization failed")[0]?.userId ?? "user_maya"}`}
        >
          View affected journeys <ArrowRight size={15} />
        </Link>
      </section>

      {/* --- USERS NEEDING ATTENTION --- */}
      <section className="mt-10">
        <h2 className="font-semibold">Users needing attention</h2>
        <div className="mt-4 overflow-x-auto border-y border-[border-line] bg-white">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="border-b border-[border-line] text-xs uppercase text-[text-ink-soft]">
              <tr>
                {"User,Current stage,Last event,Time inactive,Blocker,Recommended next action,Status"
                  .split(",")
                  .map((x) => (
                    <th className="px-4 py-3 font-medium" key={x}>
                      {x}
                    </th>
                  ))}
              </tr>
            </thead>
            <tbody>
              {all.map((j: J) => {
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
                      {j.events.some((e: any) => e.name === "repository_connected")
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

      {/* --- SIMILAR BLOCKERS --- */}
      <section className="mt-10">
        <h2 className="font-semibold">Similar blockers</h2>
        <div className="mt-4 grid gap-px overflow-hidden border border-[border-line] bg-[border-line] md:grid-cols-2">
          <div className="bg-white p-5">
            <p className="font-medium">
              Users failed GitHub authorization in the last 7 days
            </p>
            <p className="mt-2 text-sm text-[text-ink-soft]">
              Trigger an in-app OAuth recovery template.
            </p>
          </div>
          <div className="bg-white p-5">
            <p className="font-medium">
              {all.filter((j: J) => j.blocker === "First map not generated")
                .length} {" "}users connected a repository but never generated a first map
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
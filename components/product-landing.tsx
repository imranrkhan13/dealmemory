"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
motion,
useInView,
useReducedMotion,
AnimatePresence,
type Variants,
} from "framer-motion";
import {
ArrowRight,
Check,
ShieldCheck,
Brain,
BarChart3,
Zap,
Target,
Code2,
Terminal,
Users,
MousePointerClick,
AlertTriangle,
Eye,
Layers,
MessageSquare,
Lock,
Play,
X,
ChevronRight,
CheckCircle2,
FileCode,
Database,
Workflow,
Gauge,
CreditCard,
Copy,
Clock,
RefreshCw,
ArrowUpRight,
Github,
GitBranch,
Map as MapIcon,
} from "lucide-react";

/* ─────────────────────────────────────────────────────────────
DESIGN TOKENS
Paper — warm, slightly cool-leaning off-white. Working surface.
Ink — near-black, used for dark panels and headline text.
Slate (Observed) — cool, factual. What the SDK actually recorded.
Memory (Remembered) — warm violet-plum. What the user meant by it.
The two accents are never decorative — they map 1:1 to the two
halves of the product thesis: observed events vs. remembered context.
───────────────────────────────────────────────────────────── */

const THEME = {
paper: "#F5F3EE",
paperDim: "#EFEBE2",
ink: "#15181D",
inkSoft: "#3A3F47",
border: "#E3DDCF",
slate: "#3F6367",
slateSoft: "#E4EDEC",
memory: "#6B4FBB",
memorySoft: "#EFEAFB",
memoryDeep: "#4A3480",
success: "#1F8A5F",
danger: "#C4432F",
};

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
.font-display{font-family:'Fraunces',serif;font-optical-sizing:auto;}
.font-mono{font-family:'JetBrains Mono',monospace;}
.font-sans{font-family:'Inter',sans-serif;}`;

/* ─────────────────────────────────────────────────────────────
ANIMATION
───────────────────────────────────────────────────────────── */

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

const fadeInUp: Variants = {
hidden: { opacity: 0, y: 32 },
visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE_OUT } },
};

const staggerContainer: Variants = {
hidden: { opacity: 0 },
visible: { opacity: 1, transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};

/* ─────────────────────────────────────────────────────────────
TYPES
───────────────────────────────────────────────────────────── */

interface StepItem {
step: string;
title: string;
desc: string;
icon: React.ElementType;
code?: string;
}

interface JourneyNode {
id: string;
time: string;
label: string;
detail: string;
kind: "start" | "fail" | "gap" | "success" | "activation" | "checkout";
}

/* ─────────────────────────────────────────────────────────────
REUSABLE
───────────────────────────────────────────────────────────── */

function AnimatedSection({
children,
className = "",
delay = 0,
variants = fadeInUp,
}: {
children: React.ReactNode;
className?: string;
delay?: number;
variants?: Variants;
}) {
const ref = useRef<HTMLDivElement>(null);
const isInView = useInView(ref, { once: true, margin: "-80px" });
const shouldReduceMotion = useReducedMotion();

if (shouldReduceMotion) return <div className={className}>{children}</div>;

return (
    <motion.div
        ref={ref}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        variants={variants}
        transition={{ delay }}
        className={className}
    >
        {children}
    </motion.div>
);
}

function Eyebrow({ children, tone = "memory" }: { children: React.ReactNode; tone?: "memory" | "slate" }) {
const color = tone === "memory" ? THEME.memory : THEME.slate;
return (
    <p className="font-mono text-xs font-medium uppercase tracking-[0.18em]" style={{ color }}>
        {children}
    </p>
);
}

function SectionHeader({
label,
title,
subtitle,
align = "center",
tone = "memory",
}: {
label: string;
title: React.ReactNode;
subtitle?: string;
align?: "left" | "center";
tone?: "memory" | "slate";
}) {
return (
    <div className={align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
        <Eyebrow tone={tone}>{label}</Eyebrow>
        <h2 className="font-display mt-4 text-4xl font-semibold leading-[1.1] text-[#15181D] md:text-5xl">
            {title}
        </h2>
        {subtitle && (
            <p className="font-sans mt-6 text-lg leading-relaxed text-[#3A3F47]/80 md:text-xl">
                {subtitle}
            </p>
        )}
    </div>
);
}

/* ─────────────────────────────────────────────────────────────
DATA — every example below is the RepoMap demo tenant.
RepoMap: a SaaS that turns a GitHub repo into an interactive
architecture map. Its trial funnel depends on one fragile step —
connecting GitHub — which is exactly where DealMemory earns its
keep.
───────────────────────────────────────────────────────────── */

const stats = [
{ label: "SDK install", value: "< 5 min", icon: Zap },
{ label: "Session replay", value: "None, ever", icon: ShieldCheck },
{ label: "Events tracked", value: "Explicit only", icon: Target },
{ label: "Checkout timing", value: "Post-activation", icon: Lock },
];

const developerSteps: StepItem[] = [
{
    step: "Install",
    title: "Add the SDK",
    desc: "One package, framework-agnostic, TypeScript-native. RepoMap dropped it into their onboarding flow in an afternoon.",
    icon: Terminal,
    code: `npm install @activation-memory/sdk`,
},
{
    step: "Identify",
    title: "Identify the trial user",
    desc: "Call this once, right after signup. Every event that follows is tied to a real account, not an anonymous session.",
    icon: Users,
    code: `activation.identify(user.id, { plan: "trial" });`,
},
{
    step: "Track",
    title: "Send only what matters",
    desc: "RepoMap tracks five events: trial start, repo connect attempt, connect failure, map generated, checkout started. Nothing else.",
    icon: MousePointerClick,
    code: `activation.track("github_connect_failed", {
errorCode: "oauth_callback_failed"
});`,
},
{
    step: "Define",
    title: "Name the activation event",
    desc: 'RepoMap set "first_architecture_map_generated" as the milestone. Everything before it is trial. Everything after is a customer.',
    icon: Target,
    code: `activation.track("first_architecture_map_generated");
// user is now activated`,
},
{
    step: "Gate",
    title: "Let the SDK decide checkout eligibility",
    desc: "Dodo checkout only renders once the SDK reports the user as activated — the product never has to guess.",
    icon: Lock,
    code: `if (activation.isActivated(user.id)) {
showDodoCheckout();
}`,
},
];

const founderSteps: StepItem[] = [
{
    step: "See",
    title: "Read the funnel, not a pageview count",
    desc: "Trial started → repo connected → map generated → activated → checkout. One line, five stages.",
    icon: BarChart3,
},
{
    step: "Isolate",
    title: "Find where it actually breaks",
    desc: '"19 users failed GitHub OAuth this week" — a real number, not a hunch about drop-off.',
    icon: AlertTriangle,
},
{
    step: "Open",
    title: "Click into one user&#39;s path",
    desc: "Every event, in order, with timestamps — including the day they left and the day they came back.",
    icon: Eye,
},
{
    step: "Separate",
    title: "Read what happened next to why it happened",
    desc: "Observed events show the OAuth failure. Supermemory shows the user still wanted to map their repo.",
    icon: Layers,
},
{
    step: "Act",
    title: "Get one recommended action",
    desc: '"Send the GitHub reconnect guide" — a specific next step, not a dashboard to interpret.',
    icon: MessageSquare,
},
];

/* The RepoMap demo journey — the literal narrative from the brief. */
const journey: JourneyNode[] = [
{ id: "start", time: "Day 1 · 10:14", label: "Trial started", detail: "Signs up for RepoMap, SDK identifies the account.", kind: "start" },
{ id: "fail", time: "Day 1 · 10:16", label: "GitHub OAuth failed", detail: "oauth_callback_failed — connection attempt rejected.", kind: "fail" },
{ id: "gap", time: "—", label: "Leaves the trial", detail: "No further events for four days.", kind: "gap" },
{ id: "return", time: "Day 5 · 09:02", label: "Returns, reconnects GitHub", detail: "Supermemory surfaces the earlier goal and blocker.", kind: "success" },
{ id: "map", time: "Day 5 · 09:06", label: "First architecture map generated", detail: "first_architecture_map_generated — the defined activation event.", kind: "activation" },
{ id: "checkout", time: "Day 5 · 09:07", label: "Eligible for checkout", detail: "SDK flips isActivated(user.id) to true; Dodo checkout renders.", kind: "checkout" },
];

const codeSnippet = `npm install @activation-memory/sdk

import { ActivationMemory } from "@activation-memory/sdk";

const activation = new ActivationMemory({
projectKey: "pk_live_repomap",
});

// after signup
activation.identify(user.id, { plan: "trial" });
activation.track("trial_started");

// user attempts to connect their repo
activation.track("github_connect_started");
activation.track("github_connect_failed", {
errorCode: "oauth_callback_failed",
});

// four days later, they come back and retry
activation.track("github_connect_succeeded");
activation.track("first_architecture_map_generated");
// -> user is now activated

activation.setGoal("Understand my team&#39;s codebase");

if (activation.isActivated(user.id)) {
showDodoCheckout();
}`;

const comparisonRows = [
{ feature: "Session replay", others: "Records the screen", dealmemory: "Never captures screens" },
{ feature: "Event volume", others: "Tracks everything by default", dealmemory: "Explicit events only" },
{ feature: "User context", others: "Clicks and pageviews", dealmemory: "Goals, blockers, support outcomes" },
{ feature: "Drop-off detection", others: "Manual SQL against raw events", dealmemory: "Built-in funnel + blocker grouping" },
{ feature: "Checkout timing", others: "Fixed trial-day countdown", dealmemory: "Gated on the activation event" },
];

const metrics = [
{ label: "Trial users this week", value: "184", change: "+9%", icon: Users },
{ label: "Activation rate", value: "41%", change: "+6%", icon: Target },
{ label: "Median time to activate", value: "1.8 days", change: "-22%", icon: Clock },
{ label: "Recovered after a blocker", value: "58%", change: "+11%", icon: RefreshCw },
];

/* ─────────────────────────────────────────────────────────────
JOURNEY GRAPH — the signature element.
A literal, labeled reconstruction of the RepoMap demo user&#39;s
path, drawn as connected nodes rather than a generic stat
dashboard. This is what "the SDK records what happened" looks
like, made concrete.
───────────────────────────────────────────────────────────── */

/** Plain SVG marks — no nested React icon components inside <foreignObject>.
 *  Cheaper to render, nothing for hydration to trip over. */
function NodeMark({ kind }: { kind: JourneyNode["kind"] }) {
switch (kind) {
    case "fail":
        return <path d="M -4 -4 L 4 4 M 4 -4 L -4 4" stroke="white" strokeWidth={2} strokeLinecap="round" />;
    case "gap":
        return (
            <>
                <circle r={4.5} fill="none" stroke="white" strokeWidth={1.5} />
                <path d="M 0 -2 L 0 0 L 1.6 1.2" stroke="white" strokeWidth={1.3} strokeLinecap="round" fill="none" />
            </>
        );
    default:
        return <path d="M -4.5 0.5 L -1.5 3.5 L 4.5 -3.5" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" />;
}
}

function JourneyGraph() {
const shouldReduceMotion = useReducedMotion();
const nodeX = [40, 190, 340, 490, 660, 830];
const nodeY = [70, 130, 70, 130, 70, 130];

const kindFill: Record<JourneyNode["kind"], { fill: string; ring: string }> = {
    start: { fill: THEME.slate, ring: THEME.slateSoft },
    fail: { fill: THEME.danger, ring: "#F6DFDA" },
    gap: { fill: "#B8B2A2", ring: "#EFEBE2" },
    success: { fill: THEME.slate, ring: THEME.slateSoft },
    activation: { fill: THEME.memory, ring: THEME.memorySoft },
    checkout: { fill: THEME.ink, ring: "#DCD9D0" },
};

const pathD = nodeX.map((x, i) => `${i === 0 ? "M" : "L"} ${x} ${nodeY[i]}`).join(" ");

return (
    <div className="w-full overflow-x-auto">
        <svg viewBox="0 0 900 220" className="min-w-[820px] w-full h-auto" role="img" aria-label="RepoMap demo user activation journey">
            <motion.path
                d={pathD}
                fill="none"
                stroke={THEME.border}
                strokeWidth={2}
                initial={shouldReduceMotion ? undefined : { pathLength: 0 }}
                whileInView={shouldReduceMotion ? undefined : { pathLength: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.4, ease: EASE_OUT }}
            />
            {/* dashed segment marks the 4-day gap between fail and return */}
            <line
                x1={nodeX[1]} y1={nodeY[1]} x2={nodeX[2]} y2={nodeY[2]}
                stroke={THEME.danger} strokeWidth={1.5} strokeDasharray="4 5" opacity={0.5}
            />

            {journey.map((node, i) => {
                const style = kindFill[node.kind];
                const labelAbove = nodeY[i] < 100;
                return (
                    <motion.g
                        key={node.id}
                        initial={shouldReduceMotion ? undefined : { opacity: 0, scale: 0.7 }}
                        whileInView={shouldReduceMotion ? undefined : { opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.12 * i + 0.2, duration: 0.4, ease: EASE_OUT }}
                        style={{ transformOrigin: `${nodeX[i]}px ${nodeY[i]}px` }}
                    >
                        <circle cx={nodeX[i]} cy={nodeY[i]} r={22} fill={style.ring} />
                        <circle cx={nodeX[i]} cy={nodeY[i]} r={13} fill={style.fill} />
                        <g transform={`translate(${nodeX[i]} ${nodeY[i]})`}>
                            <NodeMark kind={node.kind} />
                        </g>
                        <text
                            x={nodeX[i]}
                            y={labelAbove ? nodeY[i] - 34 : nodeY[i] + 46}
                            textAnchor="middle"
                            className="font-sans"
                            fontSize="12.5"
                            fontWeight={600}
                            fill={THEME.ink}
                        >
                            {node.label}
                        </text>
                        <text
                            x={nodeX[i]}
                            y={labelAbove ? nodeY[i] - 18 : nodeY[i] + 62}
                            textAnchor="middle"
                            className="font-mono"
                            fontSize="10.5"
                            fill={THEME.inkSoft}
                            opacity={0.6}
                        >
                            {node.time}
                        </text>
                    </motion.g>
                );
            })}
        </svg>
    </div>
);
}

/* ─────────────────────────────────────────────────────────────
MAIN
───────────────────────────────────────────────────────────── */

export default function ProductLanding() {
const shouldReduceMotion = useReducedMotion();

const [copied, setCopied] = useState(false);
const [activeDevStep, setActiveDevStep] = useState(0);

const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(codeSnippet).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    });
}, []);

return (
    <main className="overflow-hidden bg-[#F5F3EE] text-[#15181D] font-sans">
        {/* ─────────── Hero ─────────── */}
        <section className="relative min-h-screen flex items-center pt-24">
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-8%] left-[-6%] w-[420px] h-[420px] rounded-full bg-[#EFEAFB] blur-[110px]" />
                <div className="absolute bottom-[-10%] right-[-8%] w-[480px] h-[480px] rounded-full bg-[#E4EDEC] blur-[120px]" />
            </div>

            <div className="relative mx-auto max-w-7xl px-6 py-24 w-full">
                <div className="mx-auto max-w-4xl text-center">
                    <motion.div
                        initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: EASE_OUT }}
                        className="inline-flex items-center gap-2 rounded-full border border-[#E3DDCF] bg-white/70 backdrop-blur-sm px-4 py-2"
                    >
                        <span className="font-mono text-xs font-medium text-[#3F6367]">activation-memory/sdk</span>
                        <span className="h-1 w-1 rounded-full bg-[#B8B2A2]" />
                        <span className="font-mono text-xs text-[#6B4FBB]">built with Supermemory + Dodo</span>
                    </motion.div>

                    <motion.h1
                        initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.1, ease: EASE_OUT }}
                        className="font-display mt-9 text-5xl font-semibold tracking-tight md:text-6xl lg:text-7xl leading-[1.08]"
                    >
                        The SDK records what happened.
                        <br />
                        <span className="text-[#6B4FBB]">Memory explains why it mattered.</span>
                        <br />
                        The dashboard shows what to do next.
                    </motion.h1>

                    <motion.p
                        initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.22, ease: EASE_OUT }}
                        className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-[#3A3F47]/80 md:text-xl"
                    >
                        An embeddable SDK for SaaS trials. Install it, identify a trial user, send the
                        events that matter — and let checkout appear only after they actually reach value.
                    </motion.p>

                    <motion.div
                        initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.34, ease: EASE_OUT }}
                        className="mt-10 flex flex-wrap justify-center gap-4"
                    >
                        <Link
                            href="/signup"
                            className="group inline-flex items-center gap-2 rounded-lg bg-[#15181D] px-7 py-3.5 text-base font-semibold text-[#F5F3EE] transition-all hover:bg-[#3A3F47]"
                        >
                            Start free — no card required <ArrowRight size={17} />
                        </Link>
                        <Link
                            href="#demo"
                            className="group inline-flex items-center gap-2 rounded-lg border border-[#E3DDCF] bg-white px-7 py-3.5 text-base font-semibold text-[#15181D] transition-all hover:border-[#6B4FBB]/40"
                        >
                            <Play size={15} className="text-[#6B4FBB]" /> See the RepoMap demo
                        </Link>
                    </motion.div>
                </div>

                {/* ─── Signature: Journey Graph ─── */}
                <motion.div
                    initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
                    animate={shouldReduceMotion ? false : { opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.5, ease: EASE_OUT }}
                    className="mt-20 rounded-2xl border border-[#E3DDCF] bg-white shadow-sm overflow-hidden"
                >
                    <div className="flex items-center justify-between border-b border-[#E3DDCF] px-8 py-5">
                        <div className="flex items-center gap-2.5">
                            <div className="h-2 w-2 rounded-full bg-[#3F6367]" />
                            <span className="font-mono text-xs font-medium text-[#3A3F47]/70">demo tenant · repomap</span>
                        </div>
                        <span className="font-mono text-xs text-[#6B4FBB]">one user, reconstructed end to end</span>
                    </div>
                    <div className="p-8">
                        <JourneyGraph />
                    </div>
                </motion.div>
            </div>
        </section>

        {/* ─────────── Trust stats ─────────── */}
        <section className="border-y border-[#E3DDCF] bg-white">
            <div className="mx-auto grid max-w-7xl gap-px bg-[#E3DDCF] md:grid-cols-4">
                {stats.map((item, index) => {
                    const Icon = item.icon;
                    return (
                        <motion.div
                            key={item.label}
                            initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
                            whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ delay: index * 0.08, duration: 0.5, ease: EASE_OUT }}
                            className="bg-[#F5F3EE] px-8 py-10 text-center"
                        >
                            <Icon className="mx-auto h-5 w-5 text-[#6B4FBB]" />
                            <p className="mt-4 font-mono text-xs uppercase tracking-wider text-[#3A3F47]/60">{item.label}</p>
                            <p className="font-display mt-2 text-2xl font-semibold text-[#15181D]">{item.value}</p>
                        </motion.div>
                    );
                })}
            </div>
        </section>

        {/* ─────────── Three layers ─────────── */}
        <section id="how-it-works" className="mx-auto max-w-7xl px-6 py-28">
            <AnimatedSection>
                <SectionHeader label="The thesis" title={<>Three layers. One clear story.</>} />
            </AnimatedSection>

            <motion.div
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                className="mt-16 grid gap-6 lg:grid-cols-3"
            >
                {[
                    {
                        icon: Terminal,
                        font: "font-mono",
                        title: "Observed",
                        headline: "The SDK records what happened",
                        desc: "trial_started, github_connect_failed, first_architecture_map_generated — explicit events, sent on purpose. Nothing inferred, nothing guessed.",
                        accent: THEME.slate,
                        bg: THEME.slateSoft,
                    },
                    {
                        icon: Brain,
                        font: "font-display",
                        title: "Remembered",
                        headline: "Memory explains why it mattered",
                        desc: "Supermemory holds the user&#39;s goal, what blocked them, and how support resolved it — across sessions, even four days apart.",
                        accent: THEME.memory,
                        bg: THEME.memorySoft,
                    },
                    {
                        icon: BarChart3,
                        font: "font-sans",
                        title: "Recommended",
                        headline: "The dashboard shows what to do next",
                        desc: "One funnel, the biggest blocker, and a specific next action — not a chart to interpret.",
                        accent: THEME.ink,
                        bg: THEME.paperDim,
                    },
                ].map((item) => {
                    const Icon = item.icon;
                    return (
                        <motion.div
                            key={item.title}
                            variants={fadeInUp}
                            className="rounded-2xl border border-[#E3DDCF] bg-white p-8"
                        >
                            <div className="flex h-11 w-11 items-center justify-center rounded-lg" style={{ backgroundColor: item.bg }}>
                                <Icon className="h-5 w-5" style={{ color: item.accent }} />
                            </div>
                            <p className="font-mono mt-6 text-xs font-medium uppercase tracking-wider" style={{ color: item.accent }}>
                                {item.title}
                            </p>
                            <h3 className={`${item.font} mt-2 text-xl font-semibold leading-snug text-[#15181D]`}>
                                {item.headline}
                            </h3>
                            <p className="mt-3 text-[15px] leading-relaxed text-[#3A3F47]/75">{item.desc}</p>
                        </motion.div>
                    );
                })}
            </motion.div>
        </section>

        {/* ─────────── Two-sided flow ─────────── */}
        <section className="border-y border-[#E3DDCF] bg-white">
            <div className="mx-auto max-w-7xl px-6 py-28">
                <AnimatedSection className="max-w-2xl">
                    <SectionHeader label="How it works" title={<>Two sides. One activation event.</>} align="left" />
                </AnimatedSection>

                <div className="mt-16 grid gap-12 lg:grid-cols-2">
                    {/* Developer */}
                    <motion.div
                        initial={shouldReduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: -40 }}
                        whileInView={shouldReduceMotion ? undefined : { opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8, ease: EASE_OUT }}
                        className="rounded-2xl border border-[#E3DDCF] bg-[#F5F3EE] p-8"
                    >
                        <div className="flex items-center gap-3 mb-8">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#3F6367]">
                                <Code2 className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-[#15181D]">Developer flow</h3>
                                <p className="font-mono text-xs text-[#3A3F47]/60">what the RepoMap engineer wired up</p>
                            </div>
                        </div>

                        <div className="space-y-1">
                            {developerSteps.map((item, index) => {
                                const Icon = item.icon;
                                const isActive = activeDevStep === index;
                                return (
                                    <motion.div
                                        key={item.step}
                                        initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, x: -16 }}
                                        whileInView={shouldReduceMotion ? undefined : { opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.06, duration: 0.4 }}
                                        onClick={() => setActiveDevStep(index)}
                                        className={`flex gap-4 cursor-pointer rounded-xl p-3.5 transition-colors ${isActive ? "bg-white border border-[#E3DDCF]" : "hover:bg-white/60"}`}
                                    >
                                        <div className="flex flex-col items-center shrink-0">
                                            <div className={`flex h-7 w-7 items-center justify-center rounded-full font-mono text-[10px] font-semibold transition-colors ${isActive ? "bg-[#3F6367] text-white" : "bg-white text-[#3F6367] border border-[#E3DDCF]"}`}>
                                                <Icon size={13} />
                                            </div>
                                            {index < developerSteps.length - 1 && <div className="mt-1.5 h-full w-px bg-[#E3DDCF]" />}
                                        </div>
                                        <div className="pb-4 flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-[10px] uppercase tracking-wider text-[#3A3F47]/50">{item.step}</span>
                                            </div>
                                            <h4 className="font-semibold text-[#15181D]">{item.title}</h4>
                                            <p className="mt-1 text-sm text-[#3A3F47]/75 leading-relaxed">{item.desc}</p>
                                            <AnimatePresence>
                                                {isActive && item.code && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: "auto", opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        transition={{ duration: 0.25 }}
                                                        className="overflow-hidden"
                                                    >
                                                        <pre className="font-mono mt-3 rounded-lg bg-[#15181D] p-3.5 text-[12px] leading-relaxed text-[#B8E0DC] whitespace-pre-wrap overflow-x-auto">
                                                            {item.code}
                                                        </pre>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                        <ChevronRight size={15} className={`mt-1 shrink-0 text-[#B8B2A2] transition-transform ${isActive ? "rotate-90 text-[#3F6367]" : ""}`} />
                                    </motion.div>
                                );
                            })}
                        </div>
                    </motion.div>

                    {/* Founder */}
                    <motion.div
                        initial={shouldReduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: 40 }}
                        whileInView={shouldReduceMotion ? undefined : { opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8, ease: EASE_OUT }}
                        className="rounded-2xl border border-[#E3DDCF] bg-[#F5F3EE] p-8"
                    >
                        <div className="flex items-center gap-3 mb-8">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#6B4FBB]">
                                <BarChart3 className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-[#15181D]">Founder flow</h3>
                                <p className="font-mono text-xs text-[#3A3F47]/60">what the RepoMap founder sees</p>
                            </div>
                        </div>

                        <div className="space-y-5">
                            {founderSteps.map((item, index) => {
                                const Icon = item.icon;
                                return (
                                    <motion.div
                                        key={item.step}
                                        initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, x: 16 }}
                                        whileInView={shouldReduceMotion ? undefined : { opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.06, duration: 0.4 }}
                                        className="flex gap-4"
                                    >
                                        <div className="flex flex-col items-center shrink-0">
                                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white border border-[#E3DDCF] text-[#6B4FBB]">
                                                <Icon size={13} />
                                            </div>
                                            {index < founderSteps.length - 1 && <div className="mt-1.5 h-full w-px bg-[#E3DDCF]" />}
                                        </div>
                                        <div className="pb-5">
                                            <span className="font-mono text-[10px] uppercase tracking-wider text-[#3A3F47]/50">{item.step}</span>
                                            <h4 className="font-semibold text-[#15181D]">{item.title}</h4>
                                            <p className="mt-1 text-sm text-[#3A3F47]/75 leading-relaxed">{item.desc}</p>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>

                        <motion.div
                            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
                            whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.4 }}
                            className="mt-2 rounded-xl border border-[#E3DDCF] bg-white p-5"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <span className="font-mono text-[10px] uppercase tracking-wider text-[#3A3F47]/50">Recommended action</span>
                                <span className="inline-flex items-center gap-1 rounded-full bg-[#F6DFDA] px-2 py-0.5 text-[10px] font-medium text-[#C4432F]">
                                    <AlertTriangle size={9} /> 19 stuck users
                                </span>
                            </div>
                            <p className="text-sm font-medium text-[#15181D]">
                                Send the GitHub reconnect guide to users who failed OAuth
                            </p>
                            <p className="mt-2 text-xs text-[#3A3F47]/60">Predicted lift · +14% activation</p>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </section>

        {/* ─────────── RepoMap demo case study ─────────── */}
        <section id="demo" className="mx-auto max-w-7xl px-6 py-28">
            <AnimatedSection className="max-w-2xl">
                <SectionHeader label="Demo tenant" title={<>RepoMap, the whole story.</>} align="left" tone="slate" />
                <p className="mt-6 text-lg leading-relaxed text-[#3A3F47]/80">
                    RepoMap turns a GitHub repository into an interactive architecture map. Its trial
                    depends on one step succeeding: connecting GitHub. Here&apos;s what DealMemory
                    recorded for one real trial user, start to finish.
                </p>
            </AnimatedSection>

            <div className="mt-16 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
                {/* narrative timeline */}
                <motion.div
                    initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 30 }}
                    whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.7, ease: EASE_OUT }}
                    className="rounded-2xl border border-[#E3DDCF] bg-white p-8"
                >
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <p className="font-mono text-xs uppercase tracking-wider text-[#3A3F47]/50">User journey</p>
                            <p className="font-semibold text-[#15181D] mt-1">github.com/user → repomap trial</p>
                        </div>
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EFEAFB] px-3 py-1 text-xs font-medium text-[#6B4FBB]">
                            <CheckCircle2 size={12} /> Activated
                        </span>
                    </div>

                    <div className="relative">
                        <div className="absolute left-[13px] top-3 bottom-3 w-px bg-[#E3DDCF]" />
                        {journey.map((node, index) => {
                            const isFail = node.kind === "fail";
                            const isGap = node.kind === "gap";
                            const isMemoryTouch = node.kind === "success" || node.kind === "activation";
                            return (
                                <motion.div
                                    key={node.id}
                                    initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, x: -16 }}
                                    whileInView={shouldReduceMotion ? undefined : { opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.08, duration: 0.45 }}
                                    className="flex gap-5 pb-7 last:pb-0 relative"
                                >
                                    <div className="flex flex-col items-center z-10 shrink-0">
                                        <div
                                            className="h-[27px] w-[27px] rounded-full flex items-center justify-center ring-4 ring-white"
                                            style={{
                                                backgroundColor: isFail ? THEME.danger : isGap ? "#B8B2A2" : node.kind === "checkout" ? THEME.ink : THEME.memory,
                                            }}
                                        >
                                            {isFail ? <X size={13} className="text-white" /> : isGap ? <Clock size={12} className="text-white" /> : <Check size={13} className="text-white" />}
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <p className="font-mono text-[11px] uppercase tracking-wider text-[#3A3F47]/50">{node.time}</p>
                                            {isFail && (
                                                <span className="inline-flex items-center rounded-full bg-[#F6DFDA] px-2 py-0.5 text-[10px] font-medium text-[#C4432F]">
                                                    blocker
                                                </span>
                                            )}
                                            {isMemoryTouch && (
                                                <span className="inline-flex items-center rounded-full bg-[#EFEAFB] px-2 py-0.5 text-[10px] font-medium text-[#6B4FBB]">
                                                    memory recalled
                                                </span>
                                            )}
                                        </div>
                                        <h4 className="mt-1 font-semibold text-[#15181D]">{node.label}</h4>
                                        <p className="mt-1 text-sm text-[#3A3F47]/70">{node.detail}</p>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>

                {/* what supermemory held onto */}
                <motion.div
                    initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 30 }}
                    whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.7, delay: 0.1, ease: EASE_OUT }}
                    className="rounded-2xl bg-[#15181D] p-8 text-white"
                >
                    <div className="flex items-center gap-2 mb-6">
                        <Brain size={16} className="text-[#B39FE8]" />
                        <p className="font-mono text-xs uppercase tracking-wider text-[#B39FE8]">held across the 4-day gap</p>
                    </div>
                    <div className="space-y-5">
                        {[
                            ["Goal", "Understand my team&#39;s codebase before onboarding new engineers"],
                            ["Blocker", "GitHub OAuth failed on the first connection attempt"],
                            ["Support outcome", "No ticket filed — user simply left and returned on their own"],
                            ["What memory changed", "On return, RepoMap greeted them at the reconnect step, not the start"],
                        ].map(([title, value]) => (
                            <div key={title} className="pb-5 border-b border-white/10 last:border-0 last:pb-0">
                                <p className="font-mono text-[10px] uppercase tracking-wider text-white/40">{title}</p>
                                <p className="mt-1.5 font-display text-[15px] leading-snug">{value}</p>
                            </div>
                        ))}
                    </div>
                    <div className="mt-7 rounded-xl bg-white/5 p-4 flex items-start gap-3">
                        <MapIcon size={16} className="text-[#B39FE8] mt-0.5 shrink-0" />
                        <p className="text-sm text-white/80 leading-relaxed">
                            Without Supermemory, RepoMap would have restarted this user at step one.
                            Instead, the four-day-old goal and blocker were still there.
                        </p>
                    </div>
                </motion.div>
            </div>
        </section>

        {/* ─────────── Observed vs Remembered ─────────── */}
        <section className="border-y border-[#E3DDCF] bg-white">
            <div className="mx-auto max-w-7xl px-6 py-28">
                <AnimatedSection className="max-w-2xl">
                    <SectionHeader label="Supermemory" title={<>Observed events. Remembered context.</>} align="left" />
                    <p className="mt-6 text-lg leading-relaxed text-[#3A3F47]/80">
                        The dashboard keeps these two things separate on purpose. One is a factual
                        log. The other is an interpretation. Conflating them is how most analytics
                        tools lose the plot.
                    </p>
                </AnimatedSection>

                <div className="mt-16 grid gap-6 lg:grid-cols-2">
                    {/* Observed */}
                    <motion.div
                        initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 24 }}
                        whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="rounded-2xl border border-[#E3DDCF] bg-[#F5F3EE] p-7"
                    >
                        <div className="flex items-center gap-2 mb-5">
                            <Eye size={15} className="text-[#3F6367]" />
                            <p className="font-mono text-xs uppercase tracking-wider text-[#3F6367]">observed events</p>
                        </div>
                        <div className="space-y-1">
                            {[
                                ["trial_started", "day 1 · 10:14"],
                                ["github_connect_failed", "day 1 · 10:16"],
                                ["github_connect_succeeded", "day 5 · 09:02"],
                                ["first_architecture_map_generated", "day 5 · 09:06"],
                            ].map(([event, time]) => (
                                <div key={event} className="flex items-center justify-between py-2.5 border-b border-[#E3DDCF]/60 last:border-0">
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <div className="h-1.5 w-1.5 rounded-full bg-[#3F6367] shrink-0" />
                                        <span className="font-mono text-[13px] text-[#15181D] truncate">{event}</span>
                                    </div>
                                    <span className="font-mono text-[11px] text-[#3A3F47]/50 shrink-0">{time}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Remembered */}
                    <motion.div
                        initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 24 }}
                        whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.08 }}
                        className="rounded-2xl bg-[#6B4FBB] p-7 text-white"
                    >
                        <div className="flex items-center gap-2 mb-5">
                            <Brain size={15} className="text-[#EFEAFB]" />
                            <p className="font-mono text-xs uppercase tracking-wider text-white/70">remembered context</p>
                        </div>
                        <div className="space-y-1">
                            {[
                                ["Goal", "Understand my team&#39;s codebase"],
                                ["Blocker", "GitHub OAuth rejected on first attempt"],
                                ["Outcome", "Reconnected without contacting support"],
                            ].map(([title, value]) => (
                                <div key={title} className="py-3 border-b border-white/15 last:border-0">
                                    <p className="font-display text-[15px] font-medium">{value}</p>
                                    <p className="font-mono text-[10px] uppercase tracking-wider text-white/50 mt-1">{title}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>

        {/* ─────────── SDK code ─────────── */}
        <section id="sdk" className="mx-auto max-w-7xl px-6 py-28">
            <div className="grid gap-14 lg:grid-cols-[0.85fr_1.15fr] items-start">
                <AnimatedSection>
                    <SectionHeader label="Developer experience" title="Install in under five minutes." align="left" tone="slate" />
                    <p className="mt-6 text-lg leading-relaxed text-[#3A3F47]/80">
                        RepoMap&apos;s actual integration — identify the trial user, track the connect
                        attempt and its outcome, define the activation event, gate checkout.
                    </p>

                    <div className="mt-9 grid grid-cols-2 gap-3">
                        {[
                            { icon: FileCode, label: "TypeScript SDK" },
                            { icon: Database, label: "Framework agnostic" },
                            { icon: ShieldCheck, label: "Privacy first" },
                            { icon: Workflow, label: "Activation gated" },
                            { icon: Gauge, label: "< 5 min setup" },
                            { icon: CreditCard, label: "Dodo ready" },
                        ].map(({ icon: Icon, label }) => (
                            <div key={label} className="flex items-center gap-2.5 rounded-lg border border-[#E3DDCF] bg-white p-3">
                                <Icon size={15} className="text-[#6B4FBB]" />
                                <span className="text-sm font-medium text-[#15181D]">{label}</span>
                            </div>
                        ))}
                    </div>
                </AnimatedSection>

                <motion.div
                    initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 40 }}
                    whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: EASE_OUT }}
                    className="overflow-hidden rounded-2xl bg-[#15181D]"
                >
                    <div className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
                        <span className="font-mono text-xs text-white/50">repomap-onboarding.ts</span>
                        <button onClick={handleCopy} className="flex items-center gap-1.5 rounded-md bg-white/5 px-3 py-1.5 text-xs text-white/60 hover:bg-white/10 hover:text-white transition-colors">
                            {copied ? (
                                <>
                                    <CheckCircle2 className="h-3.5 w-3.5 text-[#7FD9C4]" /> Copied
                                </>
                            ) : (
                                <>
                                    <Copy className="h-3.5 w-3.5" /> Copy
                                </>
                            )}
                        </button>
                    </div>
                    <div className="overflow-x-auto p-7">
                        <pre className="font-mono text-[13px] leading-7 text-[#B8E0DC] whitespace-pre">{codeSnippet}</pre>
                    </div>
                </motion.div>
            </div>
        </section>

        {/* ─────────── Comparison ─────────── */}
        <section className="border-y border-[#E3DDCF] bg-white">
            <div className="mx-auto max-w-5xl px-6 py-28">
                <AnimatedSection>
                    <SectionHeader label="Why not traditional analytics" title="Built for activation, not pageviews." />
                </AnimatedSection>

                <motion.div
                    initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 30 }}
                    whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="mt-14 overflow-hidden rounded-2xl border border-[#E3DDCF]"
                >
                    <div className="grid grid-cols-3 border-b border-[#E3DDCF] bg-[#F5F3EE] px-6 py-3.5">
                        <span className="font-mono text-xs uppercase tracking-wider text-[#3A3F47]/50">Feature</span>
                        <span className="font-mono text-xs uppercase tracking-wider text-[#3A3F47]/50 text-center">Traditional</span>
                        <span className="font-mono text-xs uppercase tracking-wider text-[#6B4FBB] text-center">DealMemory</span>
                    </div>
                    {comparisonRows.map((row, index) => (
                        <div key={row.feature} className={`grid grid-cols-3 px-6 py-4 items-center ${index !== comparisonRows.length - 1 ? "border-b border-[#E3DDCF]/60" : ""}`}>
                            <span className="text-sm font-medium text-[#15181D]">{row.feature}</span>
                            <span className="text-sm text-[#3A3F47]/60 text-center">{row.others}</span>
                            <span className="text-sm font-medium text-[#6B4FBB] text-center flex items-center justify-center gap-1.5">
                                <Check size={13} className="text-[#1F8A5F] shrink-0" /> {row.dealmemory}
                            </span>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>

        {/* ─────────── Activation-gated checkout ─────────── */}
        <section id="pricing" className="mx-auto max-w-7xl px-6 py-28">
            <AnimatedSection className="mx-auto text-center">
                <SectionHeader label="Activation-gated checkout" title={<>Ask for payment only after<br />users reach value.</>} tone="slate" />
                <p className="mt-8 text-lg leading-relaxed text-[#3A3F47]/80 max-w-2xl mx-auto">
                    DealMemory works with Dodo Payments so checkout appears only once RepoMap&apos;s
                    activation event fires — not on a fixed trial-day countdown.
                </p>
            </AnimatedSection>

            <div className="mt-16 mx-auto max-w-5xl grid gap-4 md:grid-cols-5">
                {[
                    { step: "Trial started", icon: Users },
                    { step: "GitHub connected", icon: Github },
                    { step: "Map generated", icon: MapIcon },
                    { step: "Activated", icon: CheckCircle2 },
                    { step: "Dodo checkout", icon: CreditCard },
                ].map((item, index) => {
                    const Icon = item.icon;
                    return (
                        <motion.div
                            key={item.step}
                            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
                            whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.08 }}
                            className="relative rounded-xl border border-[#E3DDCF] bg-white p-5 text-center"
                        >
                            {index < 4 && (
                                <div className="hidden md:block absolute top-1/2 -right-3 -translate-y-1/2 z-10">
                                    <ArrowRight className="h-3.5 w-3.5 text-[#B8B2A2]" />
                                </div>
                            )}
                            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[#F5F3EE] border border-[#E3DDCF] text-[#6B4FBB]">
                                <Icon size={17} />
                            </div>
                            <p className="mt-3 text-sm font-semibold text-[#15181D]">{item.step}</p>
                        </motion.div>
                    );
                })}
            </div>
        </section>

        {/* ─────────── Metrics ─────────── */}
        <section className="border-t border-[#E3DDCF] bg-white">
            <div className="mx-auto max-w-7xl px-6 py-28">
                <AnimatedSection className="mx-auto text-center">
                    <SectionHeader label="Metrics that matter" title="Every number a founder needs." />
                </AnimatedSection>

                <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-4"
                >
                    {metrics.map((stat) => {
                        const Icon = stat.icon;
                        return (
                            <motion.div key={stat.label} variants={fadeInUp} className="rounded-xl border border-[#E3DDCF] bg-[#F5F3EE] p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <Icon size={17} className="text-[#6B4FBB]" />
                                    <span className="font-mono text-[11px] font-medium text-[#1F8A5F] bg-[#E1F2E9] px-2 py-0.5 rounded-full">{stat.change}</span>
                                </div>
                                <p className="text-sm text-[#3A3F47]/70">{stat.label}</p>
                                <p className="font-display mt-1.5 text-3xl font-semibold text-[#15181D]">{stat.value}</p>
                            </motion.div>
                        );
                    })}
                </motion.div>
            </div>
        </section>

        {/* ─────────── Final CTA ─────────── */}
        <section className="relative overflow-hidden bg-[#15181D] text-white">
            <div className="relative mx-auto max-w-4xl px-6 py-28 text-center">
                <Eyebrow tone="memory">DealMemory</Eyebrow>
                <h2 className="font-display mt-7 text-4xl font-semibold leading-tight md:text-5xl">
                    The SDK records what happened.
                    <br />
                    The dashboard shows what to do next.
                </h2>
                <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-white/60">
                    Stop guessing why trial users vanish. Install one SDK and let DealMemory show
                    you where activation breaks, why, and exactly what to send instead.
                </p>
                <div className="mt-11 flex flex-wrap justify-center gap-4">
                    <Link href="/signup" className="inline-flex items-center gap-2 rounded-lg bg-white px-7 py-3.5 text-base font-semibold text-[#15181D] hover:bg-white/90 transition-colors">
                        Create your project <ArrowRight size={17} />
                    </Link>
                    <Link href="/sdk" className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-7 py-3.5 text-base font-semibold text-white hover:bg-white/10 transition-colors">
                        Read the SDK docs <ArrowUpRight size={15} className="opacity-60" />
                    </Link>
                </div>
                <p className="mt-9 text-sm text-white/35">Free for up to 1,000 trial users. No credit card required.</p>
            </div>
        </section>

        {/* ─────────── Footer ─────────── */}
        <footer className="bg-[#F5F3EE]">
            <div className="mx-auto max-w-7xl px-6 py-14">
                <div className="grid gap-10 md:grid-cols-4">
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#15181D]">
                                <GitBranch className="h-3.5 w-3.5 text-white" />
                            </div>
                            <span className="font-display text-base font-semibold">DealMemory</span>
                        </div>
                        <p className="text-sm text-[#3A3F47]/70 leading-relaxed">
                            The SDK records what happened. Memory explains why it mattered. The
                            dashboard shows what to do next.
                        </p>
                    </div>
                    {[
                        { title: "Product", items: ["How it works", "SDK", "Pricing", "Changelog"] },
                        { title: "Developers", items: ["Documentation", "API reference", "GitHub", "Status"] },
                        { title: "Company", items: ["About", "Blog", "Privacy", "Terms"] },
                    ].map((col) => (
                        <div key={col.title}>
                            <h4 className="text-sm font-semibold text-[#15181D] mb-3">{col.title}</h4>
                            <ul className="space-y-2">
                                {col.items.map((item) => (
                                    <li key={item}>
                                        <Link href="#" className="text-sm text-[#3A3F47]/65 hover:text-[#15181D] transition-colors">
                                            {item}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
                <div className="mt-10 pt-7 border-t border-[#E3DDCF] flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-[#3A3F47]/50">© 2026 DealMemory. All rights reserved.</p>
                    <Github size={17} className="text-[#3A3F47]/50 hover:text-[#15181D] transition-colors cursor-pointer" />
                </div>
            </div>
        </footer>
    </main>
);
}
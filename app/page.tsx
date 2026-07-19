'use client';

import Link from 'next/link';
import { AppShell } from '@/components/app-shell';
import {
  ArrowRight,
  Sparkles,
  Zap,
  CheckCircle2,
  Activity,
  ShieldCheck,
  Brain,
  BarChart3,
  Rocket,
  LayoutGrid,
  Film,
  Github,
  Compass,
  Eye,
  Flame,
  Telescope,
  Layers,
  Gem,
  Timer,
  Code2,
  Terminal,
  ChevronRight,
  Copy,
  Check,
} from 'lucide-react';
import { motion, useReducedMotion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useMemo, useState, useRef, useEffect } from 'react';

/* ─── Animated gradient text ─── */
function GradientText({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={['bg-gradient-to-r from-[#4F46E5] via-[#7C3AED] to-[#2563EB] bg-clip-text text-transparent animate-gradient-x', className].join(' ')}>
      {children}
    </span>
  );
}

/* ─── Copy button with animated feedback ─── */
function CopyButton({ getText, label = 'Copy', ariaLabel }: { getText: () => string; label?: string; ariaLabel?: string }) {
  const [copied, setCopied] = useState(false);
  const handle = () => {
    navigator.clipboard.writeText(getText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handle}
      aria-label={ariaLabel || label}
      className="flex items-center gap-1.5 rounded-lg border border-[#334155] bg-[#0F172A]/80 px-3 py-1.5 text-xs font-medium text-[#94A3B8] backdrop-blur-sm transition-all duration-200 hover:border-[#4F46E5] hover:text-white hover:shadow-[0_0_12px_rgba(79,70,229,0.3)]"
    >
      <AnimatePresence mode="wait">
        {copied ? (
          <motion.span key="check" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }}>
            <Check size={14} className="text-[#10B981]" />
          </motion.span>
        ) : (
          <motion.span key="copy" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }}>
            <Copy size={14} />
          </motion.span>
        )}
      </AnimatePresence>
      {copied ? 'Copied' : label}
    </button>
  );
}

/* ─── Floating particle field ─── */
function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let w = canvas.width = canvas.offsetWidth;
    let h = canvas.height = canvas.offsetHeight;
    const particles: { x: number; y: number; vx: number; vy: number; r: number; alpha: number; color: string }[] = [];
    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.5 + 0.1,
        color: ['#4F46E5', '#7C3AED', '#2563EB', '#10B981', '#F59E0B'][Math.floor(Math.random() * 5)],
      });
    }
    let frame: number;
    const animate = () => {
      ctx.clearRect(0, 0, w, h);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
      });
      ctx.globalAlpha = 0.03;
      ctx.strokeStyle = '#4F46E5';
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;
      frame = requestAnimationFrame(animate);
    };
    animate();
    const resize = () => {
      w = canvas.width = canvas.offsetWidth;
      h = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
    };
  }, []);
  return <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full" />;
}

/* ─── Animated number counter ─── */
function AnimatedNumber({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          const duration = 2000;
          const startTime = performance.now();
          const animate = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplay(Math.floor(eased * value));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value, hasAnimated]);
  return <span ref={ref}>{display}{suffix}</span>;
}

/* ─── Marquee text ─── */
function Marquee({ children, direction = 'left', speed = 30 }: { children: React.ReactNode; direction?: 'left' | 'right'; speed?: number }) {
  return (
    <div className="overflow-hidden whitespace-nowrap">
      <motion.div
        animate={{ x: direction === 'left' ? ['0%', '-50%'] : ['-50%', '0%'] }}
        transition={{ duration: speed, repeat: Infinity, ease: 'linear' } as any}
        className="inline-flex"
      >
        <span className="inline-flex">{children}</span>
        <span className="inline-flex">{children}</span>
      </motion.div>
    </div>
  );
}

/* ─── Main page ─── */
export default function Page() {
  const reduced = useReducedMotion();
  const videoSrc = process.env.NEXT_PUBLIC_DEALMEMORY_VIDEO_URL || '';
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.5], [0, -80]);

  // SDK quick-start snippets
  const frameworks = ['React', 'Next.js', 'Vue', 'Angular', 'Node', 'Express', 'FastAPI', 'Laravel', 'Django'] as const;
  const [fw, setFw] = useState<(typeof frameworks)[number]>('React');

  const code = useMemo(() => {
    const k = 'pk_live_xxxxxxxxx';
    switch (fw) {
      case 'React':
        return 'import { DealMemory } from "@dealmemory/sdk"\n\nconst dm = new DealMemory({ projectKey: "' + k + '" })';
      case 'Next.js':
        return '// app/layout.tsx or pages/_app.tsx\nimport { DealMemory } from "@dealmemory/sdk"\n\nif (typeof window !== "undefined") {\n  const dm = new DealMemory({ projectKey: "' + k + '" })\n}';
      case 'Vue':
        return 'import { DealMemory } from "@dealmemory/sdk"\nconst dm = new DealMemory({ projectKey: "' + k + '" })';
      case 'Angular':
        return 'import { DealMemory } from "@dealmemory/sdk";\nconst dm = new DealMemory({ projectKey: "' + k + '" });';
      case 'Node':
        return 'import { DealMemory } from "@dealmemory/sdk"\nconst dm = new DealMemory({ projectKey: "' + k + '" })';
      case 'Express':
        return 'import express from "express"\nimport { DealMemory } from "@dealmemory/sdk"\n\nconst app = express()\nconst dm = new DealMemory({ projectKey: "' + k + '" })';
      case 'FastAPI':
        return '# Python\n# pip install dealmemory\n# from dealmemory import DealMemory\n# dm = DealMemory(project_key="' + k + '")';
      case 'Laravel':
        return "// PHP\n// composer require dealmemory/sdk\n// use DealMemory\\SDK\\DealMemory;\n// $dm = new DealMemory(['projectKey' => '" + k + "']);";
      case 'Django':
        return '# Python Django\n# from dealmemory import DealMemory\n# dm = DealMemory(project_key="' + k + '")';
      default:
        return '';
    }
  }, [fw]);

  // Poetry lines for the hero
  const poetryLines = [
    'Every click tells a story.',
    'Every session leaves a trace.',
    'We remember what matters.',
  ];

  return (
    <AppShell>
      <main className="mx-auto w-full overflow-x-hidden">
        {/* HERO */}
        <section ref={heroRef} className="relative mx-auto w-full max-w-7xl px-5">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute left-1/2 top-[-20%] h-[60rem] w-[60rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,_rgba(79,70,229,0.08),_transparent_55%)] blur-3xl" />
            <div className="absolute right-[5%] top-[10%] h-[40rem] w-[40rem] rounded-full bg-[radial-gradient(circle_at_center,_rgba(124,58,237,0.06),_transparent_55%)] blur-3xl" />
            <div className="absolute left-[10%] top-[40%] h-[30rem] w-[30rem] rounded-full bg-[radial-gradient(circle_at_center,_rgba(16,185,129,0.05),_transparent_55%)] blur-3xl" />
            <ParticleField />
          </div>

          <motion.div style={{ opacity: heroOpacity, y: heroY }} className="min-h-[100dvh] flex flex-col items-center justify-center text-center">
            {/* Floating badge */}
            <motion.div
              initial={reduced ? false : { opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="mb-8"
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-white/80 px-4 py-2 text-sm font-medium text-[#4F46E5] backdrop-blur-sm shadow-sm">
                <Sparkles size={14} className="animate-pulse" />
                AI Activation Intelligence for Developers
              </span>
            </motion.div>

            {/* Main headline */}
            <motion.h1
              initial={reduced ? false : { opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-5xl text-5xl font-extrabold tracking-[-.04em] text-[#111827] md:text-7xl lg:text-8xl"
            >
              Ship onboarding that{' '}
              <GradientText>remembers</GradientText>.
              <br />
              Convert trials without{' '}
              <span className="relative">
                guesswork
                <motion.svg
                  initial={reduced ? false : { pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.2, delay: 1 }}
                  className="absolute -bottom-2 left-0 w-full"
                  viewBox="0 0 200 12"
                  fill="none"
                >
                  <motion.path
                    d="M2 8C40 2 80 2 100 8C120 14 160 14 198 8"
                    stroke="#4F46E5"
                    strokeWidth="3"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1, delay: 0.8 }}
                  />
                </motion.svg>
              </span>
              .
            </motion.h1>

            {/* Poetry subtitle */}
            <motion.div
              initial={reduced ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mx-auto mt-8 max-w-2xl space-y-1"
            >
              {poetryLines.map((line, i) => (
                <motion.p
                  key={line}
                  initial={reduced ? false : { opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 + i * 0.15 }}
                  className="text-lg leading-relaxed text-[#6B7280]"
                >
                  {line}
                </motion.p>
              ))}
            </motion.div>

            <motion.p
              initial={reduced ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.9 }}
              className="mx-auto mt-6 max-w-2xl text-base leading-7 text-[#9CA3AF]"
            >
              DealMemory installs in minutes and automatically tracks onboarding, builds journeys,
              remembers factual context, identifies blockers, predicts churn, and recommends the next
              action — without manual configuration.
            </motion.p>

            {/* CTA buttons */}
            <motion.div
              initial={reduced ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.1 }}
              className="mt-10 flex flex-wrap items-center justify-center gap-4"
            >
              <Link
                className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-[#4F46E5] px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#4F46E5]/25 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#4F46E5]/30"
                href="/signup"
                aria-label="Get started"
              >
                <span className="relative z-10">Get started</span>
                <ArrowRight size={16} className="relative z-10 transition-transform duration-300 group-hover:translate-x-1" />
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              </Link>
              <Link
                className="group inline-flex items-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-7 py-3.5 text-sm font-semibold text-[#374151] shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[#4F46E5]/30 hover:shadow-md"
                href="/pricing"
                aria-label="View pricing"
              >
                View pricing
                <ChevronRight size={14} className="transition-transform duration-300 group-hover:translate-x-0.5" />
              </Link>
            </motion.div>

            {/* Quick value props */}
            <div className="mt-14 grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
              {[
                { title: 'Zero Config', desc: 'Auto-capture sessions, views, clicks, checkouts', Icon: Zap, color: '#4F46E5' },
                { title: 'Evidence First', desc: 'No hallucinations — every insight cites events', Icon: ShieldCheck, color: '#10B981' },
                { title: '60s Setup', desc: 'SDK install to first event in under a minute', Icon: Timer, color: '#F59E0B' },
              ].map(({ title, desc, Icon, color: iconColor }, i) => (
                <motion.div
                  key={String(title)}
                  initial={reduced ? false : { opacity: 0, y: 30, scale: 0.95 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 1.2 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                  className="group relative overflow-hidden rounded-2xl border border-[#E5E7EB]/60 bg-white/70 p-5 text-left shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-[#4F46E5]/20 hover:shadow-lg hover:shadow-[#4F46E5]/5"
                  whileHover={reduced ? {} : { y: -6, scale: 1.02 }}
                >
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                  <div className="relative flex items-center gap-2.5">
                    <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#EEF2FF] transition-colors duration-300 group-hover:bg-[#4F46E5] group-hover:text-white" style={{ color: iconColor as string }}>
                      <Icon size={16} />
                    </span>
                    <span className="text-sm font-semibold text-[#111827]">{title as string}</span>
                  </div>
                  <p className="relative mt-3 text-sm leading-6 text-[#6B7280]">{desc as string}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* MARQUEE */}
        <div className="border-y border-[#E5E7EB]/50 bg-[#FAFAFA] py-4">
          <Marquee speed={40}>
            <div className="flex items-center gap-12 px-6 text-sm font-medium text-[#9CA3AF]">
              <span className="flex items-center gap-2"><CheckCircle2 size={14} className="text-[#10B981]" /> Zero configuration required</span>
              <span className="flex items-center gap-2"><Eye size={14} className="text-[#4F46E5]" /> Full session transparency</span>
              <span className="flex items-center gap-2"><Brain size={14} className="text-[#7C3AED]" /> Factual memory, not opinions</span>
              <span className="flex items-center gap-2"><Rocket size={14} className="text-[#EF4444]" /> Predict churn before it happens</span>
              <span className="flex items-center gap-2"><span className="text-[#6366F1]" aria-hidden="true">∞</span> Infinite scale, zero overhead</span>
              <span className="flex items-center gap-2"><Gem size={14} className="text-[#F59E0B]" /> Evidence-first insights</span>
              <span className="flex items-center gap-2"><Compass size={14} className="text-[#10B981]" /> Guided next actions</span>
              <span className="flex items-center gap-2"><Telescope size={14} className="text-[#4F46E5]" /> See what others miss</span>
            </div>
          </Marquee>
        </div>

        {/* WHAT IT DOES */}
        <section className="relative mx-auto w-full max-w-7xl px-5 py-28">
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute left-0 top-1/4 h-[40rem] w-[40rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,_rgba(79,70,229,0.04),_transparent_60%)] blur-3xl" />
            <div className="absolute right-0 bottom-1/4 h-[40rem] w-[40rem] translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,_rgba(124,58,237,0.04),_transparent_60%)] blur-3xl" />
          </div>

          <motion.div
            initial={reduced ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <p className="text-sm font-semibold tracking-wide text-[#4F46E5] uppercase">What DealMemory does for you</p>
            <h2 className="mt-4 text-4xl font-bold tracking-tight text-[#111827] md:text-5xl">
              Everything, <span className="italic text-[#6B7280]">automatically.</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-[#6B7280]">
              Install the SDK and watch as your product's memory awakens — building journeys, remembering facts,
              detecting blockers, and surfacing clear, evidence-first recommendations.
            </p>
          </motion.div>

          <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              { Icon: Brain, title: 'Builds journeys', desc: 'Aggregates sessions and events into transparent journeys, no manual setup.', color: '#4F46E5', gradient: 'from-[#EEF2FF] to-[#F5F3FF]' },
              { Icon: ShieldCheck, title: 'Remembers facts', desc: 'Stores only factual context — goals, failures, milestones. Never opinions.', color: '#10B981', gradient: 'from-[#ECFDF5] to-[#F0FDF4]' },
              { Icon: BarChart3, title: 'Identifies blockers', desc: 'Turns failures into next steps so users reach value faster.', color: '#F59E0B', gradient: 'from-[#FFFBEB] to-[#FEF3C7]' },
              { Icon: Rocket, title: 'Predicts churn', desc: 'Highlights risky journeys with confidence and evidence.', color: '#EF4444', gradient: 'from-[#FEF2F2] to-[#FEE2E2]' },
              { Icon: LayoutGrid, title: 'Auto-capture events', desc: 'Sessions, views, route changes, clicks, checkouts, errors — out of the box.', color: '#6366F1', gradient: 'from-[#EEF2FF] to-[#EDE9FE]' },
              { Icon: Sparkles, title: 'Recommends actions', desc: 'Shows exactly what to do next — with source events and reasoning.', color: '#A855F7', gradient: 'from-[#FAF5FF] to-[#F3E8FF]' },
            ].map(({ Icon, title, desc, color: iconColor, gradient }, i) => (
              <motion.div
                key={String(title)}
                initial={reduced ? false : { opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="group relative overflow-hidden rounded-2xl border border-[#E5E7EB]/60 bg-white p-6 shadow-sm transition-all duration-500 hover:border-[#4F46E5]/20 hover:shadow-xl hover:shadow-[#4F46E5]/5"
                whileHover={reduced ? {} : { y: -8, scale: 1.02 }}
              >
                <div className={['absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-500 group-hover:opacity-100', gradient as string].join(' ')} />
                <div className="relative">
                  <div className="flex items-center gap-3">
                    <motion.span
                      className="grid h-10 w-10 place-items-center rounded-xl bg-[#EEF2FF] text-[#4F46E5] transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg"
                      style={{ color: iconColor as string }}
                      whileHover={reduced ? {} : { rotate: 10 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                    >
                      <Icon size={18} />
                    </motion.span>
                    <h3 className="text-lg font-semibold text-[#111827]">{title as string}</h3>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-[#6B7280]">{desc as string}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* STATS BAR */}
        <section className="border-y border-[#E5E7EB]/50 bg-[#FAFAFA] py-16">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-12 px-5 md:gap-20">
            {[
              ['< 60s', 'Time to first event'],
              ['99.9', 'Uptime SLA'],
              ['Zero', 'Manual configuration'],
              ['infinite', 'Events tracked'],
            ].map(([num, label], i) => (
              <motion.div
                key={label}
                initial={reduced ? false : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl font-bold text-[#111827] md:text-4xl">
                  {num === '< 60s' ? '< 60s' : num === '99.9' ? <AnimatedNumber value={99} suffix=".9%" /> : num === 'infinite' ? '\u221e' : num}
                </div>
                <div className="mt-1 text-sm text-[#6B7280]">{label}</div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* SDK QUICK START */}
        <section className="relative mx-auto w-full max-w-7xl px-5 py-28">
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-sm font-semibold tracking-wide text-[#4F46E5] uppercase">SDK Quick Start</p>
            <h2 className="mt-4 text-4xl font-bold tracking-tight text-[#111827] md:text-5xl">
              Copy personalized code.
            </h2>
            <p className="mt-4 max-w-2xl text-lg text-[#6B7280]">
              Initialize the SDK with a single line. Everything else — sessions, views, clicks, checkouts, errors —
              works automatically. These examples are ready to paste.
            </p>
          </motion.div>

          {/* Framework pills */}
          <div className="mt-8 flex flex-wrap gap-2">
            {frameworks.map((name) => {
              const active = fw === name;
              return (
                <motion.button
                  key={name}
                  type="button"
                  onClick={() => setFw(name)}
                  aria-pressed={active}
                  className={[
                    'relative rounded-xl border px-4 py-2 text-sm font-medium transition-all duration-300',
                    active
                      ? 'border-[#4F46E5] bg-[#EEF2FF] text-[#4F46E5] shadow-sm shadow-[#4F46E5]/10'
                      : 'border-[#E5E7EB] bg-white text-[#374151] hover:border-[#4F46E5]/30 hover:bg-[#FAFAFA]',
                  ].join(' ')}
                  whileHover={reduced ? {} : { y: -2, scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {active && (
                    <motion.div
                      layoutId="activePill"
                      className="absolute inset-0 rounded-xl border-2 border-[#4F46E5]"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{name}</span>
                </motion.button>
              );
            })}
          </div>

          {/* Code block */}
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative mt-8 overflow-hidden rounded-2xl border border-[#1E293B] bg-[#0B0F19] shadow-2xl"
          >
            <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-[#4F46E5]/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-[#7C3AED]/10 blur-3xl" />

            <div className="flex items-center justify-between border-b border-[#1E293B] px-5 py-3">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-[#EF4444]/80" />
                <div className="h-3 w-3 rounded-full bg-[#F59E0B]/80" />
                <div className="h-3 w-3 rounded-full bg-[#10B981]/80" />
              </div>
              <div className="flex items-center gap-2 text-xs text-[#475569]">
                <Terminal size={12} />
                <span>{fw.toLowerCase().replace('.', '')}.snippet</span>
              </div>
              <div className="z-10">
                <CopyButton getText={() => code} label="Copy" ariaLabel="Copy SDK snippet" />
              </div>
            </div>

            <div className="relative p-6">
              <pre className="mono overflow-x-auto text-sm leading-7 text-[#E2E8F0]">
                <AnimatePresence mode="wait">
                  <motion.code
                    key={fw}
                    initial={reduced ? false : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="block"
                  >
                    {code.split('\n').map((line, i) => (
                      <motion.div
                        key={i}
                        initial={reduced ? false : { opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: i * 0.05 }}
                      >
                        <span className="select-none text-[#475569]">{(i + 1).toString().padStart(2, '0')}</span>{' '}
                        {line.startsWith('#') || line.startsWith('//') ? (
                          <span className="text-[#6B7280]">{line}</span>
                        ) : (
                          <span>
                            {line.split(' ').map((word, wi) => {
                              if (['import', 'from', 'const', 'let', 'var', 'new', 'if', 'typeof', 'return'].includes(word))
                                return <span key={wi} className="text-[#C084FC]">{word} </span>;
                              if (word.startsWith('"') || word.startsWith("'") || word.startsWith('`'))
                                return <span key={wi} className="text-[#86EFAC]">{word} </span>;
                              if (word.includes('DealMemory') || word.includes('dm'))
                                return <span key={wi} className="text-[#60A5FA]">{word} </span>;
                              return <span key={wi}>{word} </span>;
                            })}
                          </span>
                        )}
                      </motion.div>
                    ))}
                  </motion.code>
                </AnimatePresence>
              </pre>
            </div>
          </motion.div>
        </section>

        {/* ONBOARDING STEPS */}
        <section className="relative border-y border-[#E5E7EB]/50 bg-white">
          <div className="mx-auto grid w-full max-w-7xl md:grid-cols-2">
            <div className="relative p-10 md:border-r md:border-[#E5E7EB] md:p-16">
              <motion.div
                initial={reduced ? false : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <p className="text-sm font-semibold tracking-wide text-[#4F46E5] uppercase">Onboard in under 60 seconds</p>
                <h2 className="mt-4 text-4xl font-bold tracking-tight text-[#111827]">
                  Copy. Install. Paste. <br />
                  <span className="italic text-[#6B7280]">Start. Done.</span>
                </h2>
              </motion.div>

              <div className="mt-10 space-y-8">
                {[
                  { n: '01', title: 'Copy SDK', text: 'Personalized snippet from your dashboard.', Icon: Code2 },
                  { n: '02', title: 'Install package', text: 'npm i @dealmemory/sdk (or pnpm/yarn).', Icon: Terminal },
                  { n: '03', title: 'Paste code', text: 'Initialize with your project key.', Icon: Layers },
                  { n: '04', title: 'Start app', text: 'We wait for the first event — then celebrate.', Icon: Sparkles },
                ].map(({ n, title, text, Icon }, i) => (
                  <motion.div
                    key={n}
                    initial={reduced ? false : { opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                    className="group flex gap-5"
                    whileHover={reduced ? {} : { x: 4 }}
                  >
                    <div className="flex flex-col items-center">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#E5E7EB] bg-[#FAFAFA] text-sm font-bold text-[#4F46E5] transition-all duration-300 group-hover:border-[#4F46E5] group-hover:bg-[#4F46E5] group-hover:text-white group-hover:shadow-lg group-hover:shadow-[#4F46E5]/20">
                        <Icon size={16} />
                      </span>
                      {i < 3 && (
                        <motion.div
                          className="mt-2 h-full w-px bg-gradient-to-b from-[#E5E7EB] to-transparent"
                          initial={reduced ? false : { scaleY: 0 }}
                          whileInView={{ scaleY: 1 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
                          style={{ originY: 0 }}
                        />
                      )}
                    </div>
                    <div className="pb-8">
                      <div className="flex items-center gap-2">
                        <span className="mono text-xs text-[#9CA3AF]">{n}</span>
                        <p className="font-semibold text-[#111827]">{title as string}</p>
                      </div>
                      <p className="mt-1.5 text-sm leading-relaxed text-[#6B7280]">{text as string}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <motion.p
                initial={reduced ? false : { opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="mt-2 text-sm text-[#6B7280]"
              >
                Prefer a demo first?{' '}
                <Link className="group inline-flex items-center gap-1 text-[#4F46E5] underline underline-offset-2 transition-colors hover:text-[#3730A3]" href="/demo">
                  Run the guided demo
                  <ArrowRight size={12} className="transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
              </motion.p>
            </div>

            {/* Visual card */}
            <motion.div
              initial={reduced ? false : { opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="relative flex items-center justify-center bg-gradient-to-br from-[#FAFAFA] via-[#F5F3FF] to-[#ECFDF5] p-10 md:p-16"
            >
              <motion.div
                className="relative w-full max-w-sm"
                animate={reduced ? {} : { y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' } as any}
              >
                <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-[#4F46E5]/10 via-[#7C3AED]/10 to-[#10B981]/10 blur-2xl" />

                <div className="relative overflow-hidden rounded-2xl border border-[#E5E7EB]/80 bg-white p-6 shadow-xl shadow-[#000000]/5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] text-white shadow-lg shadow-[#4F46E5]/20">
                        <Sparkles size={18} />
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-[#111827]">DealMemory</span>
                        <p className="text-xs text-[#9CA3AF]">Project ready</p>
                      </div>
                    </div>
                    <span className="rounded-full bg-[#ECFDF5] px-3 py-1 text-[11px] font-semibold text-[#10B981]">{'\u25CF'} Live</span>
                  </div>

                  <div className="mt-6 grid grid-cols-3 gap-3">
                    {[
                      ['Events', '0'],
                      ['Users', '0'],
                      ['Uptime', '100%'],
                    ].map(([label, val]) => (
                      <div key={label} className="rounded-xl bg-[#FAFAFA] p-3 text-center">
                        <div className="text-[10px] font-medium text-[#9CA3AF] uppercase">{label}</div>
                        <div className="mt-1 text-sm font-bold text-[#111827]">
                          <motion.span
                            animate={reduced ? {} : { opacity: [1, 0.5, 1] }}
                            transition={{ duration: 2, repeat: Infinity } as any}
                          >
                            {val}
                          </motion.span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5">
                    <div className="flex items-center justify-between text-xs text-[#6B7280]">
                      <span>Setup progress</span>
                      <span className="font-medium text-[#4F46E5]">Ready</span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#F3F4F6]">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-[#4F46E5] to-[#7C3AED]"
                        initial={{ width: '0%' }}
                        whileInView={{ width: '100%' }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.5, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                      />
                    </div>
                  </div>

                  <Link
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#4F46E5] py-3 text-sm font-semibold text-white shadow-lg shadow-[#4F46E5]/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
                    href="/signup"
                    aria-label="Sign up now"
                  >
                    Get your SDK
                    <motion.span
                      animate={reduced ? {} : { x: [0, 4, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity } as any}
                    >
                      <ArrowRight size={15} />
                    </motion.span>
                  </Link>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* PRODUCT VIDEO */}
        <section className="relative mx-auto w-full max-w-7xl px-5 py-28">
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-sm font-semibold tracking-wide text-[#4F46E5] uppercase">See it in action</p>
            <h2 className="mt-4 text-4xl font-bold tracking-tight text-[#111827] md:text-5xl">
              Product walkthrough
            </h2>
            <p className="mt-4 max-w-2xl text-lg text-[#6B7280]">
              Watch how DealMemory transforms raw events into living journeys —
              a window into your users' experience, painted in real time.
            </p>
          </motion.div>

          <motion.div
            initial={reduced ? false : { opacity: 0, y: 40, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="group relative mx-auto mt-12 w-full max-w-5xl"
          >
            <motion.div
              aria-hidden="true"
              animate={reduced ? {} : { opacity: [0.4, 0.8, 0.4], scale: [0.98, 1.02, 0.98] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' } as any}
              className="pointer-events-none absolute -inset-3 rounded-[2rem] bg-gradient-to-r from-[#4F46E5]/20 via-[#7C3AED]/20 to-[#4F46E5]/20 blur-xl"
            />

            <div className="relative overflow-hidden rounded-3xl border border-[#E5E7EB] bg-white shadow-2xl transition-all duration-500 group-hover:shadow-[0_0_60px_-12px_rgba(79,70,229,0.2)]">
              <div className="flex items-center gap-2 border-b border-[#E5E7EB] bg-[#FAFAFA] px-4 py-2.5">
                <div className="h-2.5 w-2.5 rounded-full bg-[#EF4444]/60" />
                <div className="h-2.5 w-2.5 rounded-full bg-[#F59E0B]/60" />
                <div className="h-2.5 w-2.5 rounded-full bg-[#10B981]/60" />
                <div className="mx-auto text-xs text-[#9CA3AF]">dealmemory-demo.mp4</div>
              </div>

              {videoSrc ? (
                <video className="h-full w-full" src={videoSrc} controls playsInline preload="metadata" poster="/video-poster.jpg" />
              ) : (
                <div className="grid h-[320px] w-full place-items-center bg-gradient-to-br from-[#FAFAFA] to-[#F5F3FF] text-center sm:h-[420px]">
                  <motion.div
                    animate={reduced ? {} : { y: [0, -8, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' } as any}
                  >
                    <div className="relative">
                      <div className="absolute -inset-4 rounded-full bg-[#4F46E5]/10 blur-xl" />
                      <Film size={32} className="relative mx-auto text-[#4F46E5]" />
                    </div>
                    <p className="relative mt-5 text-sm text-[#6B7280]">
                      Set <code className="rounded bg-[#EEF2FF] px-1.5 py-0.5 text-xs text-[#4F46E5]">NEXT_PUBLIC_DEALMEMORY_VIDEO_URL</code> to show your product video here.
                    </p>
                    <p className="relative mt-2 text-xs text-[#9CA3AF]">Your demo will appear in this cinematic frame.</p>
                  </motion.div>
                </div>
              )}
            </div>
          </motion.div>
        </section>

        {/* WHY DEALMEMORY */}
        <section className="relative mx-auto w-full max-w-7xl px-5 pb-28">
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute right-1/4 top-0 h-[30rem] w-[30rem] rounded-full bg-[radial-gradient(circle_at_center,_rgba(16,185,129,0.04),_transparent_60%)] blur-3xl" />
          </div>

          <motion.div
            initial={reduced ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <p className="text-sm font-semibold tracking-wide text-[#4F46E5] uppercase">Evidence over guesses</p>
            <h2 className="mt-4 text-4xl font-bold tracking-tight text-[#111827] md:text-5xl">
              Insights that <span className="italic text-[#6B7280]">explain themselves.</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-[#6B7280]">
              Every recommendation includes Confidence, Evidence, Observed Events, and Reasoning.
              No hallucinations. Only traceable, actionable suggestions.
            </p>
          </motion.div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {[
              { Icon: ShieldCheck, title: 'Remembers facts only', desc: 'We remember goals, failures, milestones — never opinions. No made-up context. No synthetic narratives. Only what happened.' },
              { Icon: Brain, title: 'Explains the why', desc: 'Each suggestion cites concrete events and inactivity windows to justify the action. Every insight is a story with a beginning, middle, and recommendation.' },
              { Icon: Rocket, title: 'Boosts conversion', desc: 'Prevent drop-offs by turning blockers into precise next steps before asking for payment. Turn friction into flow.' },
            ].map(({ Icon, title, desc }, i) => (
              <motion.div
                key={String(title)}
                initial={reduced ? false : { opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.6, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                className="group relative overflow-hidden rounded-2xl border border-[#E5E7EB]/60 bg-white p-8 shadow-sm transition-all duration-500 hover:border-[#4F46E5]/20 hover:shadow-xl hover:shadow-[#4F46E5]/5"
                whileHover={reduced ? {} : { y: -8 }}
              >
                <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-[#4F46E5]/5 to-transparent transition-all duration-500 group-hover:from-[#4F46E5]/10" />

                <motion.span
                  className="relative grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-[#EEF2FF] to-[#F5F3FF] text-[#4F46E5] shadow-sm"
                  whileHover={reduced ? {} : { scale: 1.1, rotate: 5 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <Icon size={20} />
                </motion.span>

                <h3 className="relative mt-6 text-xl font-semibold text-[#111827]">{title as string}</h3>
                <p className="relative mt-3 text-sm leading-relaxed text-[#6B7280]">{desc as string}</p>

                <div className="relative mt-6 flex items-center gap-2 text-sm font-medium text-[#4F46E5] opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <span>Learn more</span>
                  <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-1" />
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="relative overflow-hidden border-t border-[#E5E7EB]/50 bg-white">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute left-1/2 top-1/2 h-[50rem] w-[50rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_center,_rgba(79,70,229,0.04),_transparent_50%)] blur-3xl" />
          </div>

          <div className="relative mx-auto max-w-4xl px-5 py-24 text-center">
            <motion.div
              initial={reduced ? false : { opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <h2 className="text-4xl font-bold tracking-tight text-[#111827] md:text-5xl lg:text-6xl">
                From install to insight <br />
                <GradientText>in minutes.</GradientText>
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-lg text-[#6B7280]">
                Join the developers who stopped guessing and started remembering.
                Your users' journeys are waiting to be understood.
              </p>
            </motion.div>

            <motion.div
              initial={reduced ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-10 flex flex-wrap items-center justify-center gap-4"
            >
              <Link
                className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-[#4F46E5] px-8 py-4 text-sm font-semibold text-white shadow-xl shadow-[#4F46E5]/25 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-[#4F46E5]/30"
                href="/signup"
                aria-label="Start free"
              >
                <span className="relative z-10">Start free</span>
                <ArrowRight size={16} className="relative z-10 transition-transform duration-300 group-hover:translate-x-1" />
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              </Link>
              <Link
                className="group inline-flex items-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-8 py-4 text-sm font-semibold text-[#374151] shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[#4F46E5]/30 hover:shadow-md"
                href="/sdk"
                aria-label="See SDK"
              >
                <Code2 size={16} />
                See SDK
              </Link>
              <Link
                className="group inline-flex items-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-8 py-4 text-sm font-semibold text-[#374151] shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[#4F46E5]/30 hover:shadow-md"
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                aria-label="View on GitHub"
              >
                <Github size={16} />
                GitHub
              </Link>
            </motion.div>

            <motion.p
              initial={reduced ? false : { opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-8 text-xs text-[#9CA3AF]"
            >
              No credit card required · Free tier forever · Open source core
            </motion.p>
          </div>
        </section>
      </main>
    </AppShell>
  );
}
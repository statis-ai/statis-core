"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import dynamic from "next/dynamic";

const ParticleNetworkCanvas = dynamic(
  () => import("./ParticleNetworkCanvas").then((m) => m.ParticleNetworkCanvas),
  { ssr: false }
);

const LINES = [
  { delay: 0,    text: "POST /actions",                              type: "prompt" },
  { delay: 0.1,  text: '{ "action_type": "apply_discount",',         type: "dim" },
  { delay: 0.18, text: '  "target": "acct-8821",',                   type: "dim" },
  { delay: 0.26, text: '  "params": { "pct": 10 } }',                type: "dim" },
  { delay: 0.6,  text: "",                                            type: "spacer" },
  { delay: 0.7,  text: "→ 201 PROPOSED        act-f93a",             type: "muted" },
  { delay: 1.1,  text: "→ evaluating policy   churn_retention_v1",  type: "muted" },
  { delay: 1.6,  text: "→ APPROVED",                                 type: "success" },
  { delay: 2.1,  text: "→ lock acquired       act-f93a",             type: "dim" },
  { delay: 2.5,  text: "→ stripe.discount(10%) executed",            type: "dim" },
  { delay: 3.0,  text: "→ COMPLETED",                                type: "success" },
  { delay: 3.3,  text: "",                                            type: "spacer" },
  { delay: 3.5,  text: "→ receipt  sha256:3f9a8b2c…",               type: "dim" },
  { delay: 3.8,  text: "→ rule     churn_retention_v1@1.0",          type: "dim" },
  { delay: 4.1,  text: "→ idempotent  act-f93a already receipted",   type: "dim" },
] as const;

const COLOR: Record<string, string> = {
  prompt:  "text-[#00ffc8]",
  dim:     "text-[#4a4540]",
  muted:   "text-[#7a756e]",
  success: "text-[#00ffc8]",
  spacer:  "",
};

function LiveTerminal() {
  const [visible, setVisible] = useState(0);

  useEffect(() => {
    const ids: ReturnType<typeof setTimeout>[] = [];
    LINES.forEach((line, i) => {
      ids.push(setTimeout(() => setVisible(i + 1), line.delay * 1000 + 800));
    });
    return () => ids.forEach(clearTimeout);
  }, []);

  return (
    <div className="relative w-full max-w-[520px] mx-auto lg:mx-0">
      {/* Subtle glow halo behind terminal — very faint */}
      <div
        className="absolute -inset-8 rounded-3xl pointer-events-none"
        style={{ background: "radial-gradient(ellipse at center, rgba(0,255,200,0.04) 0%, transparent 70%)" }}
      />
      <div
        className="relative rounded-2xl overflow-hidden terminal-glow"
        style={{ background: "#090806", border: "1px solid rgba(255,240,220,0.08)" }}
      >
        {/* Title bar */}
        <div
          className="flex items-center gap-2 px-5 py-3.5"
          style={{ borderBottom: "1px solid rgba(255,240,220,0.06)", background: "rgba(255,255,255,0.015)" }}
        >
          <div className="w-2.5 h-2.5 rounded-full bg-[#4a4540]/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#4a4540]/45" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#4a4540]/35" />
          <span className="ml-3 text-[11px] font-mono text-[#3a3530] tracking-wider">statis — agent execution</span>
          <div className="ml-auto flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00ffc8] animate-pulse" style={{ boxShadow: "0 0 6px rgba(0,255,200,0.9)" }} />
            <span className="text-[10px] font-mono text-[#00ffc8]">live</span>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 font-mono text-[12px] leading-[1.9] min-h-[300px]">
          {LINES.map((line, i) => {
            if (i >= visible) return null;
            if (line.type === "spacer") return <div key={i} className="h-2" />;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.18 }}
                className={COLOR[line.type]}
              >
                {line.type === "prompt" && (
                  <span className="text-[#00ffc8]/50 mr-2 select-none">$</span>
                )}
                {line.text}
              </motion.div>
            );
          })}
          <motion.span
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse" }}
            className="inline-block w-[7px] h-[13px] bg-[#00ffc8]/50 align-middle"
          />
        </div>

        {/* Status bar */}
        <div
          className="flex items-center justify-between px-5 py-2.5"
          style={{ borderTop: "1px solid rgba(255,240,220,0.05)", background: "rgba(255,255,255,0.01)" }}
        >
          <span className="text-[10px] font-mono text-[#3a3530]">api.statis.dev · v0.1.0</span>
          <span className="text-[10px] font-mono text-[#00ffc8]/50">exactly-once ✓</span>
        </div>
      </div>
    </div>
  );
}

export function HeroV2() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const opacity = useTransform(scrollYProgress, [0, 0.65], [1, 0]);

  return (
    <section ref={ref} className="relative flex flex-col min-h-screen items-center justify-center overflow-hidden grid-texture">
      <div className="aurora" />
      <div className="absolute inset-0 z-0 opacity-60">
        <ParticleNetworkCanvas />
      </div>
      {/* Warm vignette */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{ background: "radial-gradient(ellipse 90% 70% at 50% 50%, transparent 30%, #0e0c0a 100%)" }}
      />

      <motion.div
        style={{ y, opacity }}
        className="relative z-10 mx-auto w-full max-w-7xl px-6 lg:px-8 pt-32 pb-20"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-center">

          {/* LEFT — copy */}
          <div>
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mb-7 inline-flex items-center gap-2 rounded-full px-4 py-1.5"
              style={{ border: "1px solid rgba(0,255,200,0.2)", background: "rgba(0,255,200,0.06)" }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#00ffc8]" style={{ boxShadow: "0 0 6px rgba(0,255,200,0.9)" }} />
              <span className="text-xs font-mono font-semibold uppercase tracking-[0.2em] text-[#00ffc8]">
                Agent Execution Infrastructure
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.2 }}
              className="font-bold tracking-tight leading-[1.06] mb-6"
              style={{ fontSize: "clamp(2.8rem, 5.2vw, 4.6rem)" }}
            >
              <span
                className="block font-light text-[#5a5550]"
                style={{ fontSize: "0.52em", letterSpacing: "-0.01em", marginBottom: "0.15em" }}
              >
                Shared state in.
              </span>
              <span className="block text-[#e8e5de]">Governed, receipted</span>
              <span
                className="block text-gradient font-display"
                style={{ fontStyle: "italic" }}
              >
                action out.
              </span>
            </motion.h1>

            {/* Body */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-[#7a756e] text-lg leading-relaxed max-w-lg mb-8"
            >
              Without a governed execution layer, agents retry blindly, duplicate production writes, and leave no audit trail. Statis closes that gap — policy before every action, exactly-once guarantee, SHA-256 receipt.
            </motion.p>

            {/* Primitive chips */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55, duration: 0.5 }}
              className="flex flex-wrap items-center gap-1.5 mb-10 text-[11px] font-mono"
            >
              {[
                { label: "Propose",    accent: true },
                { label: "Evaluate",   accent: false },
                { label: "Execute ×1", accent: false },
                { label: "Receipt",    accent: false },
              ].map(({ label, accent }, i, arr) => (
                <span key={label} className="flex items-center gap-1.5">
                  <span
                    className="rounded-full border px-3 py-0.5"
                    style={accent
                      ? { color: "#00ffc8", borderColor: "rgba(0,255,200,0.2)", background: "rgba(0,255,200,0.05)" }
                      : { color: "#7a756e", borderColor: "rgba(122,117,110,0.2)", background: "rgba(122,117,110,0.05)" }
                    }
                  >
                    {label}
                  </span>
                  {i < arr.length - 1 && <span style={{ color: "#2a2530" }}>→</span>}
                </span>
              ))}
            </motion.div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="flex flex-wrap items-center gap-3 mb-10"
            >
              <a
                href="https://www.surveymonkey.com/r/GVKH2KR"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-[#00ffc8] px-8 py-3.5 text-sm font-semibold text-black transition-all hover:brightness-110 hover:scale-[1.02] cursor-pointer btn-shimmer"
              >
                Request Design Partner Access
              </a>
              <a
                href="https://docs.statis.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full px-7 py-3 text-sm font-medium text-[#7a756e] transition-all hover:text-[#e8e5de] cursor-pointer"
                style={{ border: "1px solid rgba(255,240,220,0.1)", background: "rgba(255,255,255,0.02)" }}
              >
                Read the Docs →
              </a>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.3, duration: 0.7 }}
              className="grid grid-cols-3 gap-6 max-w-lg pt-8"
              style={{ borderTop: "1px solid rgba(255,240,220,0.06)" }}
            >
              {[
                { value: "< 15ms",  label: "Policy evaluation" },
                { value: "100%",    label: "Exactly-once lock" },
                { value: "SHA-256", label: "Tamper-evident receipt" },
              ].map(s => (
                <div key={s.label}>
                  <div className="text-xl font-bold stat-gradient tracking-tight font-mono">{s.value}</div>
                  <div className="text-[10px] font-mono mt-0.5" style={{ color: "#4a4540" }}>{s.label}</div>
                </div>
              ))}
            </motion.div>

            {/* Meta */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1, duration: 0.5 }}
              className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-6 text-[10px] font-mono"
              style={{ color: "#3a3530" }}
            >
              <span>Python · TypeScript</span>
              <span style={{ color: "#2a2530" }}>·</span>
              <span>PyPI + npm</span>
              <span style={{ color: "#2a2530" }}>·</span>
              <span>api.statis.dev live</span>
            </motion.div>
          </div>

          {/* RIGHT — Terminal */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.35 }}
          >
            <LiveTerminal />
          </motion.div>
        </div>

        {/* Scroll cue */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.2, duration: 1 }}
          className="mt-20 flex justify-center"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="flex flex-col items-center gap-2"
          >
            <div className="w-px h-10 bg-gradient-to-b from-[#00ffc8]/20 to-transparent" />
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { ROW_ONE, type Chip } from "./integrationsData";

const MARQUEE_ITEMS: Chip[] = [...ROW_ONE, ...ROW_ONE, ...ROW_ONE];

function HeroMarquee() {
  return (
    <div
      className="relative mx-auto overflow-hidden"
      style={{
        maxWidth: 720,
        maskImage:
          "linear-gradient(to right, transparent 0, black 12%, black 88%, transparent 100%)",
        WebkitMaskImage:
          "linear-gradient(to right, transparent 0, black 12%, black 88%, transparent 100%)",
      }}
    >
      <div
        className="flex gap-3"
        style={{ animation: "hero-marquee 32s linear infinite" }}
      >
        {MARQUEE_ITEMS.map((chip, i) => (
          <div
            key={`${chip.name}-${i}`}
            className="flex items-center gap-3 px-5 py-3 rounded-xl flex-shrink-0"
            style={{
              background: "rgba(15,15,17,0.7)",
              border: "1px solid rgba(255,255,255,0.08)",
              backdropFilter: "blur(10px)",
              whiteSpace: "nowrap",
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill={chip.color}
              style={{ flexShrink: 0 }}
            >
              <path d={chip.path} />
            </svg>
            <span
              className="text-[14px] font-medium tracking-tight"
              style={{ color: "var(--text)" }}
            >
              {chip.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Hero() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText("pip install statis-ai");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated mesh gradient blobs */}
      <div aria-hidden className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute rounded-full"
          style={{
            width: "60vw",
            height: "60vw",
            left: "15%",
            top: "10%",
            background: "radial-gradient(circle, rgba(80,120,255,0.18), transparent 65%)",
            filter: "blur(60px)",
            animation: "blob-drift-1 22s ease-in-out infinite",
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: "55vw",
            height: "55vw",
            right: "10%",
            top: "25%",
            background: "radial-gradient(circle, rgba(0,212,255,0.15), transparent 65%)",
            filter: "blur(70px)",
            animation: "blob-drift-2 28s ease-in-out infinite",
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: "45vw",
            height: "45vw",
            left: "30%",
            bottom: "10%",
            background: "radial-gradient(circle, rgba(180,80,220,0.10), transparent 65%)",
            filter: "blur(80px)",
            animation: "blob-drift-3 32s ease-in-out infinite",
          }}
        />
      </div>

      {/* Horizon line (subtle bottom glow) */}
      <div
        aria-hidden
        className="absolute bottom-0 left-0 right-0 h-[1px] pointer-events-none"
        style={{
          background: "linear-gradient(to right, transparent 10%, rgba(0,212,255,0.4) 50%, transparent 90%)",
          boxShadow: "0 0 40px rgba(0,212,255,0.3), 0 0 80px rgba(0,212,255,0.15)",
        }}
      />

      {/* Dot grid overlay */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none opacity-[0.15]"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          maskImage: "radial-gradient(ellipse 70% 60% at 50% 50%, black 10%, transparent 70%)",
          WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 50% 50%, black 10%, transparent 70%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-[1200px] px-6 text-center pt-32 pb-24">
        {/* Announcement pill */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          className="inline-flex items-center gap-2 mb-8"
        >
          <a
            href="#changelog"
            className="group inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[12px] font-medium transition-all"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "var(--text-2)",
              backdropFilter: "blur(12px)",
            }}
          >
            <Sparkles size={12} style={{ color: "#00D4FF" }} />
            <span style={{ color: "var(--text)" }}>v0.3</span>
            <span style={{ color: "var(--text-muted)" }}>·</span>
            <span>Native OIDC SSO + SCIM provisioning</span>
            <ArrowRight size={11} className="transition-transform group-hover:translate-x-0.5" />
          </a>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
          className="mb-6 font-extrabold tracking-[-0.045em] leading-[0.98]"
          style={{ fontSize: "clamp(48px, 8vw, 96px)" }}
        >
          <span className="block">Agent execution</span>
          <span
            className="block"
            style={{
              backgroundImage: "linear-gradient(180deg, #EDEDED 0%, #888888 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            infrastructure.
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-[17px] md:text-[19px] max-w-2xl mx-auto mb-10 leading-relaxed"
          style={{ color: "var(--text-2)" }}
        >
          Policy before every action. Exactly-once execution. Tamper-evident receipts.
          <br className="hidden md:block" />
          The trust layer production agents need.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          className="flex flex-wrap items-center justify-center gap-3 mb-10"
        >
          <a
            href="https://www.surveymonkey.com/r/GVKH2KR"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 px-6 py-3 rounded-full text-[14px] font-medium transition-all"
            style={{ background: "#EDEDED", color: "#000000" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#ffffff"; e.currentTarget.style.boxShadow = "0 0 40px rgba(255,255,255,0.2)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#EDEDED"; e.currentTarget.style.boxShadow = "none"; }}
          >
            Get Early Access
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
          </a>
          <a
            href="https://docs.statis.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-[14px] font-medium transition-all"
            style={{ border: "1px solid rgba(255,255,255,0.12)", color: "var(--text)", background: "rgba(255,255,255,0.02)" }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)"; e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; e.currentTarget.style.background = "rgba(255,255,255,0.02)"; }}
          >
            Read the docs
          </a>
        </motion.div>

        {/* pip install chip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.95, duration: 0.5 }}
          className="flex items-center justify-center"
        >
          <button
            onClick={handleCopy}
            className="flex items-center gap-3 px-4 py-2 rounded-lg text-[13px] font-mono transition-all cursor-pointer"
            style={{
              background: "rgba(10,10,10,0.6)",
              border: "1px solid var(--border)",
              color: "var(--text-2)",
              backdropFilter: "blur(12px)",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
          >
            <span style={{ color: "var(--text-muted)" }}>$</span>
            <span>pip install statis-ai</span>
            <span className="ml-1 text-[11px]" style={{ color: copied ? "#00D4FF" : "var(--text-muted)" }}>
              {copied ? "✓ Copied" : "Copy"}
            </span>
          </button>
        </motion.div>

        {/* Inline integrations marquee — constrained to hero width */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.6 }}
          className="mt-12"
        >
          <HeroMarquee />
        </motion.div>
      </div>

      <style>{`
        @keyframes blob-drift-1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(4%, -3%) scale(1.08); }
          66% { transform: translate(-3%, 4%) scale(0.95); }
        }
        @keyframes blob-drift-2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-5%, 3%) scale(1.1); }
          66% { transform: translate(3%, -4%) scale(0.92); }
        }
        @keyframes blob-drift-3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-4%, -5%) scale(1.15); }
        }
        @keyframes hero-marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
      `}</style>
    </section>
  );
}

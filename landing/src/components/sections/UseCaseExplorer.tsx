"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AICard } from "@/components/ui/AICard";
import { FallbackImage } from "@/components/ui/FallbackImage";
import { UseCasePanelArt } from "@/components/illustrations";

const USE_CASES = [
  {
    key: "multi-agent",
    label: "Multi-agent workflows",
    panel: {
      chips: ["Agent", "Workflow", "State"],
      title: "Keep agents in sync with shared state.",
      description:
        "When multiple agents operate on the same entity, Statis turns their semantic events into a single, deterministic state view\u2014then pushes changes to everyone who needs them.",
      bullets: [
        "Append-only log as the source of truth for agent events.",
        "Materialized entity state derived deterministically from the log.",
        "Subscriptions notify downstream agents; replay explains decisions at any revision.",
      ],
    },
  },
  {
    key: "support",
    label: "Support + ticketing",
    panel: {
      chips: ["Ticket", "Agent", "API"],
      title: "A stable record for every ticket and customer.",
      description:
        "Support workflows drift when context lives in chat and tools disagree. Statis captures changes as events, materializes the current state, and pushes updates across assistants and systems.",
      bullets: [
        "Event log records every change as ordered facts (status, priority, owner).",
        "Materialized state yields a consistent \u201ccurrent ticket state\u201d.",
        "Replay answers \u201cwhat changed and when?\u201d with provenance.",
      ],
    },
  },
  {
    key: "sales-billing",
    label: "Sales + billing",
    panel: {
      chips: ["Invoice", "Account", "Pipeline"],
      title: "Stop state drift across revenue-critical workflows.",
      description:
        "Sales and billing are sensitive to stale state. Statis provides an audit-friendly state layer that updates subscribers when account and invoice state changes.",
      bullets: [
        "Append-only events capture lifecycle changes (quote \u2192 invoice \u2192 payment).",
        "Deterministic reducers produce a single account/billing state view.",
        "Subscriptions + guardrails push updates; replay supports audit questions.",
      ],
    },
  },
  {
    key: "csm",
    label: "CSM + onboarding",
    panel: {
      chips: ["Onboarding", "Milestone", "Agent"],
      title: "Onboarding that stays consistent across tools and agents.",
      description:
        "Onboarding involves many steps and handoffs. Statis provides a canonical state that updates as tasks complete, so every agent sees the same progress and next action.",
      bullets: [
        "Log events for onboarding steps and customer milestones.",
        "Materialize a stable \u201conboarding state\u201d per account.",
        "Push state changes to the right subscribers; replay explains handoffs.",
      ],
    },
  },
  {
    key: "compliance",
    label: "Compliance + audit",
    panel: {
      chips: ["Audit", "Revision", "Trace"],
      title: "Make every answer explainable and replayable.",
      description:
        "In regulated workflows, you need to show what was known at the time. Statis supports time-travel queries and provenance so outcomes are auditable.",
      bullets: [
        "Append-only log preserves historical truth (no silent overwrites).",
        "Materialized state provides deterministic snapshots by revision.",
        "Replay answers \u201cwhat did X know at rev N?\u201d with delivery trace.",
      ],
    },
  },
  {
    key: "data-products",
    label: "Data products",
    panel: {
      chips: ["Entity", "Metric", "Definition"],
      title: "Deterministic state for entities, metrics, and definitions.",
      description:
        "Data products break when definitions drift. Statis can treat semantic changes as events and materialize a consistent \u2018golden record\u2019 state across time.",
      bullets: [
        "Event log captures definition changes and entity updates as ordered events.",
        "Reducers materialize consistent state snapshots for downstream use.",
        "Subscriptions notify consumers; replay supports debugging and rollback.",
      ],
    },
  },
  {
    key: "devtools",
    label: "Developer tools",
    panel: {
      chips: ["SDK", "Workflow", "Debug"],
      title: "Ship workflows with a replayable state backbone.",
      description:
        "Developer workflows benefit from deterministic, inspectable state. Statis provides a bus-like pattern: events in, state out, subscribers notified.",
      bullets: [
        "Append-only events provide an auditable execution timeline.",
        "Materialized state enables deterministic \u201cstate_at(rev)\u201d debugging.",
        "Subscriptions replace polling; replay supports postmortems.",
      ],
    },
  },
];

function CheckIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      className="shrink-0 text-brand-accent"
    >
      <path
        d="M3.5 8.5L6.5 11.5L12.5 4.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function UseCaseExplorer() {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = USE_CASES[activeIndex];

  return (
    <section className="py-24 lg:py-32">
      <div className="mx-auto max-w-6xl px-6">
        {/* Header */}
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
        >
          <span className="mb-4 inline-block rounded-full bg-brand-accent/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-brand-accent">
            Use cases
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
            State infrastructure that adapts{" "}
            <span className="text-brand-muted">to every workflow</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-brand-muted">
            From multi-agent coordination to compliance audit trails, the same
            four primitives serve every vertical.
          </p>
        </motion.div>

        {/* Desktop: left nav + right panel */}
        <div className="hidden lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Left nav */}
          <div className="col-span-4 flex flex-col gap-1">
            {USE_CASES.map((uc, i) => (
              <button
                key={uc.key}
                onClick={() => setActiveIndex(i)}
                className={`group flex items-center gap-3 rounded-xl px-4 py-3.5 text-left text-sm font-medium transition-all duration-200 ${
                  i === activeIndex
                    ? "bg-brand-accent/10 text-brand-accent shadow-[inset_0_0_0_1px_rgba(0,255,200,0.2)]"
                    : "text-brand-muted hover:bg-white/[0.04] hover:text-white"
                }`}
              >
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold transition-colors ${
                    i === activeIndex
                      ? "bg-brand-accent/20 text-brand-accent"
                      : "bg-white/10 text-white/40 group-hover:text-white/60"
                  }`}
                >
                  {i + 1}
                </span>
                {uc.label}
              </button>
            ))}
          </div>

          {/* Right panel — neon border override via inline style */}
          <div className="col-span-8">
            <AICard
              className="overflow-hidden"
              interactive={false}
              style={{
                border: "1px solid rgba(0,255,200,0.35)",
                boxShadow: "0 0 25px rgba(0,255,170,0.25)",
              }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={active.key}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="flex h-full flex-col p-8 lg:p-10"
                >
                  {/* Top chips: Agent / Workflow / State */}
                  <div className="mb-4 flex flex-wrap gap-2">
                    {["Agent", "Workflow", "State"].map((chip) => (
                      <span
                        key={chip}
                        className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs font-medium text-brand-muted"
                      >
                        {chip}
                      </span>
                    ))}
                  </div>
                  {/* Use-case specific chips */}
                  <div className="mb-6 flex flex-wrap gap-2">
                    {active.panel.chips.map((chip) => (
                      <span
                        key={chip}
                        className="rounded-full border border-brand-accent/20 bg-brand-accent/5 px-3 py-1 text-xs text-brand-accent"
                      >
                        {chip}
                      </span>
                    ))}
                  </div>

                  {/* Illustration */}
                  <div className="mb-6 h-[220px] w-full shrink-0 xl:mb-6 xl:h-[260px]">
                    <FallbackImage
                      src="/illustrations/usecase_orbit.png"
                      alt="Use case diagram"
                      width={560}
                      height={260}
                      className="h-full w-full object-contain"
                      fallback={<UseCasePanelArt activeIndex={activeIndex} className="h-full w-full" />}
                    />
                  </div>

                  <h3 className="text-2xl font-semibold text-white md:text-3xl">
                    {active.panel.title}
                  </h3>
                  <p className="mt-3 max-w-lg text-sm leading-relaxed text-brand-muted">
                    {active.panel.description}
                  </p>

                  <ul className="mt-6 flex flex-1 flex-col gap-3">
                    {active.panel.bullets.map((b, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <span className="mt-0.5">
                          <CheckIcon />
                        </span>
                        <span className="text-sm leading-relaxed text-brand-muted">
                          {b}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* Mini footer row */}
                  <div className="mt-8 flex flex-wrap gap-3 border-t border-white/10 pt-6">
                    {["Source of truth", "Deterministic reducers", "Replay + provenance"].map((tag) => (
                      <span
                        key={tag}
                        className="text-xs text-brand-muted"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
            </AICard>
          </div>
        </div>

        {/* Mobile: horizontal pills + panel */}
        <div className="lg:hidden">
          <div className="-mx-6 mb-6 flex gap-2 overflow-x-auto px-6 pb-2">
            {USE_CASES.map((uc, i) => (
              <button
                key={uc.key}
                onClick={() => setActiveIndex(i)}
                className={`shrink-0 rounded-full px-4 py-2 text-xs font-medium transition-all ${
                  i === activeIndex
                    ? "bg-brand-accent/15 text-brand-accent ring-1 ring-brand-accent/25"
                    : "bg-white/[0.06] text-brand-muted"
                }`}
              >
                {uc.label}
              </button>
            ))}
          </div>

          <AICard className="p-6" interactive={false}>
            <AnimatePresence mode="wait">
              <motion.div
                key={active.key}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                <div className="mb-4 h-[140px] w-full">
                  <UseCasePanelArt activeIndex={activeIndex} className="h-full w-full" />
                </div>
                <h3 className="text-xl font-semibold text-white md:text-2xl">
                  {active.panel.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-brand-muted">
                  {active.panel.description}
                </p>
                <ul className="mt-5 flex flex-col gap-2.5">
                  {active.panel.bullets.map((b, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="mt-0.5">
                        <CheckIcon />
                      </span>
                      <span className="text-sm text-brand-muted">{b}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-6 flex flex-wrap gap-3 border-t border-white/10 pt-4">
                  {["Source of truth", "Deterministic reducers", "Replay + provenance"].map((tag) => (
                    <span key={tag} className="text-xs text-brand-muted">
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </AICard>
        </div>
      </div>
    </section>
  );
}

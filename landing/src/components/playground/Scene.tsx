"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { AgentCard, type AgentPhase } from "./AgentCard";
import { Logo } from "../Logo";
import { PolicyModal, type PolicyPhase } from "./PolicyModal";
import { HumanCard, type HumanPhase } from "./HumanCard";
import { SlackNotification } from "./SlackNotification";
import { StripeFrame } from "./StripeFrame";
import { ReceiptModal } from "./ReceiptModal";
import { Connector } from "./Connector";
import { ActFrame } from "./ActFrame";
import { ClockAnimation } from "./ClockAnimation";
import { SCENE } from "@/data/playground-scene";

/* ─── Act identifiers ───────────────────────────────────────────── */
type Act = "agent" | "statis" | "escalation" | "execution" | "receipt";
const ACTS: Act[] = ["agent", "statis", "escalation", "execution", "receipt"];

/* ─── Stagger alignment per act ─────────────────────────────────── */
const actAlign: Record<Act, string> = {
  agent: "self-start ml-[3%] md:ml-[5%]",
  statis: "self-end mr-[3%] md:mr-[5%]",
  escalation: "self-start ml-[1%] md:ml-[3%]",
  execution: "self-end mr-[5%] md:mr-[8%]",
  receipt: "self-center",
};

/* ─── Connector labels ──────────────────────────────────────────── */
const connectors: { after: Act; label: string; bend: "left" | "right" }[] = [
  { after: "agent", label: "triggers statis", bend: "right" },
  { after: "statis", label: "escalates to human", bend: "left" },
  { after: "escalation", label: "executes via stripe", bend: "right" },
  { after: "execution", label: "receipted", bend: "left" },
];

const actEnter = {
  initial: { opacity: 0, y: 28, scale: 0.97 },
  animate: { opacity: 1, y: 0, scale: 1 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as number[] },
};

export function Scene({ onClose }: { onClose: () => void }) {
  const [runId, setRunId] = useState(1);
  const [activeAct, setActiveAct] = useState<Act>("agent");
  const [reachedActs, setReachedActs] = useState<Set<Act>>(new Set(["agent"]));
  const [finalState, setFinalState] = useState(false);

  // Clock
  const [clockPhase, setClockPhase] = useState<"hidden" | "ticking" | "triggered">("hidden");

  // Per-act sub-phases
  const [agentPhase, setAgentPhase] = useState<AgentPhase>("idle");
  const [policyPhase, setPolicyPhase] = useState<PolicyPhase>("hidden");
  const [statisHit, setStatisHit] = useState(false);
  const [humanPhase, setHumanPhase] = useState<HumanPhase>("hidden");
  const [slackPhase, setSlackPhase] = useState<
    "hidden" | "slide-in" | "awaiting" | "approved" | "denied"
  >("hidden");
  const [stripePhase, setStripePhase] = useState<
    "hidden" | "receiving" | "processing" | "done"
  >("hidden");
  const [receiptVisible, setReceiptVisible] = useState(false);
  const [denied, setDenied] = useState(false);
  const [typerKey, setTyperKey] = useState(0);

  const [connVisible, setConnVisible] = useState<Record<string, boolean>>({});

  const actRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const reduced = useReducedMotion();
  const runRef = useRef(0);
  const awaitRef = useRef<((d: "approved" | "denied") => void) | null>(null);

  const sleep = useCallback(
    (ms: number) =>
      new Promise<void>((r) => setTimeout(r, reduced ? Math.min(ms, 60) : ms)),
    [reduced],
  );

  const scrollToAct = useCallback((act: Act) => {
    requestAnimationFrame(() => {
      actRefs.current[act]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    });
  }, []);

  const activateAct = useCallback(
    (act: Act) => {
      setActiveAct(act);
      setReachedActs((prev) => new Set([...prev, act]));
      scrollToAct(act);
    },
    [scrollToAct],
  );

  const showConnector = useCallback((afterAct: Act) => {
    setConnVisible((prev) => ({ ...prev, [afterAct]: true }));
  }, []);

  /* ─── Timeline ─────────────────────────────────────────────────── */
  const play = useCallback(async () => {
    const myRun = ++runRef.current;
    const alive = () => runRef.current === myRun;

    // Reset all
    setActiveAct("agent");
    setReachedActs(new Set(["agent"]));
    setFinalState(false);
    setClockPhase("hidden");
    setAgentPhase("idle");
    setPolicyPhase("hidden");
    setStatisHit(false);
    setHumanPhase("hidden");
    setSlackPhase("hidden");
    setStripePhase("hidden");
    setReceiptVisible(false);
    setDenied(false);
    setTyperKey(0);
    setConnVisible({});

    /* ── ACT 1: AGENT ─────────────────────────────────────────────── */

    // Clock animation
    await sleep(400);
    if (!alive()) return;
    setClockPhase("ticking");
    await sleep(1600);
    if (!alive()) return;
    setClockPhase("triggered");
    await sleep(800);
    if (!alive()) return;

    // Agent wakes
    setAgentPhase("awake");
    await sleep(1000);
    if (!alive()) return;

    // Task textboxes stagger in
    setAgentPhase("working");
    await sleep(1800);
    if (!alive()) return;

    // Intent types in
    setAgentPhase("typing");
    setTyperKey((k) => k + 1);
    await sleep(1600);
    if (!alive()) return;

    // Proposing flash
    setAgentPhase("proposing");
    await sleep(1000);
    if (!alive()) return;

    // Connector: agent → statis
    showConnector("agent");
    await sleep(900);
    if (!alive()) return;

    /* ── ACT 2: STATIS ────────────────────────────────────────────── */
    activateAct("statis");
    await sleep(500);
    if (!alive()) return;
    setStatisHit(true);
    await sleep(500);
    if (!alive()) return;
    setPolicyPhase("evaluating");
    await sleep(1800);
    if (!alive()) return;
    setPolicyPhase("decided");
    await sleep(1200);
    if (!alive()) return;

    // Connector: statis → escalation
    showConnector("statis");
    await sleep(900);
    if (!alive()) return;

    /* ── ACT 3: ESCALATION ────────────────────────────────────────── */
    activateAct("escalation");
    await sleep(500);
    if (!alive()) return;
    setHumanPhase("entering");
    await sleep(500);
    if (!alive()) return;
    setHumanPhase("idle");
    await sleep(600);
    if (!alive()) return;
    setHumanPhase("notified");
    setSlackPhase("slide-in");
    await sleep(500);
    if (!alive()) return;
    setSlackPhase("awaiting");

    // Wait for user decision
    const decision = await new Promise<"approved" | "denied">((resolve) => {
      awaitRef.current = resolve;
    });
    if (!alive()) return;
    awaitRef.current = null;

    setSlackPhase(decision);
    setHumanPhase("decided");
    setDenied(decision === "denied");
    await sleep(1200);
    if (!alive()) return;

    if (decision === "approved") {
      showConnector("escalation");
      await sleep(900);
      if (!alive()) return;

      /* ── ACT 4: EXECUTION ─────────────────────────────────────────── */
      activateAct("execution");
      await sleep(500);
      if (!alive()) return;
      setStripePhase("receiving");
      await sleep(600);
      if (!alive()) return;
      setStripePhase("processing");
      await sleep(1600);
      if (!alive()) return;
      setStripePhase("done");
      await sleep(1000);
      if (!alive()) return;

      showConnector("execution");
      await sleep(900);
      if (!alive()) return;
    } else {
      showConnector("escalation");
      await sleep(900);
      if (!alive()) return;
    }

    /* ── ACT 5: RECEIPT ───────────────────────────────────────────── */
    activateAct("receipt");
    await sleep(400);
    if (!alive()) return;
    setReceiptVisible(true);

    await sleep(800);
    if (!alive()) return;
    setFinalState(true);
  }, [sleep, activateAct, showConnector]);

  useEffect(() => {
    play();
    return () => {
      runRef.current++;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runId]);

  const handleApprove = useCallback(() => awaitRef.current?.("approved"), []);
  const handleDeny = useCallback(() => awaitRef.current?.("denied"), []);
  const handleReplay = useCallback(() => setRunId((n) => n + 1), []);

  /* ─── Helpers ──────────────────────────────────────────────────── */
  const activeIdx = ACTS.indexOf(activeAct);

  const getOpacity = (act: Act) => {
    if (finalState) return 1;
    if (act === activeAct) return 1;
    const idx = ACTS.indexOf(act);
    if (idx < activeIdx) return 0.35;
    return 1;
  };

  const setActRef = (act: Act) => (el: HTMLDivElement | null) => {
    actRefs.current[act] = el;
  };

  const getConnectorLabel = (afterAct: Act) => {
    if (afterAct === "escalation" && denied) return "denied — receipted";
    const c = connectors.find((c) => c.after === afterAct);
    return c?.label ?? "";
  };

  /* ─── Render ───────────────────────────────────────────────────── */
  return (
    <div className="relative flex w-full flex-col">
      {/* Console-like warm horizon glow */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 bottom-0 z-0"
        style={{
          height: "40vh",
          background:
            "radial-gradient(ellipse 80% 100% at 50% 100%, rgba(212,184,136,0.05) 0%, transparent 70%)",
        }}
      />

      {/* ── ACT 1: THE AGENT ──────────────────────────────────────── */}
      {reachedActs.has("agent") && (
        <motion.div
          ref={setActRef("agent")}
          {...actEnter}
          animate={{ ...actEnter.animate, opacity: getOpacity("agent") }}
          className={`relative flex flex-col ${actAlign.agent}`}
          style={{ transition: "opacity 0.6s ease", maxWidth: 480 }}
        >
          <ActFrame title="act 1 · the agent">
            <div className="flex flex-col items-center gap-5">
              {/* Clock animation */}
              <ClockAnimation phase={clockPhase} />

              {/* Agent card (portrait + tasks + intent) */}
              <AgentCard scene={SCENE} phase={agentPhase} typerKey={typerKey} />
            </div>
          </ActFrame>
        </motion.div>
      )}

      {/* Connector: agent → statis */}
      <Connector
        label={getConnectorLabel("agent")}
        visible={!!connVisible["agent"]}
        bend="right"
      />

      {/* ── ACT 2: STATIS ─────────────────────────────────────────── */}
      {reachedActs.has("statis") && (
        <motion.div
          ref={setActRef("statis")}
          {...actEnter}
          animate={{ ...actEnter.animate, opacity: getOpacity("statis") }}
          className={`relative flex flex-col ${actAlign.statis}`}
          style={{ transition: "opacity 0.6s ease", maxWidth: 420 }}
        >
          <ActFrame title="act 2 · governance" accentColor="rgba(200,92,26,0.35)">
            <div className="flex flex-col items-center gap-4">
              <motion.div
                className="relative flex items-center justify-center"
                style={{ width: 90, height: 90 }}
                animate={statisHit ? { scale: [1, 1.12, 1] } : { scale: 1 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
              >
                {statisHit && (
                  <motion.span
                    aria-hidden
                    className="absolute inset-0 rounded-full"
                    style={{
                      border: "2px solid rgba(200,92,26,0.55)",
                      boxShadow: "0 0 32px rgba(200,92,26,0.35)",
                    }}
                    initial={{ scale: 0.4, opacity: 0.8 }}
                    animate={{ scale: 2.2, opacity: 0 }}
                    transition={{ duration: 1.0, ease: "easeOut" }}
                  />
                )}
                <Logo size="large" gapColor="#0F0F12" />
              </motion.div>
              <div
                className="text-[10px] font-mono uppercase text-center"
                style={{ color: "var(--text-2)", letterSpacing: "0.28em" }}
              >
                statis · execution layer
              </div>
              <PolicyModal scene={SCENE} phase={policyPhase} />
            </div>
          </ActFrame>
        </motion.div>
      )}

      {/* Connector: statis → escalation */}
      <Connector
        label={getConnectorLabel("statis")}
        visible={!!connVisible["statis"]}
        bend="left"
      />

      {/* ── ACT 3: ESCALATION ─────────────────────────────────────── */}
      {reachedActs.has("escalation") && (
        <motion.div
          ref={setActRef("escalation")}
          {...actEnter}
          animate={{ ...actEnter.animate, opacity: getOpacity("escalation") }}
          className={`relative flex flex-col ${actAlign.escalation}`}
          style={{ transition: "opacity 0.6s ease", maxWidth: 620 }}
        >
          <ActFrame title="act 3 · human in the loop" accentColor="rgba(108,122,255,0.3)">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
              <HumanCard scene={SCENE} phase={humanPhase} />
              <SlackNotification
                scene={SCENE}
                phase={slackPhase}
                onApprove={handleApprove}
                onDeny={handleDeny}
              />
            </div>
          </ActFrame>
        </motion.div>
      )}

      {/* Connector: escalation → execution (or denied → receipt) */}
      <Connector
        label={getConnectorLabel("escalation")}
        visible={!!connVisible["escalation"]}
        bend="right"
      />

      {/* ── ACT 4: EXECUTION ──────────────────────────────────────── */}
      {reachedActs.has("execution") && !denied && (
        <>
          <motion.div
            ref={setActRef("execution")}
            {...actEnter}
            animate={{ ...actEnter.animate, opacity: getOpacity("execution") }}
            className={`relative flex flex-col ${actAlign.execution}`}
            style={{ transition: "opacity 0.6s ease", maxWidth: 320 }}
          >
            <ActFrame title="act 4 · execution" accentColor="rgba(99,91,255,0.3)">
              <StripeFrame scene={SCENE} phase={stripePhase} />
            </ActFrame>
          </motion.div>

          <Connector
            label={getConnectorLabel("execution")}
            visible={!!connVisible["execution"]}
            bend="left"
          />
        </>
      )}

      {/* ── ACT 5: RECEIPT ────────────────────────────────────────── */}
      {reachedActs.has("receipt") && (
        <motion.div
          ref={setActRef("receipt")}
          {...actEnter}
          animate={{ ...actEnter.animate, opacity: getOpacity("receipt") }}
          className={`relative flex flex-col ${actAlign.receipt}`}
          style={{ transition: "opacity 0.6s ease", maxWidth: 460 }}
        >
          <ActFrame title="act 5 · receipt" accentColor="rgba(34,197,94,0.3)">
            <ReceiptModal
              scene={SCENE}
              visible={receiptVisible}
              denied={denied}
              onReplay={handleReplay}
            />
          </ActFrame>
        </motion.div>
      )}

      {/* Bottom spacing */}
      <div className="h-12" />

      <style jsx global>{`
        @keyframes pgBlink {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}

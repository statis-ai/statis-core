"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useMotionTemplate, useSpring, useTransform } from "framer-motion";
import { createPortal } from "react-dom";

/* ─── Data ─────────────────────────────────────────────────────── */

type Status = "APPROVED" | "ESCALATED" | "DENIED" | "SKIPPED";

interface ActionDef {
  ts: string; entity: string; signal: string;
  action: string; status: Status; rule: string;
  receipt: string | null; ltv: string; plan: string;
}

// 5 real companies found with churn signals
const ACTIONS: ActionDef[] = [
  { ts:"02:14:31", entity:"notion",  signal:"churn_risk=HIGH", action:"apply_discount(15%)", status:"APPROVED",  rule:"churn_retention_v1", receipt:"rct-9f2a", ltv:"$12,400", plan:"pro"       },
  { ts:"02:14:35", entity:"linear",  signal:"ltv=$78,500",     action:"apply_discount(15%)", status:"ESCALATED", rule:"high_value_v1",      receipt:null,       ltv:"$78,500", plan:"enterprise" },
  { ts:"02:14:39", entity:"webflow", signal:"last_refund=3d",  action:"apply_discount(15%)", status:"DENIED",    rule:"cooldown_v1",        receipt:null,       ltv:"$4,200",  plan:"growth"     },
  { ts:"02:14:43", entity:"figma",   signal:"churn_risk=HIGH", action:"apply_discount(15%)", status:"APPROVED",  rule:"churn_retention_v1", receipt:"rct-2c8e", ltv:"$8,900",  plan:"pro"        },
  { ts:"02:14:47", entity:"loom",    signal:"churn_risk=MED",  action:"apply_discount(15%)", status:"SKIPPED",   rule:"below_threshold",    receipt:null,       ltv:"$1,100",  plan:"starter"    },
];

const S: Record<Status, { color: string; bg: string; border: string }> = {
  APPROVED:  { color:"#22863a", bg:"rgba(34,134,58,0.09)",  border:"rgba(34,134,58,0.22)"  },
  ESCALATED: { color:"#c85c1a", bg:"rgba(200,92,26,0.1)",   border:"rgba(200,92,26,0.3)"   },
  DENIED:    { color:"#cb2431", bg:"rgba(203,36,49,0.08)",  border:"rgba(203,36,49,0.22)"  },
  SKIPPED:   { color:"#999",    bg:"rgba(0,0,0,0.04)",      border:"rgba(0,0,0,0.09)"      },
};

const INFO_LINES = [
  "  statis is the execution layer for production AI agents.",
  "  policy before every action. exactly-once. SHA-256 receipted.",
];

const INIT_LINES = [
  "  → resolving endpoint...",
  "  ✓ connected  (12ms)",
  "  ✓ policy: churn_retention_v1",
  "  ✓ adapter: stripe",
  "  ✓ scanning 847 accounts for churn signals...",
  "  ✓ 5 accounts matched — queued for action",
];

const HEADER_LINES = [
  "",
  "  TIME      COMPANY    SIGNAL            ACTION               STATUS",
  "  ──────────────────────────────────────────────────────────────────",
];

const LINKS = [
  { num:"[0]", label:"docs",        href:"https://docs.statis.dev"                     },
  { num:"[1]", label:"console",     href:"https://console.statis.dev"                  },
  { num:"[2]", label:"github",      href:"https://github.com/statis-ai/statis-sdk"     },
  { num:"[3]", label:"get started", href:"https://console.statis.dev/auth?mode=signup" },
];

/* ─── Audio ─────────────────────────────────────────────────────── */

let _ctx: AudioContext | null = null;
function playClick() {
  try {
    if (!_ctx) _ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (_ctx.state === "suspended") _ctx.resume();
    const len = Math.floor(_ctx.sampleRate * 0.016);
    const buf = _ctx.createBuffer(1, len, _ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (len * 0.18));
    const src = _ctx.createBufferSource();
    src.buffer = buf;
    const g = _ctx.createGain();
    g.gain.value = 0.028;
    src.connect(g);
    g.connect(_ctx.destination);
    src.start();
  } catch {}
}

/* ─── useTyper ───────────────────────────────────────────────────── */

function useTyper(lines: string[], startKey: number, onDone?: () => void) {
  const [doneLines, setDoneLines] = useState<string[]>([]);
  const [partial, setPartial]     = useState("");
  const activeRef  = useRef(false);
  const lineIdxRef = useRef(0);
  const charIdxRef = useRef(0);
  const onDoneRef  = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    if (startKey === 0) return;
    setDoneLines([]);
    setPartial("");
    lineIdxRef.current = 0;
    charIdxRef.current = 0;
    activeRef.current  = true;

    function advance() {
      if (!activeRef.current) return;
      const li = lineIdxRef.current;
      if (li >= lines.length) {
        activeRef.current = false;
        setPartial("");
        onDoneRef.current?.();
        return;
      }
      const line = lines[li];
      if (line === "") {
        setDoneLines(p => [...p, ""]);
        lineIdxRef.current++;
        charIdxRef.current = 0;
        setTimeout(advance, 60);
        return;
      }
      charIdxRef.current++;
      const ci = charIdxRef.current;
      setPartial(line.slice(0, ci));
      playClick();
      if (ci >= line.length) {
        setDoneLines(p => [...p, line]);
        setPartial("");
        lineIdxRef.current++;
        charIdxRef.current = 0;
        setTimeout(advance, 110);
      } else {
        setTimeout(advance, 38 + Math.random() * 22);
      }
    }
    advance();
    return () => { activeRef.current = false; };
  }, [startKey]); // eslint-disable-line

  return { doneLines, partial };
}

/* ─── Cursor ─────────────────────────────────────────────────────── */

function Cursor() {
  return (
    <span className="inline-block w-[7px] h-[13px] ml-px"
          style={{ background:"#2a2a2a", animation:"blink 0.9s step-end infinite", verticalAlign:"text-bottom" }} />
  );
}

/* ─── EnterHint ──────────────────────────────────────────────────── */

function EnterHint({ onClick }: { onClick: () => void }) {
  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                transition={{ duration:0.2 }}
                className="shrink-0 px-6 pb-4 pt-1" style={{ background:"#f7f6f2" }}>
      <button onClick={onClick} className="font-mono text-[11px] select-none transition-colors"
              style={{ color:"#c0b9aa" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#777")}
              onMouseLeave={e => (e.currentTarget.style.color = "#c0b9aa")}>
        Press{" "}
        <kbd className="px-1.5 py-0.5 rounded text-[10px]"
             style={{ background:"#e8e5de", border:"1px solid #d4d0c8", color:"#888" }}>
          Enter
        </kbd>{" "}
        to run
      </button>
    </motion.div>
  );
}

/* ─── Particle field (canvas, mouse-sensitive) ───────────────────── */

function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef  = useRef({ x: 0, y: 0 });
  const rafRef    = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = (canvas.width  = window.innerWidth);
    let H = (canvas.height = window.innerHeight);

    interface P {
      x: number; y: number; shape: number;
      size: number; gray: number; baseAlpha: number;
      bs: number; bp: number; depth: number;
    }

    const particles: P[] = Array.from({ length: 320 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      shape: Math.floor(Math.random() * 3), // 0=dot 1=cross 2=square
      size: 1.0 + Math.random() * 2.0,
      gray: Math.random(),
      baseAlpha: 0.14 + Math.random() * 0.22,
      bs: 0.2 + Math.random() * 1.4,   // blink speed
      bp: Math.random() * Math.PI * 2, // blink phase
      depth: 0.3 + Math.random() * 2.8,
    }));

    let t = 0;

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      const { x: mx, y: my } = mouseRef.current;
      const cx = W / 2, cy = H / 2;

      for (const p of particles) {
        const blink = 0.5 + 0.5 * Math.sin(t * p.bs + p.bp);
        const alpha = p.baseAlpha * (0.3 + 0.7 * blink);
        const gv = Math.floor(85 + p.gray * 80); // 85–165, dark enough to see on cream
        const px  = p.x + (mx - cx) * p.depth * 0.022;
        const py  = p.y + (my - cy) * p.depth * 0.022;
        const s   = p.size;

        ctx.globalAlpha = alpha;
        ctx.fillStyle   = `rgb(${gv},${gv},${gv})`;
        ctx.strokeStyle = `rgb(${gv},${gv},${gv})`;

        if (p.shape === 0) {
          // dot
          ctx.beginPath();
          ctx.arc(px, py, s * 0.6, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.shape === 1) {
          // cross / plus
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(px - s, py); ctx.lineTo(px + s, py);
          ctx.moveTo(px, py - s); ctx.lineTo(px, py + s);
          ctx.stroke();
        } else {
          // tiny square
          ctx.fillRect(px - s * 0.5, py - s * 0.5, s, s);
        }
      }

      ctx.globalAlpha = 1;
      t += 0.016;
      rafRef.current = requestAnimationFrame(draw);
    };

    draw();

    const onMouse = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    const onResize = () => {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
      for (const p of particles) { p.x = Math.random() * W; p.y = Math.random() * H; }
    };

    // Initialize mouse to center
    mouseRef.current = { x: W / 2, y: H / 2 };

    window.addEventListener("mousemove", onMouse);
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas ref={canvasRef}
            className="absolute inset-0 pointer-events-none"
            style={{ width:"100%", height:"100%" }} />
  );
}

/* ─── Links floating terminal ────────────────────────────────────── */

function LinksTerminal({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity:0, x:16, scale:0.94 }}
          animate={{ opacity:1, x:0, scale:1 }}
          exit={{ opacity:0, x:16, scale:0.94 }}
          transition={{ type:"spring", stiffness:280, damping:28 }}
          className="absolute flex flex-col"
          style={{
            top:"0px",
            left:"calc(100% - 28px)",
            width:"185px",
            height:"220px",
            background:"#f7f6f2",
            borderRadius:"10px",
            border:"1px solid #d4d0c8",
            boxShadow:"0 12px 40px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.06)",
            overflow:"hidden",
            zIndex:20,
          }}
        >
          <div className="flex items-center gap-2 px-3 py-2 shrink-0"
               style={{ background:"#eeece6", borderBottom:"1px solid #d4d0c8" }}>
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full" style={{ background:"#e0e0e0" }} />
              <div className="w-2 h-2 rounded-full" style={{ background:"#e0e0e0" }} />
              <div className="w-2 h-2 rounded-full" style={{ background:"#e0e0e0" }} />
            </div>
            <span className="flex-1 text-center text-[10px] font-mono" style={{ color:"#aaa" }}>links</span>
          </div>
          <div className="flex-1 p-3.5 font-mono text-[11px]">
            <div className="mb-3.5">
              <span style={{ color:"#c85c1a" }}>$ </span>
              <span style={{ color:"#2a2a2a" }}>statis links</span>
            </div>
            <div className="space-y-2.5">
              {LINKS.map(l => (
                <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer"
                   className="flex items-center gap-2.5 hover:opacity-60 transition-opacity">
                  <span style={{ color:"#bbb" }}>{l.num}</span>
                  <span style={{ color:"#555" }}>{l.label}</span>
                </a>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─── Approval card ──────────────────────────────────────────────── */

function ApprovalCard({ action, onDecide }: {
  action: ActionDef; onDecide: (d: "approved"|"rejected") => void;
}) {
  return (
    <motion.div
      initial={{ opacity:0 }}
      animate={{ opacity:1 }}
      exit={{ opacity:0 }}
      className="absolute inset-0 z-20 flex items-center justify-center p-6"
      style={{ backdropFilter:"blur(4px)", background:"rgba(240,237,230,0.8)" }}
    >
      <motion.div
        initial={{ opacity:0, scale:0.90, y:18 }}
        animate={{ opacity:1, scale:1, y:0 }}
        exit={{ opacity:0, scale:0.95, y:10 }}
        transition={{ type:"spring", stiffness:320, damping:28 }}
        className="w-full"
        style={{
          maxWidth:"340px",
          background:"#fff",
          border:"1px solid #e0ddd5",
          borderTop:"3px solid #c85c1a",
          borderRadius:"14px",
          boxShadow:"0 24px 64px rgba(0,0,0,0.13), 0 4px 20px rgba(200,92,26,0.1)",
          padding:"20px",
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ background:"#c85c1a" }} />
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest" style={{ color:"#c85c1a" }}>
            Approval required
          </span>
          <span className="ml-auto text-[9px] font-mono" style={{ color:"#ccc" }}>{action.ts} UTC</span>
        </div>

        <div className="rounded-lg px-3 py-2.5 mb-4 font-mono text-[11px]"
             style={{ background:"rgba(200,92,26,0.05)", border:"1px solid rgba(200,92,26,0.15)" }}>
          <div className="font-semibold mb-0.5" style={{ color:"#c85c1a" }}>high_value_v1</div>
          <div style={{ color:"#999" }}>LTV &gt; $50k — escalated for human review</div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-5">
          {([["Company",action.entity],["LTV",action.ltv],["Plan",action.plan],["Action",action.action]] as [string,string][]).map(([l,v]) => (
            <div key={l}>
              <p className="text-[9px] uppercase tracking-wider mb-0.5 font-mono" style={{ color:"#ccc" }}>{l}</p>
              <p className="text-[11px] font-mono font-semibold" style={{ color:"#333" }}>{v}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-2.5">
          <button
            onClick={() => onDecide("approved")}
            className="flex-1 py-2.5 rounded-xl text-[12px] font-mono font-semibold"
            style={{ background:"rgba(34,134,58,0.1)", color:"#22863a", border:"1.5px solid rgba(34,134,58,0.3)" }}
            onMouseEnter={e => (e.currentTarget.style.opacity="0.72")}
            onMouseLeave={e => (e.currentTarget.style.opacity="1")}
          >
            Approve
          </button>
          <button
            onClick={() => onDecide("rejected")}
            className="flex-1 py-2.5 rounded-xl text-[12px] font-mono font-semibold"
            style={{ background:"rgba(203,36,49,0.07)", color:"#cb2431", border:"1.5px solid rgba(203,36,49,0.22)" }}
            onMouseEnter={e => (e.currentTarget.style.opacity="0.72")}
            onMouseLeave={e => (e.currentTarget.style.opacity="1")}
          >
            Reject
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Receipt popup ──────────────────────────────────────────────── */

function ReceiptCard({ action, decision, rid, onClose }: {
  action: ActionDef; decision: "approved"|"rejected"; rid: string; onClose: () => void;
}) {
  const ok = decision === "approved";
  const rows: [string,string][] = [
    ["receipt_id",  rid || "rct-0000"],
    ["decision",    decision.toUpperCase()],
    ["company",     action.entity],
    ["action",      action.action],
    ["policy",      action.rule],
    ["decided_by",  "human (you)"],
    ["executed_at", `${action.ts} UTC`],
    ...(ok ? [["adapter","stripe → promo applied"] as [string,string]] : [["outcome","action blocked"] as [string,string]]),
    ["ltv",         action.ltv],
    ["sha256",      `${(rid||"rct0").slice(-4)}a3b2...d9f1`],
  ];

  return (
    <motion.div
      initial={{ opacity:0 }}
      animate={{ opacity:1 }}
      exit={{ opacity:0 }}
      className="absolute inset-0 z-30 flex items-center justify-center"
      style={{ backdropFilter:"blur(5px)", background:"rgba(240,237,230,0.7)" }}
    >
      <motion.div
        initial={{ opacity:0, y:28, scale:0.91 }}
        animate={{ opacity:1, y:0, scale:1 }}
        exit={{ opacity:0, y:14, scale:0.95 }}
        transition={{ type:"spring", stiffness:300, damping:28 }}
        className="flex flex-col"
        style={{
          width:"252px",
          maxHeight:"390px",
          background:"#fefefe",
          borderRadius:"8px",
          border:"1px solid #e8e5de",
          boxShadow:"0 20px 60px rgba(0,0,0,0.16), 0 2px 8px rgba(0,0,0,0.05)",
          overflow:"hidden",
        }}
      >
        <div className="flex items-center justify-between px-4 py-3 shrink-0"
             style={{ background: ok ? "rgba(34,134,58,0.05)" : "rgba(203,36,49,0.04)", borderBottom:"1px solid #f0ede6" }}>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: ok ? "#22863a" : "#cb2431" }} />
            <span className="text-[10px] font-mono uppercase tracking-widest" style={{ color:"#aaa" }}>Receipt</span>
          </div>
          <div className="flex items-center gap-2">
            <motion.span
              animate={{ opacity:[1, 0.15, 1] }}
              transition={{ repeat:Infinity, duration:0.75 }}
              className="text-[9px] font-mono"
              style={{ color:"#c85c1a" }}
            >close →</motion.span>
            <button
              onClick={onClose}
              style={{ color:"#bbb", fontSize:"19px", lineHeight:1, fontWeight:300 }}
              onMouseEnter={e => (e.currentTarget.style.color="#555")}
              onMouseLeave={e => (e.currentTarget.style.color="#bbb")}
            >×</button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {rows.map(([k,v]) => (
            <div key={k}>
              <p className="text-[8px] uppercase tracking-wider mb-0.5 font-mono" style={{ color:"#ccc" }}>{k}</p>
              <p className="text-[10px] font-mono leading-snug break-all"
                 style={{ color: k==="decision" ? (ok?"#22863a":"#cb2431") : "#555" }}>{v}</p>
            </div>
          ))}
        </div>

        <div className="px-4 py-2.5 shrink-0" style={{ borderTop:"1px solid #f0ede6", background:"#faf9f6" }}>
          <div className="flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full" style={{ background: ok ? "#22863a" : "#cb2431" }} />
            <span className="text-[8px] font-mono" style={{ color:"#ccc" }}>SHA-256 tamper-evident</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Human tab ─────────────────────────────────────────────────── */

type HPhase =
  | "idle" | "info" | "awaiting-connect" | "init"
  | "awaiting-run" | "header" | "running"
  | "escalating" | "receipt-open" | "done";

function HumanTab({ onShowLinks, onHideLinks }: {
  onShowLinks: () => void;
  onHideLinks: () => void;
}) {
  const [phase, setPhase]             = useState<HPhase>("idle");
  const [infoKey, setInfoKey]         = useState(0);
  const [initKey, setInitKey]         = useState(0);
  const [headerKey, setHeaderKey]     = useState(0);
  const [actionCount, setActionCount] = useState(0);
  const [escalation, setEscalation]   = useState<{ action:ActionDef; idx:number; decision?:"approved"|"rejected"; rid?:string } | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [decisions, setDecisions]     = useState<Record<number,{ d:"approved"|"rejected"; rid:string }>>({});
  const scrollRef    = useRef<HTMLDivElement>(null);
  const runRef       = useRef(false);
  const actionIdxRef = useRef(0);
  const onShowRef    = useRef(onShowLinks);
  const onHideRef    = useRef(onHideLinks);
  onShowRef.current  = onShowLinks;
  onHideRef.current  = onHideLinks;

  const { doneLines: infoLines,   partial: infoPartial }   =
    useTyper(INFO_LINES,   infoKey,   () => { onShowRef.current(); setTimeout(() => setPhase("awaiting-connect"), 400); });
  const { doneLines: initLines,   partial: initPartial }   =
    useTyper(INIT_LINES,   initKey,   () => setTimeout(() => setPhase("awaiting-run"), 250));
  const { doneLines: headerLines, partial: headerPartial } =
    useTyper(HEADER_LINES, headerKey, () => setPhase("running"));

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  });

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key !== "Enter") return;
      if (phase === "idle")                { setPhase("info");   setInfoKey(k => k + 1); }
      else if (phase === "awaiting-connect") { setPhase("init"); setInitKey(k => k + 1); onHideRef.current(); }
      else if (phase === "awaiting-run")     { setPhase("header"); setHeaderKey(k => k + 1); }
    };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [phase]);

  useEffect(() => {
    if (phase !== "running") return;
    runRef.current = true;
    actionIdxRef.current = actionCount;
    function tick() {
      if (!runRef.current) return;
      const idx = actionIdxRef.current;
      if (idx >= ACTIONS.length) { runRef.current = false; setPhase("done"); return; }
      const a = ACTIONS[idx];
      actionIdxRef.current++;
      setActionCount(idx + 1);
      if (a.status === "ESCALATED") {
        runRef.current = false;
        setTimeout(() => { setEscalation({ action:a, idx }); setPhase("escalating"); }, 350);
        return;
      }
      setTimeout(tick, 520);
    }
    const t = setTimeout(tick, 350);
    return () => { runRef.current = false; clearTimeout(t); };
  }, [phase]); // eslint-disable-line

  function handleDecide(d: "approved"|"rejected") {
    if (!escalation) return;
    const rid = d === "approved" ? `rct-${Math.random().toString(36).slice(2,6)}` : "";
    setEscalation(e => e ? { ...e, decision:d, rid } : null);
    setDecisions(p => ({ ...p, [escalation.idx]: { d, rid } }));
    setShowReceipt(true);
    setPhase("receipt-open");
  }

  function handleReceiptClose() {
    setShowReceipt(false);
    setEscalation(null);
    setTimeout(() => setPhase("running"), 150);
  }

  function handleEnter() {
    if (phase === "idle")                { setPhase("info");   setInfoKey(k => k + 1); }
    else if (phase === "awaiting-connect") { setPhase("init"); setInitKey(k => k + 1); onHideRef.current(); }
    else if (phase === "awaiting-run")     { setPhase("header"); setHeaderKey(k => k + 1); }
  }

  const canEnter = phase === "idle" || phase === "awaiting-connect" || phase === "awaiting-run";

  function lineColor(l: string) {
    if (l.startsWith("  ✓")) return "#22863a";
    if (l.startsWith("  →")) return "#999";
    if (l.startsWith("  ──")) return "#d8d5cc";
    if (l.startsWith("  TIME")) return "#aaa";
    return "#555";
  }

  const counts = { approved:0, denied:0, escalated:0, skipped:0 };
  ACTIONS.slice(0, actionCount).forEach((a, i) => {
    const dec = decisions[i];
    if (a.status === "ESCALATED") {
      counts.escalated++;
      if (dec?.d === "approved") counts.approved++;
      else if (dec?.d === "rejected") counts.denied++;
    } else if (a.status === "APPROVED") counts.approved++;
    else if (a.status === "DENIED") counts.denied++;
    else if (a.status === "SKIPPED") counts.skipped++;
  });

  const receiptCount = ACTIONS.slice(0, actionCount).filter((a, i) => {
    const dec = decisions[i];
    return (a.status === "APPROVED") || (a.status === "ESCALATED" && dec?.d === "approved");
  }).length;

  return (
    <div className="flex flex-col h-full relative">
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 pt-5 pb-2 font-mono text-[12px]">

        {phase === "idle" && (
          <div className="mb-6">
            <span className="text-base font-bold tracking-tight" style={{ color:"#2a2a2a" }}>statis</span>
            <span className="inline-block w-[8px] h-[15px] ml-px"
                  style={{ background:"#2a2a2a", animation:"blink 0.9s step-end infinite", verticalAlign:"text-bottom" }} />
          </div>
        )}

        <div className="mb-1">
          <span style={{ color:"#c85c1a" }}>$ </span>
          <span style={{ color:"#2a2a2a" }}>statis --info</span>
          {phase === "idle" && <Cursor />}
        </div>

        {infoLines.map((l, i) => (
          <div key={i} className="py-[1px]" style={{ color:"#666" }}>{l}</div>
        ))}
        {infoPartial && (
          <div className="py-[1px]" style={{ color:"#666" }}>
            {infoPartial}
            <span className="inline-block w-[6px] h-[12px] ml-px"
                  style={{ background:"#c85c1a", verticalAlign:"text-bottom", opacity:0.8 }} />
          </div>
        )}

        {["awaiting-connect","init","awaiting-run","header","running","escalating","receipt-open","done"].includes(phase) && (
          <div className="mt-3 mb-1">
            <span style={{ color:"#c85c1a" }}>$ </span>
            <span style={{ color:"#2a2a2a" }}>statis connect --agent cs-agent</span>
            {phase === "awaiting-connect" && <Cursor />}
          </div>
        )}

        {initLines.map((l, i) => (
          <div key={i} className="py-[1px]" style={{ color: lineColor(l) }}>{l}</div>
        ))}
        {initPartial && (
          <div className="py-[1px]" style={{ color: lineColor(initPartial) }}>
            {initPartial}
            <span className="inline-block w-[6px] h-[12px] ml-px"
                  style={{ background:"#c85c1a", verticalAlign:"text-bottom", opacity:0.8 }} />
          </div>
        )}

        {["awaiting-run","header","running","escalating","receipt-open","done"].includes(phase) && (
          <div className="mt-3 mb-1">
            <span style={{ color:"#c85c1a" }}>$ </span>
            <span style={{ color:"#2a2a2a" }}>statis run</span>
            {phase === "awaiting-run" && <Cursor />}
          </div>
        )}

        {headerLines.map((l, i) =>
          l === "" ? <div key={i} className="h-2" /> :
          <div key={i} className="py-[1px]" style={{ color: lineColor(l) }}>{l}</div>
        )}
        {headerPartial && (
          <div className="py-[1px]" style={{ color: lineColor(headerPartial) }}>
            {headerPartial}
            <span className="inline-block w-[6px] h-[12px] ml-px"
                  style={{ background:"#c85c1a", verticalAlign:"text-bottom", opacity:0.8 }} />
          </div>
        )}

        {ACTIONS.slice(0, actionCount).map((a, i) => {
          const dec = decisions[i];
          const eff: Status = dec?.d === "approved" ? "APPROVED" : dec?.d === "rejected" ? "DENIED" : a.status;
          const cfg = S[eff];
          return (
            <motion.div key={a.entity}
              initial={{ opacity:0, x:-6 }} animate={{ opacity:1, x:0 }}
              transition={{ type:"spring", stiffness:260, damping:28 }}
              className="flex items-center py-[3px] px-1 rounded text-[11px]"
            >
              <span className="w-[64px] shrink-0" style={{ color:"#c0b9aa" }}>{a.ts}</span>
              <span className="w-[68px] shrink-0" style={{ color:"#777" }}>{a.entity}</span>
              <span className="w-[136px] shrink-0 truncate" style={{ color:"#999" }}>{a.signal}</span>
              <span className="w-[128px] shrink-0 truncate" style={{ color:"#555" }}>{a.action}</span>
              <motion.span
                initial={{ opacity:0, scale:0.8 }} animate={{ opacity:1, scale:1 }}
                transition={{ type:"spring", stiffness:360, damping:22, delay: dec ? 0 : 0.14 }}
                className="shrink-0 text-[9px] px-1.5 py-0.5 rounded font-semibold"
                style={{ color:cfg.color, background:cfg.bg, border:`1px solid ${cfg.border}` }}
              >
                {dec ? (dec.d === "approved" ? "APPROVED" : "DENIED") : a.status}
                {dec ? " ←you" : ""}
              </motion.span>
              {eff === "APPROVED" && (dec?.rid || a.receipt) && (
                <motion.span initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.3 }}
                             className="ml-2 shrink-0 text-[9px]" style={{ color:"#ccc" }}>
                  {dec?.rid || a.receipt}
                </motion.span>
              )}
            </motion.div>
          );
        })}

        {phase === "done" && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ duration:0.5 }}
                      className="mt-3 pt-3 pb-4 font-mono text-[11px]" style={{ borderTop:"1px solid #e8e5de" }}>
            <div className="mb-1.5">
              <span style={{ color:"#888" }}>02:14:52 </span>
              <span style={{ color:"#aaa" }}>run complete · 5 accounts processed</span>
            </div>
            <div className="space-y-0.5 mb-3">
              <div><span style={{ color:"#22863a" }}>{counts.approved}</span><span style={{ color:"#aaa" }}> executed autonomously</span></div>
              <div><span style={{ color:"#c85c1a" }}>{counts.escalated}</span><span style={{ color:"#aaa" }}> escalated — your decision</span></div>
              <div><span style={{ color:"#cb2431" }}>{counts.denied}</span><span style={{ color:"#aaa" }}> denied by policy</span></div>
              <div><span style={{ color:"#bbb" }}>{counts.skipped}</span><span style={{ color:"#aaa" }}> skipped (below threshold)</span></div>
            </div>
            <div className="mb-4">
              <span style={{ color:"#22863a" }}>✓ </span>
              <span style={{ color:"#aaa" }}>{receiptCount} tamper-evident receipts written to ledger</span>
            </div>
            <motion.div initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.7, duration:0.4 }}>
              <a href="https://console.statis.dev/auth?mode=signup" target="_blank" rel="noopener noreferrer"
                 className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-mono font-semibold"
                 style={{ background:"#c85c1a", color:"#fff", boxShadow:"0 4px 20px rgba(200,92,26,0.35)" }}
                 onMouseEnter={e => (e.currentTarget.style.opacity="0.88")}
                 onMouseLeave={e => (e.currentTarget.style.opacity="1")}>
                Get started free →
              </a>
            </motion.div>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {canEnter && <EnterHint onClick={handleEnter} />}
      </AnimatePresence>

      <AnimatePresence>
        {phase === "escalating" && escalation && !escalation.decision && (
          <ApprovalCard action={escalation.action} onDecide={handleDecide} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showReceipt && escalation?.decision && (
          <ReceiptCard action={escalation.action} decision={escalation.decision}
                       rid={escalation.rid ?? ""} onClose={handleReceiptClose} />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Agent tab ─────────────────────────────────────────────────── */

function AgentTab() {
  return (
    <div className="flex-1 overflow-y-auto px-8 py-7 font-mono text-[12px]">
      <div className="mb-7">
        <div className="text-[10px] tracking-[0.2em] uppercase mb-1.5" style={{ color:"#bbb" }}>STATIS</div>
        <div className="text-[13px] font-semibold" style={{ color:"#2a2a2a" }}>Agent execution infrastructure.</div>
        <div className="text-[11px] mt-1" style={{ color:"#999" }}>The layer between your AI agent and production systems.</div>
      </div>

      <div className="mb-6">
        <div className="text-[10px] uppercase tracking-widest mb-2.5" style={{ color:"#bbb" }}>HOW IT WORKS</div>
        <div className="space-y-1.5">
          {[
            ["→  proposed",  "typed intent submitted before execution"],
            ["→  evaluated", "deterministic policy engine, no ML"],
            ["→  executed",  "exactly-once guarantee via adapter"],
            ["→  receipted", "SHA-256 tamper-evident log on every outcome"],
          ].map(([step, desc]) => (
            <div key={step} className="flex gap-3">
              <span className="w-[110px] shrink-0" style={{ color:"#c85c1a" }}>{step}</span>
              <span style={{ color:"#888" }}>{desc}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <div className="text-[10px] uppercase tracking-widest mb-2.5" style={{ color:"#bbb" }}>COMMANDS</div>
        <div className="space-y-1.5">
          {[
            ["statis connect", "connect your agent, load policy"],
            ["statis run",     "execute a governed batch run"],
            ["statis propose", "submit a single action"],
            ["statis receipt", "fetch a receipt by ID"],
          ].map(([cmd, desc]) => (
            <div key={cmd} className="flex gap-4">
              <span className="w-[150px] shrink-0" style={{ color:"#333" }}>{cmd}</span>
              <span style={{ color:"#aaa" }}>{desc}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <div className="text-[10px] uppercase tracking-widest mb-2.5" style={{ color:"#bbb" }}>ADAPTERS</div>
        <div style={{ color:"#888" }}>stripe · salesforce · hubspot · zendesk · github · slack · airflow</div>
      </div>

      <div>
        <div className="text-[10px] uppercase tracking-widest mb-2.5" style={{ color:"#bbb" }}>LINKS</div>
        <div className="space-y-2">
          {LINKS.map(l => (
            <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer"
               className="flex items-center gap-3 transition-opacity hover:opacity-60">
              <span style={{ color:"#bbb" }}>{l.num}</span>
              <span style={{ color:"#555" }}>{l.label}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Modal shell ─────────────────────────────────────────────────── */

function ModalInner({ onClose }: { onClose: () => void }) {
  const [tab, setTab]             = useState<"human"|"agent">("human");
  const [showLinks, setShowLinks] = useState(false);

  const mouseX = useMotionValue(720);
  const mouseY = useMotionValue(400);

  // Fast blob — tight follow
  const fastX = useSpring(mouseX, { stiffness:70, damping:22 });
  const fastY = useSpring(mouseY, { stiffness:70, damping:22 });
  // Slow blob — lags behind
  const slowX = useSpring(mouseX, { stiffness:18, damping:30 });
  const slowY = useSpring(mouseY, { stiffness:18, damping:30 });

  // 3D tilt springs
  const rawTiltX = useTransform(mouseY, [0, 900], [5, -5]);
  const rawTiltY = useTransform(mouseX, [0, 1440], [-6, 6]);
  const tiltX = useSpring(rawTiltX, { stiffness:55, damping:22 });
  const tiltY = useSpring(rawTiltY, { stiffness:55, damping:22 });

  const blob1 = useMotionTemplate`radial-gradient(420px at ${fastX}px ${fastY}px, rgba(200,92,26,0.18), transparent 70%)`;
  const blob2 = useMotionTemplate`radial-gradient(780px at ${slowX}px ${slowY}px, rgba(210,130,30,0.09), transparent 72%)`;

  useEffect(() => { setShowLinks(false); }, [tab]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      transition={{ duration:0.2 }}
      className="fixed inset-0 z-[100] overflow-hidden"
      style={{ background:"#ede9e0" }}
      onMouseMove={(e) => { mouseX.set(e.clientX); mouseY.set(e.clientY); }}
    >
      {/* Canvas particle field */}
      <ParticleField />

      {/* Drifting autonomous blob — slow organic movement */}
      <div className="absolute pointer-events-none" style={{ top:"10%", left:"5%", width:560, height:560 }}>
        <motion.div
          className="w-full h-full rounded-full"
          style={{ background:"radial-gradient(circle, rgba(200,92,26,0.08), transparent 70%)", filter:"blur(40px)" }}
          animate={{ x:[0,220,-80,160,0], y:[0,-180,130,-90,0] }}
          transition={{ duration:28, repeat:Infinity, ease:"easeInOut" }}
        />
      </div>
      <div className="absolute pointer-events-none" style={{ bottom:"5%", right:"8%", width:420, height:420 }}>
        <motion.div
          className="w-full h-full rounded-full"
          style={{ background:"radial-gradient(circle, rgba(180,110,20,0.07), transparent 70%)", filter:"blur(50px)" }}
          animate={{ x:[0,-160,80,-120,0], y:[0,120,-80,100,0] }}
          transition={{ duration:22, repeat:Infinity, ease:"easeInOut", delay:4 }}
        />
      </div>

      {/* Fast mouse blob */}
      <motion.div className="absolute inset-0 pointer-events-none" style={{ background:blob1 }} />
      {/* Slow trailing blob */}
      <motion.div className="absolute inset-0 pointer-events-none" style={{ background:blob2 }} />

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-5 right-6 z-10 text-2xl font-light leading-none transition-colors"
        style={{ color:"#bbb" }}
        onMouseEnter={e => (e.currentTarget.style.color="#555")}
        onMouseLeave={e => (e.currentTarget.style.color="#bbb")}
      >×</button>

      {/* Center content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full gap-4">

        {/* Toggle */}
        <div className="flex items-center p-0.5 rounded-lg"
             style={{ background:"rgba(42,42,42,0.07)", border:"1px solid rgba(42,42,42,0.1)" }}>
          {(["human","agent"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className="relative px-5 py-1.5 rounded-md text-xs font-mono"
              style={{ color: tab === t ? "#fff" : "rgba(42,42,42,0.4)" }}
            >
              {tab === t && (
                <motion.span layoutId="tab-pill-pg" className="absolute inset-0 rounded-md"
                             style={{ background:"#2a2a2a" }}
                             transition={{ type:"spring", stiffness:400, damping:30 }} />
              )}
              <span className="relative capitalize">{t}</span>
            </button>
          ))}
        </div>

        {/* Terminal + links wrapper */}
        <div className="relative" style={{ width:"560px" }}>

          {/* Main terminal — 3D tilt follows mouse */}
          <motion.div
               className="relative flex flex-col"
               style={{
                 height:"460px",
                 background:"#f7f6f2",
                 borderRadius:"12px",
                 border:"1px solid #d4d0c8",
                 boxShadow:"0 8px 40px rgba(0,0,0,0.1), 0 1px 4px rgba(0,0,0,0.05)",
                 overflow:"hidden",
                 rotateX: tiltX,
                 rotateY: tiltY,
                 transformPerspective: 1200,
               }}>
            {/* Title bar */}
            <div className="flex items-center gap-3 px-4 py-3 shrink-0"
                 style={{ background:"#eeece6", borderBottom:"1px solid #d4d0c8" }}>
              <div className="flex items-center gap-1.5">
                <button onClick={onClose} className="w-3 h-3 rounded-full hover:opacity-80 transition-opacity"
                        style={{ background:"#ff5f56" }} />
                <div className="w-3 h-3 rounded-full" style={{ background:"#ffbd2e" }} />
                <div className="w-3 h-3 rounded-full" style={{ background:"#27c93f" }} />
              </div>
              <div className="flex-1 text-center">
                <span className="text-[11px] font-mono" style={{ color:"#aaa" }}>statis-cli</span>
              </div>
              <div className="w-12" />
            </div>

            {/* Tab content */}
            <AnimatePresence mode="wait">
              <motion.div key={tab} initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                          transition={{ duration:0.12 }} className="flex-1 flex flex-col min-h-0">
                {tab === "human"
                  ? <HumanTab onShowLinks={() => setShowLinks(true)} onHideLinks={() => setShowLinks(false)} />
                  : <AgentTab />}
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* Links floating terminal */}
          {tab === "human" && <LinksTerminal show={showLinks} />}
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Export ─────────────────────────────────────────────────────── */

export function PlaygroundModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return createPortal(
    <AnimatePresence>{open && <ModalInner key="pg" onClose={onClose} />}</AnimatePresence>,
    document.body,
  );
}

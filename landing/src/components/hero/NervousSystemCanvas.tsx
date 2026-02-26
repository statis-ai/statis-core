"use client";

import React, { useEffect, useRef, useCallback } from "react";

/* ── 3D Node type ───────────────────────────────────────────── */
interface Node3D {
    x: number;
    y: number;
    z: number;        // depth: 0 = far, 1 = close
    baseX: number;
    baseY: number;
    label: string;
    icon: string;
    isCore: boolean;
    pulsePhase: number;
    paused: boolean;
}

/* ── Inbound fact particle ──────────────────────────────────── */
interface Fact {
    fromIdx: number;
    progress: number;   // 0→1 travel
    speed: number;
    color: string;
    isAlert: boolean;
}

/* ── Outbound ripple wave ───────────────────────────────────── */
interface Ripple {
    progress: number;
    speed: number;
    color: string;
}

/* ── Constants ──────────────────────────────────────────────── */
const BLUE = "#4f46e5"; // indigo-600
const CYAN = "#6366f1"; // indigo-500
const RED = "#ef4444";
const AMBER = "#f59e0b";
const FIBER_NORMAL = "rgba(79, 70, 229, 0.2)"; // Visible indigo tint
const FIBER_ALERT = "rgba(239, 68, 68, 0.3)";

function project(
    nx: number,
    ny: number,
    nz: number,
    w: number,
    h: number,
    mx: number,
    my: number
) {
    // Parallax shift from mouse (stronger for closer nodes)
    const parallax = 0.03 * nz;
    const sx = nx + (mx - 0.5) * parallax * w;
    const sy = ny + (my - 0.5) * parallax * h;
    // Perspective scale
    const scale = 0.7 + nz * 0.3;
    return { sx, sy, scale };
}

export function NervousSystemCanvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animRef = useRef<number>(0);
    const mouseRef = useRef({ x: 0.5, y: 0.5 });
    const nodesRef = useRef<Node3D[]>([]);
    const factsRef = useRef<Fact[]>([]);
    const ripplesRef = useRef<Ripple[]>([]);
    const alertCycleRef = useRef(0);
    const lastFactRef = useRef(0);
    const lastRippleRef = useRef(0);
    const coreRotRef = useRef(0);
    const dimRef = useRef({ w: 0, h: 0 });

    /* ── Set up nodes ─────────────────────────────────────────── */
    const initNodes = useCallback((w: number, h: number) => {
        const cx = w / 2;
        const cy = h / 2;
        const r = Math.min(w, h) * 0.30;

        const agents = [
            { label: "Support", icon: "🎧", angle: -120, z: 0.85 },
            { label: "Sales", icon: "💼", angle: -60, z: 0.7 },
            { label: "Billing", icon: "💳", angle: 0, z: 0.95 },
            { label: "CSM", icon: "📋", angle: 60, z: 0.6 },
            { label: "Finance", icon: "📊", angle: 120, z: 0.75 },
        ];

        const nodes: Node3D[] = [
            // Core node at index 0
            {
                x: cx, y: cy, z: 1, baseX: cx, baseY: cy,
                label: "STATIS", icon: "", isCore: true, pulsePhase: 0, paused: false,
            },
        ];

        agents.forEach((a, i) => {
            const rad = (a.angle * Math.PI) / 180;
            const ax = cx + Math.cos(rad) * r;
            const ay = cy + Math.sin(rad) * r;
            nodes.push({
                x: ax, y: ay, z: a.z, baseX: ax, baseY: ay,
                label: a.label, icon: a.icon, isCore: false,
                pulsePhase: i * 1.2, paused: false,
            });
        });

        nodesRef.current = nodes;
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const resize = () => {
            const dpr = window.devicePixelRatio || 1;
            const rect = canvas.getBoundingClientRect();
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            ctx.scale(dpr, dpr);
            dimRef.current = { w: rect.width, h: rect.height };
            initNodes(rect.width, rect.height);
        };

        const onMouse = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            mouseRef.current = {
                x: (e.clientX - rect.left) / rect.width,
                y: (e.clientY - rect.top) / rect.height,
            };
        };

        resize();
        window.addEventListener("resize", resize);
        canvas.addEventListener("mousemove", onMouse);

        /* ── Draw loop ──────────────────────────────────────────── */
        const draw = (ts: number) => {
            const { w, h } = dimRef.current;
            const mx = mouseRef.current.x;
            const my = mouseRef.current.y;
            const nodes = nodesRef.current;
            const core = nodes[0];

            ctx.clearRect(0, 0, w, h);

            // Alert cycle: 8s normal, 3s alert
            alertCycleRef.current = (ts / 1000) % 11;
            const isAlert = alertCycleRef.current > 8;

            // Update paused state
            nodes.forEach((n) => { if (!n.isCore) n.paused = isAlert; });

            // Rotate core
            coreRotRef.current = (ts / 8000) * Math.PI * 2;

            // Spawn facts
            if (ts - lastFactRef.current > 600) {
                const fromIdx = 1 + Math.floor(Math.random() * (nodes.length - 1));
                factsRef.current.push({
                    fromIdx,
                    progress: 0,
                    speed: 0.008 + Math.random() * 0.006,
                    color: isAlert ? (Math.random() < 0.5 ? RED : AMBER) : BLUE,
                    isAlert,
                });
                lastFactRef.current = ts;
            }

            // Spawn ripples from core
            if (ts - lastRippleRef.current > 1400) {
                ripplesRef.current.push({
                    progress: 0,
                    speed: 0.012,
                    color: isAlert ? RED : CYAN,
                });
                lastRippleRef.current = ts;
            }

            /* ── Neural fibers (connections) ─────────────────────── */
            for (let i = 1; i < nodes.length; i++) {
                const n = nodes[i];
                const coreProj = project(core.x, core.y, core.z, w, h, mx, my);
                const nProj = project(n.x, n.y, n.z, w, h, mx, my);

                // Curved bezier fiber
                const cpx = (coreProj.sx + nProj.sx) / 2 + (Math.sin(i * 1.3) * 20);
                const cpy = (coreProj.sy + nProj.sy) / 2 + (Math.cos(i * 0.9) * 15);

                ctx.beginPath();
                ctx.moveTo(coreProj.sx, coreProj.sy);
                ctx.quadraticCurveTo(cpx, cpy, nProj.sx, nProj.sy);
                ctx.strokeStyle = isAlert ? FIBER_ALERT : FIBER_NORMAL;
                ctx.lineWidth = 1;
                ctx.setLineDash([4, 8]);
                ctx.lineDashOffset = -(ts / 50);
                ctx.stroke();
                ctx.setLineDash([]);

                // Secondary faint fiber for depth
                ctx.beginPath();
                ctx.moveTo(coreProj.sx, coreProj.sy);
                ctx.quadraticCurveTo(cpx - 8, cpy + 8, nProj.sx, nProj.sy);
                ctx.strokeStyle = isAlert ? "rgba(239,68,68,0.15)" : "rgba(79,70,229,0.1)";
                ctx.lineWidth = 2;
                ctx.stroke();
            }

            /* ── Ripple rings from core ──────────────────────────── */
            const coreProj = project(core.x, core.y, core.z, w, h, mx, my);
            ripplesRef.current = ripplesRef.current.filter((r) => {
                r.progress += r.speed;
                if (r.progress > 1) return false;

                const radius = r.progress * Math.min(w, h) * 0.35;
                const alpha = (1 - r.progress) * 0.15;
                ctx.beginPath();
                ctx.arc(coreProj.sx, coreProj.sy, radius, 0, Math.PI * 2);
                ctx.strokeStyle = r.color;
                ctx.globalAlpha = alpha;
                ctx.lineWidth = 1.5;
                ctx.stroke();
                ctx.globalAlpha = 1;
                return true;
            });

            /* ── Core: rotating double-ring ──────────────────────── */
            const coreSize = 28;
            const rot = coreRotRef.current;

            // Outer orbit ring 1
            ctx.beginPath();
            ctx.ellipse(coreProj.sx, coreProj.sy, coreSize + 18, (coreSize + 18) * 0.4,
                rot, 0, Math.PI * 2);
            ctx.strokeStyle = isAlert ? "rgba(239,68,68,0.3)" : "rgba(79,70,229,0.15)";
            ctx.lineWidth = 0.8;
            ctx.stroke();

            // Outer orbit ring 2 (perpendicular)
            ctx.beginPath();
            ctx.ellipse(coreProj.sx, coreProj.sy, (coreSize + 14) * 0.5, coreSize + 14,
                rot + 0.3, 0, Math.PI * 2);
            ctx.strokeStyle = isAlert ? "rgba(239,68,68,0.2)" : "rgba(79,70,229,0.1)";
            ctx.lineWidth = 0.6;
            ctx.stroke();

            // Core glow
            const glow = ctx.createRadialGradient(
                coreProj.sx, coreProj.sy, coreSize * 0.5,
                coreProj.sx, coreProj.sy, coreSize + 40
            );
            glow.addColorStop(0, isAlert ? "rgba(239,68,68,0.12)" : "rgba(0,255,200,0.08)");
            glow.addColorStop(1, "transparent");
            ctx.beginPath();
            ctx.arc(coreProj.sx, coreProj.sy, coreSize + 40, 0, Math.PI * 2);
            ctx.fillStyle = glow;
            ctx.fill();

            // Core body
            const corePulse = Math.sin(ts / 500) * 0.15 + 0.85;
            ctx.beginPath();
            ctx.arc(coreProj.sx, coreProj.sy, coreSize, 0, Math.PI * 2);
            ctx.fillStyle = isAlert ? "rgba(239,68,68,0.2)" : "rgba(79,70,229,0.15)";
            ctx.fill();
            ctx.strokeStyle = isAlert ? RED : CYAN;
            ctx.lineWidth = 1.5;
            ctx.globalAlpha = corePulse;
            ctx.stroke();
            ctx.globalAlpha = 1;

            // Core label
            ctx.fillStyle = isAlert ? RED : CYAN;
            ctx.font = "bold 9px Inter, system-ui, sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("STATIS", coreProj.sx, coreProj.sy);

            /* ── Agent nodes ─────────────────────────────────────── */
            for (let i = 1; i < nodes.length; i++) {
                const n = nodes[i];
                const p = project(n.x, n.y, n.z, w, h, mx, my);
                const nodeSize = 18 * p.scale;
                const pulse = Math.sin(ts / 600 + n.pulsePhase) * 0.15 + 0.85;
                const depthAlpha = 0.5 + n.z * 0.5; // further = dimmer

                // Node glow (alert mode)
                if (n.paused) {
                    const ng = ctx.createRadialGradient(p.sx, p.sy, nodeSize * 0.5, p.sx, p.sy, nodeSize + 20);
                    ng.addColorStop(0, "rgba(239,68,68,0.1)");
                    ng.addColorStop(1, "transparent");
                    ctx.beginPath();
                    ctx.arc(p.sx, p.sy, nodeSize + 20, 0, Math.PI * 2);
                    ctx.fillStyle = ng;
                    ctx.fill();
                }

                // Node circle
                ctx.globalAlpha = depthAlpha;
                ctx.beginPath();
                ctx.arc(p.sx, p.sy, nodeSize, 0, Math.PI * 2);
                ctx.fillStyle = "#ffffff";
                ctx.fill();
                ctx.strokeStyle = n.paused
                    ? `rgba(239,68,68,${Math.max(0.4, pulse * 0.8)})`
                    : `rgba(79,70,229,${Math.max(0.3, pulse * 0.5)})`;
                ctx.lineWidth = 1.5;
                ctx.stroke();

                // Icon
                ctx.globalAlpha = depthAlpha;
                ctx.font = `${13 * p.scale}px serif`;
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText(n.icon, p.sx, p.sy - 1);

                // Label
                ctx.fillStyle = n.paused ? "rgba(239,68,68,0.9)" : "rgba(0,0,0,0.5)";
                ctx.font = `bold ${7 * p.scale}px Inter, system-ui, sans-serif`;
                ctx.fillText(
                    n.paused ? "PAUSED" : n.label,
                    p.sx,
                    p.sy + nodeSize + 10 * p.scale
                );
                ctx.globalAlpha = 1;
            }

            /* ── Fact particles (inbound to core) ────────────────── */
            factsRef.current = factsRef.current.filter((f) => {
                f.progress += f.speed;
                if (f.progress >= 1) return false;

                const fromNode = nodes[f.fromIdx];
                const fp = project(fromNode.x, fromNode.y, fromNode.z, w, h, mx, my);
                const t = f.progress;

                // Lerp from agent to core
                const fx = fp.sx + (coreProj.sx - fp.sx) * t;
                const fy = fp.sy + (coreProj.sy - fp.sy) * t;

                // Size grows slightly as it approaches
                const size = 2 + t * 2;

                ctx.beginPath();
                ctx.arc(fx, fy, size, 0, Math.PI * 2);
                ctx.fillStyle = f.color;
                ctx.globalAlpha = 0.8 - t * 0.4;
                ctx.fill();

                // Glow trail
                const tg = ctx.createRadialGradient(fx, fy, 0, fx, fy, size * 5);
                tg.addColorStop(0, f.color + "33");
                tg.addColorStop(1, "transparent");
                ctx.beginPath();
                ctx.arc(fx, fy, size * 5, 0, Math.PI * 2);
                ctx.fillStyle = tg;
                ctx.globalAlpha = 0.3;
                ctx.fill();
                ctx.globalAlpha = 1;

                return true;
            });

            // Cap arrays
            if (factsRef.current.length > 30) factsRef.current = factsRef.current.slice(-20);
            if (ripplesRef.current.length > 8) ripplesRef.current = ripplesRef.current.slice(-5);

            /* ── Ambient depth particles ─────────────────────────── */
            const particleCount = 12;
            for (let i = 0; i < particleCount; i++) {
                const px = (Math.sin(ts / 3000 + i * 2.1) * 0.4 + 0.5) * w;
                const py = (Math.cos(ts / 4000 + i * 1.7) * 0.35 + 0.5) * h;
                const pz = (Math.sin(i * 0.8) * 0.3 + 0.5);
                const pp = project(px, py, pz, w, h, mx, my);
                const psize = 1 + pz;

                ctx.beginPath();
                ctx.arc(pp.sx, pp.sy, psize, 0, Math.PI * 2);
                ctx.fillStyle = "rgba(79,70,229,0.2)";
                ctx.globalAlpha = 0.4 + pz * 0.3;
                ctx.fill();
                ctx.globalAlpha = 1;
            }

            animRef.current = requestAnimationFrame(draw);
        };

        animRef.current = requestAnimationFrame(draw);

        return () => {
            cancelAnimationFrame(animRef.current);
            window.removeEventListener("resize", resize);
            canvas.removeEventListener("mousemove", onMouse);
        };
    }, [initNodes]);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full mix-blend-multiply"
            style={{ opacity: 0.9 }}
        />
    );
}

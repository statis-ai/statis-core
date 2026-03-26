"use client";

import { useEffect, useRef } from "react";

interface Particle {
    x: number;   // 3D x [-1, 1] normalised
    y: number;   // 3D y [-1, 1] normalised
    z: number;   // 3D z depth [0.2, 1.0] — higher z = closer = bigger
    vx: number;
    vy: number;
    vz: number;
    baseAlpha: number;
}

export function ParticleNetworkCanvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Respect reduced motion
        const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
        if (mql.matches) return;

        let animationFrameId: number;
        let width = 1;
        let height = 1;
        const particles: Particle[] = [];

        // Mouse position in [-1, 1] normalised canvas space
        const mouse = { nx: 0, ny: 0, active: false };
        // Smoothed parallax offset (lags behind mouse)
        const parallax = { x: 0, y: 0 };

        const PARTICLE_COUNT = Math.min(Math.floor(window.innerWidth / 10), 140);
        const FOCAL_LENGTH = 1.8;   // Perspective strength
        const NODE_COLOR_NEAR  = "0, 255, 200";   // cyan — near particles
        const NODE_COLOR_FAR   = "99, 102, 241";  // indigo — far particles
        const MAX_SCREEN_DIST  = 160;              // Connection threshold (screen px)
        const MOUSE_RADIUS_PX  = 240;             // Mouse influence radius (screen px)
        const PARALLAX_STRENGTH = 0.06;           // How much layers shift with mouse

        const initParticles = () => {
            particles.length = 0;
            for (let i = 0; i < PARTICLE_COUNT; i++) {
                particles.push({
                    x: (Math.random() - 0.5) * 2.4,
                    y: (Math.random() - 0.5) * 2.4,
                    z: Math.random() * 0.8 + 0.2,
                    vx: (Math.random() - 0.5) * 0.0006,
                    vy: (Math.random() - 0.5) * 0.0006,
                    vz: (Math.random() - 0.5) * 0.0003,
                    baseAlpha: Math.random() * 0.35 + 0.06,
                });
            }
        };

        const resize = () => {
            const parent = canvas.parentElement;
            if (!parent) return;
            const dpr = window.devicePixelRatio || 1;
            width  = parent.clientWidth;
            height = parent.clientHeight;
            canvas.width  = width  * dpr;
            canvas.height = height * dpr;
            ctx.scale(dpr, dpr);
        };

        // Project 3D [-1,1] coords → screen px, with parallax shift per z-layer
        const project = (p: Particle) => {
            // Parallax: far particles (low z) shift more → depth illusion
            const layerShift = (1 - p.z) * PARALLAX_STRENGTH;
            const px3d = p.x + parallax.x * layerShift;
            const py3d = p.y + parallax.y * layerShift;

            const scale = FOCAL_LENGTH / (FOCAL_LENGTH + (1 - p.z));
            const sx = (px3d * scale + 1) * 0.5 * width;
            const sy = (py3d * scale + 1) * 0.5 * height;
            const radius = (p.z * 1.8 + 0.3) * scale;  // closer = bigger
            return { sx, sy, radius, scale };
        };

        const draw = () => {
            ctx.clearRect(0, 0, width, height);

            // Smooth parallax towards mouse
            const targetPx = mouse.active ? mouse.nx * 2 : 0;
            const targetPy = mouse.active ? mouse.ny * 2 : 0;
            parallax.x += (targetPx - parallax.x) * 0.04;
            parallax.y += (targetPy - parallax.y) * 0.04;

            // Update positions (wrap at edges)
            for (const p of particles) {
                p.x += p.vx;
                p.y += p.vy;
                p.z += p.vz;
                if (p.x < -1.4) p.x = 1.4;
                if (p.x >  1.4) p.x = -1.4;
                if (p.y < -1.4) p.y = 1.4;
                if (p.y >  1.4) p.y = -1.4;
                if (p.z < 0.15) p.vz = Math.abs(p.vz);
                if (p.z > 1.0)  p.vz = -Math.abs(p.vz);
            }

            // Project all particles
            const projected = particles.map((p) => ({ p, ...project(p) }));

            // Sort back-to-front so near particles render on top
            projected.sort((a, b) => a.p.z - b.p.z);

            // Draw connections first (behind nodes)
            for (let i = 0; i < projected.length; i++) {
                const a = projected[i];
                for (let j = i + 1; j < projected.length; j++) {
                    const b = projected[j];
                    const dx = a.sx - b.sx;
                    const dy = a.sy - b.sy;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist > MAX_SCREEN_DIST) continue;

                    const avgZ = (a.p.z + b.p.z) * 0.5;
                    const proximity = 1 - dist / MAX_SCREEN_DIST;
                    let alpha = proximity * 0.10 * avgZ;
                    let lineColor = NODE_COLOR_FAR;

                    // Boost lines near mouse
                    const msx = mouse.nx * 0.5 * width  + width  * 0.5;
                    const msy = mouse.ny * 0.5 * height + height * 0.5;
                    const dma = Math.sqrt((a.sx - msx) ** 2 + (a.sy - msy) ** 2);
                    const dmb = Math.sqrt((b.sx - msx) ** 2 + (b.sy - msy) ** 2);
                    if (dma < MOUSE_RADIUS_PX && dmb < MOUSE_RADIUS_PX) {
                        const boost = (1 - Math.max(dma, dmb) / MOUSE_RADIUS_PX) * 0.45;
                        alpha = Math.min(0.65, alpha + boost);
                        lineColor = NODE_COLOR_NEAR;
                    }

                    ctx.beginPath();
                    ctx.moveTo(a.sx, a.sy);
                    ctx.lineTo(b.sx, b.sy);
                    ctx.strokeStyle = `rgba(${lineColor}, ${alpha})`;
                    ctx.lineWidth = alpha > 0.2 ? 1.0 : 0.4;
                    ctx.stroke();
                }
            }

            // Draw nodes
            for (const { p, sx, sy, radius } of projected) {
                const msx = mouse.nx * 0.5 * width  + width  * 0.5;
                const msy = mouse.ny * 0.5 * height + height * 0.5;
                const dm = Math.sqrt((sx - msx) ** 2 + (sy - msy) ** 2);
                const nearMouse = dm < MOUSE_RADIUS_PX;

                let alpha = p.baseAlpha * p.z;
                let nodeColor = NODE_COLOR_FAR;
                if (nearMouse) {
                    const boost = (1 - dm / MOUSE_RADIUS_PX) * 0.55;
                    alpha = Math.min(0.9, alpha + boost);
                    nodeColor = NODE_COLOR_NEAR;
                    // Slight repulsion from mouse cursor
                    const ndx = sx - msx;
                    const ndy = sy - msy;
                    const norm = Math.sqrt(ndx * ndx + ndy * ndy) || 1;
                    p.x -= (ndx / norm) * 0.00025;
                    p.y -= (ndy / norm) * 0.00025;
                }

                // Subtle glow for near particles
                if (nearMouse && alpha > 0.3) {
                    ctx.beginPath();
                    ctx.arc(sx, sy, radius * 3, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(${nodeColor}, ${alpha * 0.08})`;
                    ctx.fill();
                }

                ctx.beginPath();
                ctx.arc(sx, sy, Math.max(0.3, radius), 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${nodeColor}, ${alpha})`;
                ctx.fill();
            }

            animationFrameId = requestAnimationFrame(draw);
        };

        const handleMouseMove = (e: MouseEvent) => {
            // Normalise to [-1, 1]
            mouse.nx = (e.clientX / window.innerWidth)  * 2 - 1;
            mouse.ny = (e.clientY / window.innerHeight) * 2 - 1;
            mouse.active = true;
        };

        const handleMouseLeave = () => { mouse.active = false; };

        let resizeTimeout: ReturnType<typeof setTimeout>;
        const handleResize = () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => { resize(); initParticles(); }, 200);
        };

        window.addEventListener("resize",    handleResize);
        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseout",  handleMouseLeave);

        resize();
        initParticles();
        draw();

        return () => {
            window.removeEventListener("resize",    handleResize);
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseout",  handleMouseLeave);
            clearTimeout(resizeTimeout);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none"
        />
    );
}

"use client";

import { useEffect, useRef } from "react";

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    baseAlpha: number;
}

export function ParticleNetworkCanvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let animationFrameId: number;
        let width = canvas.width;
        let height = canvas.height;
        const particles: Particle[] = [];

        const mouse = { x: -1000, y: -1000 };

        // Constants
        const PARTICLE_COUNT = Math.floor(window.innerWidth / 15); // Scale count by screen width
        const MAX_DISTANCE = 150;
        const MOUSE_RADIUS = 200;
        const NODE_COLOR = "79, 70, 229"; // indigo-600

        const initParticles = () => {
            particles.length = 0;
            for (let i = 0; i < PARTICLE_COUNT; i++) {
                particles.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    vx: (Math.random() - 0.5) * 0.4,
                    vy: (Math.random() - 0.5) * 0.4,
                    radius: Math.random() * 1.5 + 0.5,
                    baseAlpha: Math.random() * 0.5 + 0.1
                });
            }
        };

        const resize = () => {
            const parent = canvas.parentElement;
            if (parent) {
                width = parent.clientWidth;
                height = parent.clientHeight;
                const dpr = window.devicePixelRatio || 1;
                canvas.width = width * dpr;
                canvas.height = height * dpr;
                ctx.scale(dpr, dpr);
            }
        };

        const draw = () => {
            ctx.clearRect(0, 0, width, height);

            // Update & Draw particles
            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                p.x += p.vx;
                p.y += p.vy;

                // Bounce off edges smoothly
                if (p.x < 0 || p.x > width) p.vx *= -1;
                if (p.y < 0 || p.y > height) p.vy *= -1;

                // Distance to mouse
                const dxMouse = mouse.x - p.x;
                const dyMouse = mouse.y - p.y;
                const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);

                // Mouse interaction: slight attraction and increased opacity
                let currentAlpha = p.baseAlpha;
                if (distMouse < MOUSE_RADIUS) {
                    currentAlpha = Math.min(1, p.baseAlpha + (MOUSE_RADIUS - distMouse) / MOUSE_RADIUS * 0.6);
                    // Subtle pull towards mouse
                    p.x += dxMouse * 0.005;
                    p.y += dyMouse * 0.005;
                }

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${NODE_COLOR}, ${currentAlpha})`;
                ctx.fill();

                // Connect particles
                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const dx = p.x - p2.x;
                    const dy = p.y - p2.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < MAX_DISTANCE) {
                        const lineAlpha = (1 - dist / MAX_DISTANCE) * 0.15;

                        // Highlight lines near mouse (brain signal effect)
                        const distMouseP2 = Math.sqrt((mouse.x - p2.x) ** 2 + (mouse.y - p2.y) ** 2);
                        let finalAlpha = lineAlpha;
                        if (distMouse < MOUSE_RADIUS && distMouseP2 < MOUSE_RADIUS) {
                            const boost = Math.min(0.6, 0.6 * (1 - Math.max(distMouse, distMouseP2) / MOUSE_RADIUS));
                            finalAlpha = Math.min(1, lineAlpha + boost);
                        }

                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.strokeStyle = `rgba(${NODE_COLOR}, ${finalAlpha})`;
                        // Thicker lines if active near mouse
                        ctx.lineWidth = finalAlpha > 0.3 ? 1.5 : 0.5;
                        ctx.stroke();
                    }
                }
            }

            animationFrameId = requestAnimationFrame(draw);
        };

        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        };

        const handleMouseLeave = () => {
            mouse.x = -1000;
            mouse.y = -1000;
        };

        let resizeTimeout: NodeJS.Timeout;
        const handleResize = () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                resize();
                initParticles();
            }, 200);
        };

        window.addEventListener("resize", handleResize);
        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseout", handleMouseLeave); // triggers when leaving window

        resize();
        initParticles();
        draw();

        return () => {
            window.removeEventListener("resize", handleResize);
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseout", handleMouseLeave);
            clearTimeout(resizeTimeout);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none mix-blend-multiply"
        />
    );
}

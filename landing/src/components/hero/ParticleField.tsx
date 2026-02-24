"use client";

import { useEffect, useRef } from "react";

class Particle {
    x: number;
    y: number;
    baseX: number;
    baseY: number;
    dx: number;
    dy: number;
    size: number;
    color: string;
    angle: number;

    constructor(x: number, y: number, color: string) {
        this.x = x;
        this.y = y;
        this.baseX = x;
        this.baseY = y;
        this.dx = 0;
        this.dy = 0;
        this.size = Math.random() * 2 + 1;
        this.color = color;
        this.angle = Math.random() * Math.PI * 2;
    }
}

export function ParticleField() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let particles: Particle[] = [];
        let animationFrameId: number;

        const mouse = {
            x: -1000,
            y: -1000,
            radius: 200,
        };

        const colors = ["#00FFAA", "#4F46E5", "#0ea5e9", "#22d3ee"]; // Cyan, Indigo, Light Blue

        const init = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;

            particles = [];
            const density = 40;
            const rows = canvas.height / density;
            const cols = canvas.width / density;

            for (let y = 0; y < rows; y++) {
                for (let x = 0; x < cols; x++) {
                    const px = x * density + (Math.random() * density - density / 2);
                    const py = y * density + (Math.random() * density - density / 2);
                    const color = colors[Math.floor(Math.random() * colors.length)];
                    particles.push(new Particle(px, py, color));
                }
            }
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];

                // Calculate distance between mouse and particle base position
                const dx = mouse.x - p.baseX;
                const dy = mouse.y - p.baseY;
                const distance = Math.sqrt(dx * dx + dy * dy);

                let forceDirectionX = dx / distance;
                let forceDirectionY = dy / distance;

                const maxDistance = mouse.radius;
                let force = (maxDistance - distance) / maxDistance;
                if (force < 0) force = 0;

                const directionX = forceDirectionX * force * 15;
                const directionY = forceDirectionY * force * 15;

                if (distance < mouse.radius) {
                    p.x -= directionX;
                    p.y -= directionY;
                } else {
                    // Return to base position
                    if (p.x !== p.baseX) {
                        const dxBase = p.x - p.baseX;
                        p.x -= dxBase / 10;
                    }
                    if (p.y !== p.baseY) {
                        const dyBase = p.y - p.baseY;
                        p.y -= dyBase / 10;
                    }
                }

                // Draw angled line for particle instead of circle to mimic Antigravity style
                p.angle = Math.atan2(p.y - p.baseY, p.x - p.baseX);
                const lineLength = force > 0 ? p.size * 3 + (force * 10) : p.size * 3;

                // Rotate the particle drawing slightly based on force
                ctx.save();
                ctx.translate(p.x, p.y);
                if (distance < mouse.radius) {
                    ctx.rotate(p.angle);
                } else {
                    // Default rotation for flow pattern
                    ctx.rotate(Math.sin((p.baseX * 0.01) + (p.baseY * 0.01)) * Math.PI);
                }

                ctx.beginPath();
                ctx.moveTo(-lineLength / 2, 0);
                ctx.lineTo(lineLength / 2, 0);
                ctx.strokeStyle = p.color;

                // Fade out particles that are far from the center or have less force
                // But keep them somewhat visible for a starry/field effect
                const baseOpacity = 0.2;
                const activeOpacity = 0.8 * force;
                ctx.globalAlpha = baseOpacity + activeOpacity;

                ctx.lineWidth = p.size;
                ctx.lineCap = "round";
                ctx.stroke();
                ctx.restore();
            }

            animationFrameId = requestAnimationFrame(animate);
        };

        init();
        animate();

        const handleMouseMove = (e: MouseEvent) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        };

        const handleMouseLeave = () => {
            mouse.x = -1000;
            mouse.y = -1000;
        };

        const handleResize = () => {
            init();
        };

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseleave", handleMouseLeave);
        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseleave", handleMouseLeave);
            window.removeEventListener("resize", handleResize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 z-0 pointer-events-none opacity-60"
        />
    );
}

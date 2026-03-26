"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useInView } from "framer-motion";

export interface TerminalLine {
    text: string;
    type: "comment" | "code" | "success" | "info" | "blocked" | "spacer" | "prompt";
    delay?: number; // ms from animation start, defaults to auto-calculated
}

const TYPE_COLORS: Record<string, string> = {
    comment:  "text-[#4a4a6a]",
    code:     "text-[#9a9ab0]",
    success:  "text-emerald-400",
    info:     "text-sky-400",
    blocked:  "text-rose-400",
    spacer:   "",
    prompt:   "text-[#00ffc8]",
};

interface Props {
    lines: TerminalLine[];
    title?: string;
    className?: string;
    autoPlay?: boolean; // default true — plays on scroll into view
}

export function AnimatedTerminal({ lines, title = "statis", className = "", autoPlay = true }: Props) {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: false, margin: "-80px" });
    const [visibleCount, setVisibleCount] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

    const clearAll = () => {
        timeoutsRef.current.forEach(clearTimeout);
        timeoutsRef.current = [];
    };

    const play = useCallback(() => {
        clearAll();
        setVisibleCount(0);
        setIsPlaying(true);

        // Auto-calculate cumulative delay: 80ms per line base, faster for comments
        let cumulative = 0;
        lines.forEach((line, i) => {
            const lineDelay = line.delay !== undefined
                ? line.delay
                : cumulative;

            const id = setTimeout(() => {
                setVisibleCount(i + 1);
            }, lineDelay);
            timeoutsRef.current.push(id);

            // Advance cumulative — comments and spacers are faster
            if (line.delay === undefined) {
                cumulative += line.type === "spacer" ? 120 : line.type === "comment" ? 80 : 160;
            } else {
                cumulative = line.delay + 160;
            }
        });

        const doneId = setTimeout(() => setIsPlaying(false), cumulative + 200);
        timeoutsRef.current.push(doneId);
    }, [lines]);

    // Auto-play when scrolled into view
    useEffect(() => {
        if (isInView && autoPlay && visibleCount === 0) {
            play();
        }
        if (!isInView && !autoPlay) {
            clearAll();
            setVisibleCount(0);
            setIsPlaying(false);
        }
    }, [isInView]);

    useEffect(() => () => clearAll(), []);

    return (
        <div
            ref={ref}
            className={`rounded-2xl border border-white/10 bg-[#06070e] overflow-hidden terminal-glow group ${className}`}
            onMouseEnter={play}
        >
            {/* Titlebar */}
            <div className="flex items-center gap-2 px-5 py-3.5 border-b border-white/6 bg-white/[0.02]">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500/70" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
                <span className="ml-3 text-[11px] font-mono text-[#3a3a5a] tracking-wider">{title}</span>
                <div className="ml-auto flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <span className="text-[10px] font-mono text-[#3a3a5a] cursor-default" onClick={(e) => { e.stopPropagation(); play(); }}>
                        ↺ replay
                    </span>
                </div>
            </div>

            {/* Body */}
            <div className="p-5 font-mono text-[12px] leading-[1.9] min-h-[160px] overflow-x-auto">
                {lines.map((line, i) => {
                    const visible = i < visibleCount;
                    if (!visible) return null;
                    if (line.type === "spacer") return <div key={i} className="h-2" />;
                    return (
                        <div
                            key={i}
                            className={`${TYPE_COLORS[line.type]} animate-fade-in-up`}
                            style={{ animationDuration: "150ms" }}
                        >
                            {line.type === "prompt" ? (
                                <><span className="text-[#00ffc8]">$ </span>{line.text}</>
                            ) : line.text}
                        </div>
                    );
                })}
                {/* Blinking cursor while playing */}
                {(isPlaying || visibleCount === 0) && (
                    <span className="inline-block w-2 h-3.5 bg-[#00ffc8]/60 align-middle animate-pulse" />
                )}
            </div>
        </div>
    );
}

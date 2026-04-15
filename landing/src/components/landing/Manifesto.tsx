"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const PHRASES = ["Agents need", "infrastructure,", "not guardrails."];

export function Manifesto() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Parallax / reveal mappings
  const bgOpacity = useTransform(scrollYProgress, [0, 0.4, 0.7, 1], [0, 1, 1, 0]);
  const bgScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.6, 1, 1.3]);
  const lineWidth = useTransform(scrollYProgress, [0.2, 0.6], ["0%", "40%"]);
  const lineOpacity = useTransform(scrollYProgress, [0.2, 0.5, 0.9], [0, 1, 0]);

  return (
    <section
      ref={ref}
      className="relative py-40 md:py-56 overflow-hidden"
    >
      {/* Large gradient glow behind text, tied to scroll */}
      <motion.div
        aria-hidden
        className="absolute inset-0 pointer-events-none flex items-center justify-center"
        style={{ opacity: bgOpacity }}
      >
        <motion.div
          className="rounded-full"
          style={{
            width: "80vw",
            height: "80vw",
            maxWidth: 900,
            maxHeight: 900,
            background:
              "radial-gradient(circle, rgba(0,212,255,0.18) 0%, rgba(94,106,210,0.08) 30%, transparent 60%)",
            filter: "blur(40px)",
            scale: bgScale,
          }}
        />
      </motion.div>

      {/* Soft horizon line that draws as you scroll */}
      <div className="relative mx-auto max-w-[1200px] px-6">
        <motion.div
          className="absolute left-1/2 -translate-x-1/2 h-px"
          style={{
            top: "50%",
            width: lineWidth,
            opacity: lineOpacity,
            background: "linear-gradient(to right, transparent, #00D4FF, transparent)",
            boxShadow: "0 0 20px rgba(0,212,255,0.4)",
          }}
        />

        <div className="relative text-center">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-[11px] uppercase tracking-[0.3em] mb-10"
            style={{ color: "var(--text-muted)" }}
          >
            Manifesto
          </motion.p>

          <h2
            className="font-bold tracking-[-0.04em] max-w-4xl mx-auto"
            style={{ fontSize: "clamp(2.2rem, 6vw, 4.5rem)", lineHeight: 1.05 }}
          >
            {PHRASES.map((phrase, i) => (
              <motion.span
                key={phrase}
                initial={{ opacity: 0, y: 40, filter: "blur(8px)" }}
                whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{
                  duration: 0.8,
                  delay: i * 0.15,
                  ease: [0.25, 0.1, 0.25, 1],
                }}
                className="block"
                style={
                  i === 2
                    ? {
                        backgroundImage:
                          "linear-gradient(90deg, #00D4FF 0%, #8E99F0 50%, #EDEDED 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                      }
                    : {}
                }
              >
                {phrase}
              </motion.span>
            ))}
          </h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="text-[15px] md:text-[17px] mt-10 max-w-xl mx-auto leading-relaxed"
            style={{ color: "var(--text-2)" }}
          >
            Stop wrapping models in filters. Start building the execution substrate
            the next decade of software will run on.
          </motion.p>
        </div>
      </div>
    </section>
  );
}

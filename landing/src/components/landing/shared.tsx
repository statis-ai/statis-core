"use client";

import { type ReactNode, useRef, useState, useEffect } from "react";

/* ── useInView hook (vanilla IntersectionObserver) ── */

function useInView(threshold = 0.1): [React.RefObject<HTMLDivElement | null>, boolean] {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, visible];
}

/* ── Reveal animation wrapper (CSS-based, no framer-motion) ── */

export function SectionReveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const [ref, visible] = useInView(0.05);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(30px)",
        transition: `opacity 0.6s cubic-bezier(0.25, 0.1, 0.25, 1) ${delay}s, transform 0.6s cubic-bezier(0.25, 0.1, 0.25, 1) ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

/* ── Stagger container ── */

export function StaggerContainer({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const [ref, visible] = useInView(0.05);

  return (
    <div ref={ref} className={className} data-visible={visible || undefined}>
      {children}
    </div>
  );
}

export function StaggerItem({
  children,
  className,
  index = 0,
}: {
  children: ReactNode;
  className?: string;
  index?: number;
}) {
  const [ref, visible] = useInView(0.05);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)",
        transition: `opacity 0.5s cubic-bezier(0.25, 0.1, 0.25, 1) ${index * 0.08}s, transform 0.5s cubic-bezier(0.25, 0.1, 0.25, 1) ${index * 0.08}s`,
      }}
    >
      {children}
    </div>
  );
}

/* ── Section wrapper with max-width ── */

export function Section({
  children,
  className = "",
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={`py-24 md:py-32 ${className}`}>
      <div className="mx-auto max-w-[1200px] px-6">{children}</div>
    </section>
  );
}

/* ── Eyebrow label ── */

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span
      className="text-[11px] uppercase tracking-[0.2em] font-medium"
      style={{ color: "var(--text-muted)" }}
    >
      {children}
    </span>
  );
}

"use client";

import { useEffect, useState, useCallback } from "react";
import { Nav } from "./Nav";
import { Hero } from "./Hero";
import { Problem } from "./Problem";
import { Console } from "./Console";
import { Code } from "./Code";
import { Method } from "./Method";
import { Manifesto } from "./Manifesto";
import { FAQ } from "./FAQ";
import { Enterprise } from "./Enterprise";
import { CTA } from "./CTA";
import { LandingFooter } from "./Footer";

function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  const handleScroll = useCallback(() => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight > 0) {
      setProgress((scrollTop / docHeight) * 100);
    }
  }, []);

  useEffect(() => {
    let raf: number;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(handleScroll);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [handleScroll]);

  return <div className="scroll-progress" style={{ width: `${progress}%` }} />;
}

export default function LandingPage() {
  return (
    <>
      <ScrollProgress />
      <Nav />
      <main className="relative z-10">
        <Hero />
        <Problem />
        <Console />
        <Code />
        <Method />
        <Manifesto />
        <FAQ />
        <Enterprise />
        <CTA />
      </main>
      <LandingFooter />
    </>
  );
}

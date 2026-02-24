"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export function HeroCopy() {
  return (
    <div className="max-w-xl">
      <motion.h1
        className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        STATIS is the base layer for{" "}
        <span className="text-gradient">reliable AI state.</span>
      </motion.h1>

      <motion.p
        className="mt-6 max-w-lg text-lg text-brand-muted md:text-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
      >
        Append-only semantic events → deterministic materialized state → push
        updates + replay for audit.
      </motion.p>

      <motion.div
        className="mt-10 flex items-center gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
        <Button variant="primary" size="lg">
          View Demo
        </Button>
        <Button variant="ghost" size="lg">
          Read the Spec
        </Button>
      </motion.div>
    </div>
  );
}

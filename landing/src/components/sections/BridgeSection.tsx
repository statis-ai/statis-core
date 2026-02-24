"use client";

import { motion } from "framer-motion";

export function BridgeSection() {
  return (
    <section className="py-16 lg:py-20">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            One model. Many workflows.
          </h2>
          <p className="mt-4 text-brand-muted">
            The same four primitives power every vertical — from multi-agent
            coordination to audit trails.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

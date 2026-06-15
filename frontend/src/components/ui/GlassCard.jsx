"use client";

import { motion } from "framer-motion";
import { clsx } from "clsx";

export function GlassCard({ children, className, animate = false, ...props }) {
  const base = clsx("glass p-6", className);

  if (animate) {
    return (
      <motion.div
        className={base}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={base} {...props}>
      {children}
    </div>
  );
}

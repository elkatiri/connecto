"use client";

import { motion } from "framer-motion";
import { pageTransition } from "@/animations/variants";

export function PageWrapper({ children, className = "" }) {
  return (
    <motion.main
      initial={pageTransition.initial}
      animate={pageTransition.animate}
      exit={pageTransition.exit}
      className={`min-h-screen bg-bg ${className}`}
    >
      {children}
    </motion.main>
  );
}

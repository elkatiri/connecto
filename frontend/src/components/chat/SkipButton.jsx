"use client";

import { motion } from "framer-motion";
import { SkipForward } from "lucide-react";

export function SkipButton({ onSkip, disabled }) {
  return (
    <motion.button
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.93 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      onClick={onSkip}
      disabled={disabled}
      className="
        flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold text-sm
        bg-linear-to-r from-[#7C3AED] to-[#06B6D4]
        text-white cursor-pointer select-none
        shadow-[0_0_24px_rgba(124,58,237,0.35)]
        hover:shadow-[0_0_36px_rgba(124,58,237,0.55)]
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-shadow duration-200
      "
    >
      <SkipForward size={16} />
      Next Person
    </motion.button>
  );
}

"use client";

import { clsx } from "clsx";

const variants = {
  default:
    "bg-white/5 border border-white/10 text-text",
  primary:
    "bg-[#8b5cf6]/20 border border-[#8b5cf6]/30 text-[#a78bfa]",
  secondary:
    "bg-[#06B6D4]/20 border border-[#06B6D4]/30 text-[#67e8f9]",
  success:
    "bg-emerald-500/20 border border-emerald-500/30 text-emerald-400",
  warning:
    "bg-amber-500/20 border border-amber-500/30 text-amber-400",
};

export function Badge({ children, variant = "default", className, dot }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium",
        variants[variant],
        className
      )}
    >
      {dot && (
        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
      )}
      {children}
    </span>
  );
}

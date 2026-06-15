"use client";

import { clsx } from "clsx";

const states = {
  online: "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]",
  searching: "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)] animate-pulse",
  offline: "bg-[#6b7280]",
  connected: "bg-[#06B6D4] shadow-[0_0_8px_rgba(6,182,212,0.6)]",
};

export function StatusIndicator({ status = "offline", label, size = "md" }) {
  const dotSize = size === "sm" ? "w-1.5 h-1.5" : "w-2 h-2";

  return (
    <span className="inline-flex items-center gap-2">
      <span className={clsx("rounded-full flex-shrink-0", states[status], dotSize)} />
      {label && (
        <span className="text-sm text-muted">{label}</span>
      )}
    </span>
  );
}

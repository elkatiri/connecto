"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Flag } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { scaleIn } from "@/animations/variants";

const REASONS = [
  { value: "inappropriate", label: "Inappropriate Content" },
  { value: "spam", label: "Spam" },
  { value: "harassment", label: "Harassment" },
  { value: "nudity", label: "Nudity" },
];

export function ReportModal({ open, onClose, onSubmit }) {
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!selected) return;
    setLoading(true);
    await onSubmit(selected);
    setLoading(false);
    setSelected(null);
    onClose();
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            variants={scaleIn}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="glass p-6 w-full max-w-md pointer-events-auto">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <Flag size={18} className="text-red-400" />
                  <h3 className="text-lg font-semibold text-text">Report User</h3>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg hover:bg-white/6 text-muted hover:text-text transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <p className="text-sm text-muted mb-4">
                Select a reason for reporting this user:
              </p>

              <div className="flex flex-col gap-2 mb-6">
                {REASONS.map((r) => (
                  <button
                    key={r.value}
                    onClick={() => setSelected(r.value)}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-left transition-all
                      ${selected === r.value
                        ? "bg-red-500/20 border border-red-500/40 text-red-400"
                        : "bg-white/3 border border-white/6 text-text hover:bg-white/6"}
                    `}
                  >
                    <span className={`w-4 h-4 rounded-full border-2 flex-shrink-0 transition-all ${
                      selected === r.value ? "border-red-400 bg-red-400" : "border-white/30"
                    }`} />
                    {r.label}
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <Button variant="secondary" className="flex-1" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  className="flex-1"
                  disabled={!selected}
                  loading={loading}
                  onClick={handleSubmit}
                >
                  Report
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

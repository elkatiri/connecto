"use client";

import { createContext, useContext, useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

const ToastContext = createContext(null);

const ICONS = {
  success: { Icon: CheckCircle2, color: "text-emerald-400" },
  error:   { Icon: AlertCircle,  color: "text-red-400" },
  info:    { Icon: Info,         color: "text-[#67e8f9]" },
};

let counter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const toast = useCallback((message, { type = "info", duration = 3200 } = {}) => {
    const id = ++counter;
    setToasts((t) => [...t, { id, message, type }]);
    if (duration) setTimeout(() => dismiss(id), duration);
    return id;
  }, [dismiss]);

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map(({ id, message, type }) => {
            const { Icon, color } = ICONS[type] || ICONS.info;
            return (
              <motion.div
                key={id}
                layout
                initial={{ opacity: 0, y: 20, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.96 }}
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
                className="pointer-events-auto glass-sm rounded-xl pl-4 pr-3 py-3 flex items-center gap-2.5 max-w-sm"
                style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.45)" }}
              >
                <Icon size={16} className={color} />
                <span className="text-sm text-text flex-1">{message}</span>
                <button
                  onClick={() => dismiss(id)}
                  aria-label="Dismiss notification"
                  className="text-muted hover:text-text transition-colors"
                >
                  <X size={14} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  // No-op fallback so components work even if the provider isn't mounted.
  if (!ctx) return { toast: () => {}, dismiss: () => {} };
  return ctx;
}

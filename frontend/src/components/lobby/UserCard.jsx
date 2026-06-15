"use client";

import { motion } from "framer-motion";
import { Video, MessageSquare, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { avatarGradient, initials } from "@/lib/avatar";

export function UserCard({ user, onConnect, connecting }) {
  const [from, to] = avatarGradient(user.name);
  const busy = user.status === "busy";
  const ModeIcon = user.mode === "text" ? MessageSquare : Video;

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 18 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
      }}
      layout
    >
      <div className="glass p-5 h-full flex flex-col items-center text-center hover:border-white/10 transition-colors duration-300">
        {/* Avatar */}
        <div className="relative mb-4">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-white text-xl"
            style={{ background: `linear-gradient(135deg, ${from}, ${to})`, boxShadow: `0 0 28px ${from}55` }}
          >
            {initials(user.name)}
          </div>
          <span
            className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-card ${busy ? "bg-amber-400" : "bg-emerald-400"}`}
            style={{ boxShadow: busy ? "0 0 8px rgba(251,191,36,0.8)" : "0 0 8px rgba(52,211,153,0.8)" }}
          />
        </div>

        {/* Name + status */}
        <h3 className="font-semibold text-text truncate max-w-full">{user.name}</h3>
        <span className="flex items-center gap-1.5 mt-1 text-xs text-muted">
          <ModeIcon size={11} />
          {busy ? "In a call" : "Available"}
        </span>

        {/* Interests */}
        {user.interests?.length > 0 && (
          <div className="flex flex-wrap justify-center gap-1.5 mt-3">
            {user.interests.slice(0, 3).map((tag) => (
              <span key={tag} className="px-2 py-0.5 rounded-full text-[10px] font-medium glass-sm text-muted border border-white/8">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Connect */}
        <Button
          variant={busy ? "secondary" : "primary"}
          size="sm"
          className="w-full mt-5"
          disabled={busy || connecting}
          onClick={() => onConnect(user.id)}
        >
          {connecting ? (
            <><Loader2 size={14} className="animate-spin" /> Connecting…</>
          ) : busy ? (
            "Unavailable"
          ) : (
            <><Video size={14} /> Connect</>
          )}
        </Button>
      </div>
    </motion.div>
  );
}

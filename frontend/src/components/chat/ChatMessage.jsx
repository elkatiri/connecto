"use client";

import { motion } from "framer-motion";
import { slideInUp } from "@/animations/variants";

export function ChatMessage({ text, isOwn, timestamp }) {
  const time = timestamp
    ? new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "";

  return (
    <motion.div
      variants={slideInUp}
      initial="hidden"
      animate="visible"
      className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-3`}
    >
      <div className={`max-w-[75%] flex flex-col gap-1 ${isOwn ? "items-end" : "items-start"}`}>
        <div
          className={`px-4 py-2.5 text-sm leading-relaxed text-text ${
            isOwn ? "bubble-mine" : "bubble-theirs"
          }`}
        >
          {text}
        </div>
        {time && (
          <span className="text-[10px] text-muted px-1">{time}</span>
        )}
      </div>
    </motion.div>
  );
}

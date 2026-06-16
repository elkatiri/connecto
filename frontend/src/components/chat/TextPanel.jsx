"use client";

import { useState, useRef, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { Send, Smile } from "lucide-react";
import { ChatMessage } from "./ChatMessage";

const EMOJIS = ["😄", "😂", "🔥", "❤️", "👋", "🤔", "😎", "🙏", "💯", "👀"];

export function TextPanel({ messages, onSend, blocked }) {
  const [text, setText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSend() {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText("");
    inputRef.current?.focus();
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="flex flex-col h-full glass rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/6 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]" />
        <span className="text-sm text-muted">Live Chat</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <AnimatePresence initial={false}>
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <p className="text-muted text-sm text-center">
                Say hello! 👋
              </p>
            </div>
          ) : (
            messages.map((msg) => (
              <ChatMessage
                key={msg.id}
                text={msg.text}
                isOwn={msg.isOwn}
                timestamp={msg.timestamp}
              />
            ))
          )}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Blocked notice */}
      {blocked && (
        <div className="px-4 py-2 bg-red-500/10 border-t border-red-500/20">
          <p className="text-xs text-red-400 text-center">Message blocked — content not allowed</p>
        </div>
      )}

      {/* Input */}
      <div className="px-3 py-3 border-t border-white/6">
        {showEmoji && (
          <div className="mb-2 flex flex-wrap gap-1.5 p-2 glass-sm rounded-xl">
            {EMOJIS.map((e) => (
              <button
                key={e}
                onClick={() => { setText((p) => p + e); setShowEmoji(false); }}
                className="text-lg hover:scale-125 transition-transform"
              >
                {e}
              </button>
            ))}
          </div>
        )}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowEmoji((p) => !p)}
            className="p-2 rounded-xl text-muted hover:text-text hover:bg-white/6 transition-colors flex-shrink-0"
          >
            <Smile size={18} />
          </button>
          <input
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message…"
            maxLength={500}
            className="
              flex-1 bg-white/4 border border-white/8 rounded-xl
              px-4 py-2.5 text-sm text-text placeholder:text-muted
              focus:outline-none focus:border-[#8b5cf6]/50 transition-colors
            "
          />
          <button
            onClick={handleSend}
            disabled={!text.trim()}
            className="
              w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0
              bg-linear-to-br from-[#8b5cf6] to-[#06B6D4]
              text-white disabled:opacity-40 disabled:cursor-not-allowed
              hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-shadow
            "
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

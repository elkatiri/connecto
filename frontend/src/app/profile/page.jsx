"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Video, MessageSquare, Check, LogOut, Users } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { avatarGradient, initials } from "@/lib/avatar";
import { getSession, logout } from "@/lib/session";
import { store } from "@/lib/storage";

const INTERESTS = [
  "Music", "Gaming", "Art", "Travel", "Tech", "Movies", "Sports",
  "Cooking", "Books", "Photography",
];

export default function ProfilePage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [name, setName] = useState("");
  const [mode, setMode] = useState("video");
  const [interests, setInterests] = useState([]);
  const [isAnon, setIsAnon] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const s = getSession();
    if (!s) { router.push("/entry"); return; }
    setName(s.name);
    setMode(s.mode);
    setInterests(s.interests);
    setIsAnon(s.isAnonymous);
    setReady(true);
  }, [router]);

  function toggleInterest(tag) {
    setInterests((prev) =>
      prev.includes(tag) ? prev.filter((i) => i !== tag) : prev.length < 5 ? [...prev, tag] : prev
    );
  }

  function save() {
    store.set("chat_name", name.trim() || "Guest");
    store.set("chat_mode", mode);
    store.set("chat_interests", JSON.stringify(interests));
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  }

  if (!ready) return <AppShell><div className="min-h-screen" /></AppShell>;

  const [from, to] = avatarGradient(name || "Guest");

  return (
    <AppShell>
      <main className="px-4 sm:px-6 lg:px-10 pt-10 lg:pt-12 pb-16 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-text tracking-tight mb-1">Profile</h1>
        <p className="text-muted text-sm mb-8">Manage how you appear to others and your chat preferences.</p>

        {/* Identity header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <GlassCard className="p-6 gradient-border relative flex items-center gap-5 mb-5">
            <div
              className="w-20 h-20 rounded-3xl flex items-center justify-center font-bold text-white text-3xl shrink-0"
              style={{ background: `linear-gradient(135deg, ${from}, ${to})`, boxShadow: `0 0 32px ${from}66` }}
            >
              {initials(name || "Guest")}
            </div>
            <div className="min-w-0">
              <h2 className="text-xl font-bold text-text truncate">{name || "Guest"}</h2>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={isAnon ? "secondary" : "success"}>{isAnon ? "Guest account" : "Registered"}</Badge>
                <Badge variant="default">{mode === "video" ? "Video" : "Text"}</Badge>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Editable fields */}
        <GlassCard className="p-6 mb-5">
          {/* Display name */}
          <p className="text-xs font-semibold uppercase tracking-wide text-muted mb-3">Display name</p>
          <input
            type="text"
            value={name}
            maxLength={24}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-white/4 border border-white/8 rounded-xl px-3.5 py-2.5 text-sm text-text placeholder:text-muted focus:outline-none focus:border-primary/50"
          />

          {/* Mode */}
          <div className="border-t border-white/6 mt-6 pt-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted mb-3">Preferred chat type</p>
            <div className="glass-sm rounded-xl p-1.5 flex gap-1.5 max-w-xs">
              {[
                { value: "video", icon: Video, label: "Video" },
                { value: "text", icon: MessageSquare, label: "Text" },
              ].map(({ value, icon: Icon, label }) => (
                <button
                  key={value}
                  onClick={() => setMode(value)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                    mode === value
                      ? "bg-linear-to-r from-primary to-secondary text-white shadow-[0_0_18px_rgba(139,92,246,0.3)]"
                      : "text-muted hover:text-text"
                  }`}
                >
                  <Icon size={15} /> {label}
                </button>
              ))}
            </div>
          </div>

          {/* Interests */}
          <div className="border-t border-white/6 mt-6 pt-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted mb-3">
              Interests <span className="text-text/70 normal-case tracking-normal">· up to 5 ({interests.length}/5)</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map((tag) => (
                <motion.button
                  key={tag}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleInterest(tag)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                    interests.includes(tag)
                      ? "bg-linear-to-r from-primary to-secondary text-white shadow-[0_0_12px_rgba(139,92,246,0.3)]"
                      : "glass-sm text-muted hover:text-text border border-white/8"
                  }`}
                >
                  {tag}
                </motion.button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 mt-7">
            <Button variant="primary" className="gap-2" onClick={save}>
              {saved ? <><Check size={16} /> Saved</> : "Save changes"}
            </Button>
            <Button variant="secondary" className="gap-2" onClick={() => router.push("/lobby")}>
              <Users size={15} /> Browse People
            </Button>
          </div>
        </GlassCard>

        {/* Danger / logout */}
        <GlassCard className="p-6 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-text">Log out</h3>
            <p className="text-sm text-muted mt-0.5">End this session and return to the home page.</p>
          </div>
          <Button variant="danger" className="gap-2" onClick={() => logout(router)}>
            <LogOut size={15} /> Log out
          </Button>
        </GlassCard>
      </main>
    </AppShell>
  );
}

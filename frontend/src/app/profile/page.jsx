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
      <main className="px-4 sm:px-6 lg:px-10 pt-10 lg:pt-12 pb-16 max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-text tracking-tight mb-1">Profile</h1>
        <p className="text-muted text-sm mb-8">Manage how you appear to others and your chat preferences.</p>

        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-5 items-start">
          {/* ── Left: identity + meta + logout ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:sticky lg:top-12 space-y-5"
          >
            <GlassCard className="p-6 gradient-border relative flex flex-col items-center text-center">
              <div
                className="w-24 h-24 rounded-3xl flex items-center justify-center font-bold text-white text-4xl mb-4"
                style={{ background: `linear-gradient(135deg, ${from}, ${to})`, boxShadow: `0 0 36px ${from}66` }}
              >
                {initials(name || "Guest")}
              </div>
              <h2 className="text-xl font-bold text-text truncate max-w-full">{name || "Guest"}</h2>
              <div className="flex items-center gap-2 mt-3">
                <Badge variant={isAnon ? "secondary" : "success"}>{isAnon ? "Guest account" : "Registered"}</Badge>
              </div>
            </GlassCard>

            {/* Meta */}
            <GlassCard className="p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted mb-3">About you</p>
              <dl className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-muted">Account</dt>
                  <dd className="text-text font-medium">{isAnon ? "Guest" : "Registered"}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-muted">Preferred chat</dt>
                  <dd className="flex items-center gap-1.5 text-text font-medium">
                    {mode === "video" ? <Video size={14} /> : <MessageSquare size={14} />}
                    {mode === "video" ? "Video" : "Text"}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-muted">Interests</dt>
                  <dd className="text-text font-medium">{interests.length} selected</dd>
                </div>
              </dl>
            </GlassCard>

            {/* Logout */}
            <GlassCard className="p-5 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-text text-sm">Log out</h3>
                <p className="text-xs text-muted mt-0.5">End this session</p>
              </div>
              <Button variant="danger" size="sm" className="gap-2" onClick={() => logout(router)}>
                <LogOut size={14} /> Log out
              </Button>
            </GlassCard>
          </motion.div>

          {/* ── Right: editable settings ── */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}>
            <GlassCard className="p-6 sm:p-7">
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
          </motion.div>
        </div>
      </main>
    </AppShell>
  );
}

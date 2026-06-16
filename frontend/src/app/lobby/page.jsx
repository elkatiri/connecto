"use client";

export const dynamic = "force-dynamic";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Search, Shuffle, Video, MessageSquare, Radio, Sparkles,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { UserCard } from "@/components/lobby/UserCard";
import { UserCardSkeleton } from "@/components/lobby/UserCardSkeleton";
import { usePresence } from "@/hooks/usePresence";
import { useToast } from "@/components/ui/Toast";
import { store } from "@/lib/storage";

const MODE_FILTERS = [
  { value: "all",   label: "Everyone", icon: Users },
  { value: "video", label: "Video",    icon: Video },
  { value: "text",  label: "Text",     icon: MessageSquare },
];

export default function LobbyPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [profile, setProfile] = useState(null);
  const [query, setQuery] = useState("");
  const [modeFilter, setModeFilter] = useState("all");
  const [interestFilter, setInterestFilter] = useState(null);
  const [connectingId, setConnectingId] = useState(null);

  useEffect(() => {
    const token = store.get("token");
    const name = store.get("chat_name");
    if (!token || !name) {
      router.push("/entry?go=lobby");
      return;
    }
    setProfile({
      name,
      mode: store.get("chat_mode") || "video",
      interests: JSON.parse(store.get("chat_interests") || "[]"),
    });
  }, [router]);

  const { users, loaded, match, unavailable, connectTo } = usePresence(profile || {});

  useEffect(() => {
    if (!match) return;
    store.set("match_data", JSON.stringify(match));
    if (match.peerName) store.set("peer_name", match.peerName);
    router.push("/chat");
  }, [match, router]);

  useEffect(() => {
    if (unavailable && unavailable === connectingId) {
      setConnectingId(null);
      toast("That person just started another call. Try someone else.", { type: "error" });
    }
  }, [unavailable, connectingId, toast]);

  function handleConnect(peerId) {
    setConnectingId(peerId);
    connectTo(peerId);
  }

  const allInterests = useMemo(() => {
    const set = new Set();
    users.forEach((u) => u.interests?.forEach((i) => set.add(i)));
    return [...set].sort();
  }, [users]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((u) => {
      if (modeFilter !== "all" && u.mode !== modeFilter) return false;
      if (interestFilter && !u.interests?.includes(interestFilter)) return false;
      if (q && !u.name.toLowerCase().includes(q) && !u.interests?.some((i) => i.toLowerCase().includes(q)))
        return false;
      return true;
    });
  }, [users, query, modeFilter, interestFilter]);

  const availableCount = users.filter((u) => u.status !== "busy").length;

  return (
    <AppShell>
      <main className="px-4 sm:px-6 lg:px-10 pt-8 lg:pt-10 pb-16">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-text tracking-tight">People online now</h1>
            <div className="flex items-center gap-4 mt-2 text-sm">
              <span className="flex items-center gap-1.5 text-emerald-400"><Radio size={13} /> {users.length} online</span>
              <span className="flex items-center gap-1.5 text-muted"><Sparkles size={13} /> {availableCount} available</span>
            </div>
          </div>
          <div className="relative w-full md:w-80 shrink-0">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or interest…"
              className="w-full glass-sm rounded-xl pl-10 pr-4 py-2.5 text-sm text-text placeholder:text-muted focus:outline-none focus:border-primary/50"
            />
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-3 mb-7">
          <div className="glass-sm rounded-xl p-1 flex gap-1">
            {MODE_FILTERS.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setModeFilter(value)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  modeFilter === value
                    ? "bg-linear-to-r from-primary to-secondary text-white"
                    : "text-muted hover:text-text"
                }`}
              >
                <Icon size={14} /> {label}
              </button>
            ))}
          </div>

          {allInterests.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {interestFilter && <span className="w-px h-5 bg-white/10 mx-1 hidden sm:block" />}
              {allInterests.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setInterestFilter(interestFilter === tag ? null : tag)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    interestFilter === tag
                      ? "bg-linear-to-r from-primary to-secondary text-white"
                      : "glass-sm text-muted hover:text-text border border-white/8"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Loading skeletons */}
        {!loaded ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-4">
            {Array.from({ length: 8 }).map((_, i) => <UserCardSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass rounded-3xl py-24 px-6 text-center">
            <div className="w-14 h-14 rounded-2xl glass-sm flex items-center justify-center mx-auto mb-5">
              <Users size={22} className="text-muted" />
            </div>
            <h3 className="font-semibold text-text mb-1.5">
              {users.length === 0 ? "Nobody else is here yet" : "No one matches your filters"}
            </h3>
            <p className="text-sm text-muted max-w-xs mx-auto mb-6">
              {users.length === 0
                ? "Open the app in another tab or invite a friend — they'll appear here. Or jump into a random match."
                : "Try clearing the search or filters to see everyone online."}
            </p>
            {users.length === 0 ? (
              <Button variant="primary" size="sm" className="gap-2" onClick={() => router.push("/matchmaking")}>
                <Shuffle size={15} /> Try a random match
              </Button>
            ) : (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => { setQuery(""); setModeFilter("all"); setInterestFilter(null); }}
              >
                Clear filters
              </Button>
            )}
          </div>
        ) : (
          <motion.div
            variants={{ visible: { transition: { staggerChildren: 0.04 } } }}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-4"
          >
            <AnimatePresence>
              {filtered.map((u) => (
                <UserCard
                  key={u.id}
                  user={u}
                  connecting={connectingId === u.id}
                  onConnect={handleConnect}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </main>
    </AppShell>
  );
}

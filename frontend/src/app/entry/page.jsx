"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Video, MessageSquare, UserX, LogIn, ChevronDown, ChevronUp, Shuffle, Users, Play } from "lucide-react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { scaleIn, staggerContainer, fadeUp } from "@/animations/variants";
import { api } from "@/services/api";
import { store } from "@/lib/storage";
import { getSession } from "@/lib/session";
import { avatarGradient, initials } from "@/lib/avatar";

const INTERESTS = [
  "Music", "Gaming", "Art", "Travel", "Tech", "Movies", "Sports",
  "Cooking", "Books", "Photography",
];

// Friendly fallback name so a display name is never required.
const ADJ = ["Blue", "Swift", "Calm", "Bright", "Bold", "Lucky", "Cosmic", "Mellow"];
const NOUN = ["Fox", "Wolf", "Otter", "Falcon", "Tiger", "Panda", "Comet", "Maple"];
function randomName() {
  const a = ADJ[Math.floor(Math.random() * ADJ.length)];
  const n = NOUN[Math.floor(Math.random() * NOUN.length)];
  return `${a}${n}${Math.floor(10 + Math.random() * 90)}`;
}

function EntryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = searchParams.get("mode") === "text" ? "text" : "video";
  const initialDest = searchParams.get("go") === "lobby" ? "lobby" : "match";

  const [mode, setMode] = useState(initialMode);
  const [destination, setDestination] = useState(initialDest);
  const [name, setName] = useState("");
  const [interests, setInterests] = useState([]);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [anonLoading, setAnonLoading] = useState(false);
  const [error, setError] = useState("");
  const [existing, setExisting] = useState(null);

  // Already signed in? Pre-fill their saved profile so they stay logged in.
  useEffect(() => {
    const s = getSession();
    if (s) {
      setExisting(s);
      setName(s.name === "Guest" ? "" : s.name);
      setMode(s.mode);
      setInterests(s.interests);
    }
  }, []);

  function toggleInterest(tag) {
    setInterests((prev) =>
      prev.includes(tag) ? prev.filter((i) => i !== tag) : prev.length < 5 ? [...prev, tag] : prev
    );
  }

  const dest = destination === "lobby" ? "/lobby" : "/matchmaking";

  function savePrefs() {
    // A display name is never required — fall back to the saved one, else auto-generate.
    const finalName = name.trim() || existing?.name || randomName();
    store.set("chat_name", finalName);
    store.set("chat_mode", mode);
    store.set("chat_interests", JSON.stringify(interests));
  }

  // Continue with the existing session — no re-authentication needed.
  function handleContinue() {
    savePrefs();
    router.push(dest);
  }

  function switchAccount() {
    store.clear();
    setExisting(null);
    setName("");
    setEmail("");
    setPassword("");
  }

  async function handleAnonymous() {
    setAnonLoading(true);
    setError("");
    try {
      const data = await api.post("/api/auth/anonymous", {});
      store.set("token", data.token);
      store.set("userId", data.sessionId);
      savePrefs();
      router.push(dest);
    } catch (err) {
      setError(err.message);
    } finally {
      setAnonLoading(false);
    }
  }

  async function handleAuth(e) {
    e.preventDefault();
    setAuthLoading(true);
    setError("");
    try {
      const endpoint = authMode === "login" ? "/api/auth/login" : "/api/auth/register";
      const data = await api.post(endpoint, { email, password });
      store.set("token", data.token);
      store.set("userId", data.userId);
      savePrefs();
      router.push(dest);
    } catch (err) {
      setError(err.message);
    } finally {
      setAuthLoading(false);
    }
  }

  const sectionLabel = "text-xs font-semibold uppercase tracking-wide text-muted mb-3";

  return (
    <PageWrapper className="min-h-screen px-4 sm:px-6 lg:px-8 pt-24 pb-12">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="mb-8">
          <motion.div variants={fadeUp} className="mb-3">
            <Badge variant="primary" dot>Set up your session</Badge>
          </motion.div>
          <motion.h1 variants={fadeUp} className="text-3xl sm:text-4xl font-bold text-text tracking-tight">
            How do you want to connect?
          </motion.h1>
          <motion.p variants={fadeUp} className="text-muted mt-2 text-sm">
            Set your preferences, then jump in — as a guest or with an account.
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-5 items-start">
          {/* ── Preferences ── */}
          <motion.div variants={scaleIn} initial="hidden" animate="visible">
            <GlassCard className="p-6 sm:p-7">
              {/* How to connect */}
              <p className={sectionLabel}>How to connect</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: "match", icon: Shuffle, label: "Random Match", sub: "Meet someone instantly" },
                  { value: "lobby", icon: Users, label: "Browse People", sub: "Pick who to connect with" },
                ].map(({ value, icon: Icon, label, sub }) => (
                  <button
                    key={value}
                    onClick={() => setDestination(value)}
                    className={`flex flex-col items-start gap-1 p-4 rounded-2xl border text-left transition-all ${
                      destination === value
                        ? "border-transparent bg-linear-to-br from-primary/25 to-secondary/15 shadow-[0_0_24px_rgba(139,92,246,0.18)]"
                        : "border-white/8 hover:border-white/15 hover:bg-white/4"
                    }`}
                  >
                    <span className={`w-9 h-9 rounded-xl flex items-center justify-center mb-1 ${destination === value ? "bg-linear-to-br from-primary to-secondary text-white" : "glass-sm text-muted"}`}>
                      <Icon size={16} />
                    </span>
                    <span className="text-sm font-semibold text-text">{label}</span>
                    <span className="text-xs text-muted">{sub}</span>
                  </button>
                ))}
              </div>

              {/* Chat type */}
              <div className="border-t border-white/6 mt-6 pt-6">
                <p className={sectionLabel}>Chat type</p>
                <div className="glass-sm rounded-xl p-1.5 flex gap-1.5">
                  {[
                    { value: "video", icon: Video, label: "Video Chat" },
                    { value: "text", icon: MessageSquare, label: "Text Only" },
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

              {/* Display name — hidden when already signed in (name is known) */}
              {!existing && (
                <div className="border-t border-white/6 mt-6 pt-6">
                  <p className={sectionLabel}>
                    Display name <span className="text-text/60 normal-case tracking-normal">· optional</span>
                  </p>
                  <input
                    type="text"
                    value={name}
                    maxLength={24}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Leave blank for a random name"
                    className="w-full bg-white/4 border border-white/8 rounded-xl px-3.5 py-2.5 text-sm text-text placeholder:text-muted focus:outline-none focus:border-primary/50"
                  />
                </div>
              )}

              {/* Interests */}
              <div className="border-t border-white/6 mt-6 pt-6">
                <p className={sectionLabel}>
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
            </GlassCard>
          </motion.div>

          {/* ── Jump in ── */}
          <motion.div variants={scaleIn} initial="hidden" animate="visible" transition={{ delay: 0.08 }} className="lg:sticky lg:top-24">
            <GlassCard className="p-6 gradient-border relative">
              {existing ? (
                /* ── Already signed in ── */
                <>
                  {(() => {
                    const [ef, et] = avatarGradient(existing.name);
                    return (
                      <div className="flex items-center gap-3 mb-5">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white"
                             style={{ background: `linear-gradient(135deg, ${ef}, ${et})`, boxShadow: `0 0 24px ${ef}55` }}>
                          {initials(existing.name)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-muted">Welcome back</p>
                          <h3 className="font-bold text-text truncate">{existing.name}</h3>
                        </div>
                      </div>
                    );
                  })()}
                  <p className="text-sm text-muted mb-5 leading-relaxed">
                    You&apos;re signed in and ready to go.
                  </p>
                  <Button variant="primary" size="lg" className="w-full gap-2" onClick={handleContinue}>
                    <Play size={17} /> Start
                  </Button>
                  {error && <p className="text-xs text-red-400 mt-3 text-center">{error}</p>}
                  <button
                    onClick={switchAccount}
                    className="w-full text-center text-xs text-muted hover:text-text transition-colors mt-4"
                  >
                    Use a different account
                  </button>
                </>
              ) : (
                /* ── New / signed out ── */
                <>
                  <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-4"
                       style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.22), rgba(6,182,212,0.12))", border: "1px solid rgba(139,92,246,0.25)" }}>
                    <UserX size={18} className="text-[#c4b5fd]" />
                  </div>
                  <h3 className="font-semibold text-text mb-1">Ready to go?</h3>
                  <p className="text-sm text-muted mb-5 leading-relaxed">
                    Continue instantly as a guest — no account needed, your identity stays private.
                  </p>

                  <Button variant="primary" className="w-full" loading={anonLoading} onClick={handleAnonymous}>
                    Continue as Guest
                  </Button>

                  {error && <p className="text-xs text-red-400 mt-3 text-center">{error}</p>}

                  {/* divider */}
                  <div className="flex items-center gap-3 my-5">
                    <span className="flex-1 h-px bg-white/8" />
                    <span className="text-xs text-muted">or</span>
                    <span className="flex-1 h-px bg-white/8" />
                  </div>

                  <button
                    onClick={() => setShowAuth((p) => !p)}
                    className="w-full flex items-center justify-between text-sm text-muted hover:text-text transition-colors"
                  >
                    <span className="flex items-center gap-2"><LogIn size={15} className="text-[#67e8f9]" /> Sign in or create an account</span>
                    {showAuth ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>

                  <AnimatePresence>
                    {showAuth && (
                      <motion.form
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                        onSubmit={handleAuth}
                      >
                        <div className="pt-4">
                          <div className="flex mb-3 glass-sm rounded-xl overflow-hidden p-1 gap-1">
                            {["login", "register"].map((m) => (
                              <button
                                type="button"
                                key={m}
                                onClick={() => setAuthMode(m)}
                                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${
                                  authMode === m ? "bg-white/8 text-text" : "text-muted hover:text-text"
                                }`}
                              >
                                {m}
                              </button>
                            ))}
                          </div>
                          <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full bg-white/4 border border-white/8 rounded-xl px-3 py-2.5 text-sm text-text placeholder:text-muted focus:outline-none focus:border-primary/50 mb-2"
                          />
                          <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full bg-white/4 border border-white/8 rounded-xl px-3 py-2.5 text-sm text-text placeholder:text-muted focus:outline-none focus:border-primary/50 mb-3"
                          />
                          <Button type="submit" variant="secondary" className="w-full" loading={authLoading}>
                            {authMode === "login" ? "Login" : "Create Account"}
                          </Button>
                        </div>
                      </motion.form>
                    )}
                  </AnimatePresence>
                </>
              )}
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </PageWrapper>
  );
}

export default function EntryPage() {
  return (
    <Suspense>
      <EntryContent />
    </Suspense>
  );
}

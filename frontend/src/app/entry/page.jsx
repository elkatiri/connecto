"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Video, MessageSquare, UserX, LogIn, ChevronDown, ChevronUp } from "lucide-react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { scaleIn, staggerContainer, fadeUp } from "@/animations/variants";
import { api } from "@/services/api";

const INTERESTS = [
  "Music", "Gaming", "Art", "Travel", "Tech", "Movies", "Sports",
  "Cooking", "Books", "Photography",
];

function EntryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = searchParams.get("mode") === "text" ? "text" : "video";

  const [mode, setMode] = useState(initialMode);
  const [interests, setInterests] = useState([]);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [anonLoading, setAnonLoading] = useState(false);
  const [error, setError] = useState("");

  function toggleInterest(tag) {
    setInterests((prev) =>
      prev.includes(tag) ? prev.filter((i) => i !== tag) : prev.length < 5 ? [...prev, tag] : prev
    );
  }

  function savePrefs() {
    sessionStorage.setItem("chat_mode", mode);
    sessionStorage.setItem("chat_interests", JSON.stringify(interests));
  }

  async function handleAnonymous() {
    setAnonLoading(true);
    setError("");
    try {
      const data = await api.post("/api/auth/anonymous", {});
      sessionStorage.setItem("token", data.token);
      sessionStorage.setItem("userId", data.sessionId);
      savePrefs();
      router.push("/matchmaking");
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
      sessionStorage.setItem("token", data.token);
      sessionStorage.setItem("userId", data.userId);
      savePrefs();
      router.push("/matchmaking");
    } catch (err) {
      setError(err.message);
    } finally {
      setAuthLoading(false);
    }
  }

  return (
    <PageWrapper className="flex items-center justify-center min-h-screen px-4 py-16">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="text-center mb-10"
        >
          <motion.div variants={fadeUp} className="mb-3">
            <Badge variant="primary" dot>Set Your Preferences</Badge>
          </motion.div>
          <motion.h1 variants={fadeUp} className="text-3xl sm:text-4xl font-bold text-text">
            How do you want to connect?
          </motion.h1>
        </motion.div>

        {/* Mode toggle */}
        <motion.div variants={scaleIn} initial="hidden" animate="visible" className="mb-6">
          <GlassCard className="p-2">
            <div className="flex gap-2">
              {[
                { value: "video", icon: Video, label: "Video Chat" },
                { value: "text", icon: MessageSquare, label: "Text Only" },
              ].map(({ value, icon: Icon, label }) => (
                <button
                  key={value}
                  onClick={() => setMode(value)}
                  className={`
                    flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all
                    ${mode === value
                      ? "bg-linear-to-r from-primary to-secondary text-white shadow-[0_0_20px_rgba(139,92,246,0.32)]"
                      : "text-muted hover:text-text hover:bg-white/4"}
                  `}
                >
                  <Icon size={16} />
                  {label}
                </button>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        {/* Interests */}
        <motion.div
          variants={scaleIn}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <GlassCard>
            <p className="text-sm text-muted mb-3">
              Select up to 5 interests{" "}
              <span className="text-text font-medium">({interests.length}/5)</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map((tag) => (
                <motion.button
                  key={tag}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleInterest(tag)}
                  className={`
                    px-4 py-1.5 rounded-full text-sm font-medium transition-all
                    ${interests.includes(tag)
                      ? "bg-linear-to-r from-[#7C3AED] to-[#06B6D4] text-white shadow-[0_0_12px_rgba(124,58,237,0.3)]"
                      : "glass-sm text-muted hover:text-text border border-white/8"}
                  `}
                >
                  {tag}
                </motion.button>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        {/* Entry cards */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          {/* Anonymous */}
          <motion.div variants={scaleIn}>
            <GlassCard className="hover:border-white/12 transition-colors cursor-pointer h-full">
              <div className="w-10 h-10 rounded-xl bg-[#7C3AED]/20 border border-[#7C3AED]/30 flex items-center justify-center mb-4">
                <UserX size={18} className="text-[#a78bfa]" />
              </div>
              <h3 className="font-semibold text-text mb-1">Stay Anonymous</h3>
              <p className="text-sm text-muted mb-5 leading-relaxed">
                Jump in instantly with no account. Your identity stays private.
              </p>
              {error && <p className="text-xs text-red-400 mb-3">{error}</p>}
              <Button
                variant="primary"
                className="w-full"
                loading={anonLoading}
                onClick={handleAnonymous}
              >
                Continue as Guest
              </Button>
            </GlassCard>
          </motion.div>

          {/* Auth */}
          <motion.div variants={scaleIn}>
            <GlassCard className="hover:border-white/12 transition-colors h-full">
              <div className="w-10 h-10 rounded-xl bg-[#06B6D4]/20 border border-[#06B6D4]/30 flex items-center justify-center mb-4">
                <LogIn size={18} className="text-[#67e8f9]" />
              </div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-text">Login / Register</h3>
                <button
                  onClick={() => setShowAuth((p) => !p)}
                  className="text-muted hover:text-text transition-colors"
                >
                  {showAuth ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              </div>
              <p className="text-sm text-muted mb-4 leading-relaxed">
                Save your preferences and chat history across sessions.
              </p>

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
                    <div className="flex mb-3 glass-sm rounded-xl overflow-hidden p-1 gap-1">
                      {["login", "register"].map((m) => (
                        <button
                          type="button"
                          key={m}
                          onClick={() => setAuthMode(m)}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${
                            authMode === m
                              ? "bg-white/8 text-text"
                              : "text-muted hover:text-text"
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
                      className="w-full bg-white/4 border border-white/8 rounded-xl px-3 py-2.5 text-sm text-text placeholder:text-muted focus:outline-none focus:border-[#7C3AED]/50 mb-2"
                    />
                    <input
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full bg-white/4 border border-white/8 rounded-xl px-3 py-2.5 text-sm text-text placeholder:text-muted focus:outline-none focus:border-[#7C3AED]/50 mb-3"
                    />
                    {error && <p className="text-xs text-red-400 mb-2">{error}</p>}
                    <Button
                      type="submit"
                      variant="secondary"
                      className="w-full"
                      loading={authLoading}
                    >
                      {authMode === "login" ? "Login" : "Create Account"}
                    </Button>
                  </motion.form>
                )}
              </AnimatePresence>

              {!showAuth && (
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => setShowAuth(true)}
                >
                  Sign in
                </Button>
              )}
            </GlassCard>
          </motion.div>
        </motion.div>
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

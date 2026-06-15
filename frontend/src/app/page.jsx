"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Zap, Video, MessageSquare, Shield, Filter, Globe, Users, Clock,
  ArrowRight, Mic, Camera, PhoneOff, SkipForward, Star,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";

gsap.registerPlugin(ScrollTrigger);

const FEATURES = [
  { icon: Zap,            title: "Instant Match",    desc: "Connect in under 3 seconds with our smart global matchmaking engine." },
  { icon: Video,          title: "HD Video Chat",    desc: "Crystal-clear video with adaptive quality for any connection speed." },
  { icon: MessageSquare,  title: "Text Mode",        desc: "Prefer typing? Switch to text-only for a lighter, faster experience." },
  { icon: Shield,         title: "AI Moderation",    desc: "Real-time content filtering and community reporting keep it clean." },
  { icon: Filter,         title: "Interest Filters", desc: "Match by shared interests for more meaningful conversations." },
  { icon: Globe,          title: "Fully Anonymous",  desc: "No account needed. Jump in without sharing any personal data." },
];

const STEPS = [
  { num: "01", title: "Choose Your Mode",  desc: "Pick video or text chat, then add interests to find better matches." },
  { num: "02", title: "Get Matched",       desc: "Our engine finds the perfect match across 150+ countries in seconds." },
  { num: "03", title: "Start Chatting",    desc: "Enjoy real conversation. Skip anytime to meet someone new." },
];

const STATS = [
  { icon: Users, value: "2M+",  label: "Active Users" },
  { icon: Globe, value: "150+", label: "Countries"    },
  { icon: Clock, value: "< 3s", label: "Match Time"   },
  { icon: Star,  value: "4.9",  label: "App Rating"   },
];

export default function LandingPage() {
  const rootRef = useRef(null);
  const orbRef  = useRef(null);

  useGSAP(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(".hero-badge",  { opacity: 0, y: -12 }, { opacity: 1, y: 0, duration: 0.5 },              0)
        .fromTo(".hero-title",  { opacity: 0, y: 40  }, { opacity: 1, y: 0, duration: 0.65 },           0.15)
        .fromTo(".hero-sub",    { opacity: 0, y: 22  }, { opacity: 1, y: 0, duration: 0.5 },            0.42)
        .fromTo(".hero-cta",    { opacity: 0, scale: 0.92 }, { opacity: 1, scale: 1, duration: 0.4, stagger: 0.1 }, 0.62)
        .fromTo(".hero-stats",  { opacity: 0, y: 14  }, { opacity: 1, y: 0, duration: 0.5 },            0.88)
        .fromTo(".hero-mockup", { opacity: 0, x: 40, scale: 0.96 }, { opacity: 1, x: 0, scale: 1, duration: 0.7, ease: "power2.out" }, 0.35);

      gsap.to(orbRef.current, { y: "+=26", duration: 4.5, ease: "sine.inOut", yoyo: true, repeat: -1 });

      gsap.fromTo(".feature-card", { opacity: 0, y: 36 }, {
        opacity: 1, y: 0, duration: 0.55, stagger: 0.08, ease: "power3.out",
        scrollTrigger: { trigger: ".features-section", start: "top 78%" },
      });

      gsap.fromTo(".step-card", { opacity: 0, y: 28 }, {
        opacity: 1, y: 0, duration: 0.55, stagger: 0.14, ease: "power3.out",
        scrollTrigger: { trigger: ".steps-section", start: "top 78%" },
      });

      gsap.to(".cta-glow", {
        boxShadow: "0 0 80px rgba(139,92,246,0.6)",
        duration: 1.8, ease: "sine.inOut", yoyo: true, repeat: -1,
      });
    }, rootRef);

    return () => ctx.revert();
  }, { scope: rootRef });

  return (
    <div ref={rootRef} className="min-h-screen bg-bg">
      <Navbar />

      {/* ── HERO ── */}
      <section className="relative min-h-screen overflow-hidden">
        {/* Background layer */}
        <div className="absolute inset-0 pointer-events-none">
          <div ref={orbRef} className="orb-purple absolute w-[800px] h-[800px] -top-60 -left-60" />
          <div className="orb-cyan absolute w-[500px] h-[500px] bottom-0 right-0" />
          <div className="bg-grid absolute inset-0" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 min-h-screen flex items-center pt-24 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_440px] xl:grid-cols-[1fr_500px] gap-14 xl:gap-20 items-center w-full">

            {/* ── Left: copy ── */}
            <div>
              <div className="hero-badge mb-7 opacity-0">
                <Badge variant="primary" dot>Now live in 150+ countries</Badge>
              </div>

              <h1 className="hero-title opacity-0 text-5xl sm:text-6xl xl:text-7xl font-bold leading-[1.05] tracking-tight mb-6">
                Meet Real<br className="hidden sm:block" /> People,<br />
                <span className="gradient-text">Instantly.</span>
              </h1>

              <p className="hero-sub opacity-0 text-lg text-muted max-w-lg mb-10 leading-relaxed">
                Random video and text chat with strangers worldwide. No sign-up, no wait — just connect.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-14">
                <Link href="/entry" className="hero-cta opacity-0">
                  <Button variant="primary" size="lg" className="w-full sm:w-auto cta-glow gap-2">
                    <Video size={18} />
                    Start Video Chat
                  </Button>
                </Link>
                <Link href="/entry?mode=text" className="hero-cta opacity-0">
                  <Button variant="secondary" size="lg" className="w-full sm:w-auto gap-2">
                    <MessageSquare size={18} />
                    Text Only
                  </Button>
                </Link>
              </div>

              {/* Stats */}
              <div className="hero-stats opacity-0 grid grid-cols-2 sm:grid-cols-4 gap-x-8 gap-y-5">
                {STATS.map(({ icon: Icon, value, label }) => (
                  <div key={label}>
                    <span className="block text-2xl font-bold text-text">{value}</span>
                    <span className="flex items-center gap-1.5 mt-0.5 text-xs text-muted">
                      <Icon size={11} className="text-primary" />
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Right: UI mockup ── */}
            <div className="hidden lg:block hero-mockup opacity-0">
              <div className="relative">
                {/* Ambient glow behind card */}
                <div className="absolute -inset-6 rounded-3xl blur-2xl"
                     style={{ background: "radial-gradient(ellipse, rgba(139,92,246,0.2) 0%, transparent 70%)" }} />

                {/* Main card */}
                <div className="glass rounded-3xl p-3 gradient-border relative">
                  {/* Status bar */}
                  <div className="flex items-center justify-between px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"
                            style={{ boxShadow: "0 0 6px rgba(52,211,153,0.9)" }} />
                      <span className="text-xs font-semibold text-text/85">Connected</span>
                    </div>
                    <span className="text-xs text-muted">Sarah · New York 🇺🇸</span>
                  </div>

                  {/* Video tiles */}
                  <div className="grid grid-cols-2 gap-2">
                    {/* You */}
                    <div className="aspect-[4/3] rounded-2xl video-placeholder relative overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full flex items-center justify-center font-bold text-white text-2xl"
                             style={{ background: "linear-gradient(135deg, #8b5cf6, #6d28d9)", boxShadow: "0 0 32px rgba(139,92,246,0.45)" }}>
                          Y
                        </div>
                      </div>
                      <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md text-[10px] text-white/80 font-medium"
                           style={{ background: "rgba(0,0,0,0.6)" }}>
                        You
                      </div>
                    </div>

                    {/* Sarah */}
                    <div className="aspect-[4/3] rounded-2xl video-placeholder relative overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full flex items-center justify-center font-bold text-white text-2xl"
                             style={{ background: "linear-gradient(135deg, #06b6d4, #0891b2)", boxShadow: "0 0 32px rgba(6,182,212,0.45)" }}>
                          S
                        </div>
                      </div>
                      <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md text-[10px] text-white/80 font-medium"
                           style={{ background: "rgba(0,0,0,0.6)" }}>
                        Sarah
                      </div>
                    </div>
                  </div>

                  {/* Control bar */}
                  <div className="flex items-center justify-center gap-2.5 pt-3 pb-1">
                    <div className="w-10 h-10 rounded-full glass-sm flex items-center justify-center text-text/55">
                      <Mic size={15} />
                    </div>
                    <div className="w-10 h-10 rounded-full glass-sm flex items-center justify-center text-text/55">
                      <Camera size={15} />
                    </div>
                    <div className="w-11 h-11 rounded-full flex items-center justify-center text-white"
                         style={{ background: "rgba(239,68,68,0.75)" }}>
                      <PhoneOff size={17} />
                    </div>
                    <div className="px-4 h-10 rounded-full flex items-center gap-1.5 text-white text-xs font-semibold"
                         style={{ background: "linear-gradient(135deg, #8b5cf6, #06b6d4)" }}>
                      <SkipForward size={13} />
                      Next
                    </div>
                  </div>
                </div>

                {/* Floating: online count */}
                <div className="absolute -bottom-5 -left-8 glass-sm rounded-2xl px-4 py-3 flex items-center gap-3"
                     style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}>
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                       style={{ background: "rgba(52,211,153,0.12)", border: "1px solid rgba(52,211,153,0.22)" }}>
                    <Users size={14} className="text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-text">12,847</p>
                    <p className="text-[10px] text-muted">Online now</p>
                  </div>
                </div>

                {/* Floating: match speed */}
                <div className="absolute -top-5 -right-8 glass-sm rounded-2xl px-4 py-3 flex items-center gap-3"
                     style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}>
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                       style={{ background: "rgba(139,92,246,0.14)", border: "1px solid rgba(139,92,246,0.24)" }}>
                    <Zap size={14} className="text-[#c4b5fd]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-text">2.3s avg</p>
                    <p className="text-[10px] text-muted">Match speed</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="features-section py-28 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-5">Features</Badge>
            <h2 className="text-3xl sm:text-5xl font-bold text-text tracking-tight">
              Built for real connections
            </h2>
            <p className="text-muted mt-4 max-w-sm mx-auto leading-relaxed">
              Everything you need for meaningful conversations with people around the world.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="feature-card opacity-0">
                <GlassCard className="h-full group hover:border-white/10 transition-all duration-300 hover:bg-white/[0.034]">
                  <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-5 transition-shadow duration-300 group-hover:shadow-[0_0_24px_rgba(139,92,246,0.3)]"
                       style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.22), rgba(6,182,212,0.12))", border: "1px solid rgba(139,92,246,0.2)" }}>
                    <Icon size={18} className="text-[#c4b5fd]" />
                  </div>
                  <h3 className="font-semibold text-text mb-2 text-base">{title}</h3>
                  <p className="text-sm text-muted leading-relaxed">{desc}</p>
                </GlassCard>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="steps-section py-28 px-4 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="orb-purple absolute w-[600px] h-[500px] -top-20 left-1/2 -translate-x-1/2 opacity-50" />
        </div>

        <div className="max-w-5xl mx-auto relative">
          <div className="text-center mb-16">
            <Badge variant="primary" className="mb-5">Simple</Badge>
            <h2 className="text-3xl sm:text-5xl font-bold text-text tracking-tight">
              Three steps to connect
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-9 left-[calc(33.33%+20px)] right-[calc(33.33%+20px)] h-px"
                 style={{ background: "linear-gradient(90deg, rgba(139,92,246,0.5), rgba(6,182,212,0.5))" }} />

            {STEPS.map(({ num, title, desc }) => (
              <div key={num} className="step-card opacity-0">
                <GlassCard className="text-center group hover:border-white/10 transition-all duration-300">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5 font-bold text-white text-sm transition-shadow duration-300 group-hover:shadow-[0_0_44px_rgba(139,92,246,0.55)]"
                       style={{ background: "linear-gradient(135deg, #8b5cf6, #06b6d4)", boxShadow: "0 0 28px rgba(139,92,246,0.38)" }}>
                    {num}
                  </div>
                  <h3 className="font-semibold text-text mb-2">{title}</h3>
                  <p className="text-sm text-muted leading-relaxed">{desc}</p>
                </GlassCard>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-28 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="glass rounded-3xl gradient-border p-12 sm:p-16 text-center relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
              <div className="orb-purple absolute w-[500px] h-[400px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-65" />
            </div>
            <div className="relative">
              <Badge variant="primary" dot className="mb-6">Free Forever</Badge>
              <h2 className="text-4xl sm:text-5xl font-bold text-text tracking-tight mb-4">
                Ready to meet<br />someone new?
              </h2>
              <p className="text-muted mb-10 max-w-sm mx-auto text-base leading-relaxed">
                Join millions connecting every day. Free, instant, and anonymous.
              </p>
              <Link href="/entry">
                <Button variant="primary" size="lg" className="cta-glow gap-2">
                  Start Chatting — It&apos;s Free
                  <ArrowRight size={18} />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/[0.058] py-10 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-2">
            <Image src="/logo-mark.png" alt="CONNECTO" width={32} height={32} className="w-8 h-8" />
            <span className="font-bold gradient-text text-lg tracking-tight">CONNECTO</span>
          </div>

          <p className="text-xs text-muted order-3 sm:order-2">
            © {new Date().getFullYear()} CONNECTO · Connect responsibly
          </p>

          <div className="flex items-center gap-6 order-2 sm:order-3">
            <Link href="/#features"     className="text-xs text-muted hover:text-text transition-colors">Features</Link>
            <Link href="/#how-it-works" className="text-xs text-muted hover:text-text transition-colors">How It Works</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

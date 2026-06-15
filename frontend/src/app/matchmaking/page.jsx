"use client";

export const dynamic = "force-dynamic";

import { useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { TextPlugin } from "gsap/TextPlugin";
import { X } from "lucide-react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { useSocket } from "@/hooks/useSocket";
import { useMatchmaking } from "@/hooks/useMatchmaking";

gsap.registerPlugin(TextPlugin);

const STATUS_MESSAGES = [
  "Searching globally…",
  "Scanning interests…",
  "Finding your match…",
  "Almost there…",
  "Connecting now…",
];

export default function MatchmakingPage() {
  const router = useRouter();
  const { socket } = useSocket();
  const { status, matchData, joinQueue, cancelQueue } = useMatchmaking();

  const containerRef = useRef(null);
  const statusTextRef = useRef(null);
  const dot1Ref = useRef(null);
  const dot2Ref = useRef(null);
  const dot3Ref = useRef(null);
  const glowRef = useRef(null);
  const globeRef = useRef(null);

  // Join queue on mount
  useEffect(() => {
    const mode = sessionStorage.getItem("chat_mode") || "video";
    const interests = JSON.parse(sessionStorage.getItem("chat_interests") || "[]");
    joinQueue({ mode, interests });
  }, [joinQueue]);

  // Navigate on match
  useEffect(() => {
    if (status === "matched" && matchData) {
      sessionStorage.setItem("match_data", JSON.stringify(matchData));
      const t = setTimeout(() => router.push("/chat"), 600);
      return () => clearTimeout(t);
    }
  }, [status, matchData, router]);

  useGSAP(() => {
    const ctx = gsap.context(() => {
      // Pulsing globe
      gsap.to(globeRef.current, {
        scale: 1.15,
        duration: 1.4,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });

      // Breathing glow
      gsap.to(glowRef.current, {
        scale: 1.4,
        opacity: 0.35,
        duration: 2,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });

      // Orbiting dots (manual x/y via onUpdate)
      function orbit(dotEl, radius, speed, startOffset) {
        const startTime = Date.now() + startOffset;
        gsap.to({}, {
          duration: speed,
          ease: "none",
          repeat: -1,
          onUpdate() {
            const angle = ((Date.now() - startTime) / (speed * 1000)) * Math.PI * 2;
            gsap.set(dotEl, {
              x: Math.cos(angle) * radius,
              y: Math.sin(angle) * radius,
            });
          },
        });
      }

      orbit(dot1Ref.current, 80, 3, 0);
      orbit(dot2Ref.current, 110, 5, 1000);
      orbit(dot3Ref.current, 140, 7, 2000);

      // Status text cycling
      let msgIndex = 0;
      function cycleStatus() {
        msgIndex = (msgIndex + 1) % STATUS_MESSAGES.length;
        gsap.to(statusTextRef.current, {
          opacity: 0,
          duration: 0.3,
          onComplete() {
            if (statusTextRef.current) {
              statusTextRef.current.textContent = STATUS_MESSAGES[msgIndex];
            }
            gsap.to(statusTextRef.current, { opacity: 1, duration: 0.3 });
          },
        });
      }

      const interval = setInterval(cycleStatus, 2200);
      return () => clearInterval(interval);
    }, containerRef);

    return () => ctx.revert();
  }, { scope: containerRef });

  function handleCancel() {
    cancelQueue();
    router.push("/entry");
  }

  return (
    <PageWrapper className="flex items-center justify-center min-h-screen">
      <div ref={containerRef} className="flex flex-col items-center gap-10">
        {/* Orbit stage */}
        <div className="relative w-72 h-72 flex items-center justify-center">
          {/* Ambient glow */}
          <div
            ref={glowRef}
            className="absolute w-40 h-40 rounded-full bg-[#7C3AED]/20 blur-3xl"
            style={{ opacity: 0.2 }}
          />

          {/* Center globe */}
          <div
            ref={globeRef}
            className="relative z-10 w-20 h-20 rounded-full bg-linear-to-br from-[#7C3AED] to-[#06B6D4] flex items-center justify-center text-4xl shadow-[0_0_40px_rgba(124,58,237,0.5)]"
          >
            🌍
          </div>

          {/* Orbit rings */}
          {[80, 110, 140].map((r) => (
            <div
              key={r}
              className="absolute rounded-full border border-white/5"
              style={{ width: r * 2, height: r * 2 }}
            />
          ))}

          {/* Orbiting dots */}
          {[
            { ref: dot1Ref, color: "#7C3AED" },
            { ref: dot2Ref, color: "#06B6D4" },
            { ref: dot3Ref, color: "#a78bfa" },
          ].map(({ ref, color }, i) => (
            <div
              key={i}
              ref={ref}
              className="absolute w-3 h-3 rounded-full"
              style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }}
            />
          ))}
        </div>

        {/* Text */}
        <div className="text-center space-y-2">
          <p
            ref={statusTextRef}
            className="text-lg font-medium text-text"
          >
            {STATUS_MESSAGES[0]}
          </p>
          <p className="text-sm text-muted">
            Matching you with someone worldwide
          </p>
        </div>

        {/* Cancel */}
        <button
          onClick={handleCancel}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl glass-sm text-sm text-muted hover:text-text border border-white/8 hover:border-white/14 transition-all"
        >
          <X size={14} />
          Cancel
        </button>
      </div>
    </PageWrapper>
  );
}

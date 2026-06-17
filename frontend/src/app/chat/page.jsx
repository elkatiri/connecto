"use client";

export const dynamic = "force-dynamic";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Flag, Mic, MicOff, Video, VideoOff, PhoneOff, SkipForward, MessageSquare, X } from "lucide-react";
import { avatarGradient, initials } from "@/lib/avatar";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { VideoPanel } from "@/components/chat/VideoPanel";
import { TextPanel } from "@/components/chat/TextPanel";
import { ReportModal } from "@/components/chat/ReportModal";
import { StatusIndicator } from "@/components/ui/StatusIndicator";
import { useSocket } from "@/hooks/useSocket";
import { useWebRTC } from "@/hooks/useWebRTC";
import { store } from "@/lib/storage";

export default function ChatPage() {
  const router = useRouter();
  const { socket, connected } = useSocket();
  const webRTC = useWebRTC();

  const [messages, setMessages] = useState([]);
  const [blocked, setBlocked] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [matchData, setMatchData] = useState(null);
  const [partnerLeft, setPartnerLeft] = useState(false);
  const [peerName, setPeerName] = useState("Stranger");
  const [connecting, setConnecting] = useState(true);
  const [muted, setMuted] = useState(false);
  const [camOff, setCamOff] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  const roomIdRef = useRef(null);
  const peerIdRef = useRef(null);
  const chatOpenRef = useRef(false);
  chatOpenRef.current = chatOpen;

  // Load match data and bootstrap WebRTC
  useEffect(() => {
    const stored = store.get("match_data");
    if (!stored) { router.push("/entry"); return; }

    const data = JSON.parse(stored);
    setMatchData(data);
    setPeerName(data.peerName || store.get("peer_name") || "Stranger");
    roomIdRef.current = data.roomId;
    peerIdRef.current = data.peerId;

    // The call mode comes from the match itself (set by both sides of the connect).
    const mode = data.mode || store.get("chat_mode") || "video";
    const isVideo = mode === "video";

    async function setup() {
      if (isVideo) {
        try {
          await webRTC.getLocalStream(true);
        } catch {
          await webRTC.getLocalStream(false);
        }
      }

      webRTC.createPeerConnection(data.peerId);

      if (data.initiator) {
        await webRTC.createOffer(data.peerId);
      }
    }

    setup();

    return () => {
      webRTC.closeConnection();
    };
  }, []);

  // Socket events for WebRTC signaling and chat
  useEffect(() => {
    if (!socket) return;

    function onOffer({ from, sdp }) {
      webRTC.handleOffer(from, sdp);
    }
    function onAnswer({ sdp }) {
      webRTC.handleAnswer(sdp);
    }
    function onIce({ candidate }) {
      webRTC.addIceCandidate(candidate);
    }
    function onMessage({ senderId, text, timestamp }) {
      setMessages((p) => [
        ...p,
        { id: Date.now() + Math.random(), text, isOwn: false, timestamp },
      ]);
      if (!chatOpenRef.current) setUnread((u) => u + 1);
    }
    function onUserLeft() {
      setPartnerLeft(true);
    }
    function onBlocked({ reason }) {
      setBlocked(true);
      setTimeout(() => setBlocked(false), 3000);
    }

    socket.on("webrtc-offer", onOffer);
    socket.on("webrtc-answer", onAnswer);
    socket.on("ice-candidate", onIce);
    socket.on("receive-message", onMessage);
    socket.on("user-left", onUserLeft);
    socket.on("message-blocked", onBlocked);

    return () => {
      socket.off("webrtc-offer", onOffer);
      socket.off("webrtc-answer", onAnswer);
      socket.off("ice-candidate", onIce);
      socket.off("receive-message", onMessage);
      socket.off("user-left", onUserLeft);
      socket.off("message-blocked", onBlocked);
    };
  }, [socket, webRTC]);

  const handleSend = useCallback((text) => {
    if (!roomIdRef.current) return;
    const timestamp = Date.now();
    socket.emit("send-message", { roomId: roomIdRef.current, text, timestamp });
    setMessages((p) => [
      ...p,
      { id: Date.now() + Math.random(), text, isOwn: true, timestamp },
    ]);
  }, [socket]);

  const handleSkip = useCallback(() => {
    webRTC.closeConnection();
    setMessages([]);
    setPartnerLeft(false);
    store.remove("match_data");
    router.push("/matchmaking");
  }, [webRTC, router]);

  const handleEnd = useCallback(() => {
    webRTC.closeConnection();
    store.remove("match_data");
    router.push("/lobby");
  }, [webRTC, router]);

  const toggleMute = useCallback(() => {
    setMuted(webRTC.toggleMute() === false);
  }, [webRTC]);

  const toggleCam = useCallback(() => {
    setCamOff(webRTC.toggleCamera() === false);
  }, [webRTC]);

  const openChat = useCallback(() => {
    setChatOpen((o) => {
      if (!o) setUnread(0);
      return !o;
    });
  }, []);

  const handleReport = useCallback(async (reason) => {
    if (!peerIdRef.current) return;
    socket.emit("report-user", {
      reportedId: peerIdRef.current,
      reason,
      sessionId: roomIdRef.current,
    });
    await new Promise((r) => setTimeout(r, 400));
    handleSkip();
  }, [socket, handleSkip]);

  // Dismiss the connecting overlay once the call is live, or after a short fallback.
  useEffect(() => {
    if (webRTC.connectionState === "connected") setConnecting(false);
  }, [webRTC.connectionState]);
  useEffect(() => {
    const t = setTimeout(() => setConnecting(false), 7000);
    return () => clearTimeout(t);
  }, []);

  const chatMode = matchData?.mode || "video";
  const isVideo = chatMode === "video";

  return (
    <PageWrapper className="relative h-screen overflow-hidden">
      {/* Background — full-bleed video, or a subtle backdrop in text mode */}
      {isVideo ? (
        <div className="absolute inset-0">
          <VideoPanel
            localStreamRef={webRTC.localStreamRef}
            remoteStream={webRTC.remoteStream}
            connectionState={webRTC.connectionState}
            immersive
          />
        </div>
      ) : (
        <div className="absolute inset-0 video-placeholder" />
      )}

      {/* Top scrim header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-0 inset-x-0 z-20 px-4 py-3.5 flex items-center justify-between bg-linear-to-b from-black/75 via-black/25 to-transparent"
      >
        <div className="flex items-center gap-2">
          <Image src="/logo-mark.png" alt="CONNECTO" width={28} height={28} className="w-7 h-7" />
          <span className="font-bold gradient-text text-sm sm:text-base">CONNECTO</span>
        </div>
        <div className="flex items-center gap-2.5">
          <StatusIndicator
            status={partnerLeft ? "offline" : webRTC.connectionState === "connected" ? "connected" : "searching"}
            label={partnerLeft ? `${peerName} left` : webRTC.connectionState === "connected" ? `Connected · ${peerName}` : "Connecting…"}
          />
          <button
            onClick={() => setReportOpen(true)}
            aria-label="Report this user"
            className="p-2 rounded-xl glass-sm text-muted hover:text-red-400 border border-white/8 hover:border-red-500/30 transition-all"
          >
            <Flag size={15} />
          </button>
        </div>
      </motion.div>

      {/* Partner left banner */}
      <AnimatePresence>
        {partnerLeft && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute top-20 left-1/2 -translate-x-1/2 z-20 glass-sm px-4 py-2.5 rounded-xl border border-amber-500/25 bg-amber-500/10"
          >
            <p className="text-sm text-amber-400">{peerName} left — tap Next to meet someone new.</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Text-mode conversation (fills the screen, capped for readability) */}
      {!isVideo && (
        <div className="absolute inset-0 pt-16 pb-28 px-3 sm:px-4 flex justify-center z-10">
          <div className="w-full max-w-3xl h-full">
            <TextPanel messages={messages} onSend={handleSend} blocked={blocked} />
          </div>
        </div>
      )}

      {/* Floating control bar */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="absolute bottom-6 inset-x-0 z-30 flex justify-center px-4"
      >
        <div className="glass-sm rounded-full px-3 py-2.5 flex items-center gap-2 shadow-[0_8px_32px_rgba(0,0,0,0.45)]">
          {isVideo && (
            <button
              onClick={toggleMute}
              aria-label={muted ? "Unmute microphone" : "Mute microphone"}
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${muted ? "bg-red-500/30 text-red-400 border border-red-500/40" : "bg-white/10 text-text hover:bg-white/15"}`}
            >
              {muted ? <MicOff size={18} /> : <Mic size={18} />}
            </button>
          )}
          {isVideo && (
            <button
              onClick={toggleCam}
              aria-label={camOff ? "Turn camera on" : "Turn camera off"}
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${camOff ? "bg-red-500/30 text-red-400 border border-red-500/40" : "bg-white/10 text-text hover:bg-white/15"}`}
            >
              {camOff ? <VideoOff size={18} /> : <Video size={18} />}
            </button>
          )}
          <button
            onClick={handleEnd}
            aria-label="End and return to lobby"
            className="w-11 h-11 rounded-full flex items-center justify-center bg-red-500/85 text-white hover:bg-red-500 transition-colors"
          >
            <PhoneOff size={18} />
          </button>
          <button
            onClick={handleSkip}
            className="h-11 px-5 rounded-full flex items-center gap-2 text-white font-semibold text-sm transition-shadow hover:shadow-[0_0_24px_rgba(139,92,246,0.5)]"
            style={{ background: "linear-gradient(135deg, #8b5cf6, #06b6d4)" }}
          >
            <SkipForward size={16} /> Next
          </button>
          {isVideo && (
            <button
              onClick={openChat}
              aria-label="Toggle chat"
              className={`relative w-11 h-11 rounded-full flex items-center justify-center transition-colors ${chatOpen ? "bg-white/20 text-text" : "bg-white/10 text-text hover:bg-white/15"}`}
            >
              <MessageSquare size={18} />
              {unread > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">
                  {unread}
                </span>
              )}
            </button>
          )}
        </div>
      </motion.div>

      {/* Chat drawer (video mode) */}
      {isVideo && (
        <AnimatePresence>
          {chatOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={openChat}
                className="sm:hidden absolute inset-0 z-30 bg-black/50"
              />
              <motion.aside
                initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
                transition={{ type: "spring", stiffness: 320, damping: 34 }}
                className="absolute top-0 right-0 h-full w-full sm:w-[380px] z-40 p-3 sm:pt-16"
              >
                <div className="relative h-full">
                  <TextPanel messages={messages} onSend={handleSend} blocked={blocked} />
                  <button
                    onClick={openChat}
                    aria-label="Close chat"
                    className="absolute top-3.5 right-3 p-1.5 rounded-lg text-muted hover:text-text transition-colors z-10"
                  >
                    <X size={16} />
                  </button>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>
      )}

      {/* Report modal */}
      <ReportModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        onSubmit={handleReport}
      />

      {/* Connecting overlay — shown until the call is live */}
      <AnimatePresence>
        {matchData && !partnerLeft && connecting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-bg/95 backdrop-blur-sm"
          >
            {(() => {
              const [cf, ct] = avatarGradient(peerName);
              return (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="relative mb-6"
                >
                  <span className="absolute -inset-3 rounded-full animate-ping"
                        style={{ background: `radial-gradient(circle, ${cf}44, transparent 70%)` }} />
                  <div className="relative w-24 h-24 rounded-3xl flex items-center justify-center font-bold text-white text-3xl"
                       style={{ background: `linear-gradient(135deg, ${cf}, ${ct})`, boxShadow: `0 0 48px ${cf}66` }}>
                    {initials(peerName)}
                  </div>
                </motion.div>
              );
            })()}
            <p className="text-lg font-semibold text-text">Connecting with {peerName}…</p>
            <p className="text-sm text-muted mt-1">Setting up your {isVideo ? "video" : "text"} chat</p>
            <div className="flex gap-1.5 mt-5">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="w-2 h-2 rounded-full bg-primary"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageWrapper>
  );
}

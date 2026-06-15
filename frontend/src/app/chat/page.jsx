"use client";

export const dynamic = "force-dynamic";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Flag, Zap } from "lucide-react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { VideoPanel } from "@/components/chat/VideoPanel";
import { TextPanel } from "@/components/chat/TextPanel";
import { SkipButton } from "@/components/chat/SkipButton";
import { ReportModal } from "@/components/chat/ReportModal";
import { Badge } from "@/components/ui/Badge";
import { StatusIndicator } from "@/components/ui/StatusIndicator";
import { useSocket } from "@/hooks/useSocket";
import { useWebRTC } from "@/hooks/useWebRTC";
import { slideInRight } from "@/animations/variants";
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

  const roomIdRef = useRef(null);
  const peerIdRef = useRef(null);

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

  const chatMode = matchData?.mode || "video";
  const isVideo = chatMode === "video";

  return (
    <PageWrapper className="flex flex-col min-h-screen p-3 sm:p-4 gap-3">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-linear-to-br from-[#7C3AED] to-[#06B6D4] flex items-center justify-center">
            <Zap size={14} className="text-white" />
          </div>
          <span className="font-bold gradient-text text-sm sm:text-base">CONNECTO</span>
        </div>
        <div className="flex items-center gap-3">
          <StatusIndicator
            status={partnerLeft ? "offline" : webRTC.connectionState === "connected" ? "connected" : "searching"}
            label={partnerLeft ? `${peerName} left` : webRTC.connectionState === "connected" ? `Connected · ${peerName}` : "Connecting…"}
          />
          <button
            onClick={() => setReportOpen(true)}
            className="p-2 rounded-xl glass-sm text-muted hover:text-red-400 border border-white/6 hover:border-red-500/30 transition-all"
          >
            <Flag size={15} />
          </button>
        </div>
      </motion.div>

      {/* Partner left banner */}
      {partnerLeft && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-sm px-4 py-3 rounded-xl border border-amber-500/20 bg-amber-500/10 text-center"
        >
          <p className="text-sm text-amber-400">Your partner has left. Skip to meet someone new.</p>
        </motion.div>
      )}

      {/* Main panels */}
      <div className="flex-1 flex flex-col md:flex-row gap-3 min-h-0">
        {isVideo && (
          <motion.div
            variants={slideInRight}
            initial="hidden"
            animate="visible"
            className="md:flex-[3] h-72 md:h-auto min-h-0"
          >
            <VideoPanel
              localStreamRef={webRTC.localStreamRef}
              remoteStream={webRTC.remoteStream}
              connectionState={webRTC.connectionState}
              onToggleMute={webRTC.toggleMute}
              onToggleCamera={webRTC.toggleCamera}
            />
          </motion.div>
        )}

        <motion.div
          variants={slideInRight}
          initial="hidden"
          animate="visible"
          transition={{ delay: isVideo ? 0.1 : 0 }}
          className={`${isVideo ? "md:flex-[2]" : "flex-1"} h-72 md:h-auto min-h-0`}
        >
          <TextPanel
            messages={messages}
            onSend={handleSend}
            blocked={blocked}
          />
        </motion.div>
      </div>

      {/* Skip */}
      <div className="flex justify-center pb-2">
        <SkipButton onSkip={handleSkip} disabled={false} />
      </div>

      {/* Report modal */}
      <ReportModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        onSubmit={handleReport}
      />
    </PageWrapper>
  );
}

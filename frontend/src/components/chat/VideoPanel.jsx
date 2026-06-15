"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Mic, MicOff, Video, VideoOff, User } from "lucide-react";

export function VideoPanel({ localStreamRef, remoteStream, connectionState, onToggleMute, onToggleCamera }) {
  const remoteVideoRef = useRef(null);
  const localVideoRef = useRef(null);
  const [muted, setMuted] = useState(false);
  const [camOff, setCamOff] = useState(false);
  const [pip, setPip] = useState({ x: 0, y: 0 });
  const dragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0, px: 0, py: 0 });

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  useEffect(() => {
    if (localVideoRef.current && localStreamRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
    }
  }, [localStreamRef]);

  const handleMuteToggle = useCallback(() => {
    const enabled = onToggleMute?.();
    setMuted(enabled === false);
  }, [onToggleMute]);

  const handleCamToggle = useCallback(() => {
    const enabled = onToggleCamera?.();
    setCamOff(enabled === false);
  }, [onToggleCamera]);

  function onMouseDown(e) {
    dragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY, px: pip.x, py: pip.y };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  }
  function onMouseMove(e) {
    if (!dragging.current) return;
    setPip({
      x: dragStart.current.px + (e.clientX - dragStart.current.x),
      y: dragStart.current.py + (e.clientY - dragStart.current.y),
    });
  }
  function onMouseUp() {
    dragging.current = false;
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", onMouseUp);
  }

  const isConnected = connectionState === "connected";

  return (
    <div className="relative w-full h-full bg-bg rounded-2xl overflow-hidden">
      {/* Remote video */}
      {isConnected && remoteStream ? (
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full video-placeholder flex flex-col items-center justify-center gap-4">
          <div className="w-20 h-20 rounded-full bg-white/5 border border-white/8 flex items-center justify-center">
            <User size={36} className="text-muted" />
          </div>
          <p className="text-muted text-sm">
            {connectionState === "connecting" ? "Connecting…" : "Waiting for connection"}
          </p>
        </div>
      )}

      {/* Local PiP */}
      {localStreamRef.current && (
        <motion.div
          style={{ right: 12 - pip.x, bottom: 56 - pip.y }}
          className="absolute w-40 h-28 rounded-xl overflow-hidden glass-sm border border-white/10 cursor-grab active:cursor-grabbing"
          onMouseDown={onMouseDown}
        >
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover scale-x-[-1]"
          />
          {camOff && (
            <div className="absolute inset-0 bg-bg flex items-center justify-center">
              <VideoOff size={20} className="text-muted" />
            </div>
          )}
        </motion.div>
      )}

      {/* Controls */}
      <div className="absolute bottom-0 left-0 right-0 p-3 flex items-center justify-center gap-3">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleMuteToggle}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
            muted
              ? "bg-red-500/30 border border-red-500/50 text-red-400"
              : "bg-white/8 border border-white/10 text-text hover:bg-white/12"
          }`}
        >
          {muted ? <MicOff size={16} /> : <Mic size={16} />}
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleCamToggle}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
            camOff
              ? "bg-red-500/30 border border-red-500/50 text-red-400"
              : "bg-white/8 border border-white/10 text-text hover:bg-white/12"
          }`}
        >
          {camOff ? <VideoOff size={16} /> : <Video size={16} />}
        </motion.button>
      </div>
    </div>
  );
}

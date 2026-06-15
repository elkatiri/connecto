"use client";

import { useRef, useState, useCallback } from "react";
import socket from "@/services/socket";

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

export function useWebRTC() {
  const localStreamRef = useRef(null);
  const pcRef = useRef(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [connectionState, setConnectionState] = useState("new");

  const getLocalStream = useCallback(async (videoEnabled = true) => {
    try {
      const constraints = {
        audio: true,
        video: videoEnabled ? { width: 1280, height: 720 } : false,
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = stream;
      return stream;
    } catch (err) {
      console.error("getUserMedia error:", err);
      throw err;
    }
  }, []);

  const createPeerConnection = useCallback((peerId) => {
    const pc = new RTCPeerConnection(ICE_SERVERS);
    pcRef.current = pc;

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current);
      });
    }

    const remote = new MediaStream();
    setRemoteStream(remote);

    pc.ontrack = (e) => {
      e.streams[0].getTracks().forEach((track) => remote.addTrack(track));
      setRemoteStream(new MediaStream(remote.getTracks()));
    };

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        socket.emit("ice-candidate", { to: peerId, candidate: e.candidate });
      }
    };

    pc.onconnectionstatechange = () => {
      setConnectionState(pc.connectionState);
    };

    return pc;
  }, []);

  const createOffer = useCallback(async (peerId) => {
    const pc = pcRef.current || createPeerConnection(peerId);
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    socket.emit("webrtc-offer", { to: peerId, sdp: pc.localDescription });
  }, [createPeerConnection]);

  const handleOffer = useCallback(async (peerId, sdp) => {
    const pc = pcRef.current || createPeerConnection(peerId);
    await pc.setRemoteDescription(new RTCSessionDescription(sdp));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    socket.emit("webrtc-answer", { to: peerId, sdp: pc.localDescription });
  }, [createPeerConnection]);

  const handleAnswer = useCallback(async (sdp) => {
    if (!pcRef.current) return;
    await pcRef.current.setRemoteDescription(new RTCSessionDescription(sdp));
  }, []);

  const addIceCandidate = useCallback(async (candidate) => {
    if (!pcRef.current) return;
    try {
      await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (err) {
      console.error("ICE candidate error:", err);
    }
  }, []);

  const closeConnection = useCallback(() => {
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }
    setRemoteStream(null);
    setConnectionState("closed");
  }, []);

  const toggleMute = useCallback(() => {
    if (!localStreamRef.current) return;
    const audio = localStreamRef.current.getAudioTracks()[0];
    if (audio) audio.enabled = !audio.enabled;
    return audio?.enabled;
  }, []);

  const toggleCamera = useCallback(() => {
    if (!localStreamRef.current) return;
    const video = localStreamRef.current.getVideoTracks()[0];
    if (video) video.enabled = !video.enabled;
    return video?.enabled;
  }, []);

  return {
    localStreamRef,
    remoteStream,
    connectionState,
    getLocalStream,
    createPeerConnection,
    createOffer,
    handleOffer,
    handleAnswer,
    addIceCandidate,
    closeConnection,
    toggleMute,
    toggleCamera,
  };
}

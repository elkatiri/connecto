"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import socket from "@/services/socket";

export function useMatchmaking() {
  const [status, setStatus] = useState("idle");
  const [matchData, setMatchData] = useState(null);
  const prefsRef = useRef({ interests: [], mode: "video" });

  useEffect(() => {
    function onMatchFound(data) {
      setMatchData(data);
      setStatus("matched");
    }
    function onError(err) {
      setStatus("error");
      console.error("Matchmaking error:", err);
    }

    socket.on("match-found", onMatchFound);
    socket.on("error", onError);

    return () => {
      socket.off("match-found", onMatchFound);
      socket.off("error", onError);
    };
  }, []);

  const joinQueue = useCallback(({ interests = [], mode = "video" } = {}) => {
    prefsRef.current = { interests, mode };
    setStatus("searching");
    setMatchData(null);
    socket.emit("join-queue", { interests, mode });
  }, []);

  const nextUser = useCallback(() => {
    socket.emit("next-user");
    setStatus("searching");
    setMatchData(null);
    setTimeout(() => {
      socket.emit("join-queue", prefsRef.current);
    }, 100);
  }, []);

  const cancelQueue = useCallback(() => {
    socket.emit("next-user");
    setStatus("idle");
    setMatchData(null);
  }, []);

  return { status, matchData, joinQueue, nextUser, cancelQueue };
}

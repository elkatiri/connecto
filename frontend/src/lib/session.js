"use client";

import socket from "@/services/socket";
import { store } from "@/lib/storage";

// Reads the current identity (client-only). Persists across browser restarts.
export function getSession() {
  if (typeof window === "undefined") return null;
  const token = store.get("token");
  if (!token) return null;
  return {
    token,
    name: store.get("chat_name") || "Guest",
    mode: store.get("chat_mode") || "video",
    interests: JSON.parse(store.get("chat_interests") || "[]"),
    isAnonymous: !store.get("userId")?.includes("@"),
  };
}

// Clears the session, drops the socket connection, and returns home.
export function logout(router) {
  try {
    if (socket.connected) socket.disconnect();
  } catch {}
  store.clear();
  if (router) router.push("/");
  else if (typeof window !== "undefined") window.location.href = "/";
}

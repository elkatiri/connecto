"use client";

// Auth + identity persist across browser restarts (localStorage); everything
// else (per-call data like match info) is tab/session scoped (sessionStorage).
const PERSISTENT = new Set(["token", "userId", "chat_name", "chat_mode", "chat_interests"]);

function backend(key) {
  if (typeof window === "undefined") return null;
  return PERSISTENT.has(key) ? window.localStorage : window.sessionStorage;
}

export const store = {
  get(key) {
    return backend(key)?.getItem(key) ?? null;
  },
  set(key, value) {
    backend(key)?.setItem(key, value);
  },
  remove(key) {
    backend(key)?.removeItem(key);
  },
  // Wipe everything we own (used on logout).
  clear() {
    if (typeof window === "undefined") return;
    window.localStorage.clear();
    window.sessionStorage.clear();
  },
};

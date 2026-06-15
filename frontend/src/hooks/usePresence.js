"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import socket from "@/services/socket";

// Joins the lobby presence, keeps the live user list, and handles instant connects.
export function usePresence({ name, interests = [], mode = "video" } = {}) {
  const [users, setUsers] = useState([]);
  const [match, setMatch] = useState(null);     // set when a call is established
  const [unavailable, setUnavailable] = useState(null); // peer id that was busy
  const profileRef = useRef({ name, interests, mode });
  profileRef.current = { name, interests, mode };

  // Connect socket + (re)announce presence on every (re)connection.
  useEffect(() => {
    if (!socket.connected) socket.connect();

    function announce() {
      socket.emit("presence:join", profileRef.current);
      socket.emit("presence:list");
    }

    function onUsers(list) {
      setUsers(Array.isArray(list) ? list : []);
    }
    function onMatch(data) {
      setMatch(data);
    }
    function onUnavailable({ to }) {
      setUnavailable(to);
      setTimeout(() => setUnavailable(null), 2500);
    }

    socket.on("connect", announce);
    socket.on("presence:users", onUsers);
    socket.on("match-found", onMatch);
    socket.on("direct:unavailable", onUnavailable);

    if (socket.connected) announce();

    return () => {
      socket.off("connect", announce);
      socket.off("presence:users", onUsers);
      socket.off("match-found", onMatch);
      socket.off("direct:unavailable", onUnavailable);
    };
  }, []);

  // Re-announce when the profile becomes available / changes (it loads after mount).
  useEffect(() => {
    if (socket.connected && name) {
      socket.emit("presence:join", { name, interests, mode });
    }
  }, [name, mode, JSON.stringify(interests)]);

  const connectTo = useCallback((peerId) => {
    socket.emit("direct:connect", { to: peerId });
  }, []);

  // Everyone except me.
  const others = users.filter((u) => u.id !== socket.id);

  return { users: others, selfId: socket.id, match, unavailable, connectTo };
}

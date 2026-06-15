"use client";

import { useEffect, useState } from "react";
import socket from "@/services/socket";

export function useSocket() {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!socket.connected) socket.connect();

    function onConnect() { setConnected(true); }
    function onDisconnect() { setConnected(false); }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    if (socket.connected) setConnected(true);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);

  return { socket, connected };
}

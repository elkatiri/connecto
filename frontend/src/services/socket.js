"use client";

import { io } from "socket.io-client";

const URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001";

const socket = io(URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  transports: ["websocket", "polling"],
});

export default socket;

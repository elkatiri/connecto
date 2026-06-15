"use client";

const BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001";

async function request(path, options = {}) {
  const token =
    typeof window !== "undefined" ? sessionStorage.getItem("token") : null;

  const res = await fetch(`${BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

export const api = {
  post: (path, body) =>
    request(path, { method: "POST", body: JSON.stringify(body) }),
  get: (path) => request(path),
  patch: (path, body) =>
    request(path, { method: "PATCH", body: JSON.stringify(body) }),
};

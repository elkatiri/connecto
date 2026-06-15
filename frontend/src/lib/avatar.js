// Deterministic avatar gradient + initials so each user looks distinct and stable.
const PALETTES = [
  ["#8b5cf6", "#6d28d9"],
  ["#06b6d4", "#0891b2"],
  ["#ec4899", "#be185d"],
  ["#f59e0b", "#d97706"],
  ["#10b981", "#059669"],
  ["#3b82f6", "#1d4ed8"],
  ["#a855f7", "#7c3aed"],
  ["#14b8a6", "#0d9488"],
];

function hash(str = "") {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h << 5) - h + str.charCodeAt(i);
  return Math.abs(h);
}

export function avatarGradient(name = "") {
  return PALETTES[hash(name) % PALETTES.length];
}

export function initials(name = "") {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] || "?") + (parts[1]?.[0] || "")).toUpperCase();
}

// Tracks who is currently online in the lobby and whether they are free to chat.
// Keyed by socket.id so it stays in sync with the live connection.

const users = new Map();

function register(socketId, { name, interests = [], mode = 'video' } = {}) {
  const existing = users.get(socketId);
  users.set(socketId, {
    id: socketId,
    name: (name || 'Guest').slice(0, 24),
    interests: Array.isArray(interests) ? interests.slice(0, 5) : [],
    mode: mode === 'text' ? 'text' : 'video',
    status: 'available',
    joinedAt: existing ? existing.joinedAt : Date.now(),
  });
  return users.get(socketId);
}

function unregister(socketId) {
  users.delete(socketId);
}

function setStatus(socketId, status) {
  const u = users.get(socketId);
  if (u) u.status = status;
}

function get(socketId) {
  return users.get(socketId) || null;
}

// Full public list (clients filter out their own id).
function list() {
  return [...users.values()].sort((a, b) => a.joinedAt - b.joinedAt);
}

function count() {
  return users.size;
}

module.exports = { register, unregister, setStatus, get, list, count };

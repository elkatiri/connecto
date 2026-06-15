const { v4: uuidv4 } = require('uuid');

const queue = new Map();
const rooms = new Map();

function joinQueue(socket, { interests = [], mode = 'video' }) {
  queue.set(socket.id, { socket, interests, mode, joinedAt: Date.now() });
  attemptMatch(socket.id);
}

function scoreMatch(a, b) {
  if (a.mode !== b.mode) return -1;
  const shared = a.interests.filter((i) => b.interests.includes(i)).length;
  return shared;
}

function attemptMatch(socketId) {
  const candidate = queue.get(socketId);
  if (!candidate) return;

  let bestMatch = null;
  let bestScore = -1;

  for (const [id, entry] of queue) {
    if (id === socketId) continue;
    const score = scoreMatch(candidate, entry);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = { id, entry };
    }
  }

  if (!bestMatch) return;

  const roomId = uuidv4();
  queue.delete(socketId);
  queue.delete(bestMatch.id);

  rooms.set(roomId, {
    participants: [socketId, bestMatch.id],
    mode: candidate.mode,
    startedAt: Date.now(),
  });

  candidate.socket.join(roomId);
  bestMatch.entry.socket.join(roomId);

  candidate.socket.emit('match-found', {
    roomId,
    peerId: bestMatch.id,
    initiator: true,
    mode: candidate.mode,
  });
  bestMatch.entry.socket.emit('match-found', {
    roomId,
    peerId: socketId,
    initiator: false,
    mode: candidate.mode,
  });
}

function leaveQueue(socketId) {
  queue.delete(socketId);
}

function leaveRoom(socketId) {
  for (const [roomId, room] of rooms) {
    if (room.participants.includes(socketId)) {
      const partnerId = room.participants.find((id) => id !== socketId);
      rooms.delete(roomId);
      return { partnerId, roomId };
    }
  }
  return { partnerId: null, roomId: null };
}

function getQueueSize() {
  return queue.size;
}

module.exports = { joinQueue, leaveQueue, leaveRoom, getQueueSize };

const { v4: uuidv4 } = require('uuid');
const presence = require('./presence');

const queue = new Map();
const rooms = new Map();

// Creates a room record (shared by random matchmaking and direct lobby connects)
// and marks both participants busy in the presence registry.
function createRoom(participants, mode) {
  const roomId = uuidv4();
  rooms.set(roomId, { participants, mode, startedAt: Date.now() });
  participants.forEach((id) => presence.setStatus(id, 'busy'));
  return roomId;
}

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

  queue.delete(socketId);
  queue.delete(bestMatch.id);

  const roomId = createRoom([socketId, bestMatch.id], candidate.mode);

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
      // Both participants are free again (if still online in the lobby).
      room.participants.forEach((id) => presence.setStatus(id, 'available'));
      return { partnerId, roomId };
    }
  }
  return { partnerId: null, roomId: null };
}

function getQueueSize() {
  return queue.size;
}

module.exports = { joinQueue, leaveQueue, leaveRoom, getQueueSize, createRoom };

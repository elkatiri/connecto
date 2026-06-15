require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');

const matchmaking = require('./services/matchmaking');
const signaling = require('./services/signaling');
const { filterMessage, reportUser } = require('./services/moderation');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/reports', require('./routes/reports'));

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    queueSize: matchmaking.getQueueSize(),
    timestamp: new Date().toISOString(),
  });
});

io.on('connection', (socket) => {
  socket.on('join-queue', ({ interests = [], mode = 'video' } = {}) => {
    matchmaking.joinQueue(socket, { interests, mode });
  });

  socket.on('webrtc-offer', (data) => {
    signaling.handleOffer(socket, data);
  });

  socket.on('webrtc-answer', (data) => {
    signaling.handleAnswer(socket, data);
  });

  socket.on('ice-candidate', (data) => {
    signaling.handleIceCandidate(socket, data);
  });

  socket.on('send-message', ({ roomId, text, timestamp }) => {
    if (!text || !roomId) return;

    if (filterMessage(text)) {
      socket.emit('message-blocked', { reason: 'Message contains prohibited content' });
      return;
    }

    socket.to(roomId).emit('receive-message', {
      senderId: socket.id,
      text,
      timestamp,
    });
  });

  socket.on('next-user', () => {
    const { partnerId, roomId } = matchmaking.leaveRoom(socket.id);
    if (partnerId) {
      io.to(partnerId).emit('user-left', {});
      const partnerSocket = io.sockets.sockets.get(partnerId);
      if (partnerSocket) {
        matchmaking.leaveQueue(partnerId);
      }
    }
    if (roomId) socket.leave(roomId);
    matchmaking.leaveQueue(socket.id);
  });

  socket.on('report-user', async ({ reportedId, reason, sessionId }) => {
    try {
      await reportUser({ reporterId: socket.id, reportedId, reason, sessionId });
      socket.emit('report-submitted', { success: true });
    } catch (err) {
      socket.emit('error', { code: 'REPORT_FAILED', message: 'Could not submit report' });
    }
  });

  socket.on('disconnect', () => {
    const { partnerId, roomId } = matchmaking.leaveRoom(socket.id);
    if (partnerId) {
      io.to(partnerId).emit('user-left', {});
    }
    matchmaking.leaveQueue(socket.id);
  });
});

const PORT = process.env.PORT || 5001;

async function start() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/connecto');
    console.log('MongoDB connected');
  } catch (err) {
    console.warn('MongoDB connection failed — running without DB:', err.message);
  }

  server.listen(PORT, () => {
    console.log(`CONNECTO server running on port ${PORT}`);
  });
}

start();

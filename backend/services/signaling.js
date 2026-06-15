function handleOffer(socket, { to, sdp }) {
  socket.to(to).emit('webrtc-offer', { from: socket.id, sdp });
}

function handleAnswer(socket, { to, sdp }) {
  socket.to(to).emit('webrtc-answer', { from: socket.id, sdp });
}

function handleIceCandidate(socket, { to, candidate }) {
  socket.to(to).emit('ice-candidate', { from: socket.id, candidate });
}

module.exports = { handleOffer, handleAnswer, handleIceCandidate };

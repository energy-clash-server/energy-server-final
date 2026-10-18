const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

const rooms = {};

io.on('connection', (socket) => {
  socket.on('join_room', ({ roomId, playerName }) => {
    socket.join(roomId);
    if (!rooms[roomId]) rooms[roomId] = { players: [] };
    rooms[roomId].players.push({ id: socket.id, name: playerName });
    io.to(roomId).emit('update_players', rooms[roomId].players);
  });

  socket.on('game_action', ({ roomId, actionData }) => {
    socket.to(roomId).emit('receive_action', actionData);
  });

  socket.on('disconnect', () => {
    for (const roomId in rooms) {
      rooms[roomId].players = rooms[roomId].players.filter(p => p.id !== socket.id);
      io.to(roomId).emit('update_players', rooms[roomId].players);
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

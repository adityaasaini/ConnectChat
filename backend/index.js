import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const server = createServer(app);

// Socket.io initialization with CORS handling
const io = new Server(server, {
  cors: {
    origin: '*', // Development me sabhi domains allow kiye
  }
});

const ROOM_GROUP = 'group';

// Listen to client connections
io.on('connection', (socket) => {
  console.log('A user connected', socket.id);

  // User join event
  socket.on('join-room', async (username) => {
    console.log(`${username} is joining the group`);
    await socket.join(ROOM_GROUP);
    // User ke alawa sabko broadcast karo ki usne join kiya
    socket.to(ROOM_GROUP).emit('room-notice', username);
  });

  // Handle incoming messages aur broadcast karo
  socket.on('chat-message', (message) => {
    socket.to(ROOM_GROUP).emit('chat-message', message);
  });

  // Typing event aane par baakiyo ko notify karo
  socket.on('typing', (username) => {
    socket.to(ROOM_GROUP).emit('typing', username);
  });

  // Typing stop hone par notify karo
  socket.on('stop-typing', (username) => {
    socket.to(ROOM_GROUP).emit('stop-typing', username);
  });
});

// Start HTTP server
server.listen(4600, () => {
  console.log('Server listening on port 4600');
});
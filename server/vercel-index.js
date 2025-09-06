const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

// Middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(morgan('combined'));

// CORS configuration for Vercel
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://thinksync-client.vercel.app',
    'https://*.vercel.app',
    process.env.CLIENT_URL || 'https://localhost:3000'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// MongoDB connection
if (process.env.NODE_ENV !== 'development') {
  mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const db = mongoose.connection;
  db.on('error', (error) => {
    console.error('MongoDB connection error:', error);
  });

  db.once('open', () => {
    console.log('Connected to MongoDB');
    console.log('Database name:', db.name);
  });
}

// Import routes
const authRoutes = require('./routes/auth');
const boardRoutes = require('./routes/boards');
const mindMapRoutes = require('./routes/mindmaps');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/boards', boardRoutes);
app.use('/api/mindmaps', mindMapRoutes);

// Socket.IO setup (only for non-Vercel deployments)
let io;
const activeRooms = new Map();
const socketRooms = new Map();

if (process.env.VERCEL !== '1') {
  const server = http.createServer(app);
  io = socketIo(server, {
    cors: corsOptions,
    transports: ['websocket', 'polling']
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join a room (board/mindmap)
    socket.on('joinRoom', ({ roomId, userId, userName }) => {
      console.log(`User ${userName} (${userId}) joining room ${roomId}`);
      
      // Leave previous room if any
      if (socketRooms.has(socket.id)) {
        const prevRoomId = socketRooms.get(socket.id);
        socket.leave(prevRoomId);
        
        if (activeRooms.has(prevRoomId)) {
          const roomUsers = activeRooms.get(prevRoomId);
          roomUsers.delete(socket.id);
          
          socket.to(prevRoomId).emit('userLeft', { userId });
          
          if (roomUsers.size === 0) {
            activeRooms.delete(prevRoomId);
          } else {
            const updatedUsers = Array.from(roomUsers.values());
            io.to(prevRoomId).emit('roomUsers', updatedUsers);
          }
        }
      }
      
      // Join new room
      socket.join(roomId);
      socketRooms.set(socket.id, roomId);
      
      if (!activeRooms.has(roomId)) {
        activeRooms.set(roomId, new Map());
      }
      
      const roomUsers = activeRooms.get(roomId);
      roomUsers.set(socket.id, { userId, userName });
      
      socket.to(roomId).emit('userJoined', { userId, userName });
      
      const userList = Array.from(roomUsers.values());
      io.to(roomId).emit('roomUsers', userList);
      
      console.log(`Room ${roomId} now has ${userList.length} users:`, userList.map(u => u.userName));
    });

    // Handle drawing events
    socket.on('drawStart', (data) => {
      socket.to(data.roomId).emit('drawStart', data);
    });

    socket.on('drawing', (data) => {
      socket.to(data.roomId).emit('drawing', data);
    });

    socket.on('drawEnd', (data) => {
      socket.to(data.roomId).emit('drawEnd', data);
    });

    // Handle mind map node updates
    socket.on('nodeUpdate', (data) => {
      socket.to(data.roomId).emit('nodeUpdate', data);
    });

    socket.on('nodeAdd', (data) => {
      socket.to(data.roomId).emit('nodeAdd', data);
    });

    socket.on('nodeDelete', (data) => {
      socket.to(data.roomId).emit('nodeDelete', data);
    });

    // Handle cursor position sharing
    socket.on('cursorMove', (data) => {
      socket.to(data.roomId).emit('cursorMove', data);
    });

    // Handle leaving a room
    socket.on('leaveRoom', ({ roomId, userId }) => {
      console.log(`User ${userId} leaving room ${roomId}`);
      socket.leave(roomId);
      
      if (activeRooms.has(roomId)) {
        const roomUsers = activeRooms.get(roomId);
        roomUsers.delete(socket.id);
        
        socket.to(roomId).emit('userLeft', { userId });
        
        const userList = Array.from(roomUsers.values());
        io.to(roomId).emit('roomUsers', userList);
        
        if (roomUsers.size === 0) {
          activeRooms.delete(roomId);
        }
      }
      
      socketRooms.delete(socket.id);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      
      if (socketRooms.has(socket.id)) {
        const roomId = socketRooms.get(socket.id);
        
        if (activeRooms.has(roomId)) {
          const roomUsers = activeRooms.get(roomId);
          const user = roomUsers.get(socket.id);
          
          if (user) {
            roomUsers.delete(socket.id);
            
            socket.to(roomId).emit('userLeft', { userId: user.userId });
            
            const userList = Array.from(roomUsers.values());
            io.to(roomId).emit('roomUsers', userList);
            
            console.log(`User ${user.userName} left room ${roomId}. Room now has ${userList.length} users.`);
            
            if (roomUsers.size === 0) {
              activeRooms.delete(roomId);
              console.log(`Room ${roomId} deleted (empty)`);
            }
          }
        }
        
        socketRooms.delete(socket.id);
      }
    });
  });

  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
} else {
  // Vercel serverless function export
  module.exports = app;
}

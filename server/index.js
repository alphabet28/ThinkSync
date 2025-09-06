const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const helmet = require('helmet');
const morgan = require('morgan');

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(helmet());
app.use(morgan('combined'));
// CORS configuration for production
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:3001', 
    process.env.CLIENT_URL || 'https://thinksync-client.onrender.com'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/thinksync', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', (error) => {
  console.error('MongoDB connection error:', error);
});
db.once('open', () => {
  console.log('Connected to MongoDB');
  console.log('Database name:', db.name);
  console.log('MongoDB URI:', process.env.MONGODB_URI);
});

// Import routes
const authRoutes = require('./routes/auth');
const boardRoutes = require('./routes/boards');
const mindMapRoutes = require('./routes/mindmaps');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/boards', boardRoutes);
app.use('/api/mindmaps', mindMapRoutes);

// Socket.IO for real-time collaboration
const activeRooms = new Map(); // roomId -> Map(socketId -> {userId, userName})
const socketRooms = new Map(); // socketId -> roomId

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join a room (board/mindmap)
  socket.on('joinRoom', ({ roomId, userId, userName }) => {
    console.log(`User ${userName} (${userId}) joining room ${roomId}`);
    
    // Leave previous room if any
    if (socketRooms.has(socket.id)) {
      const prevRoomId = socketRooms.get(socket.id);
      socket.leave(prevRoomId);
      
      // Remove from previous room's user list
      if (activeRooms.has(prevRoomId)) {
        const roomUsers = activeRooms.get(prevRoomId);
        roomUsers.delete(socket.id);
        
        // Broadcast user left to previous room
        socket.to(prevRoomId).emit('userLeft', { userId });
        
        // Clean up empty rooms
        if (roomUsers.size === 0) {
          activeRooms.delete(prevRoomId);
        } else {
          // Send updated user list to previous room
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
    
    // Broadcast user joined to room
    socket.to(roomId).emit('userJoined', { userId, userName });
    
    // Send current users in room to all users in the room
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
      
      // Broadcast user left to room
      socket.to(roomId).emit('userLeft', { userId });
      
      // Send updated user list to room
      const userList = Array.from(roomUsers.values());
      io.to(roomId).emit('roomUsers', userList);
      
      // Clean up empty rooms
      if (roomUsers.size === 0) {
        activeRooms.delete(roomId);
      }
    }
    
    socketRooms.delete(socket.id);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    // Get the room this socket was in
    if (socketRooms.has(socket.id)) {
      const roomId = socketRooms.get(socket.id);
      
      if (activeRooms.has(roomId)) {
        const roomUsers = activeRooms.get(roomId);
        const user = roomUsers.get(socket.id);
        
        if (user) {
          roomUsers.delete(socket.id);
          
          // Broadcast user left to room
          socket.to(roomId).emit('userLeft', { userId: user.userId });
          
          // Send updated user list to room
          const userList = Array.from(roomUsers.values());
          io.to(roomId).emit('roomUsers', userList);
          
          console.log(`User ${user.userName} left room ${roomId}. Room now has ${userList.length} users.`);
          
          // Clean up empty rooms
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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

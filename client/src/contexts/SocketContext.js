import React, { createContext, useState, useContext, useEffect } from 'react';
import io from 'socket.io-client';
import { AuthContext } from './AuthContext';

const SocketContext = createContext();

const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const { user } = useContext(AuthContext);

  const SOCKET_SERVER_URL = process.env.REACT_APP_API_URL || 
    (process.env.NODE_ENV === 'production' 
      ? 'https://thinksync-api.onrender.com' 
      : 'http://localhost:5000');

  useEffect(() => {
    if (user) {
      const newSocket = io(SOCKET_SERVER_URL);
      setSocket(newSocket);

      // Listen for connected users
      newSocket.on('roomUsers', (users) => {
        setConnectedUsers(users);
      });

      newSocket.on('userJoined', (userData) => {
        setConnectedUsers(prev => [...prev, userData]);
      });

      newSocket.on('userLeft', (userData) => {
        setConnectedUsers(prev => prev.filter(u => u.userId !== userData.userId));
      });

      return () => {
        newSocket.close();
        setSocket(null);
        setConnectedUsers([]);
        setCurrentRoom(null);
      };
    }
  }, [user, SOCKET_SERVER_URL]);

  // Cleanup effect for when component unmounts or user changes
  useEffect(() => {
    return () => {
      if (socket && currentRoom && user) {
        console.log(`Cleanup: leaving room ${currentRoom}`);
        socket.emit('leaveRoom', { 
          roomId: currentRoom, 
          userId: user.id 
        });
      }
    };
  }, [socket, currentRoom, user]);

  const joinRoom = (roomId) => {
    console.log(`Attempting to join room: ${roomId}, current room: ${currentRoom}`);
    if (socket && user && roomId) {
      // Only join if not already in this room
      if (currentRoom !== roomId) {
        console.log(`Joining new room: ${roomId} as ${user.username}`);
        socket.emit('joinRoom', {
          roomId,
          userId: user.id,
          userName: user.username
        });
        setCurrentRoom(roomId);
      } else {
        console.log(`Already in room ${roomId}, skipping join`);
      }
    }
  };

  const leaveRoom = () => {
    console.log(`Leaving current room: ${currentRoom}`);
    if (socket && currentRoom && user) {
      socket.emit('leaveRoom', { 
        roomId: currentRoom, 
        userId: user.id 
      });
      setCurrentRoom(null);
      setConnectedUsers([]);
    }
  };

  const emitDrawing = (drawingData) => {
    if (socket && currentRoom) {
      socket.emit('drawing', { ...drawingData, roomId: currentRoom });
    }
  };

  const emitNodeUpdate = (nodeData) => {
    if (socket && currentRoom) {
      socket.emit('nodeUpdate', { ...nodeData, roomId: currentRoom });
    }
  };

  const emitNodeAdd = (nodeData) => {
    if (socket && currentRoom) {
      socket.emit('nodeAdd', { ...nodeData, roomId: currentRoom });
    }
  };

  const emitNodeDelete = (nodeId) => {
    if (socket && currentRoom) {
      socket.emit('nodeDelete', { nodeId, roomId: currentRoom });
    }
  };

  const emitCursorMove = (cursorData) => {
    if (socket && currentRoom) {
      socket.emit('cursorMove', { ...cursorData, roomId: currentRoom, userId: user.id });
    }
  };

  const value = {
    socket,
    connectedUsers,
    currentRoom,
    joinRoom,
    leaveRoom,
    emitDrawing,
    emitNodeUpdate,
    emitNodeAdd,
    emitNodeDelete,
    emitCursorMove
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export { SocketContext, SocketProvider };

import React, { useState, useRef, useEffect, useContext, useCallback } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Button,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Tooltip,
  Avatar,
  AvatarGroup
} from '@mui/material';
import {
  ArrowBack,
  Brush,
  Clear,
  Save,
  Share,
  Undo,
  Redo,
  PanTool
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { SocketContext } from '../../contexts/SocketContext';
import SignatureCanvas from 'react-signature-canvas';
import axios from 'axios';

const Whiteboard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const [board, setBoard] = useState(null);
  const [tool, setTool] = useState('pen');
  const [brushSize, setBrushSize] = useState(3);
  const [brushColor, setBrushColor] = useState('#000000');
  const [shareDialog, setShareDialog] = useState(false);
  const [collaboratorEmail, setCollaboratorEmail] = useState('');
  const [isDrawing, setIsDrawing] = useState(false);
  const [canvasHistory, setCanvasHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const { socket, connectedUsers, joinRoom, leaveRoom, currentRoom } = useContext(SocketContext);

  const saveToHistory = useCallback(() => {
    if (canvasRef.current) {
      try {
        const newHistory = canvasHistory.slice(0, historyIndex + 1);
        newHistory.push(canvasRef.current.toDataURL());
        setCanvasHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
      } catch (error) {
        console.error('Error saving to history:', error);
      }
    }
  }, [canvasHistory, historyIndex]);

  useEffect(() => {
    const fetchBoard = async () => {
      try {
        const response = await axios.get(`/boards/${id}`);
        setBoard(response.data.board);
        
        // Load saved canvas data
        if (response.data.board.canvasData) {
          setTimeout(() => {
            if (canvasRef.current) {
              try {
                canvasRef.current.fromDataURL(response.data.board.canvasData);
                saveToHistory();
              } catch (error) {
                console.error('Error loading canvas data:', error);
              }
            }
          }, 100);
        }
      } catch (error) {
        console.error('Error fetching board:', error);
        navigate('/dashboard');
      }
    };

    fetchBoard();
  }, [id, navigate, saveToHistory]);

  useEffect(() => {
    if (socket && board) {
      joinRoom(board._id);

      // Listen for real-time drawing events
      const handleRemoteDrawStart = (data) => {
        console.log('Remote draw start:', data);
      };

      const handleRemoteDrawing = (data) => {
        console.log('Remote drawing:', data);
      };

      const handleRemoteDrawEnd = (data) => {
        console.log('Remote draw end:', data);
      };

      socket.on('drawStart', handleRemoteDrawStart);
      socket.on('drawing', handleRemoteDrawing);
      socket.on('drawEnd', handleRemoteDrawEnd);

      return () => {
        socket.off('drawStart');
        socket.off('drawing');
        socket.off('drawEnd');
        // Leave room when component unmounts
        leaveRoom();
      };
    }
  }, [socket, board, joinRoom, leaveRoom]);

  const handleUndo = () => {
    if (historyIndex > 0 && canvasRef.current) {
      try {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        canvasRef.current.fromDataURL(canvasHistory[newIndex]);
      } catch (error) {
        console.error('Error during undo:', error);
      }
    }
  };

  const handleRedo = () => {
    if (historyIndex < canvasHistory.length - 1 && canvasRef.current) {
      try {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        canvasRef.current.fromDataURL(canvasHistory[newIndex]);
      } catch (error) {
        console.error('Error during redo:', error);
      }
    }
  };

  const handleClearCanvas = () => {
    if (canvasRef.current) {
      try {
        canvasRef.current.clear();
        saveToHistory();
        if (socket && currentRoom) {
          socket.emit('canvasClear', { roomId: currentRoom });
        }
      } catch (error) {
        console.error('Error clearing canvas:', error);
      }
    }
  };

  const handleSaveBoard = async () => {
    if (canvasRef.current) {
      try {
        console.log('Saving board with ID:', id);
        const canvasData = canvasRef.current.toDataURL();
        console.log('Canvas data length:', canvasData.length);
        
        const response = await axios.put(`/boards/${id}`, { canvasData });
        console.log('Save response:', response.data);
        
        // Show success message could be added here
        alert('Board saved successfully!');
      } catch (error) {
        console.error('Error saving board:', error);
        console.error('Error response:', error.response?.data);
        alert('Error saving board: ' + (error.response?.data?.message || error.message));
      }
    } else {
      console.error('Canvas reference is null');
      alert('Canvas not available for saving');
    }
  };

  const handleDrawStart = (event) => {
    setIsDrawing(true);
    if (socket && currentRoom && canvasRef.current && canvasRef.current.canvas) {
      const rect = canvasRef.current.canvas.getBoundingClientRect();
      socket.emit('drawStart', {
        roomId: currentRoom,
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
        brushColor,
        brushSize
      });
    }
  };

  const handleDrawEnd = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveToHistory();
      if (socket && currentRoom) {
        socket.emit('drawEnd', { roomId: currentRoom });
      }
    }
  };

  const handleAddCollaborator = async () => {
    try {
      await axios.post(`/boards/${id}/collaborators`, {
        email: collaboratorEmail,
        permission: 'write'
      });
      setShareDialog(false);
      setCollaboratorEmail('');
      // Refresh board data
      const response = await axios.get(`/boards/${id}`);
      setBoard(response.data.board);
    } catch (error) {
      console.error('Error adding collaborator:', error);
    }
  };

  const colors = ['#000000', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
  const brushSizes = [1, 3, 5, 10, 20];

  if (!board) {
    return <Box>Loading...</Box>;
  }

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton color="inherit" onClick={() => navigate('/dashboard')}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, ml: 2 }}>
            {board.title}
          </Typography>
          
          {/* Connected Users */}
          <AvatarGroup max={4} sx={{ mr: 2 }}>
            {connectedUsers.map((connectedUser) => (
              <Tooltip key={connectedUser.id} title={connectedUser.userName}>
                <Avatar sx={{ width: 32, height: 32 }}>
                  {connectedUser.userName?.charAt(0).toUpperCase()}
                </Avatar>
              </Tooltip>
            ))}
          </AvatarGroup>

          <IconButton color="inherit" onClick={() => setShareDialog(true)}>
            <Share />
          </IconButton>
          <Button color="inherit" onClick={handleSaveBoard}>
            <Save sx={{ mr: 1 }} />
            Save
          </Button>
        </Toolbar>
      </AppBar>

      {/* Toolbar */}
      <Paper sx={{ p: 1, borderRadius: 0 }}>
        <Box display="flex" alignItems="center" gap={2}>
          {/* Tools */}
          <Box display="flex" gap={1}>
            <IconButton
              color={tool === 'pen' ? 'primary' : 'default'}
              onClick={() => setTool('pen')}
            >
              <Brush />
            </IconButton>
            <IconButton
              color={tool === 'pan' ? 'primary' : 'default'}
              onClick={() => setTool('pan')}
            >
              <PanTool />
            </IconButton>
          </Box>

          {/* Colors */}
          <Box display="flex" gap={1}>
            {colors.map((color) => (
              <Box
                key={color}
                sx={{
                  width: 24,
                  height: 24,
                  backgroundColor: color,
                  border: brushColor === color ? '2px solid #666' : '1px solid #ccc',
                  borderRadius: '50%',
                  cursor: 'pointer'
                }}
                onClick={() => setBrushColor(color)}
              />
            ))}
          </Box>

          {/* Brush Sizes */}
          <Box display="flex" gap={1}>
            {brushSizes.map((size) => (
              <Chip
                key={size}
                label={size}
                size="small"
                variant={brushSize === size ? 'filled' : 'outlined'}
                onClick={() => setBrushSize(size)}
                sx={{ cursor: 'pointer' }}
              />
            ))}
          </Box>

          {/* Actions */}
          <Box display="flex" gap={1}>
            <IconButton onClick={handleUndo} disabled={historyIndex <= 0}>
              <Undo />
            </IconButton>
            <IconButton onClick={handleRedo} disabled={historyIndex >= canvasHistory.length - 1}>
              <Redo />
            </IconButton>
            <IconButton onClick={handleClearCanvas}>
              <Clear />
            </IconButton>
          </Box>
        </Box>
      </Paper>

      {/* Canvas */}
      <Box sx={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <SignatureCanvas
          ref={canvasRef}
          canvasProps={{
            width: window.innerWidth,
            height: window.innerHeight - 120,
            style: { width: '100%', height: '100%' }
          }}
          penColor={brushColor}
          minWidth={brushSize}
          maxWidth={brushSize}
          onBegin={handleDrawStart}
          onEnd={handleDrawEnd}
        />
      </Box>

      {/* Share Dialog */}
      <Dialog open={shareDialog} onClose={() => setShareDialog(false)}>
        <DialogTitle>Share Whiteboard</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Collaborator Email"
            type="email"
            fullWidth
            variant="outlined"
            value={collaboratorEmail}
            onChange={(e) => setCollaboratorEmail(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShareDialog(false)}>Cancel</Button>
          <Button onClick={handleAddCollaborator} variant="contained">
            Add Collaborator
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Whiteboard;

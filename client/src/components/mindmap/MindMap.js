import React, { useState, useRef, useEffect, useContext, useCallback } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Button,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Tooltip,
  Avatar,
  AvatarGroup,
  Fab,
  MenuItem,
  Chip
} from '@mui/material';
import {
  ArrowBack,
  Add,
  Save,
  Share,
  Psychology,
  Delete,
  Edit,
  AutoFixHigh
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { Stage, Layer, Rect, Text, Circle, Line } from 'react-konva';
import { SocketContext } from '../../contexts/SocketContext';
import axios from 'axios';

const MindMap = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const stageRef = useRef(null);
  const [mindMap, setMindMap] = useState(null);
  const [nodes, setNodes] = useState([]);
  const [connections, setConnections] = useState([]);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [editingNode, setEditingNode] = useState(null);
  const [shareDialog, setShareDialog] = useState(false);
  const [collaboratorEmail, setCollaboratorEmail] = useState('');
  const [nodeDialog, setNodeDialog] = useState(false);
  const [newNodeText, setNewNodeText] = useState('');
  const [nodeContextMenu, setNodeContextMenu] = useState(null);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [showAiDialog, setShowAiDialog] = useState(false);

  const { socket, connectedUsers, joinRoom, leaveRoom, emitNodeUpdate, emitNodeAdd, emitNodeDelete } = useContext(SocketContext);

  useEffect(() => {
    const fetchMindMap = async () => {
      try {
        const response = await axios.get(`/mindmaps/${id}`);
        setMindMap(response.data.mindMap);
        setNodes(response.data.mindMap.nodes);
        setConnections(response.data.mindMap.connections);
      } catch (error) {
        console.error('Error fetching mind map:', error);
        navigate('/dashboard');
      }
    };

    fetchMindMap();
  }, [id, navigate]);

  useEffect(() => {
    if (socket && mindMap) {
      joinRoom(mindMap._id);

      const handleRemoteNodeUpdate = (data) => {
        setNodes(prev => prev.map(node => 
          node.id === data.id ? { ...node, ...data } : node
        ));
      };

      const handleRemoteNodeAdd = (data) => {
        setNodes(prev => [...prev, data]);
      };

      const handleRemoteNodeDelete = (data) => {
        setNodes(prev => prev.filter(node => node.id !== data.nodeId));
        setConnections(prev => prev.filter(conn => 
          conn.from !== data.nodeId && conn.to !== data.nodeId
        ));
      };

      socket.on('nodeUpdate', handleRemoteNodeUpdate);
      socket.on('nodeAdd', handleRemoteNodeAdd);
      socket.on('nodeDelete', handleRemoteNodeDelete);

      return () => {
        socket.off('nodeUpdate');
        socket.off('nodeAdd');
        socket.off('nodeDelete');
        // Leave room when component unmounts
        leaveRoom();
      };
    }
  }, [socket, mindMap, joinRoom, leaveRoom]);

  const saveMindMap = useCallback(async () => {
    if (mindMap) {
      try {
        console.log('Saving mind map with ID:', id);
        console.log('Nodes:', nodes.length);
        console.log('Connections:', connections.length);
        
        const response = await axios.put(`/mindmaps/${id}`, { nodes, connections });
        console.log('Save response:', response.data);
        
        alert('Mind map saved successfully!');
      } catch (error) {
        console.error('Error saving mind map:', error);
        console.error('Error response:', error.response?.data);
        alert('Error saving mind map: ' + (error.response?.data?.message || error.message));
      }
    } else {
      console.error('Mind map data is null');
      alert('Mind map not available for saving');
    }
  }, [mindMap, nodes, connections, id]);

  const handleNodeDrag = (nodeId, newPos) => {
    const updatedNodes = nodes.map(node =>
      node.id === nodeId ? { ...node, x: newPos.x, y: newPos.y } : node
    );
    setNodes(updatedNodes);
    emitNodeUpdate({ id: nodeId, ...newPos });
  };

  const handleNodeDoubleClick = (node) => {
    setEditingNode(node);
    setNewNodeText(node.text);
    setNodeDialog(true);
  };

  const handleUpdateNode = () => {
    if (editingNode) {
      const updatedNodes = nodes.map(node =>
        node.id === editingNode.id ? { ...node, text: newNodeText } : node
      );
      setNodes(updatedNodes);
      emitNodeUpdate({ id: editingNode.id, text: newNodeText });
      setNodeDialog(false);
      setEditingNode(null);
      setNewNodeText('');
    }
  };

  const handleAddNode = (parentId = null) => {
    const stageSize = stageRef.current ? stageRef.current.size() : { width: 800, height: 600 };
    const newNodeId = 'node-' + Date.now();
    
    // Position new node randomly or near parent
    let x = Math.random() * (stageSize.width - 200) + 100;
    let y = Math.random() * (stageSize.height - 100) + 50;
    
    if (parentId) {
      const parentNode = nodes.find(node => node.id === parentId);
      if (parentNode) {
        x = parentNode.x + 200;
        y = parentNode.y;
        
        // Create connection
        const newConnection = {
          id: 'conn-' + Date.now(),
          from: parentId,
          to: newNodeId,
          color: '#666666',
          thickness: 2,
          style: 'solid'
        };
        setConnections(prev => [...prev, newConnection]);
      }
    }

    const newNode = {
      id: newNodeId,
      text: 'New Idea',
      x,
      y,
      width: 150,
      height: 80,
      backgroundColor: '#e3f2fd',
      textColor: '#000000',
      borderColor: '#2196f3',
      shape: 'rectangle',
      fontSize: 14,
      parentId
    };

    setNodes(prev => [...prev, newNode]);
    emitNodeAdd(newNode);
    setNodeContextMenu(null);
  };

  const handleDeleteNode = (nodeId) => {
    if (nodeId !== mindMap?.centerNode) {
      setNodes(prev => prev.filter(node => node.id !== nodeId));
      setConnections(prev => prev.filter(conn => conn.from !== nodeId && conn.to !== nodeId));
      emitNodeDelete(nodeId);
    }
    setNodeContextMenu(null);
  };

  const handleNodeRightClick = (e, node) => {
    e.evt.preventDefault();
    const stage = e.target.getStage();
    const pointerPosition = stage.getPointerPosition();
    
    setNodeContextMenu({
      x: pointerPosition.x,
      y: pointerPosition.y,
      node
    });
  };

  const handleGenerateAISuggestions = async () => {
    try {
      const response = await axios.post(`/mindmaps/${id}/ai-suggestions`);
      setAiSuggestions(response.data.suggestions);
      setShowAiDialog(true);
    } catch (error) {
      console.error('Error generating AI suggestions:', error);
    }
  };

  const handleApplyAISuggestion = (suggestion) => {
    if (suggestion.type === 'node') {
      handleAddNode();
      // Update the last added node with suggestion text
      setNodes(prev => {
        const updated = [...prev];
        if (updated.length > 0) {
          updated[updated.length - 1].text = suggestion.text;
        }
        return updated;
      });
    }
    setShowAiDialog(false);
  };

  const handleAddCollaborator = async () => {
    try {
      await axios.post(`/mindmaps/${id}/collaborators`, {
        email: collaboratorEmail,
        permission: 'write'
      });
      setShareDialog(false);
      setCollaboratorEmail('');
      // Refresh mind map data
      const response = await axios.get(`/mindmaps/${id}`);
      setMindMap(response.data.mindMap);
    } catch (error) {
      console.error('Error adding collaborator:', error);
    }
  };



  if (!mindMap) {
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
            {mindMap.title}
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

          <IconButton color="inherit" onClick={handleGenerateAISuggestions}>
            <AutoFixHigh />
          </IconButton>
          <IconButton color="inherit" onClick={() => setShareDialog(true)}>
            <Share />
          </IconButton>
          <Button color="inherit" onClick={saveMindMap}>
            <Save sx={{ mr: 1 }} />
            Save
          </Button>
        </Toolbar>
      </AppBar>

      {/* Mind Map Canvas */}
      <Box sx={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <Stage
          width={window.innerWidth}
          height={window.innerHeight - 64}
          draggable
          ref={stageRef}
        >
          <Layer>
            {/* Draw connections first */}
            {connections.map((connection) => {
              const fromNode = nodes.find(node => node.id === connection.from);
              const toNode = nodes.find(node => node.id === connection.to);
              if (!fromNode || !toNode) return null;

              return (
                <Line
                  key={connection.id}
                  points={[
                    fromNode.x + fromNode.width / 2,
                    fromNode.y + fromNode.height / 2,
                    toNode.x + toNode.width / 2,
                    toNode.y + toNode.height / 2
                  ]}
                  stroke={connection.color}
                  strokeWidth={connection.thickness}
                />
              );
            })}

            {/* Draw nodes */}
            {nodes.map((node) => (
              <React.Fragment key={node.id}>
                {node.shape === 'circle' ? (
                  <Circle
                    x={node.x + node.width / 2}
                    y={node.y + node.height / 2}
                    radius={node.width / 2}
                    fill={node.backgroundColor}
                    stroke={node.borderColor}
                    strokeWidth={2}
                    draggable
                    onDragEnd={(e) => handleNodeDrag(node.id, e.target.position())}
                    onDblClick={() => handleNodeDoubleClick(node)}
                    onClick={() => setSelectedNodeId(node.id)}
                    onContextMenu={(e) => handleNodeRightClick(e, node)}
                  />
                ) : (
                  <Rect
                    x={node.x}
                    y={node.y}
                    width={node.width}
                    height={node.height}
                    fill={node.backgroundColor}
                    stroke={node.borderColor}
                    strokeWidth={selectedNodeId === node.id ? 3 : 2}
                    cornerRadius={5}
                    draggable
                    onDragEnd={(e) => handleNodeDrag(node.id, e.target.position())}
                    onDblClick={() => handleNodeDoubleClick(node)}
                    onClick={() => setSelectedNodeId(node.id)}
                    onContextMenu={(e) => handleNodeRightClick(e, node)}
                  />
                )}
                
                <Text
                  x={node.x}
                  y={node.y + node.height / 2 - node.fontSize / 2}
                  width={node.width}
                  height={node.height}
                  text={node.text}
                  fontSize={node.fontSize}
                  fontFamily="Arial"
                  fill={node.textColor}
                  align="center"
                  verticalAlign="middle"
                  wrap="word"
                  ellipsis={true}
                />
              </React.Fragment>
            ))}
          </Layer>
        </Stage>

        {/* Add Node FAB */}
        <Fab
          color="primary"
          sx={{ position: 'absolute', bottom: 16, right: 16 }}
          onClick={() => handleAddNode()}
        >
          <Add />
        </Fab>
      </Box>

      {/* Context Menu */}
      {nodeContextMenu && (
        <Paper
          sx={{
            position: 'absolute',
            left: nodeContextMenu.x,
            top: nodeContextMenu.y,
            zIndex: 1000
          }}
        >
          <MenuItem onClick={() => handleAddNode(nodeContextMenu.node.id)}>
            <Add sx={{ mr: 1 }} /> Add Child Node
          </MenuItem>
          <MenuItem onClick={() => handleNodeDoubleClick(nodeContextMenu.node)}>
            <Edit sx={{ mr: 1 }} /> Edit
          </MenuItem>
          {nodeContextMenu.node.id !== mindMap?.centerNode && (
            <MenuItem 
              onClick={() => handleDeleteNode(nodeContextMenu.node.id)}
              sx={{ color: 'error.main' }}
            >
              <Delete sx={{ mr: 1 }} /> Delete
            </MenuItem>
          )}
        </Paper>
      )}

      {/* Node Edit Dialog */}
      <Dialog open={nodeDialog} onClose={() => setNodeDialog(false)}>
        <DialogTitle>Edit Node</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Node Text"
            fullWidth
            variant="outlined"
            value={newNodeText}
            onChange={(e) => setNewNodeText(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNodeDialog(false)}>Cancel</Button>
          <Button onClick={handleUpdateNode} variant="contained">
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* AI Suggestions Dialog */}
      <Dialog open={showAiDialog} onClose={() => setShowAiDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>AI Suggestions</DialogTitle>
        <DialogContent>
          {aiSuggestions.map((suggestion, index) => (
            <Box key={index} sx={{ mb: 2 }}>
              <Chip
                icon={<Psychology />}
                label={`${Math.round(suggestion.confidence * 100)}% confidence`}
                size="small"
                sx={{ mb: 1 }}
              />
              <Typography variant="body1" gutterBottom>
                {suggestion.text}
              </Typography>
              <Button
                size="small"
                onClick={() => handleApplyAISuggestion(suggestion)}
                variant="outlined"
              >
                Apply Suggestion
              </Button>
            </Box>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAiDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={shareDialog} onClose={() => setShareDialog(false)}>
        <DialogTitle>Share Mind Map</DialogTitle>
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

export default MindMap;

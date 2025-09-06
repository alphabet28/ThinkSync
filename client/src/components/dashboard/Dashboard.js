import React, { useState, useEffect, useContext } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  AppBar,
  Toolbar
} from '@mui/material';
import {
  Add,
  Dashboard as DashboardIcon,
  Psychology,
  MoreVert,
  Edit,
  Delete,
  Share,
  Public,
  Lock,
  AccountCircle,
  Logout
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import axios from 'axios';

const Dashboard = () => {
  const [boards, setBoards] = useState([]);
  const [mindMaps, setMindMaps] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('board'); // 'board' or 'mindmap'
  const [newItem, setNewItem] = useState({
    title: '',
    description: '',
    isPublic: false,
    tags: []
  });
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [profileMenuAnchor, setProfileMenuAnchor] = useState(null);

  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const [boardsRes, mindMapsRes] = await Promise.all([
        axios.get('/boards'),
        axios.get('/mindmaps')
      ]);
      setBoards(boardsRes.data.boards);
      setMindMaps(mindMapsRes.data.mindMaps);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const handleCreateItem = async () => {
    try {
      const endpoint = dialogType === 'board' ? '/boards' : '/mindmaps';
      const response = await axios.post(endpoint, newItem);
      
      if (dialogType === 'board') {
        setBoards(prev => [response.data.board, ...prev]);
      } else {
        setMindMaps(prev => [response.data.mindMap, ...prev]);
      }

      setOpenDialog(false);
      setNewItem({ title: '', description: '', isPublic: false, tags: [] });
    } catch (error) {
      console.error('Error creating item:', error);
    }
  };

  const handleDeleteItem = async () => {
    try {
      const isBoard = selectedItem.type === 'board';
      const endpoint = isBoard ? `/boards/${selectedItem.id}` : `/mindmaps/${selectedItem.id}`;
      
      await axios.delete(endpoint);
      
      if (isBoard) {
        setBoards(prev => prev.filter(board => board._id !== selectedItem.id));
      } else {
        setMindMaps(prev => prev.filter(map => map._id !== selectedItem.id));
      }

      setAnchorEl(null);
      setSelectedItem(null);
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const handleOpenItem = (item, type) => {
    const route = type === 'board' ? '/board' : '/mindmap';
    navigate(`${route}/${item._id}`);
  };

  const handleMenuClick = (event, item, type) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedItem({ ...item, type, id: item._id });
  };

  const handleProfileMenuOpen = (event) => {
    setProfileMenuAnchor(event.currentTarget);
  };

  const handleLogout = () => {
    logout();
    setProfileMenuAnchor(null);
  };

  const ItemCard = ({ item, type, icon }) => (
    <Card
      sx={{
        height: '100%',
        cursor: 'pointer',
        '&:hover': { boxShadow: 6 },
        transition: 'box-shadow 0.3s'
      }}
      onClick={() => handleOpenItem(item, type)}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box display="flex" alignItems="center" mb={1}>
            {icon}
            <Typography variant="h6" component="h3" ml={1} noWrap>
              {item.title}
            </Typography>
          </Box>
          <IconButton
            size="small"
            onClick={(e) => handleMenuClick(e, item, type)}
          >
            <MoreVert />
          </IconButton>
        </Box>
        
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {item.description || 'No description'}
        </Typography>

        <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
          <Typography variant="caption" color="text.secondary">
            Modified: {new Date(item.lastModified).toLocaleDateString()}
          </Typography>
          {item.isPublic ? <Public fontSize="small" /> : <Lock fontSize="small" />}
        </Box>

        {item.tags && item.tags.length > 0 && (
          <Box mt={1}>
            {item.tags.slice(0, 3).map((tag, index) => (
              <Chip key={index} label={tag} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
            ))}
            {item.tags.length > 3 && <Chip label={`+${item.tags.length - 3}`} size="small" />}
          </Box>
        )}
      </CardContent>
    </Card>
  );

  return (
    <>
      <AppBar position="static" sx={{ mb: 4 }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            ThinkSync Dashboard
          </Typography>
          <IconButton color="inherit" onClick={handleProfileMenuOpen}>
            <Avatar sx={{ width: 32, height: 32 }}>
              {user?.username?.charAt(0).toUpperCase()}
            </Avatar>
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg">
        <Box mb={4}>
          <Typography variant="h4" gutterBottom>
            Welcome back, {user?.username}!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Continue your creative work or start something new
          </Typography>
        </Box>

        {/* Boards Section */}
        <Box mb={4}>
          <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <DashboardIcon sx={{ mr: 1 }} />
            Whiteboards ({boards.length})
          </Typography>
          <Grid container spacing={3}>
            {boards.map((board) => (
              <Grid item xs={12} sm={6} md={4} key={board._id}>
                <ItemCard
                  item={board}
                  type="board"
                  icon={<DashboardIcon color="primary" />}
                />
              </Grid>
            ))}
            <Grid item xs={12} sm={6} md={4}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  border: '2px dashed #ccc',
                  '&:hover': { borderColor: 'primary.main' }
                }}
                onClick={() => {
                  setDialogType('board');
                  setOpenDialog(true);
                }}
              >
                <Box textAlign="center">
                  <Add sx={{ fontSize: 48, color: 'text.secondary' }} />
                  <Typography variant="h6" color="text.secondary">
                    Create Whiteboard
                  </Typography>
                </Box>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* Mind Maps Section */}
        <Box mb={4}>
          <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <Psychology sx={{ mr: 1 }} />
            Mind Maps ({mindMaps.length})
          </Typography>
          <Grid container spacing={3}>
            {mindMaps.map((mindMap) => (
              <Grid item xs={12} sm={6} md={4} key={mindMap._id}>
                <ItemCard
                  item={mindMap}
                  type="mindmap"
                  icon={<Psychology color="secondary" />}
                />
              </Grid>
            ))}
            <Grid item xs={12} sm={6} md={4}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  border: '2px dashed #ccc',
                  '&:hover': { borderColor: 'secondary.main' }
                }}
                onClick={() => {
                  setDialogType('mindmap');
                  setOpenDialog(true);
                }}
              >
                <Box textAlign="center">
                  <Add sx={{ fontSize: 48, color: 'text.secondary' }} />
                  <Typography variant="h6" color="text.secondary">
                    Create Mind Map
                  </Typography>
                </Box>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* Action Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
        >
          <MenuItem onClick={() => console.log('Edit')}>
            <Edit sx={{ mr: 1 }} /> Edit
          </MenuItem>
          <MenuItem onClick={() => console.log('Share')}>
            <Share sx={{ mr: 1 }} /> Share
          </MenuItem>
          <MenuItem onClick={handleDeleteItem} sx={{ color: 'error.main' }}>
            <Delete sx={{ mr: 1 }} /> Delete
          </MenuItem>
        </Menu>

        {/* Profile Menu */}
        <Menu
          anchorEl={profileMenuAnchor}
          open={Boolean(profileMenuAnchor)}
          onClose={() => setProfileMenuAnchor(null)}
        >
          <MenuItem onClick={() => setProfileMenuAnchor(null)}>
            <AccountCircle sx={{ mr: 1 }} /> Profile
          </MenuItem>
          <MenuItem onClick={handleLogout}>
            <Logout sx={{ mr: 1 }} /> Logout
          </MenuItem>
        </Menu>

        {/* Create Dialog */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            Create New {dialogType === 'board' ? 'Whiteboard' : 'Mind Map'}
          </DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Title"
              fullWidth
              variant="outlined"
              value={newItem.title}
              onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              label="Description (optional)"
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              value={newItem.description}
              onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateItem} variant="contained" disabled={!newItem.title.trim()}>
              Create
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
};

export default Dashboard;

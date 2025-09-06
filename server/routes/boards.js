const express = require('express');
const Board = require('../models/Board');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all boards for user
router.get('/', auth, async (req, res) => {
  try {
    const boards = await Board.find({
      $or: [
        { owner: req.userId },
        { 'collaborators.user': req.userId }
      ]
    }).populate('owner', 'username avatar')
      .populate('collaborators.user', 'username avatar')
      .sort({ lastModified: -1 });

    res.json({ boards });
  } catch (error) {
    console.error('Get boards error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get specific board
router.get('/:id', auth, async (req, res) => {
  try {
    const board = await Board.findOne({
      _id: req.params.id,
      $or: [
        { owner: req.userId },
        { 'collaborators.user': req.userId },
        { isPublic: true }
      ]
    }).populate('owner', 'username avatar')
      .populate('collaborators.user', 'username avatar');

    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    res.json({ board });
  } catch (error) {
    console.error('Get board error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new board
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, isPublic, tags } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const board = new Board({
      title,
      description,
      owner: req.userId,
      isPublic: isPublic || false,
      tags: tags || []
    });

    await board.save();
    await board.populate('owner', 'username avatar');

    res.status(201).json({ 
      message: 'Board created successfully',
      board 
    });
  } catch (error) {
    console.error('Create board error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update board
router.put('/:id', auth, async (req, res) => {
  try {
    console.log('Board update request received:');
    console.log('Board ID:', req.params.id);
    console.log('User ID:', req.userId);
    console.log('Request body keys:', Object.keys(req.body));
    
    const { title, description, isPublic, tags, canvasData, content } = req.body;

    const board = await Board.findOne({
      _id: req.params.id,
      $or: [
        { owner: req.userId },
        { 'collaborators.user': req.userId, 'collaborators.permission': { $in: ['write', 'admin'] } }
      ]
    });

    if (!board) {
      console.log('Board not found or no permission');
      return res.status(404).json({ message: 'Board not found or no permission' });
    }

    console.log('Board found, updating...');
    if (title) board.title = title;
    if (description !== undefined) board.description = description;
    if (isPublic !== undefined) board.isPublic = isPublic;
    if (tags) board.tags = tags;
    if (canvasData) {
      board.canvasData = canvasData;
      console.log('Canvas data updated, length:', canvasData.length);
    }
    if (content) board.content = content;

    board.lastModified = new Date();
    await board.save();
    console.log('Board saved successfully');
    
    await board.populate('owner', 'username avatar');
    await board.populate('collaborators.user', 'username avatar');

    res.json({
      message: 'Board updated successfully',
      board
    });
  } catch (error) {
    console.error('Update board error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete board
router.delete('/:id', auth, async (req, res) => {
  try {
    const board = await Board.findOne({
      _id: req.params.id,
      owner: req.userId
    });

    if (!board) {
      return res.status(404).json({ message: 'Board not found or no permission' });
    }

    await Board.findByIdAndDelete(req.params.id);

    res.json({ message: 'Board deleted successfully' });
  } catch (error) {
    console.error('Delete board error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add collaborator
router.post('/:id/collaborators', auth, async (req, res) => {
  try {
    const { email, permission } = req.body;

    const board = await Board.findOne({
      _id: req.params.id,
      owner: req.userId
    });

    if (!board) {
      return res.status(404).json({ message: 'Board not found or no permission' });
    }

    const User = require('../models/User');
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already a collaborator
    const existingCollaborator = board.collaborators.find(
      collab => collab.user.toString() === user._id.toString()
    );

    if (existingCollaborator) {
      return res.status(400).json({ message: 'User is already a collaborator' });
    }

    board.collaborators.push({
      user: user._id,
      permission: permission || 'write'
    });

    await board.save();
    await board.populate('collaborators.user', 'username avatar');

    res.json({
      message: 'Collaborator added successfully',
      board
    });
  } catch (error) {
    console.error('Add collaborator error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

const express = require('express');
const MindMap = require('../models/MindMap');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all mind maps for user
router.get('/', auth, async (req, res) => {
  try {
    const mindMaps = await MindMap.find({
      $or: [
        { owner: req.userId },
        { 'collaborators.user': req.userId }
      ]
    }).populate('owner', 'username avatar')
      .populate('collaborators.user', 'username avatar')
      .sort({ lastModified: -1 });

    res.json({ mindMaps });
  } catch (error) {
    console.error('Get mind maps error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get specific mind map
router.get('/:id', auth, async (req, res) => {
  try {
    const mindMap = await MindMap.findOne({
      _id: req.params.id,
      $or: [
        { owner: req.userId },
        { 'collaborators.user': req.userId },
        { isPublic: true }
      ]
    }).populate('owner', 'username avatar')
      .populate('collaborators.user', 'username avatar');

    if (!mindMap) {
      return res.status(404).json({ message: 'Mind map not found' });
    }

    res.json({ mindMap });
  } catch (error) {
    console.error('Get mind map error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new mind map
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, isPublic, tags } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    // Create center node
    const centerNodeId = 'center-' + Date.now();
    const centerNode = {
      id: centerNodeId,
      text: title,
      x: 400,
      y: 300,
      width: 200,
      height: 100,
      backgroundColor: '#e3f2fd',
      borderColor: '#2196f3',
      shape: 'circle',
      fontSize: 18
    };

    const mindMap = new MindMap({
      title,
      description,
      owner: req.userId,
      isPublic: isPublic || false,
      tags: tags || [],
      nodes: [centerNode],
      connections: [],
      centerNode: centerNodeId
    });

    await mindMap.save();
    await mindMap.populate('owner', 'username avatar');

    res.status(201).json({ 
      message: 'Mind map created successfully',
      mindMap 
    });
  } catch (error) {
    console.error('Create mind map error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update mind map
router.put('/:id', auth, async (req, res) => {
  try {
    console.log('Mind map update request received:');
    console.log('Mind map ID:', req.params.id);
    console.log('User ID:', req.userId);
    console.log('Request body keys:', Object.keys(req.body));
    
    const { title, description, isPublic, tags, nodes, connections } = req.body;

    const mindMap = await MindMap.findOne({
      _id: req.params.id,
      $or: [
        { owner: req.userId },
        { 'collaborators.user': req.userId, 'collaborators.permission': { $in: ['write', 'admin'] } }
      ]
    });

    if (!mindMap) {
      console.log('Mind map not found or no permission');
      return res.status(404).json({ message: 'Mind map not found or no permission' });
    }

    console.log('Mind map found, updating...');
    if (title) mindMap.title = title;
    if (description !== undefined) mindMap.description = description;
    if (isPublic !== undefined) mindMap.isPublic = isPublic;
    if (tags) mindMap.tags = tags;
    if (nodes) {
      mindMap.nodes = nodes;
      console.log('Nodes updated, count:', nodes.length);
    }
    if (connections) {
      mindMap.connections = connections;
      console.log('Connections updated, count:', connections.length);
    }

    mindMap.lastModified = new Date();
    await mindMap.save();
    console.log('Mind map saved successfully');
    
    await mindMap.populate('owner', 'username avatar');
    await mindMap.populate('collaborators.user', 'username avatar');

    res.json({
      message: 'Mind map updated successfully',
      mindMap
    });
  } catch (error) {
    console.error('Update mind map error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete mind map
router.delete('/:id', auth, async (req, res) => {
  try {
    const mindMap = await MindMap.findOne({
      _id: req.params.id,
      owner: req.userId
    });

    if (!mindMap) {
      return res.status(404).json({ message: 'Mind map not found or no permission' });
    }

    await MindMap.findByIdAndDelete(req.params.id);

    res.json({ message: 'Mind map deleted successfully' });
  } catch (error) {
    console.error('Delete mind map error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Generate AI suggestions
router.post('/:id/ai-suggestions', auth, async (req, res) => {
  try {
    const mindMap = await MindMap.findOne({
      _id: req.params.id,
      $or: [
        { owner: req.userId },
        { 'collaborators.user': req.userId }
      ]
    });

    if (!mindMap) {
      return res.status(404).json({ message: 'Mind map not found' });
    }

    // Simple AI suggestion logic (can be enhanced with actual AI API)
    const suggestions = generateAISuggestions(mindMap.nodes, mindMap.title);

    mindMap.aiSuggestions = suggestions;
    await mindMap.save();

    res.json({
      message: 'AI suggestions generated',
      suggestions
    });
  } catch (error) {
    console.error('Generate AI suggestions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to generate AI suggestions
function generateAISuggestions(nodes, title) {
  const suggestions = [];
  
  // Analyze existing nodes and suggest related concepts
  const nodeTexts = nodes.map(node => node.text.toLowerCase());
  
  // Example suggestions based on title and existing nodes
  if (title.toLowerCase().includes('business')) {
    suggestions.push({
      text: 'Revenue Streams',
      type: 'node',
      confidence: 0.8
    });
    suggestions.push({
      text: 'Target Audience',
      type: 'node',
      confidence: 0.85
    });
  }
  
  if (title.toLowerCase().includes('project')) {
    suggestions.push({
      text: 'Timeline',
      type: 'node',
      confidence: 0.9
    });
    suggestions.push({
      text: 'Resources',
      type: 'node',
      confidence: 0.8
    });
  }
  
  // Suggest connections if nodes seem related
  if (nodeTexts.includes('problem') && nodeTexts.includes('solution')) {
    suggestions.push({
      text: 'Connect Problem to Solution',
      type: 'connection',
      confidence: 0.95
    });
  }
  
  return suggestions.slice(0, 5); // Return top 5 suggestions
}

module.exports = router;

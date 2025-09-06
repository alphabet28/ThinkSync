const mongoose = require('mongoose');

const NodeSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true,
    trim: true
  },
  x: {
    type: Number,
    required: true
  },
  y: {
    type: Number,
    required: true
  },
  width: {
    type: Number,
    default: 150
  },
  height: {
    type: Number,
    default: 80
  },
  backgroundColor: {
    type: String,
    default: '#ffffff'
  },
  textColor: {
    type: String,
    default: '#000000'
  },
  borderColor: {
    type: String,
    default: '#cccccc'
  },
  shape: {
    type: String,
    enum: ['rectangle', 'circle', 'diamond', 'triangle'],
    default: 'rectangle'
  },
  fontSize: {
    type: Number,
    default: 14
  },
  parentId: {
    type: String,
    default: null
  },
  children: [{
    type: String
  }]
});

const ConnectionSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  from: {
    type: String,
    required: true
  },
  to: {
    type: String,
    required: true
  },
  color: {
    type: String,
    default: '#000000'
  },
  thickness: {
    type: Number,
    default: 2
  },
  style: {
    type: String,
    enum: ['solid', 'dashed', 'dotted'],
    default: 'solid'
  }
});

const MindMapSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  collaborators: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    permission: {
      type: String,
      enum: ['read', 'write', 'admin'],
      default: 'write'
    }
  }],
  nodes: [NodeSchema],
  connections: [ConnectionSchema],
  centerNode: {
    type: String,
    required: true
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true
  }],
  aiSuggestions: [{
    text: String,
    type: {
      type: String,
      enum: ['node', 'connection', 'improvement']
    },
    confidence: Number,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  lastModified: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Update lastModified on save
MindMapSchema.pre('save', function(next) {
  this.lastModified = new Date();
  next();
});

module.exports = mongoose.model('MindMap', MindMapSchema);

/**
 * Match Result model - stores CV-job comparison results
 * @module models/matchResultModel
 */

const mongoose = require('mongoose');

const matchResultSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  jobId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Job', 
    required: true 
  },
  score: { 
    type: Number, 
    required: true, 
    min: 0, 
    max: 100 
  },
  canApply: { 
    type: Boolean, 
    required: true 
  },
  reasons: [{ 
    type: String 
  }],
  matchesThreshold: { 
    type: Boolean, 
    required: true 
  },
  comparedAt: { 
    type: Date, 
    default: Date.now 
  },
  // Hash to detect if CV or Job changed
  cvHash: { 
    type: String, 
    required: true 
  },
  jobHash: { 
    type: String, 
    required: true 
  }
}, { 
  timestamps: true 
});

// Compound index for efficient lookups
matchResultSchema.index({ userId: 1, jobId: 1 });
matchResultSchema.index({ comparedAt: 1 });
matchResultSchema.index({ matchesThreshold: 1, score: -1 });

module.exports = mongoose.model('MatchResult', matchResultSchema);
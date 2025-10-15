// models/EmergencyEvent.js
const mongoose = require('mongoose');

const EmergencySchema = new mongoose.Schema({
  // Basic Emergency Info
  emergencyType: {
    type: String,
    required: true,
    enum: ['medical', 'fire', 'police', 'natural_disaster', 'accident', 'other'],
    index: true
  },
  status: {
    type: String,
    required: true,
    enum: ['active', 'resolved', 'cancelled', 'escalated'],
    default: 'active'
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },

  // User Reference
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // Location Data
  location: {
    coordinates: {
      type: [Number], // [longitude, latitude]
      index: '2dsphere'
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },

  // AI Analysis Results
  aiAnalysis: {
    confidenceScore: Number,
    detectedEmergencyType: String,
    riskAssessment: String,
    reasoning: String,
    timestamp: Date
  },

  // Instructions Array
  instructions: [{
    stepNumber: Number,
    title: String,
    description: String,
    estimatedTime: Number, // in seconds
    completed: {
      type: Boolean,
      default: false
    },
    completedAt: Date,
    aiGenerated: {
      type: Boolean,
      default: true
    }
  }],

  // Notifications Tracking
  notifications: [{
    contactId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contact'
    },
    method: {
      type: String,
      enum: ['sms', 'push', 'email']
    },
    sentAt: Date,
    status: {
      type: String,
      enum: ['sent', 'delivered', 'failed', 'pending']
    },
    retryCount: {
      type: Number,
      default: 0
    }
  }],

  // Resolution Data
  resolvedAt: Date,
  resolutionNotes: String,
  responseTime: Number // in seconds

}, {
  timestamps: true
});

// Index for geospatial queries and performance
EmergencySchema.index({ userId: 1, createdAt: -1 });
EmergencySchema.index({ status: 1, emergencyType: 1 });

module.exports = mongoose.model('EmergencyEvent', EmergencySchema);
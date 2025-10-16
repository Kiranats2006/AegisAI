const mongoose = require('mongoose');

const EmergencyServiceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['hospital', 'police', 'fire'], required: true },
  contact: { type: String },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true } // [lng, lat]
  }
});

EmergencyServiceSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('EmergencyService', EmergencyServiceSchema);

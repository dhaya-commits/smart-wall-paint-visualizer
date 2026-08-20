const mongoose = require('mongoose');

const patternSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  category: String, // 'Floral', 'Geometric', etc
  imageUrl: String,
  scalingInfo: Object,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Pattern', patternSchema);
const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  originalImageUrl: { type: String, required: true },
  wallSelection: { type: Object }, // Stores canvas coordinates/polygon data
  appliedColor: { type: mongoose.Schema.Types.ObjectId, ref: 'Color' },
  appliedPattern: { type: mongoose.Schema.Types.ObjectId, ref: 'Pattern' },
  colorSettings: {
    hexCode: String,
    opacity: { type: Number, default: 1 },
    finish: { type: String, enum: ['matte', 'glossy', 'satin'], default: 'matte' }
  },
  previewImageUrl: String,
  savedImageUrl: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Project', projectSchema);
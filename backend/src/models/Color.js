const mongoose = require('mongoose');

const colorSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  hexCode: { type: String, required: true },
  rgbCode: String,
  brand: String,
  finish: [{ type: String }], // ['matte', 'glossy', 'satin']
  category: [String], // ['Living Room', 'Bedroom', 'Accent']
  imageUrl: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Color', colorSchema);
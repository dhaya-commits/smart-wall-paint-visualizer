const express = require('express');
const Project = require('../models/Project');
const { auth } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Get all projects for logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const projects = await Project.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Upload image and create a new project
router.post('/upload', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    const imageUrl = `/uploads/${req.file.filename}`;
    
    const project = new Project({
      userId: req.user.userId,
      name: req.body.name || 'Untitled Room',
      originalImageUrl: imageUrl,
    });

    await project.save();
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a specific project
router.get('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, userId: req.user.userId }).populate('appliedColor');
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Save design (update project with wall selection and color)
router.put('/:id/save', auth, async (req, res) => {
  try {
    const { wallSelection, colorSettings, appliedColor, previewImageUrl } = req.body;
    
    const project = await Project.findOne({ _id: req.params.id, userId: req.user.userId });
    if (!project) return res.status(404).json({ error: 'Project not found' });

    if (wallSelection) project.wallSelection = wallSelection;
    if (colorSettings) project.colorSettings = colorSettings;
    if (appliedColor) project.appliedColor = appliedColor;
    if (previewImageUrl) project.previewImageUrl = previewImageUrl;
    project.updatedAt = Date.now();

    await project.save();
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

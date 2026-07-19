const { generateProductivitySummary, handleChatAssistant } = require('../services/aiService');
const Task = require('../models/Task');
const User = require('../models/User');

// @desc    Get AI Productivity Summary
// @route   GET /api/ai/summary
// @access  Private
const getProductivitySummary = async (req, res) => {
  try {
    let tasks;
    if (req.user.role === 'admin') {
      tasks = await Task.find({});
    } else {
      tasks = await Task.find({ assignedTo: req.user._id });
    }

    // Prepare stats for AI
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'Completed').length;
    const pendingTasks = totalTasks - completedTasks;
    const delayedTasks = tasks.filter(t => t.status !== 'Completed' && new Date(t.deadline) < new Date()).length;
    const completionRate = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

    const stats = {
      totalTasks,
      completedTasks,
      pendingTasks,
      delayedTasks,
      completionRate,
      role: req.user.role,
    };

    const summary = await generateProductivitySummary(stats);
    res.json({ summary });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Chat with AI Assistant
// @route   POST /api/ai/chat
// @access  Private
const chatWithAssistant = async (req, res) => {
  try {
    const { question } = req.body;
    
    // Get user's tasks to provide context to the AI
    const userTasks = await Task.find({ assignedTo: req.user._id }).select('title priority status deadline estimatedDuration actualDuration');
    
    const answer = await handleChatAssistant(question, userTasks);
    res.json({ answer });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProductivitySummary,
  chatWithAssistant,
};

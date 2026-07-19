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

    const activeTasksList = tasks
      .filter(t => t.status !== 'Completed')
      .map(t => ({
        title: t.title,
        description: t.description || 'No detailed parameters supplied.',
        deadline: t.deadline,
        priority: t.priority
      }));

    const stats = {
      totalTasks,
      completedTasks,
      pendingTasks,
      delayedTasks,
      completionRate,
      role: req.user.role,
      activeTasksList
    };

    const summary = await generateProductivitySummary(stats);

    const quotes = [
      { text: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
      { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
      { text: "Quality means doing it right when no one is looking.", author: "Henry Ford" },
      { text: "Action is the foundational key to all success.", author: "Pablo Picasso" },
      { text: "Your limit is only your imagination.", author: "Unknown" },
      { text: "Push yourself, because no one else is going to do it for you.", author: "Unknown" },
      { text: "Great things never come from comfort zones.", author: "Unknown" }
    ];
    const motivationQuote = quotes[Math.round((new Date().getDate() * 7) % quotes.length)];

    res.json({ summary, motivationQuote });
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

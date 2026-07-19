const Task = require('../models/Task');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const dayjs = require('dayjs');

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private (Admin or Member creating their own)
const createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      assignedTo,
      category,
      priority,
      startDate,
      deadline,
      estimatedDuration,
      isRecurring,
      recurrence,
      recurrenceValue,
      attachmentUrl,
    } = req.body;

    // Enforce authorization check: members can only assign tasks to themselves
    const finalAssignedTo = req.user.role === 'admin' ? assignedTo : [req.user._id];

    const task = await Task.create({
      title,
      description,
      assignedTo: finalAssignedTo,
      category,
      priority,
      startDate,
      deadline,
      estimatedDuration,
      isRecurring,
      recurrence,
      recurrenceValue,
      attachmentUrl,
      createdBy: req.user._id,
    });

    const assignedUsers = await User.find({ _id: { $in: assignedTo } });

    if (assignedUsers && assignedUsers.length > 0) {
      // Send Email Notification to all assigned users
      const emailHtml = `
        <h3>A new task has been assigned to you.</h3>
        <p><strong>Task:</strong> ${title}</p>
        <p><strong>Deadline:</strong> ${dayjs(deadline).format('DD MMMM YYYY')}</p>
        <p><strong>Priority:</strong> ${priority}</p>
        <p>Please check your dashboard.</p>
      `;

      assignedUsers.forEach(user => {
        sendEmail({
          email: user.email,
          subject: 'New Task Assigned: ' + title,
          html: emailHtml,
        });
      });
    }

    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all tasks (Admin) or user tasks (Member)
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res) => {
  try {
    let tasks;
    if (req.user.role === 'admin') {
      tasks = await Task.find({}).populate('assignedTo', 'name email profilePicture').sort({ createdAt: -1 });
    } else {
      tasks = await Task.find({ assignedTo: req.user._id }).populate('assignedTo', 'name email profilePicture').sort({ createdAt: -1 });
    }
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get task by ID
// @route   GET /api/tasks/:id
// @access  Private
const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate('assignedTo', 'name email profilePicture');

    if (task) {
      // Check if user is admin or one of the assigned members
      if (req.user.role !== 'admin' && !task.assignedTo.some(user => user._id.toString() === req.user._id.toString())) {
        return res.status(403).json({ message: 'Not authorized to view this task' });
      }
      res.json(task);
    } else {
      res.status(404).json({ message: 'Task not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update task (status, actual duration, etc.)
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (task) {
      // Members can only update their own tasks
      if (req.user.role !== 'admin' && !task.assignedTo.some(id => id.toString() === req.user._id.toString())) {
        return res.status(403).json({ message: 'Not authorized to update this task' });
      }

      task.title = req.body.title || task.title;
      task.description = req.body.description || task.description;
      task.priority = req.body.priority || task.priority;
      task.status = req.body.status || task.status;
      task.actualDuration = req.body.actualDuration !== undefined ? req.body.actualDuration : task.actualDuration;
      
      // Admin only updates
      if (req.user.role === 'admin') {
        task.assignedTo = req.body.assignedTo || task.assignedTo;
        task.deadline = req.body.deadline || task.deadline;
        task.startDate = req.body.startDate || task.startDate;
        task.estimatedDuration = req.body.estimatedDuration || task.estimatedDuration;
      }

      const updatedTask = await task.save();
      res.json(updatedTask);
    } else {
      res.status(404).json({ message: 'Task not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private/Admin
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (task) {
      await task.deleteOne();
      res.json({ message: 'Task removed' });
    } else {
      res.status(404).json({ message: 'Task not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
};

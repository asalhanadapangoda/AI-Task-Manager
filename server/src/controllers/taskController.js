const Task = require('../models/Task');
const User = require('../models/User');
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

    const finalIsRecurring = isRecurring || (recurrence && recurrence !== 'None');

    const task = await Task.create({
      title,
      description: description || 'No detailed parameters supplied.',
      assignedTo: finalAssignedTo,
      category,
      priority,
      startDate: startDate || new Date(),
      deadline,
      estimatedDuration,
      isRecurring: finalIsRecurring,
      recurrence: recurrence || 'None',
      recurrenceValue: recurrenceValue || '',
      attachmentUrl,
      createdBy: req.user._id,
    });

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

const getPublicSchedule = async (req, res) => {
  try {
    const users = await User.find({ email: { $ne: 'admin@example.com' } }, 'name');
    const tasks = await Task.find({ status: { $ne: 'Completed' } }).populate('assignedTo', 'name');

    const totalTasks = await Task.countDocuments({});
    const completedTasks = await Task.countDocuments({ status: 'Completed' });
    const activeTasks = await Task.countDocuments({ status: { $ne: 'Completed' } });

    // Resolution rate calculation
    const resolutionRate = totalTasks > 0 
      ? ((completedTasks / totalTasks) * 100).toFixed(1) + '%' 
      : '100%';

    // Generate dynamic synthesis
    let synthesis = 'All system nodes running within normal load parameters.';
    const highPriorityCount = await Task.countDocuments({ priority: 'High', status: { $ne: 'Completed' } });
    if (highPriorityCount > 0) {
      synthesis = `Warning: ${highPriorityCount} high priority deployment${highPriorityCount > 1 ? 's' : ''} pending. Allocate additional support to balance load thresholds.`;
    } else if (activeTasks === 0) {
      synthesis = 'No active task workloads queued. System standing by.';
    }

    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    const schedule = users.map(user => {
      const userTasks = tasks.filter(task => 
        task.assignedTo && task.assignedTo.some(assignedUser => assignedUser._id.toString() === user._id.toString())
      );

      const weekSchedule = {
        _id: user._id,
        name: user.name,
        Monday: [],
        Tuesday: [],
        Wednesday: [],
        Thursday: [],
        Friday: [],
        Saturday: [],
        Sunday: []
      };

      userTasks.forEach(task => {
        const day = daysOfWeek[new Date(task.deadline).getDay()];
        if (weekSchedule[day]) {
          weekSchedule[day].push({
            _id: task._id,
            title: task.title,
            priority: task.priority
          });
        }
      });

      return weekSchedule;
    });

    res.json({
      metrics: {
        activeTasks,
        resolutionRate,
        synthesis
      },
      schedule
    });
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
  getPublicSchedule,
};

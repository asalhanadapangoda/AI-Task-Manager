const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    assignedTo: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    }],
    category: {
      type: String,
      default: 'General',
    },
    priority: {
      type: String,
      enum: ['High', 'Medium', 'Low'],
      default: 'Medium',
    },
    status: {
      type: String,
      enum: ['Not Started', 'In Progress', 'Review', 'Completed'],
      default: 'Not Started',
    },
    startDate: {
      type: Date,
      required: true,
    },
    deadline: {
      type: Date,
      required: true,
    },
    estimatedDuration: {
      type: Number, // in hours
      required: true,
    },
    actualDuration: {
      type: Number, // in hours
      default: 0,
    },
    isRecurring: {
      type: Boolean,
      default: false,
    },
    recurrence: {
      type: String,
      enum: ['None', 'Daily', 'Weekly', 'Monthly', 'Custom'],
      default: 'None',
    },
    recurrenceValue: {
      type: String, // e.g., 'Monday', 'Friday', or specific date depending on the pattern
      default: '',
    },
    attachmentUrl: {
      type: String,
      default: '',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;

const cron = require('node-cron');
const Task = require('../models/Task');
const dayjs = require('dayjs');

// Run every day at midnight (0 0 * * *)
cron.schedule('0 0 * * *', async () => {
  console.log('Running daily cron job to check for recurring tasks...');
  try {
    const today = dayjs();
    
    // Find all recurring tasks that are not completed
    const recurringTasks = await Task.find({ isRecurring: true });

    for (const task of recurringTasks) {
      let shouldCreateNew = false;
      let newStartDate = today;
      let newDeadline = today.add(1, 'day'); // Default deadline

      if (task.recurrence === 'Daily') {
        shouldCreateNew = true;
      } else if (task.recurrence === 'Weekly') {
        // e.g. recurrenceValue = 'Monday'
        const todayDayName = today.format('dddd');
        if (task.recurrenceValue === todayDayName) {
          shouldCreateNew = true;
          newDeadline = today.add(7, 'day');
        }
      } else if (task.recurrence === 'Monthly') {
        // e.g. recurrenceValue = '1' (first day of month)
        if (today.date().toString() === task.recurrenceValue) {
          shouldCreateNew = true;
          newDeadline = today.add(1, 'month');
        }
      }

      if (shouldCreateNew) {
        await Task.create({
          title: task.title,
          description: task.description,
          assignedTo: task.assignedTo,
          category: task.category,
          priority: task.priority,
          estimatedDuration: task.estimatedDuration,
          isRecurring: false, // The new instance is a normal task for that day/week
          startDate: newStartDate.toDate(),
          deadline: newDeadline.toDate(),
          createdBy: task.createdBy,
        });
        console.log(`Created new instance for recurring task: ${task.title}`);
      }
    }
  } catch (error) {
    console.error('Error in cron job:', error);
  }
});

module.exports = cron;

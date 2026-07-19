const express = require('express');
const {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  getPublicSchedule,
} = require('../controllers/taskController');
const { protect, admin } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/public-schedule', getPublicSchedule);

router.route('/').get(protect, getTasks).post(protect, createTask);
router
  .route('/:id')
  .get(protect, getTaskById)
  .put(protect, updateTask)
  .delete(protect, admin, deleteTask);

module.exports = router;

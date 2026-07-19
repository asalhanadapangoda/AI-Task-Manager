const express = require('express');
const { loginUser, createUser, getUsers, deleteUser } = require('../controllers/authController');
const { protect, admin } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/login', loginUser);
router.post('/create', protect, admin, createUser);
router.get('/users', protect, admin, getUsers);
router.delete('/users/:id', protect, admin, deleteUser);

module.exports = router;

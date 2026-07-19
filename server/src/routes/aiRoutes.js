const express = require('express');
const { getProductivitySummary, chatWithAssistant } = require('../controllers/aiController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/summary', protect, getProductivitySummary);
router.post('/chat', protect, chatWithAssistant);

module.exports = router;

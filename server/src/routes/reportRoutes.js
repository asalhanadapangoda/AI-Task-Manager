const express = require('express');
const { downloadPdfReport, downloadExcelReport } = require('../controllers/reportController');
const { protect, admin } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/pdf', protect, downloadPdfReport);
router.get('/excel', protect, downloadExcelReport);

module.exports = router;

const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const Task = require('../models/Task');

// @desc    Download Report as PDF
// @route   GET /api/reports/pdf
// @access  Private/Admin
const downloadPdfReport = async (req, res) => {
  try {
    let tasks;
    if (req.user.role === 'admin') {
      tasks = await Task.find({}).populate('assignedTo', 'name');
    } else {
      tasks = await Task.find({ assignedTo: req.user._id }).populate('assignedTo', 'name');
    }

    const doc = new PDFDocument();
    let filename = encodeURIComponent('Task_Report') + '.pdf';

    res.setHeader('Content-disposition', 'attachment; filename="' + filename + '"');
    res.setHeader('Content-type', 'application/pdf');

    doc.fontSize(20).text('Team Task Performance Report', { align: 'center' });
    doc.moveDown();

    tasks.forEach(task => {
      doc.fontSize(14).text(`Task: ${task.title}`);
      doc.fontSize(12).text(`Assigned To: ${task.assignedTo && task.assignedTo.length > 0 ? task.assignedTo.map(u => u.name).join(', ') : 'Unassigned'}`);
      doc.fontSize(12).text(`Status: ${task.status}`);
      doc.fontSize(12).text(`Estimated Time: ${task.estimatedDuration} hrs`);
      doc.fontSize(12).text(`Actual Time: ${task.actualDuration} hrs`);
      doc.moveDown();
    });

    doc.pipe(res);
    doc.end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Download Report as Excel
// @route   GET /api/reports/excel
// @access  Private/Admin
const downloadExcelReport = async (req, res) => {
  try {
    let tasks;
    if (req.user.role === 'admin') {
      tasks = await Task.find({}).populate('assignedTo', 'name');
    } else {
      tasks = await Task.find({ assignedTo: req.user._id }).populate('assignedTo', 'name');
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Tasks');

    worksheet.columns = [
      { header: 'Task Title', key: 'title', width: 30 },
      { header: 'Assigned To', key: 'assignedTo', width: 20 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Priority', key: 'priority', width: 15 },
      { header: 'Est. Duration (hrs)', key: 'estimated', width: 20 },
      { header: 'Act. Duration (hrs)', key: 'actual', width: 20 },
    ];

    tasks.forEach(task => {
      worksheet.addRow({
        title: task.title,
        assignedTo: task.assignedTo && task.assignedTo.length > 0 ? task.assignedTo.map(u => u.name).join(', ') : 'Unassigned',
        status: task.status,
        priority: task.priority,
        estimated: task.estimatedDuration,
        actual: task.actualDuration,
      });
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=' + 'Task_Report.xlsx'
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  downloadPdfReport,
  downloadExcelReport,
};

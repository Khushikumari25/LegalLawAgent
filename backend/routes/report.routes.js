const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const { protect } = require('../middleware/auth');
const { mongoIdValidation, validate } = require('../middleware/validator');

// All routes are protected
router.use(protect);

// Static routes MUST be defined BEFORE parameterized routes
router.post('/generate', reportController.generateReport);
router.get('/templates/list', reportController.getReportTemplates);

// List all reports
router.get('/', reportController.getAllReports);

// Parameterized routes
router.get('/:id', mongoIdValidation, validate, reportController.getReportById);
router.get('/:id/download', mongoIdValidation, validate, reportController.downloadReport);
router.delete('/:id', mongoIdValidation, validate, reportController.deleteReport);

module.exports = router;

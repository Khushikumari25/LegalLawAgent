const express = require('express');
const router = express.Router();
const caseController = require('../controllers/case.controller');
const { protect, authorize } = require('../middleware/auth');
const { uploadLimiter } = require('../middleware/rateLimiter');
const { caseValidation, mongoIdValidation, paginationValidation, validate } = require('../middleware/validator');
const upload = require('../middleware/upload');

// All routes are protected
router.use(protect);

// Static routes MUST be defined BEFORE parameterized routes
// Case search and filter
router.get('/search', caseController.searchCases);
router.get('/filter', caseController.filterCases);

// Case statistics
router.get('/stats/overview', caseController.getCaseStats);

// Case CRUD operations
router.route('/')
  .get(paginationValidation, validate, caseController.getAllCases)
  .post(uploadLimiter, upload.multiple('documents', 5), caseValidation, validate, caseController.createCase);

router.route('/:id')
  .get(mongoIdValidation, validate, caseController.getCaseById)
  .put(mongoIdValidation, validate, caseController.updateCase)
  .delete(mongoIdValidation, validate, authorize('admin', 'lawyer'), caseController.deleteCase);

// Case document operations
router.post('/:id/documents', mongoIdValidation, validate, uploadLimiter, upload.multiple('documents', 5), caseController.addDocuments);
router.delete('/:id/documents/:documentId', mongoIdValidation, validate, caseController.deleteDocument);

module.exports = router;

const express = require('express');
const router = express.Router();
const analysisController = require('../controllers/analysis.controller');
const { protect } = require('../middleware/auth');
const { mongoIdValidation, mongoCaseIdValidation, validate } = require('../middleware/validator');

// All routes are protected
router.use(protect);

// IPC to BNS mapping - static routes BEFORE parameterized routes
router.get('/ipc-bns/search', analysisController.searchIPCBNSMappings);
router.post('/ipc-bns/bulk', analysisController.bulkIPCToBNSMapping);
router.get('/ipc-bns/:ipcSection', analysisController.getIPCToBNSMapping);

// Case analysis
router.post('/case/:id', mongoIdValidation, validate, analysisController.analyzeCase);
router.get('/case/:id/results', mongoIdValidation, validate, analysisController.getAnalysisResults);

// Petition eligibility
router.post('/petition-eligibility', analysisController.checkPetitionEligibility);
router.get('/petition-eligibility/:caseId', mongoCaseIdValidation, validate, analysisController.getPetitionEligibility);

// Similar cases
router.get('/similar-cases/:id', mongoIdValidation, validate, analysisController.findSimilarCases);

// Legal insights
router.get('/insights/:id', mongoIdValidation, validate, analysisController.getLegalInsights);

module.exports = router;

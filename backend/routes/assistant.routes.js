const express = require('express');
const router = express.Router();
const assistantController = require('../controllers/assistant.controller');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// AI Assistant chat
router.post('/chat', assistantController.chat);
router.get('/chat/history', assistantController.getChatHistory);
router.delete('/chat/history', assistantController.clearChatHistory);

// Suggested prompts
router.get('/suggestions', assistantController.getSuggestedPrompts);

// Context-aware assistance
router.post('/analyze-query', assistantController.analyzeQuery);

module.exports = router;

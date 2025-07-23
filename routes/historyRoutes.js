const express = require('express');
const router = express.Router();
const { addPrompt, getHistory,getPromptById, updatePrompt,
  deletePrompt } = require('../controllers/historyController');

router.post('/', addPrompt);       // POST /api/history
router.get('/', getHistory);
router.get('/:id',getPromptById);       // GET /api/history
router.put('/:id', updatePrompt);     // Edit prompt
router.delete('/:id', deletePrompt);  // Delete prompt

module.exports = router;
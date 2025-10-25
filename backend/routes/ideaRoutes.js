const express = require('express');
const router = express.Router();
const ideaController = require('../controllers/ideaController');
const { protect } = require('../middleware/auth'); // JWT auth middleware

router.get('/public-ideas', protect, (req, res) => ideaController.getPublicIdeas(req, res));
router.get('/my', protect, (req, res) => ideaController.getMyIdeas(req, res));
router.post('/submit', protect, (req, res) => ideaController.submitIdea(req, res));
router.put('/:id', protect, (req, res) => ideaController.editIdea(req, res));
router.delete('/:id', protect, (req, res) => ideaController.deleteIdea(req, res));

module.exports = router;

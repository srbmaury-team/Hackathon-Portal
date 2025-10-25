const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/google-login', authController.googleLogin);

module.exports = router;

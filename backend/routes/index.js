const express = require('express');
const router = express.Router();
const authController = require('../controller/authController');


//register
router.post('/register',authController.register);
//login
router.post('/login', authController.login);

module.exports = router;

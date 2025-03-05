// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/user/:email', authController.getUserByEmail);
router.put('/update-password', authController.updatePassword);
router.delete("/delete-user", authController.deleteUser);

module.exports = router;

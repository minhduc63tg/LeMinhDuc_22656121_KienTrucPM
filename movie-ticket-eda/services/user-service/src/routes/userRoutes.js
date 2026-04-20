// src/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const c = require('../controllers/userController');

router.post('/register', c.register);
router.post('/login', c.login);
router.get('/users', c.getAllUsers);
router.get('/users/:id', c.getUserById);

module.exports = router;

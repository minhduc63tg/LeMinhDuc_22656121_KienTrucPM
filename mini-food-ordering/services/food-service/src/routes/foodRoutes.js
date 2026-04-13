// routes/foodRoutes.js
const express = require('express');
const router = express.Router();
const foodController = require('../controllers/foodController');

router.get('/foods', foodController.getAllFoods);
router.get('/foods/:id', foodController.getFoodById);
router.post('/foods', foodController.createFood);
router.put('/foods/:id', foodController.updateFood);
router.delete('/foods/:id', foodController.deleteFood);

module.exports = router;

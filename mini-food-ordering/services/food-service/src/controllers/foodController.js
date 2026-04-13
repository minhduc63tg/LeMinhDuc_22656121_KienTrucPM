// controllers/foodController.js
const { v4: uuidv4 } = require('uuid');
const { foods } = require('../db');

const getAllFoods = (req, res) => {
  const { category } = req.query;
  const result = category ? foods.filter((f) => f.category === category) : foods;
  return res.json({ success: true, data: result });
};

const getFoodById = (req, res) => {
  const food = foods.find((f) => f.id === req.params.id);
  if (!food) return res.status(404).json({ success: false, message: 'Không tìm thấy món ăn' });
  return res.json({ success: true, data: food });
};

const createFood = (req, res) => {
  const { name, description, price, category, image } = req.body;
  if (!name || !price || !category) {
    return res.status(400).json({ success: false, message: 'Thiếu thông tin bắt buộc' });
  }

  const newFood = {
    id: uuidv4(),
    name,
    description: description || '',
    price: Number(price),
    category,
    image: image || '🍽️',
    available: true,
    createdAt: new Date().toISOString(),
  };

  foods.push(newFood);
  return res.status(201).json({ success: true, message: 'Thêm món ăn thành công', data: newFood });
};

const updateFood = (req, res) => {
  const index = foods.findIndex((f) => f.id === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, message: 'Không tìm thấy món ăn' });

  foods[index] = { ...foods[index], ...req.body, id: foods[index].id };
  return res.json({ success: true, message: 'Cập nhật thành công', data: foods[index] });
};

const deleteFood = (req, res) => {
  const index = foods.findIndex((f) => f.id === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, message: 'Không tìm thấy món ăn' });

  foods.splice(index, 1);
  return res.json({ success: true, message: 'Xóa món ăn thành công' });
};

module.exports = { getAllFoods, getFoodById, createFood, updateFood, deleteFood };

// src/routes/users.js
const express = require('express');
const { pool } = require('../config/db');
const router = express.Router();

// GET /users — list users (HASH partition distributes these rows across 4 partitions)
router.get('/', async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT id, name, email, phone, address, created_at FROM users LIMIT 100');
    res.json({ data: rows, total: rows.length, partitionNote: 'HASH(id) × 4 partitions' });
  } catch (err) { next(err); }
});

// GET /users/:id
router.get('/:id', async (req, res, next) => {
  try {
    // MariaDB prunes to HASH(id) % 4 partition automatically
    const [[user]] = await pool.query(
      'SELECT id, name, email, phone, address, created_at FROM users WHERE id = ?',
      [+req.params.id]);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) { next(err); }
});

// POST /users
router.post('/', async (req, res, next) => {
  try {
    const { name, email, phone, address } = req.body;
    if (!name || !email) return res.status(400).json({ error: 'name and email required' });
    const [result] = await pool.query(
      'INSERT INTO users (name, email, phone, address) VALUES (?, ?, ?, ?)',
      [name, email, phone || null, address || null]);
    res.status(201).json({ id: result.insertId, name, email });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Email already exists' });
    next(err);
  }
});

module.exports = router;

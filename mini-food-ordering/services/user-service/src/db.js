// db.js — In-memory "database" for User Service
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

const users = [
  {
    id: uuidv4(),
    name: 'Admin',
    email: 'admin@food.com',
    password: bcrypt.hashSync('admin123', 8),
    role: 'ADMIN',
    createdAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    name: 'Nguyễn Văn A',
    email: 'user@food.com',
    password: bcrypt.hashSync('user123', 8),
    role: 'USER',
    createdAt: new Date().toISOString(),
  },
];

module.exports = { users };

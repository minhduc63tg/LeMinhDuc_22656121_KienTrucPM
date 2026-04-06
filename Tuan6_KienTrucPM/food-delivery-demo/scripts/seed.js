// scripts/seed.js — Insert demo data
const mysql = require('mysql2/promise');
require('dotenv').config();

async function seed() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'food_delivery',
  });

  // Restaurants
  await conn.query(`INSERT INTO restaurants (name, category, address, rating) VALUES
    ('Phở Hà Nội', 'Vietnamese', '123 Nguyễn Huệ, Q1', 4.8),
    ('Pizza Bella', 'Italian',   '456 Lê Lợi, Q1',    4.5),
    ('Sushi Saigon', 'Japanese', '789 Đồng Khởi, Q1', 4.7)`);

  // Menu items
  await conn.query(`INSERT INTO menu_items (restaurant_id, name, price, category) VALUES
    (1, 'Phở Bò Đặc Biệt', 75000, 'Noodles'),
    (1, 'Bún Bò Huế',       65000, 'Noodles'),
    (2, 'Pizza Margherita', 180000, 'Pizza'),
    (2, 'Pasta Carbonara',  160000, 'Pasta'),
    (3, 'Salmon Sashimi',   220000, 'Sashimi'),
    (3, 'Ramen Tonkotsu',   145000, 'Ramen')`);

  // Users (spread across HASH partitions automatically)
  await conn.query(`INSERT INTO users (name, email, phone, address) VALUES
    ('Nguyễn Văn An', 'an@example.com', '0901234567', 'Q1, HCM'),
    ('Trần Thị Bình', 'binh@example.com','0912345678', 'Q3, HCM'),
    ('Lê Minh Châu',  'chau@example.com','0923456789', 'Q7, HCM')`);

  // Orders across different quarters (to demo partition pruning)
  const now = Math.floor(Date.now() / 1000);
  const q1_2025 = Math.floor(new Date('2025-02-15').getTime() / 1000);
  await conn.query(`INSERT INTO orders (user_id, restaurant_id, status, total_amount, created_ts) VALUES
    (1, 1, 'delivered',  75000, ${q1_2025}),
    (2, 2, 'confirmed', 340000, ${q1_2025}),
    (1, 3, 'pending',   220000, ${now}),
    (3, 1, 'preparing', 140000, ${now})`);

  await conn.query(`INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price) VALUES
    (1, 1, 1, 75000),
    (2, 3, 1, 180000),(2, 4, 1, 160000),
    (3, 5, 1, 220000),
    (4, 1, 1, 75000),(4, 2, 1, 65000)`);

  await conn.end();
  console.log('🌱 Seed data inserted!');
}

seed().catch(e => { console.error(e.message); process.exit(1); });

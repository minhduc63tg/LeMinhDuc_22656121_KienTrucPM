// scripts/setup-db.js
// Creates schema with MariaDB RANGE partitioning on orders (by status/month)
// and HASH partitioning on users (spread load evenly)

const mysql = require('mysql2/promise');
require('dotenv').config();

async function setup() {
  const conn = await mysql.createConnection({
    host:     process.env.DB_HOST     || 'localhost',
    port:     parseInt(process.env.DB_PORT) || 3306,
    user:     process.env.DB_USER     || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true,
  });

  console.log('🚀 Setting up food_delivery database...\n');

  // ── Create DB ──────────────────────────────────────────────────────────────
  await conn.query(`CREATE DATABASE IF NOT EXISTS food_delivery CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await conn.query(`USE food_delivery`);

  // ── Table: restaurants ─────────────────────────────────────────────────────
  await conn.query(`DROP TABLE IF EXISTS restaurants`);
  await conn.query(`
    CREATE TABLE restaurants (
      id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      name        VARCHAR(120) NOT NULL,
      category    VARCHAR(60),
      address     VARCHAR(255),
      rating      DECIMAL(2,1) DEFAULT 0.0,
      is_open     TINYINT(1)   DEFAULT 1,
      created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_category (category),
      INDEX idx_rating   (rating)
    ) ENGINE=InnoDB
  `);
  console.log('✅ Table: restaurants');

  // ── Table: menu_items ──────────────────────────────────────────────────────
  await conn.query(`DROP TABLE IF EXISTS menu_items`);
  await conn.query(`
    CREATE TABLE menu_items (
      id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      restaurant_id   INT UNSIGNED NOT NULL,
      name            VARCHAR(120) NOT NULL,
      description     TEXT,
      price           DECIMAL(10,2) NOT NULL,
      category        VARCHAR(60),
      is_available    TINYINT(1) DEFAULT 1,
      INDEX idx_restaurant (restaurant_id),
      INDEX idx_category   (category)
    ) ENGINE=InnoDB
  `);
  console.log('✅ Table: menu_items');

  // ── Table: users (HASH partition — distributes rows evenly by id) ──────────
  // Great for: high-write tables, load balancing across partitions
  await conn.query(`DROP TABLE IF EXISTS users`);
  await conn.query(`
    CREATE TABLE users (
      id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
      name        VARCHAR(100) NOT NULL,
      email       VARCHAR(150) NOT NULL,
      phone       VARCHAR(20),
      address     VARCHAR(255),
      created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY uq_email (email, id),
      INDEX idx_email (email)
    ) ENGINE=InnoDB
    PARTITION BY HASH(id)
    PARTITIONS 4
  `);
  console.log('✅ Table: users (HASH partition × 4)');

  // ── Table: orders (RANGE partition by created_at month) ───────────────────
  // Benefit: pruning — queries for "this month" only scan 1 partition
  // MariaDB RANGE needs integer key; we use UNIX_TIMESTAMP()
  await conn.query(`DROP TABLE IF EXISTS orders`);
  await conn.query(`
    CREATE TABLE orders (
      id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
      user_id       INT UNSIGNED NOT NULL,
      restaurant_id INT UNSIGNED NOT NULL,
      status        ENUM('pending','confirmed','preparing','delivering','delivered','cancelled')
                    DEFAULT 'pending',
      total_amount  DECIMAL(10,2) NOT NULL,
      created_ts    INT UNSIGNED NOT NULL COMMENT 'UNIX timestamp for partition key',
      created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY   (id, created_ts),
      INDEX idx_user   (user_id),
      INDEX idx_status (status)
    ) ENGINE=InnoDB
    PARTITION BY RANGE (created_ts) (
      PARTITION p_2024_q1 VALUES LESS THAN (UNIX_TIMESTAMP('2024-04-01')),
      PARTITION p_2024_q2 VALUES LESS THAN (UNIX_TIMESTAMP('2024-07-01')),
      PARTITION p_2024_q3 VALUES LESS THAN (UNIX_TIMESTAMP('2024-10-01')),
      PARTITION p_2024_q4 VALUES LESS THAN (UNIX_TIMESTAMP('2025-01-01')),
      PARTITION p_2025_q1 VALUES LESS THAN (UNIX_TIMESTAMP('2025-04-01')),
      PARTITION p_2025_q2 VALUES LESS THAN (UNIX_TIMESTAMP('2025-07-01')),
      PARTITION p_future  VALUES LESS THAN MAXVALUE
    )
  `);
  console.log('✅ Table: orders (RANGE partition by quarter)');

  // ── Table: order_items ─────────────────────────────────────────────────────
  await conn.query(`DROP TABLE IF EXISTS order_items`);
  await conn.query(`
    CREATE TABLE order_items (
      id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      order_id      INT UNSIGNED NOT NULL,
      menu_item_id  INT UNSIGNED NOT NULL,
      quantity      SMALLINT UNSIGNED DEFAULT 1,
      unit_price    DECIMAL(10,2) NOT NULL,
      INDEX idx_order (order_id)
    ) ENGINE=InnoDB
  `);
  console.log('✅ Table: order_items');

  // ── Table: events (simple outbox for async messaging demo) ────────────────
  await conn.query(`DROP TABLE IF EXISTS events`);
  await conn.query(`
    CREATE TABLE events (
      id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      topic       VARCHAR(100) NOT NULL,
      payload     JSON         NOT NULL,
      status      ENUM('pending','published') DEFAULT 'pending',
      created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_status (status),
      INDEX idx_topic  (topic)
    ) ENGINE=InnoDB
  `);
  console.log('✅ Table: events (outbox pattern)');

  await conn.end();
  console.log('\n🎉 Schema ready! Run: node scripts/seed.js');
}

setup().catch(err => {
  console.error('Setup failed:', err.message);
  process.exit(1);
});

CREATE DATABASE IF NOT EXISTS flashsale_db;
USE flashsale_db;

CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price INT NOT NULL,
    stock INT NOT NULL,
    image VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId VARCHAR(50) NOT NULL,
    productId INT NOT NULL,
    qty INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert dummy data for demo
INSERT INTO products (name, price, stock, image) VALUES
('iPhone 15 Pro Max', 30000000, 10, '📱'),
('MacBook Air M3', 25000000, 5, '💻'),
('AirPods Pro 2', 5000000, 20, '🎧');

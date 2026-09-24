CREATE DATABASE IF NOT EXISTS cafeteria_kiosk_db;
USE cafeteria_kiosk_db;

CREATE TABLE IF NOT EXISTS users (
  user_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('ADMIN','STAFF') NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
  category_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  description VARCHAR(500),
  display_order INT DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS menu_items (
  item_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  category_id BIGINT NOT NULL,
  name VARCHAR(160) NOT NULL,
  description VARCHAR(500),
  price DECIMAL(10,2) NOT NULL,
  image_url VARCHAR(1000),
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  stock_quantity INT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_menu_category FOREIGN KEY (category_id) REFERENCES categories(category_id)
);

CREATE TABLE IF NOT EXISTS token_counters (
  order_date DATE PRIMARY KEY,
  last_token INT NOT NULL
);

CREATE TABLE IF NOT EXISTS orders (
  order_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  token_number INT NOT NULL,
  order_date DATE NOT NULL,
  user_id BIGINT NULL,
  order_status ENUM('PENDING','PREPARING','READY','COMPLETED','CANCELLED') NOT NULL,
  payment_status ENUM('UNPAID','PAID','REFUNDED') NOT NULL,
  payment_method ENUM('CASH','CARD_MANUAL','OTHER') NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  notes VARCHAR(1000),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_order_user FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE IF NOT EXISTS order_items (
  order_item_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  order_id BIGINT NOT NULL,
  item_id BIGINT NULL,
  item_name_snapshot VARCHAR(160) NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(12,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  CONSTRAINT fk_order_item_order FOREIGN KEY (order_id) REFERENCES orders(order_id),
  CONSTRAINT fk_order_item_menu FOREIGN KEY (item_id) REFERENCES menu_items(item_id) ON DELETE SET NULL
);

CREATE INDEX idx_orders_date ON orders(order_date);
CREATE INDEX idx_order_items_order ON order_items(order_id);

-- Demo admin. Login: admin@example.com / password
INSERT INTO users(full_name,email,password_hash,role,is_active)
SELECT 'Cafeteria Admin','admin@example.com','$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy','ADMIN',TRUE
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email='admin@example.com');

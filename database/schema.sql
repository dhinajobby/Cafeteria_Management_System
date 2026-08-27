create database cafeteria_db;
use cafeteria_db;
CREATE TABLE food_items (
    item_id INT AUTO_INCREMENT PRIMARY KEY,
    item_name VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    stock_count INT NOT NULL DEFAULT 0,
    is_available BOOLEAN DEFAULT TRUE
);
CREATE TABLE orders (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    total_bill DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    payment_method VARCHAR(20) DEFAULT 'CASH ON DELIVERY',
    order_status ENUM('PENDING', 'COMPLETED', 'CANCELLED') DEFAULT 'PENDING'
);
CREATE TABLE order_items (
    order_item_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    item_id INT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES food_items(item_id) ON DELETE CASCADE
);
INSERT INTO food_items (item_name, price, stock_count, is_available) VALUES
('Sandwich', 40.00, 20, TRUE),
('Burger', 70.00, 15, TRUE),
('Coffee', 20.00, 50, TRUE),
('Fruit Juice', 30.00, 25, TRUE),
('Samosa', 15.00, 30, TRUE);

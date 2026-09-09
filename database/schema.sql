-- =====================================================================
-- Cafeteria Management System (Self-Service Kiosk Mode) - DB Schema
-- Engine: MySQL 8.0+
-- Character Set: utf8mb4
-- =====================================================================

CREATE DATABASE IF NOT EXISTS cafeteria_kiosk_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE cafeteria_kiosk_db;

-- Drop tables in FK-safe order (useful for re-running during development)
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS token_counters;
DROP TABLE IF EXISTS menu_items;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;

-- =====================================================================
-- TABLE: users
-- Staff/Admin accounts ONLY. Guests never get a row here — kiosk
-- customers are fully anonymous (see orders.user_id being nullable).
-- =====================================================================
CREATE TABLE users (
    user_id         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    full_name       VARCHAR(100)    NOT NULL,
    email           VARCHAR(150)    NOT NULL,
    password_hash   VARCHAR(255)    NOT NULL,   -- BCrypt hash, never plain text
    role            ENUM('ADMIN', 'STAFF') NOT NULL DEFAULT 'STAFF',
    is_active       BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
                                    ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT uq_users_email UNIQUE (email)
) ENGINE=InnoDB;

-- =====================================================================
-- TABLE: categories
-- =====================================================================
CREATE TABLE categories (
    category_id     INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(80)     NOT NULL,
    description     VARCHAR(255)    DEFAULT NULL,
    display_order   INT UNSIGNED    NOT NULL DEFAULT 0,
    is_active       BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_categories_name UNIQUE (name)
) ENGINE=InnoDB;

-- =====================================================================
-- TABLE: menu_items
-- =====================================================================
CREATE TABLE menu_items (
    item_id         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    category_id     INT UNSIGNED    NOT NULL,
    name            VARCHAR(120)    NOT NULL,
    description     VARCHAR(500)    DEFAULT NULL,
    price           DECIMAL(10,2)   NOT NULL,
    image_url       VARCHAR(255)    DEFAULT NULL,
    is_available    BOOLEAN         NOT NULL DEFAULT TRUE,   -- kiosk hides unavailable items live
    stock_quantity  INT             DEFAULT NULL,            -- NULL = not tracked / unlimited
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
                                    ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_menu_items_category
        FOREIGN KEY (category_id) REFERENCES categories(category_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CONSTRAINT chk_menu_items_price CHECK (price >= 0),

    INDEX idx_menu_items_category (category_id),
    INDEX idx_menu_items_available (is_available)
) ENGINE=InnoDB;

-- =====================================================================
-- TABLE: token_counters
-- One row per calendar day. Backs atomic, race-safe token generation:
-- Step 2's OrderService will run this inside a transaction as
--   INSERT INTO token_counters (order_date, last_token) VALUES (CURDATE(), 1)
--   ON DUPLICATE KEY UPDATE last_token = LAST_INSERT_ID(last_token + 1);
-- then read LAST_INSERT_ID() for the new token — this keeps kiosk
-- tokens short (#1, #2, ...) and resets them each day, without two
-- simultaneous kiosk orders ever colliding on the same token number.
-- =====================================================================
CREATE TABLE token_counters (
    order_date      DATE            NOT NULL PRIMARY KEY,
    last_token      INT UNSIGNED    NOT NULL DEFAULT 0
) ENGINE=InnoDB;

-- =====================================================================
-- TABLE: orders
-- user_id is NULL for anonymous kiosk guests; populated only when a
-- staff member creates/edits an order on a customer's behalf.
-- =====================================================================
CREATE TABLE orders (
    order_id        BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    token_number     INT UNSIGNED    NOT NULL,   -- short daily-reset number shown to guest, e.g. 101
    order_date      DATE            NOT NULL DEFAULT (CURRENT_DATE),  -- pairs with token_number for daily uniqueness
    user_id         BIGINT UNSIGNED DEFAULT NULL,  -- NULL = anonymous guest order
    order_status    ENUM('PENDING', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED')
                                    NOT NULL DEFAULT 'PENDING',
    payment_status  ENUM('UNPAID', 'PAID', 'REFUNDED') NOT NULL DEFAULT 'UNPAID',
    payment_method  ENUM('CASH', 'CARD_MANUAL', 'OTHER') NOT NULL DEFAULT 'CASH',
    total_amount    DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
    notes           VARCHAR(255)    DEFAULT NULL,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
                                    ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_orders_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,

    CONSTRAINT chk_orders_total CHECK (total_amount >= 0),

    -- A given token number can only mean one order per calendar day
    CONSTRAINT uq_orders_date_token UNIQUE (order_date, token_number),

    INDEX idx_orders_status (order_status),
    INDEX idx_orders_date (order_date),
    INDEX idx_orders_user (user_id)
) ENGINE=InnoDB;

-- =====================================================================
-- TABLE: order_items
-- item_name_snapshot + unit_price preserve historical accuracy even if
-- the menu item is later renamed, repriced, or deleted.
-- =====================================================================
CREATE TABLE order_items (
    order_item_id       BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_id            BIGINT UNSIGNED NOT NULL,
    item_id             BIGINT UNSIGNED NOT NULL,
    item_name_snapshot  VARCHAR(120)    NOT NULL,
    quantity            INT UNSIGNED    NOT NULL,
    unit_price          DECIMAL(10,2)   NOT NULL,
    subtotal            DECIMAL(10,2)   GENERATED ALWAYS AS (quantity * unit_price) STORED,

    CONSTRAINT fk_order_items_order
        FOREIGN KEY (order_id) REFERENCES orders(order_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_order_items_menu_item
        FOREIGN KEY (item_id) REFERENCES menu_items(item_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CONSTRAINT chk_order_items_qty CHECK (quantity > 0),
    CONSTRAINT chk_order_items_price CHECK (unit_price >= 0),

    INDEX idx_order_items_order (order_id),
    INDEX idx_order_items_item (item_id)
) ENGINE=InnoDB;

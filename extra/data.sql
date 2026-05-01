-- Faran Traders Business Management System Database PHP
-- Created: 2025-12-28     

CREATE DATABASE IF NOT EXISTS faran_traders CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE faran_traders;

-- Table 1: Users
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table 2: Customers
CREATE TABLE IF NOT EXISTS customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    city VARCHAR(50),
    type ENUM('Regular', 'One-time') DEFAULT 'Regular',
    opening_balance DECIMAL(15,2) DEFAULT 0.00,
    current_balance DECIMAL(15,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name),
    INDEX idx_city (city),
    INDEX idx_phone (phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table 3: Suppliers
CREATE TABLE IF NOT EXISTS suppliers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    city VARCHAR(50),
    type ENUM('Regular', 'One-time') DEFAULT 'Regular',
    opening_balance DECIMAL(15,2) DEFAULT 0.00,
    current_balance DECIMAL(15,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name),
    INDEX idx_city (city),
    INDEX idx_phone (phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table 4: Items/Products
CREATE TABLE IF NOT EXISTS items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50),
    unit VARCHAR(20) DEFAULT 'Bags',
    current_stock DECIMAL(10,2) DEFAULT 0.00,
    min_stock_alert DECIMAL(10,2) DEFAULT 10.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name),
    INDEX idx_category (category),
    INDEX idx_stock (current_stock)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table 5: Sales
CREATE TABLE IF NOT EXISTS sales (
    id INT AUTO_INCREMENT PRIMARY KEY,
    invoice_no VARCHAR(50) NOT NULL UNIQUE,

    customer_id INT DEFAULT NULL, 
    sale_date DATE NOT NULL,
    total_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    payment_received DECIMAL(15,2) DEFAULT 0.00,
    balance DECIMAL(15,2) DEFAULT 0.00,

    payment_method ENUM('Cash', 'Credit') DEFAULT 'Credit', 
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
   
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
    
    INDEX idx_invoice (invoice_no),
    INDEX idx_customer (customer_id),
    INDEX idx_date (sale_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table 6: Sale Items
CREATE TABLE IF NOT EXISTS sale_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sale_id INT NOT NULL,
    item_id INT NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    rate DECIMAL(15,2) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE RESTRICT,
    INDEX idx_sale (sale_id),
    INDEX idx_item (item_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table 7: Purchases
CREATE TABLE IF NOT EXISTS purchases (
    id INT AUTO_INCREMENT PRIMARY KEY,
    invoice_no VARCHAR(50) NOT NULL UNIQUE,
    supplier_id INT NOT NULL,
    purchase_date DATE NOT NULL,
    total_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    transport_expense DECIMAL(15,2) DEFAULT 0.00,
    other_expense DECIMAL(15,2) DEFAULT 0.00,
    payment_made DECIMAL(15,2) DEFAULT 0.00,
    balance DECIMAL(15,2) DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE RESTRICT,
    INDEX idx_invoice (invoice_no),
    INDEX idx_supplier (supplier_id),
    INDEX idx_date (purchase_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table 8: Purchase Items
CREATE TABLE IF NOT EXISTS purchase_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    purchase_id INT NOT NULL,
    item_id INT NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    rate DECIMAL(15,2) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    FOREIGN KEY (purchase_id) REFERENCES purchases(id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE RESTRICT,
    INDEX idx_purchase (purchase_id),
    INDEX idx_item (item_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table 9: Transactions (Unified Ledger)
CREATE TABLE IF NOT EXISTS transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    transaction_type ENUM('Sale', 'Purchase', 'Payment', 'Receipt', 'Opening') NOT NULL,
    party_type ENUM('Customer', 'Supplier') NOT NULL,
    party_id INT NOT NULL,
    transaction_date DATE NOT NULL,
    invoice_no VARCHAR(50),
    description TEXT,
    debit DECIMAL(15,2) DEFAULT 0.00,
    credit DECIMAL(15,2) DEFAULT 0.00,
    balance DECIMAL(15,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_party (party_type, party_id),
    INDEX idx_date (transaction_date),
    INDEX idx_type (transaction_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table 10: Expenses
CREATE TABLE IF NOT EXISTS expenses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    expense_type VARCHAR(50) NOT NULL,
    description TEXT,
    amount DECIMAL(15,2) NOT NULL,
    expense_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_date (expense_date),
    INDEX idx_type (expense_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table 11: Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    notification_type ENUM('Low Stock', 'Out of Stock', 'Payment Due', 'Large Receivable') NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    reference_id INT,
    reference_type VARCHAR(50),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_read (is_read),
    INDEX idx_type (notification_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- Table 12: Stock Logs (Manual Adjustments & History)
CREATE TABLE IF NOT EXISTS stock_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    item_id INT NOT NULL,
    adjustment_type ENUM('Add', 'Subtract') NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    reason VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
    INDEX idx_item (item_id),
    INDEX idx_type (adjustment_type),
    INDEX idx_date (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert default admin user (password: admin123)
INSERT INTO users (username, password, email, full_name) VALUES 
('admin', '$2y$10$ruRNeY0uBnE7sqN9pdCQBegfiSEWrn/.yL1yHYwS33oeCqtG9hkLe', 'admin@farantraders.com', 'Administrator');

-- Sample data for testing
INSERT INTO customers (name, phone, city, type, opening_balance, current_balance) VALUES
('Ahmed Khan', '0300-1234567', 'Karachi', 'Regular', 5000.00, 5000.00),
('Bilal Ahmed', '0321-9876543', 'Lahore', 'Regular', 0.00, 0.00),
('Shahid Malik', '0333-4567890', 'Islamabad', 'One-time', 0.00, 0.00),
('Walk-in Customer', '0000', '', 'Regular', 0.00, 0.00);

INSERT INTO suppliers (name, phone, city, type, opening_balance, current_balance) VALUES
('Shabir Traders', '0300-1111111', 'Karachi', 'Regular', 10000.00, 10000.00),
('Faisal Suppliers', '0321-2222222', 'Lahore', 'Regular', 0.00, 0.00),
('Walk-in Supplier', '0000000000', 'Local', 'One-time', 0.00, 0.00);

INSERT INTO items (name, category, unit, current_stock, min_stock_alert) VALUES
('Rice Basmati', 'Grains', 'Bags', 100.00, 10.00),
('Wheat Flour', 'Grains', 'Bags', 50.00, 10.00),
('Sugar', 'Groceries', 'Bags', 75.00, 10.00),
('Cooking Oil', 'Groceries', 'Liters', 5.00, 10.00);

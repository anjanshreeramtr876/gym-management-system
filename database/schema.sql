-- ============================================
-- Gym Management System - Database Schema
-- ============================================

CREATE DATABASE IF NOT EXISTS gym_management;
USE gym_management;

-- -------------------------------------------
-- Table: TRAINER
-- -------------------------------------------
CREATE TABLE IF NOT EXISTS TRAINER (
    Trainer_ID INT AUTO_INCREMENT PRIMARY KEY,
    Trainer_Name VARCHAR(100) NOT NULL,
    Specialization VARCHAR(100),
    Phone VARCHAR(15),
    Experience INT DEFAULT 0
);

-- -------------------------------------------
-- Table: MEMBER
-- -------------------------------------------
CREATE TABLE IF NOT EXISTS MEMBER (
    Member_ID INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    Age INT,
    Gender ENUM('Male', 'Female', 'Other'),
    Phone VARCHAR(15),
    Address VARCHAR(255),
    Join_Date DATE,
    Trainer_ID INT,
    FOREIGN KEY (Trainer_ID) REFERENCES TRAINER(Trainer_ID)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);

-- -------------------------------------------
-- Table: PAYMENT
-- -------------------------------------------
CREATE TABLE IF NOT EXISTS PAYMENT (
    Payment_ID INT AUTO_INCREMENT PRIMARY KEY,
    Member_ID INT,
    Amount DECIMAL(10, 2) NOT NULL,
    Payment_Date DATE,
    Payment_Method ENUM('Cash', 'Card', 'UPI', 'Online') DEFAULT 'Cash',
    Membership_Type ENUM('Monthly', 'Quarterly', 'Half-Yearly', 'Yearly') DEFAULT 'Monthly',
    FOREIGN KEY (Member_ID) REFERENCES MEMBER(Member_ID)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- -------------------------------------------
-- Table: USERS (Authentication)
-- -------------------------------------------
CREATE TABLE IF NOT EXISTS USERS (
    User_ID INT AUTO_INCREMENT PRIMARY KEY,
    Unique_ID VARCHAR(12) UNIQUE,
    Username VARCHAR(50) NOT NULL UNIQUE,
    Email VARCHAR(100) UNIQUE,
    Password VARCHAR(255) NOT NULL,
    Role ENUM('admin', 'member') DEFAULT 'member',
    Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- -------------------------------------------
-- Table: DIET_PLAN
-- -------------------------------------------
CREATE TABLE IF NOT EXISTS DIET_PLAN (
    Plan_ID INT AUTO_INCREMENT PRIMARY KEY,
    Member_ID INT NOT NULL,
    Trainer_ID INT NOT NULL,
    Plan_Name VARCHAR(100) NOT NULL,
    Goal VARCHAR(100),
    Breakfast TEXT,
    Lunch TEXT,
    Dinner TEXT,
    Snacks TEXT,
    Notes TEXT,
    Created_At DATE,
    FOREIGN KEY (Member_ID) REFERENCES MEMBER(Member_ID) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (Trainer_ID) REFERENCES TRAINER(Trainer_ID) ON DELETE CASCADE ON UPDATE CASCADE
);

-- -------------------------------------------
-- Sample Data (Optional)
-- -------------------------------------------
INSERT INTO TRAINER (Trainer_Name, Specialization, Phone, Experience) VALUES
('Rahul Sharma', 'Weight Training', '9876543210', 5),
('Priya Patel', 'Yoga & Flexibility', '9876543211', 3),
('Amit Kumar', 'Cardio & HIIT', '9876543212', 7);

INSERT INTO MEMBER (Name, Age, Gender, Phone, Address, Join_Date, Trainer_ID) VALUES
('Aarav Mehta', 25, 'Male', '9001234567', '123 MG Road, Mumbai', '2026-01-15', 1),
('Sneha Gupta', 22, 'Female', '9001234568', '45 Park Street, Delhi', '2026-02-10', 2),
('Vikram Singh', 30, 'Male', '9001234569', '78 Lake Road, Pune', '2026-03-01', 1);

INSERT INTO PAYMENT (Member_ID, Amount, Payment_Date, Payment_Method, Membership_Type) VALUES
(1, 2000.00, '2026-01-15', 'UPI', 'Monthly'),
(2, 5000.00, '2026-02-10', 'Card', 'Quarterly'),
(3, 2000.00, '2026-03-01', 'Cash', 'Monthly');

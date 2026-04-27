-- Migration: Add Unique_ID column to USERS table
-- Run this if the USERS table already exists

ALTER TABLE USERS ADD COLUMN Unique_ID VARCHAR(12) UNIQUE AFTER User_ID;

-- Generate unique IDs for any existing users that don't have one
-- You can run this manually or the application will handle new users automatically

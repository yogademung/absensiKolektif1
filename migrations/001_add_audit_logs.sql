-- Migration: Add audit_logs table
-- Date: 2025-11-25
-- Description: Create audit_logs table to track all admin activities

USE training_voucher_db;

CREATE TABLE IF NOT EXISTS audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  admin_id INT NULL,
  action VARCHAR(50) NOT NULL,
  entity_type VARCHAR(50) NULL,
  entity_id INT NULL,
  old_values TEXT NULL,
  new_values TEXT NULL,
  ip_address VARCHAR(45) NULL,
  user_agent TEXT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE SET NULL
);

-- Index for better query performance
CREATE INDEX idx_admin_id ON audit_logs(admin_id);
CREATE INDEX idx_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_created_at ON audit_logs(created_at);

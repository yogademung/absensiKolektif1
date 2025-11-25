CREATE DATABASE IF NOT EXISTS training_voucher_db;
USE training_voucher_db;

CREATE TABLE IF NOT EXISTS admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS hotels (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  token_quota INT DEFAULT 0,
  token_used INT DEFAULT 0,
  status TINYINT DEFAULT 1
);

CREATE TABLE IF NOT EXISTS training_modules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT
);

CREATE TABLE IF NOT EXISTS training_schedules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  module_id INT NOT NULL,
  date DATE NOT NULL,
  session ENUM('Session 1', 'Session 2') NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  zoom_link VARCHAR(255),
  max_participants INT DEFAULT 50,
  FOREIGN KEY (module_id) REFERENCES training_modules(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS vouchers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  staff_name VARCHAR(255) NOT NULL,
  hotel_id INT NOT NULL,
  module_id INT NOT NULL,
  schedule_id INT NOT NULL,
  zoom_link VARCHAR(255),
  token_cost INT DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (hotel_id) REFERENCES hotels(id),
  FOREIGN KEY (module_id) REFERENCES training_modules(id),
  FOREIGN KEY (schedule_id) REFERENCES training_schedules(id)
);

CREATE TABLE IF NOT EXISTS token_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  hotel_id INT NOT NULL,
  registration_id INT,
  token_change INT NOT NULL,
  reason VARCHAR(255),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (hotel_id) REFERENCES hotels(id),
  FOREIGN KEY (registration_id) REFERENCES vouchers(id)
);

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

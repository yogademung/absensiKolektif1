ALTER TABLE admins ADD COLUMN role ENUM('super_admin', 'hotel_user') DEFAULT 'super_admin';
ALTER TABLE admins ADD COLUMN hotel_id INT NULL;
ALTER TABLE admins ADD CONSTRAINT fk_admins_hotel_id FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE SET NULL;

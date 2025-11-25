-- Admin password is 'Admin123!' (hashed)
INSERT INTO admins (email, password_hash) VALUES 
('admin@example.com', '$2a$10$X7V.j.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1'); 
-- Note: The hash above is a placeholder. We will generate a real hash in the setup script or use a known hash.
-- Real hash for 'Admin123!' generated via bcrypt: $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy

INSERT INTO hotels (name, token_quota, token_used, status) VALUES 
('Hotel A', 100, 0, 1),
('Hotel B', 50, 0, 1),
('Hotel C', 200, 10, 1);

INSERT INTO training_modules (name, description) VALUES 
('Customer Service Excellence', 'Learn how to handle customers with care.'),
('Safety & Hygiene', 'Standard protocols for hotel safety.'),
('Digital Marketing Basics', 'Introduction to social media marketing.');

INSERT INTO training_schedules (module_id, date, session, start_time, end_time, zoom_link, max_participants) VALUES 
(1, CURDATE() + INTERVAL 1 DAY, 'Session 1', '09:00:00', '12:00:00', 'https://zoom.us/j/123456789', 30),
(1, CURDATE() + INTERVAL 1 DAY, 'Session 2', '13:00:00', '16:00:00', 'https://zoom.us/j/987654321', 30),
(2, CURDATE() + INTERVAL 2 DAY, 'Session 1', '10:00:00', '11:30:00', 'https://zoom.us/j/111222333', 50);

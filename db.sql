-- --------------------------------------------------------
-- Host:                         mysql-kolektiftrainingvhp.alwaysdata.net
-- Server version:               10.11.15-MariaDB - MariaDB Server
-- Server OS:                    Linux
-- HeidiSQL Version:             12.13.0.7147
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

-- Dumping data for table kolektiftrainingvhp_training_voucher_db.admins: ~5 rows (approximately)
INSERT IGNORE INTO `admins` (`id`, `email`, `password_hash`, `created_at`, `status`, `role`, `hotel_id`) VALUES
	(1, 'admin@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '2025-11-25 12:59:24', 'active', 'super_admin', NULL),
	(2, 'darma@gmail.com', '$2a$10$vyOrugTonIdJR65mzuBsLOvypTh/ZHIB.PJf1p0LcebcgY7qk8bhy', '2025-11-25 13:31:00', 'active', 'super_admin', NULL),
	(3, 'amaranta@gmail.com', '$2a$10$yojsHEjtr5AugmGNLCwE/.fHO85EYBVsWJ4pWjo1AHfdgBQ/4ES/6', '2025-11-26 09:29:39', 'active', 'hotel_user', 4),
	(4, 'jonhotel@gmail.com', '$2a$10$WD0tQLhC6mH2iUByflcAYuZ0P4DeRzdXeUnOtAFBycTsfwtH5TTeC', '2025-11-26 12:46:09', 'active', 'hotel_user', 2),
	(5, 'kolektif212@gmail.com', '$2a$10$.gmFYCmzdIp/ZpGwVM4EsuxBvO76bz7QgWlKSIAA6HMBSTZoNXYAa', '2025-11-26 09:39:42', 'active', 'super_admin', NULL);

-- Dumping data for table kolektiftrainingvhp_training_voucher_db.audit_logs: ~52 rows (approximately)
INSERT IGNORE INTO `audit_logs` (`id`, `admin_id`, `admin_email`, `action`, `entity_type`, `entity_id`, `old_values`, `new_values`, `ip_address`, `user_agent`, `created_at`) VALUES
	(1, 2, NULL, 'CREATE', 'admin', 3, NULL, '{"email":"amaranta@gmail.com","role":"hotel_user","hotelId":"4"}', NULL, NULL, '2025-11-26 09:29:39'),
	(2, 2, NULL, 'CREATE', 'admin', 4, NULL, '{"email":"jonhotel@gmail.com","role":"hotel_user","hotelId":2}', NULL, NULL, '2025-11-26 12:46:09'),
	(3, 2, NULL, 'CREATE', 'admin', 5, NULL, '{"email":"kolektif212@gmail.com","role":"super_admin","hotelId":null}', NULL, NULL, '2025-11-26 09:39:42'),
	(4, 5, NULL, 'CREATE', 'schedule', 4, NULL, '{"module_id":"1","date":"2025-12-27","session":"Session 1","start_time":"12:55","end_time":"16:56","zoom_link":"https://us06web.zoom.us/meetings/86397421279/invitations?signature=GLY1isE7Na_0uK2u9a0CuU-YiSKba1NtjPxb6rNHyTQ","video_link":null,"max_participants":50}', NULL, NULL, '2025-11-26 09:56:30'),
	(5, 5, NULL, 'CREATE', 'schedule', 5, NULL, '{"module_id":"1","date":"2025-12-27","session":"Session 1","start_time":"12:55","end_time":"16:56","zoom_link":"https://us06web.zoom.us/meetings/86397421279/invitations?signature=GLY1isE7Na_0uK2u9a0CuU-YiSKba1NtjPxb6rNHyTQ","video_link":null,"max_participants":50}', NULL, NULL, '2025-11-26 09:56:30'),
	(6, 3, 'amaranta@gmail.com', 'LOGIN', 'admin', 3, NULL, '{"email":"amaranta@gmail.com","role":"hotel_user"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '2025-11-27 09:18:48'),
	(7, NULL, NULL, 'GENERATE_VOUCHER', 'voucher', 7, NULL, '{"staff_name":"hyhyh","hotel_id":"4","hotel_name":"Amaranta Prambanan","module_id":"2","schedule_id":"3","token_cost":0,"is_first_registration":false}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '2025-11-27 09:19:00'),
	(8, 3, 'amaranta@gmail.com', 'LOGIN', 'admin', 3, NULL, '{"email":"amaranta@gmail.com","role":"hotel_user"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-10 02:21:37'),
	(9, 2, 'darma@gmail.com', 'LOGIN', 'admin', 2, NULL, '{"email":"darma@gmail.com","role":"super_admin"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-10 02:22:05'),
	(10, 3, 'amaranta@gmail.com', 'LOGIN', 'admin', 3, NULL, '{"email":"amaranta@gmail.com","role":"hotel_user"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-11 09:49:48'),
	(11, 2, 'darma@gmail.com', 'LOGIN', 'admin', 2, NULL, '{"email":"darma@gmail.com","role":"super_admin"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-11 10:04:20'),
	(12, 3, 'amaranta@gmail.com', 'LOGIN', 'admin', 3, NULL, '{"email":"amaranta@gmail.com","role":"hotel_user"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-11 10:05:39'),
	(13, 3, 'amaranta@gmail.com', 'LOGIN', 'admin', 3, NULL, '{"email":"amaranta@gmail.com","role":"hotel_user"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-19 02:34:57'),
	(14, 2, 'darma@gmail.com', 'LOGIN', 'admin', 2, NULL, '{"email":"darma@gmail.com","role":"super_admin"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2025-12-19 02:35:50'),
	(15, 2, 'darma@gmail.com', 'UPDATE', 'schedule', 2, '{"module_id":1,"date":"2025-11-28T23:00:00.000Z","zoom_link":"https://zoom.us/j/987654321","video_link":null}', '{"module_id":"1","date":"2025-11-28","session":"Session 2","start_time":"13:00:00","end_time":"16:00:00","zoom_link":"https://zoom.us/j/987654321","video_link":"https://youtu.be/s83wqOqaUVE","max_participants":50}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2025-12-19 02:50:35'),
	(16, 2, 'darma@gmail.com', 'UPDATE', 'schedule', 1, '{"module_id":1,"date":"2025-12-17T23:00:00.000Z","zoom_link":"https://zoom.us/j/123456789","video_link":null}', '{"module_id":"1","date":"2025-12-17","session":"Session 1","start_time":"09:00:00","end_time":"12:00:00","zoom_link":"https://zoom.us/j/123456789","video_link":"https://youtu.be/s83wqOqaUVE","max_participants":50}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2025-12-19 03:14:08'),
	(17, 3, 'amaranta@gmail.com', 'LOGIN', 'admin', 3, NULL, '{"email":"amaranta@gmail.com","role":"hotel_user"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-19 14:45:00'),
	(18, 2, 'darma@gmail.com', 'LOGIN', 'admin', 2, NULL, '{"email":"darma@gmail.com","role":"super_admin"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-19 14:51:01'),
	(19, NULL, NULL, 'GENERATE_VOUCHER', 'voucher', 8, NULL, '{"staff_name":"121212","hotel_id":"4","hotel_name":"Amaranta Prambanan","module_id":"1","schedule_id":"5","token_cost":1,"is_first_registration":true}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-19 14:53:41'),
	(20, 2, 'darma@gmail.com', 'LOGIN', 'admin', 2, NULL, '{"email":"darma@gmail.com","role":"super_admin"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-02 03:37:11'),
	(21, 2, 'darma@gmail.com', 'UPDATE', 'module', 1, '{"name":"Customer Service Excellence","description":"Learn how to handle customers with care."}', '{"name":"Sales & Catering","description":"tes"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-02 03:37:33'),
	(22, 2, 'darma@gmail.com', 'UPDATE', 'module', 2, '{"name":"Safety & Hygiene","description":"Standard protocols for hotel safety."}', '{"name":"FO Reception","description":"FO Reception"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-02 03:37:47'),
	(23, 2, 'darma@gmail.com', 'UPDATE', 'module', 3, '{"name":"Digital Marketing Basics","description":"Introduction to social media marketing."}', '{"name":"FO Cashier","description":"FO Cashier"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-02 03:37:59'),
	(24, 2, 'darma@gmail.com', 'CREATE', 'module', 4, NULL, '{"name":"Telephone Operator","description":"Telephone Operator"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-02 03:38:09'),
	(25, 2, 'darma@gmail.com', 'CREATE', 'module', 5, NULL, '{"name":"Housekeeping","description":"Housekeeping"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-02 03:38:21'),
	(26, 2, 'darma@gmail.com', 'CREATE', 'module', 6, NULL, '{"name":"Outlet POS","description":"Outlet POS"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-02 03:38:38'),
	(27, 2, 'darma@gmail.com', 'CREATE', 'module', 7, NULL, '{"name":"Night Audit","description":"Night Audit"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-02 03:38:53'),
	(28, 2, 'darma@gmail.com', 'CREATE', 'module', 8, NULL, '{"name":"Income Audit","description":"Income Audit"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-02 03:39:27'),
	(29, 2, 'darma@gmail.com', 'CREATE', 'module', 9, NULL, '{"name":"Account Receivable","description":"Account Receivable"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-02 03:39:45'),
	(30, 2, 'darma@gmail.com', 'CREATE', 'module', 10, NULL, '{"name":"Purchasing","description":"Purchasing"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-02 03:39:55'),
	(31, 2, 'darma@gmail.com', 'CREATE', 'module', 11, NULL, '{"name":"Inventory Receiving","description":"Inventory Receiving"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-02 03:40:06'),
	(32, 2, 'darma@gmail.com', 'CREATE', 'module', 12, NULL, '{"name":"Inventory Outgoing","description":"Inventory Outgoing"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-02 03:40:17'),
	(33, 2, 'darma@gmail.com', 'CREATE', 'module', 13, NULL, '{"name":"Inventory Cost Control I","description":"Inventory Cost Control I"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-02 03:40:30'),
	(34, 2, 'darma@gmail.com', 'CREATE', 'module', 14, NULL, '{"name":"Inventory Cost Control II","description":"Inventory Cost Control II"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-02 03:40:37'),
	(35, 2, 'darma@gmail.com', 'UPDATE', 'module', 2, '{"name":"FO Reception","description":"FO Reception"}', '{"name":"FO Reception I","description":"FO Reception I"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-02 03:40:50'),
	(36, 2, 'darma@gmail.com', 'UPDATE', 'module', 3, '{"name":"FO Cashier","description":"FO Cashier"}', '{"name":"FO Cashier I","description":"FO Cashier I"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-02 03:40:59'),
	(37, 2, 'darma@gmail.com', 'CREATE', 'module', 15, NULL, '{"name":"FO Reception II","description":"FO Reception II"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-02 03:41:28'),
	(38, 2, 'darma@gmail.com', 'CREATE', 'module', 16, NULL, '{"name":"FO Cashier II","description":"FO Cashier II"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-02 03:41:41'),
	(39, 2, 'darma@gmail.com', 'CREATE', 'module', 17, NULL, '{"name":"Account Payable","description":"Account Payable"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-02 03:41:59'),
	(40, 2, 'darma@gmail.com', 'CREATE', 'module', 18, NULL, '{"name":"General Cashier","description":"General Cashier"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-02 03:42:06'),
	(41, 2, 'darma@gmail.com', 'CREATE', 'module', 19, NULL, '{"name":"General Ledger","description":"General Ledger"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-02 03:42:16'),
	(42, 2, 'darma@gmail.com', 'CREATE', 'module', 20, NULL, '{"name":"Fixed Assets","description":"Fixed Assets"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-02 03:42:29'),
	(43, 2, 'darma@gmail.com', 'CREATE', 'module', 21, NULL, '{"name":"Engineering","description":"Engineering"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-02 03:42:38'),
	(44, 2, 'darma@gmail.com', 'CREATE', 'schedule', 6, NULL, '{"module_id":"1","date":"2026-01-12","session":"Session 1","start_time":"09:30","end_time":"12:30","zoom_link":"PT. Supranusa Sindata VHP SOFTWARE is inviting you to a scheduled Zoom meeting.\\n\\nTopic: VHP CLOUD COLLECTIVE TRAINING Sales & Catering\\nTime: Jan 12, 2026 09:30 AM Singapore\\nJoin Zoom Meeting\\nhttps://us06web.zoom.us/j/84237044357?pwd=JKS6MB8owQTUiFySJfejBeaDMKPhQ7.1\\n\\nMeeting ID: 842 3704 4357\\nPasscode: 483019\\n\\nJoin instructions\\nhttps://us06web.zoom.us/meetings/84237044357/invitations?signature=rji36KINXcADoeEbiLDjL8SceB4XKwktjSo1GG_sRZo\\n\\n","video_link":null,"max_participants":50}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-02 03:44:06'),
	(45, 2, 'darma@gmail.com', 'CREATE', 'schedule', 7, NULL, '{"module_id":"11","date":"2026-01-12","session":"Session 2","start_time":"13:00","end_time":"16:30","zoom_link":"PT. Supranusa Sindata VHP SOFTWARE is inviting you to a scheduled Zoom meeting.\\n\\nTopic: VHP CLOUD COLLECTIVE TRAINING Inventory Receiving\\nTime: Jan 12, 2026 02:00 PM Singapore\\nJoin Zoom Meeting\\nhttps://us06web.zoom.us/j/81336121898?pwd=Cd8TmmO4RrbXviXcak1RMjHCpYLM29.1\\n\\nMeeting ID: 813 3612 1898\\nPasscode: 669444\\n\\nJoin instructions\\nhttps://us06web.zoom.us/meetings/81336121898/invitations?signature=nv_3kIvs5qv3-OejagnOcGT-J-K5OtIPQtS0ktZAKB4\\n\\n","video_link":null,"max_participants":50}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-02 03:44:38'),
	(46, 2, 'darma@gmail.com', 'CREATE', 'schedule', 8, NULL, '{"module_id":"15","date":"2026-01-12","session":"Session 1","start_time":"09:30","end_time":"12:30","zoom_link":"PT. Supranusa Sindata VHP SOFTWARE is inviting you to a scheduled Zoom meeting.\\n\\nTopic: VHP CLOUD COLLECTIVE TRAINING FO Reception & Reservation (Part 2)\\nTime: Jan 13, 2026 09:30 AM Singapore\\nJoin Zoom Meeting\\nhttps://us06web.zoom.us/j/85102520539?pwd=2m1DVgJdYTr6KaTSmwhbWb9CsLT3Q5.1\\n\\nMeeting ID: 851 0252 0539\\nPasscode: 718799\\n\\nJoin instructions\\nhttps://us06web.zoom.us/meetings/85102520539/invitations?signature=pxw7Vpwr9HQuttxbvAv8O9pS_cX3gBV294C6q2GOHWc\\n\\n","video_link":null,"max_participants":50}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-02 03:45:11'),
	(47, 2, 'darma@gmail.com', 'CREATE', 'schedule', 9, NULL, '{"module_id":"12","date":"2026-01-13","session":"Session 2","start_time":"13:00","end_time":"16:30","zoom_link":"PT. Supranusa Sindata VHP SOFTWARE is inviting you to a scheduled Zoom meeting.\\n\\nTopic: VHP CLOUD COLLECTIVE TRAINING Inventory Outgoing\\nTime: Jan 13, 2026 02:00 PM Singapore\\nJoin Zoom Meeting\\nhttps://us06web.zoom.us/j/84890859881?pwd=HACItQOozhZtOpnfeREedEVwO0jPdQ.1\\n\\nMeeting ID: 848 9085 9881\\nPasscode: 414685\\n\\nJoin instructions\\nhttps://us06web.zoom.us/meetings/84890859881/invitations?signature=dfD-YosUgrFlwLV01jI8q__qtmG53PAml8AHbgNeTls\\n\\n","video_link":null,"max_participants":50}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-02 03:46:11'),
	(48, 2, 'darma@gmail.com', 'CREATE', 'hotel', 5, NULL, '{"name":"Homy Nomad","token_quota":"10","gdrive_link":null,"overhandle_form_link":null}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-02 03:47:14'),
	(49, 2, 'darma@gmail.com', 'CREATE', 'hotel_schedule_bulk', NULL, NULL, '{"hotel_ids":[5],"schedule_ids":[6,7,8,9],"count":4}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-02 03:47:41'),
	(50, 2, 'darma@gmail.com', 'CREATE', 'hotel_schedule_bulk', NULL, NULL, '{"hotel_ids":[4],"schedule_ids":[6,8],"count":2}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-02 03:48:27'),
	(51, 3, 'amaranta@gmail.com', 'LOGIN', 'admin', 3, NULL, '{"email":"amaranta@gmail.com","role":"hotel_user"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-02 04:11:59'),
	(52, 2, 'darma@gmail.com', 'CREATE', 'hotel_schedule_bulk', NULL, NULL, '{"hotel_ids":[3],"schedule_ids":[6,7,8,9],"count":4}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-02 04:15:29');

-- Dumping data for table kolektiftrainingvhp_training_voucher_db.hotels: ~5 rows (approximately)
INSERT IGNORE INTO `hotels` (`id`, `name`, `token_quota`, `token_used`, `status`, `gdrive_link`, `overhandle_form_link`) VALUES
	(1, 'Hotel A', 100, 0, 1, NULL, NULL),
	(2, 'Hotel B', 50, 1, 1, NULL, NULL),
	(3, 'Hotel C', 200, 14, 1, NULL, NULL),
	(4, 'Amaranta Prambanan', 10, 6, 1, NULL, NULL),
	(5, 'Homy Nomad', 10, 4, 1, NULL, NULL);

-- Dumping data for table kolektiftrainingvhp_training_voucher_db.others_information: ~3 rows (approximately)
INSERT IGNORE INTO `others_information` (`id`, `type`, `detail`, `created_at`, `updated_at`) VALUES
	(1, 'terms', 'Syarat dan ketentuan penggunaan sistem training voucher.', '2025-12-01 06:52:10', '2025-12-01 06:52:10'),
	(2, 'warning_generate', 'Peringatan: Pastikan data yang diinput sudah benar sebelum generate voucher.', '2025-12-01 06:52:10', '2025-12-01 06:52:10'),
	(3, 'maximum_expired', '90', '2025-12-01 07:42:19', '2025-12-01 07:42:19');

-- Dumping data for table kolektiftrainingvhp_training_voucher_db.token_logs: ~11 rows (approximately)
INSERT IGNORE INTO `token_logs` (`id`, `hotel_id`, `registration_id`, `token_change`, `reason`, `created_at`) VALUES
	(1, 4, 1, -1, 'Voucher Registration', '2025-11-25 13:33:19'),
	(2, 4, 2, -1, 'Voucher Registration (First - Token Deducted)', '2025-11-25 14:50:17'),
	(3, 4, 3, -1, 'Voucher Registration (First - Token Deducted)', '2025-11-26 12:04:06'),
	(4, 2, 4, -1, 'Voucher Registration (First - Token Deducted)', '2025-11-26 12:46:55'),
	(5, 4, 5, 0, 'Voucher Registration (Additional - No Token Deducted)', '2025-11-26 09:42:06'),
	(6, 4, 6, 0, 'Voucher Registration (Additional - No Token Deducted)', '2025-11-26 09:48:57'),
	(7, 4, 7, 0, 'Voucher Registration (Additional - No Token Deducted)', '2025-11-27 09:19:00'),
	(8, 4, 8, -1, 'Voucher Registration (First - Token Deducted)', '2025-12-19 14:53:41'),
	(9, 5, NULL, -4, 'Bulk Hotel Schedule Assignment (4 schedules)', '2026-01-02 03:47:41'),
	(10, 4, NULL, -2, 'Bulk Hotel Schedule Assignment (2 schedules)', '2026-01-02 03:48:27'),
	(11, 3, NULL, -4, 'Bulk Hotel Schedule Assignment (4 schedules)', '2026-01-02 04:15:29');

-- Dumping data for table kolektiftrainingvhp_training_voucher_db.training_modules: ~21 rows (approximately)
INSERT IGNORE INTO `training_modules` (`id`, `name`, `description`) VALUES
	(1, 'Sales & Catering', 'tes'),
	(2, 'FO Reception I', 'FO Reception I'),
	(3, 'FO Cashier I', 'FO Cashier I'),
	(4, 'Telephone Operator', 'Telephone Operator'),
	(5, 'Housekeeping', 'Housekeeping'),
	(6, 'Outlet POS', 'Outlet POS'),
	(7, 'Night Audit', 'Night Audit'),
	(8, 'Income Audit', 'Income Audit'),
	(9, 'Account Receivable', 'Account Receivable'),
	(10, 'Purchasing', 'Purchasing'),
	(11, 'Inventory Receiving', 'Inventory Receiving'),
	(12, 'Inventory Outgoing', 'Inventory Outgoing'),
	(13, 'Inventory Cost Control I', 'Inventory Cost Control I'),
	(14, 'Inventory Cost Control II', 'Inventory Cost Control II'),
	(15, 'FO Reception II', 'FO Reception II'),
	(16, 'FO Cashier II', 'FO Cashier II'),
	(17, 'Account Payable', 'Account Payable'),
	(18, 'General Cashier', 'General Cashier'),
	(19, 'General Ledger', 'General Ledger'),
	(20, 'Fixed Assets', 'Fixed Assets'),
	(21, 'Engineering', 'Engineering');

-- Dumping data for table kolektiftrainingvhp_training_voucher_db.training_schedules: ~9 rows (approximately)
INSERT IGNORE INTO `training_schedules` (`id`, `module_id`, `date`, `session`, `start_time`, `end_time`, `zoom_link`, `video_link`, `max_participants`) VALUES
	(1, 1, '2025-12-17', 'Session 1', '09:00:00', '12:00:00', 'https://zoom.us/j/123456789', 'https://youtu.be/s83wqOqaUVE', 50),
	(2, 1, '2025-11-28', 'Session 2', '13:00:00', '16:00:00', 'https://zoom.us/j/987654321', 'https://youtu.be/s83wqOqaUVE', 50),
	(3, 2, '2025-11-27', 'Session 1', '10:00:00', '11:30:00', 'https://zoom.us/j/111222333', NULL, 50),
	(4, 1, '2025-12-27', 'Session 1', '12:55:00', '16:56:00', 'https://us06web.zoom.us/meetings/86397421279/invitations?signature=GLY1isE7Na_0uK2u9a0CuU-YiSKba1NtjPxb6rNHyTQ', NULL, 50),
	(5, 1, '2025-12-27', 'Session 1', '12:55:00', '16:56:00', 'https://us06web.zoom.us/meetings/86397421279/invitations?signature=GLY1isE7Na_0uK2u9a0CuU-YiSKba1NtjPxb6rNHyTQ', NULL, 50),
	(6, 1, '2026-01-12', 'Session 1', '09:30:00', '12:30:00', 'PT. Supranusa Sindata VHP SOFTWARE is inviting you to a scheduled Zoom meeting.\n\nTopic: VHP CLOUD COLLECTIVE TRAINING Sales & Catering\nTime: Jan 12, 2026 09:30 AM Singapore\nJoin Zoom Meeting\nhttps://us06web.zoom.us/j/84237044357?pwd=JKS6MB8owQTUiFySJfejBe', NULL, 50),
	(7, 11, '2026-01-12', 'Session 2', '13:00:00', '16:30:00', 'PT. Supranusa Sindata VHP SOFTWARE is inviting you to a scheduled Zoom meeting.\n\nTopic: VHP CLOUD COLLECTIVE TRAINING Inventory Receiving\nTime: Jan 12, 2026 02:00 PM Singapore\nJoin Zoom Meeting\nhttps://us06web.zoom.us/j/81336121898?pwd=Cd8TmmO4RrbXviXcak1', NULL, 50),
	(8, 15, '2026-01-12', 'Session 1', '09:30:00', '12:30:00', 'PT. Supranusa Sindata VHP SOFTWARE is inviting you to a scheduled Zoom meeting.\n\nTopic: VHP CLOUD COLLECTIVE TRAINING FO Reception & Reservation (Part 2)\nTime: Jan 13, 2026 09:30 AM Singapore\nJoin Zoom Meeting\nhttps://us06web.zoom.us/j/85102520539?pwd=2m1', NULL, 50),
	(9, 12, '2026-01-13', 'Session 2', '13:00:00', '16:30:00', 'PT. Supranusa Sindata VHP SOFTWARE is inviting you to a scheduled Zoom meeting.\n\nTopic: VHP CLOUD COLLECTIVE TRAINING Inventory Outgoing\nTime: Jan 13, 2026 02:00 PM Singapore\nJoin Zoom Meeting\nhttps://us06web.zoom.us/j/84890859881?pwd=HACItQOozhZtOpnfeREe', NULL, 50);

-- Dumping data for table kolektiftrainingvhp_training_voucher_db.vouchers: ~18 rows (approximately)
INSERT IGNORE INTO `vouchers` (`id`, `staff_name`, `hotel_id`, `module_id`, `schedule_id`, `zoom_link`, `token_cost`, `created_at`) VALUES
	(1, 'Budi', 4, 1, 1, 'https://zoom.us/j/123456789', 1, '2025-11-25 13:33:19'),
	(2, 'Budi', 4, 1, 2, 'https://zoom.us/j/987654321', 1, '2025-11-25 14:50:17'),
	(3, 'budi', 4, 2, 3, 'https://zoom.us/j/111222333', 1, '2025-11-26 12:04:06'),
	(4, 'Anjas', 2, 1, 2, 'https://zoom.us/j/987654321', 1, '2025-11-26 12:46:55'),
	(5, 'Bojo', 4, 2, 3, 'https://zoom.us/j/111222333', 0, '2025-11-26 09:42:06'),
	(6, 'Jenny', 4, 1, 1, 'https://zoom.us/j/123456789', 0, '2025-11-26 09:48:57'),
	(7, 'hyhyh', 4, 2, 3, 'https://zoom.us/j/111222333', 0, '2025-11-27 09:19:00'),
	(8, '121212', 4, 1, 5, 'https://us06web.zoom.us/meetings/86397421279/invitations?signature=GLY1isE7Na_0uK2u9a0CuU-YiSKba1NtjPxb6rNHyTQ', 1, '2025-12-19 14:53:41'),
	(9, 'HOTEL_ASSIGNMENT', 5, 1, 6, 'PT. Supranusa Sindata VHP SOFTWARE is inviting you to a scheduled Zoom meeting.\n\nTopic: VHP CLOUD COLLECTIVE TRAINING Sales & Catering\nTime: Jan 12, 2026 09:30 AM Singapore\nJoin Zoom Meeting\nhttps://us06web.zoom.us/j/84237044357?pwd=JKS6MB8owQTUiFySJfejBe', 1, '2026-01-02 03:47:41'),
	(10, 'HOTEL_ASSIGNMENT', 5, 11, 7, 'PT. Supranusa Sindata VHP SOFTWARE is inviting you to a scheduled Zoom meeting.\n\nTopic: VHP CLOUD COLLECTIVE TRAINING Inventory Receiving\nTime: Jan 12, 2026 02:00 PM Singapore\nJoin Zoom Meeting\nhttps://us06web.zoom.us/j/81336121898?pwd=Cd8TmmO4RrbXviXcak1', 1, '2026-01-02 03:47:41'),
	(11, 'HOTEL_ASSIGNMENT', 5, 15, 8, 'PT. Supranusa Sindata VHP SOFTWARE is inviting you to a scheduled Zoom meeting.\n\nTopic: VHP CLOUD COLLECTIVE TRAINING FO Reception & Reservation (Part 2)\nTime: Jan 13, 2026 09:30 AM Singapore\nJoin Zoom Meeting\nhttps://us06web.zoom.us/j/85102520539?pwd=2m1', 1, '2026-01-02 03:47:41'),
	(12, 'HOTEL_ASSIGNMENT', 5, 12, 9, 'PT. Supranusa Sindata VHP SOFTWARE is inviting you to a scheduled Zoom meeting.\n\nTopic: VHP CLOUD COLLECTIVE TRAINING Inventory Outgoing\nTime: Jan 13, 2026 02:00 PM Singapore\nJoin Zoom Meeting\nhttps://us06web.zoom.us/j/84890859881?pwd=HACItQOozhZtOpnfeREe', 1, '2026-01-02 03:47:41'),
	(13, 'HOTEL_ASSIGNMENT', 4, 1, 6, 'PT. Supranusa Sindata VHP SOFTWARE is inviting you to a scheduled Zoom meeting.\n\nTopic: VHP CLOUD COLLECTIVE TRAINING Sales & Catering\nTime: Jan 12, 2026 09:30 AM Singapore\nJoin Zoom Meeting\nhttps://us06web.zoom.us/j/84237044357?pwd=JKS6MB8owQTUiFySJfejBe', 1, '2026-01-02 03:48:27'),
	(14, 'HOTEL_ASSIGNMENT', 4, 15, 8, 'PT. Supranusa Sindata VHP SOFTWARE is inviting you to a scheduled Zoom meeting.\n\nTopic: VHP CLOUD COLLECTIVE TRAINING FO Reception & Reservation (Part 2)\nTime: Jan 13, 2026 09:30 AM Singapore\nJoin Zoom Meeting\nhttps://us06web.zoom.us/j/85102520539?pwd=2m1', 1, '2026-01-02 03:48:27'),
	(15, 'HOTEL_ASSIGNMENT', 3, 1, 6, 'PT. Supranusa Sindata VHP SOFTWARE is inviting you to a scheduled Zoom meeting.\n\nTopic: VHP CLOUD COLLECTIVE TRAINING Sales & Catering\nTime: Jan 12, 2026 09:30 AM Singapore\nJoin Zoom Meeting\nhttps://us06web.zoom.us/j/84237044357?pwd=JKS6MB8owQTUiFySJfejBe', 1, '2026-01-02 04:15:29'),
	(16, 'HOTEL_ASSIGNMENT', 3, 11, 7, 'PT. Supranusa Sindata VHP SOFTWARE is inviting you to a scheduled Zoom meeting.\n\nTopic: VHP CLOUD COLLECTIVE TRAINING Inventory Receiving\nTime: Jan 12, 2026 02:00 PM Singapore\nJoin Zoom Meeting\nhttps://us06web.zoom.us/j/81336121898?pwd=Cd8TmmO4RrbXviXcak1', 1, '2026-01-02 04:15:29'),
	(17, 'HOTEL_ASSIGNMENT', 3, 15, 8, 'PT. Supranusa Sindata VHP SOFTWARE is inviting you to a scheduled Zoom meeting.\n\nTopic: VHP CLOUD COLLECTIVE TRAINING FO Reception & Reservation (Part 2)\nTime: Jan 13, 2026 09:30 AM Singapore\nJoin Zoom Meeting\nhttps://us06web.zoom.us/j/85102520539?pwd=2m1', 1, '2026-01-02 04:15:29'),
	(18, 'HOTEL_ASSIGNMENT', 3, 12, 9, 'PT. Supranusa Sindata VHP SOFTWARE is inviting you to a scheduled Zoom meeting.\n\nTopic: VHP CLOUD COLLECTIVE TRAINING Inventory Outgoing\nTime: Jan 13, 2026 02:00 PM Singapore\nJoin Zoom Meeting\nhttps://us06web.zoom.us/j/84890859881?pwd=HACItQOozhZtOpnfeREe', 1, '2026-01-02 04:15:29');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;

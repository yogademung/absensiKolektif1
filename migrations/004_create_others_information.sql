-- Migration: Create others_information table
-- Description: Store terms & conditions, warnings, and other informational content

CREATE TABLE IF NOT EXISTS `others_information` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `type` varchar(50) NOT NULL COMMENT 'Type of information: terms, warning_generate, etc',
  `detail` text NOT NULL COMMENT 'Content/detail of the information',
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_type` (`type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Sample data
INSERT INTO `others_information` (`type`, `detail`) VALUES
('terms', 'Syarat dan ketentuan penggunaan sistem training voucher.'),
('warning_generate', 'Peringatan: Pastikan data yang diinput sudah benar sebelum generate voucher.');

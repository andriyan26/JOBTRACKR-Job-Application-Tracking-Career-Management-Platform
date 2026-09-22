-- ==========================================================
-- JOBTRACKR MySQL Database Schema for Hostinger
-- Career Command Center & Multi-Device Sync Database
-- ==========================================================

CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `email` VARCHAR(191) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `role_title` VARCHAR(150) DEFAULT 'Job Seeker',
  `location` VARCHAR(150) DEFAULT 'Indonesia',
  `target_salary` VARCHAR(100) DEFAULT '15.000.000 - 25.000.000 IDR',
  `avatar` LONGTEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `applications` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `user_id` VARCHAR(64) NOT NULL,
  `company_name` VARCHAR(191) NOT NULL,
  `position` VARCHAR(191) NOT NULL,
  `applied_via` VARCHAR(100) DEFAULT 'LinkedIn',
  `location` VARCHAR(150) DEFAULT 'Indonesia',
  `salary_range` VARCHAR(100) DEFAULT 'Negotiable',
  `work_mode` VARCHAR(50) DEFAULT 'On-site',
  `job_type` VARCHAR(50) DEFAULT 'Full-time',
  `application_date` DATE NOT NULL,
  `current_status` VARCHAR(50) DEFAULT 'Applied',
  `last_contact_date` DATE,
  `notes` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_user_apps` (`user_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `application_events` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `user_id` VARCHAR(64) NOT NULL,
  `application_id` VARCHAR(64),
  `type` VARCHAR(50) NOT NULL,
  `title` VARCHAR(191) NOT NULL,
  `event_date` VARCHAR(50) NOT NULL,
  `description` TEXT,
  `completed` TINYINT(1) DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_user_events` (`user_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `synced_emails` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` VARCHAR(64) NOT NULL,
  `email_id` VARCHAR(191) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `user_email_unique` (`user_id`, `email_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

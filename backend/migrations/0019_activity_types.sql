-- FitIn: activity_types. Applied migrations are immutable; add a new file for changes.
CREATE TABLE `activity_types` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `code` VARCHAR(64) COLLATE utf8mb4_0900_bin NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `category` VARCHAR(24) NOT NULL,
  `active` BOOLEAN NOT NULL DEFAULT 1,
  CHECK (`active` IN (0,1)),
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  UNIQUE (`code`),
  CHECK (`category` IN ('cardio','strength','mobility','aquatic','sport','dance','combat','other')),
  INDEX (`active`,`category`,`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

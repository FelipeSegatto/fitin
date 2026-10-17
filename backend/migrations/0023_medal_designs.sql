-- FitIn: medal_designs. Applied migrations are immutable; add a new file for changes.
CREATE TABLE `medal_designs` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `code` VARCHAR(64) COLLATE utf8mb4_0900_bin NOT NULL,
  `kind` VARCHAR(16) NOT NULL,
  `finish` VARCHAR(24) NOT NULL,
  `asset_key` VARCHAR(500) NOT NULL,
  `active` BOOLEAN NOT NULL DEFAULT 1,
  CHECK (`active` IN (0,1)),
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  UNIQUE (`code`),
  CHECK (`kind` IN ('medallion','dumbbell'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

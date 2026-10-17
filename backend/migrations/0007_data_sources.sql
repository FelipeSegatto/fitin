-- FitIn: data_sources. Applied migrations are immutable; add a new file for changes.
CREATE TABLE `data_sources` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `code` VARCHAR(32) COLLATE utf8mb4_0900_bin NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `kind` VARCHAR(24) NOT NULL,
  `base_url` VARCHAR(1000) NULL,
  `terms_url` VARCHAR(1000) NULL,
  `license_code` VARCHAR(100) NULL,
  `license_notes` TEXT NULL,
  `terms_checked_at` DATETIME(6) NULL,
  `enabled` BOOLEAN NOT NULL DEFAULT 1,
  CHECK (`enabled` IN (0,1)),
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  UNIQUE (`code`),
  CHECK (`kind` IN ('external_api','reference_dataset','personal_label','fitin_curated'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- FitIn: source_records. Applied migrations are immutable; add a new file for changes.
CREATE TABLE `source_records` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `source_id` BIGINT UNSIGNED NOT NULL,
  `external_id` VARCHAR(191) COLLATE utf8mb4_0900_bin NOT NULL,
  `source_url` VARCHAR(1000) NULL,
  `first_seen_at` DATETIME(6) NOT NULL,
  `last_seen_at` DATETIME(6) NOT NULL,
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  UNIQUE (`source_id`,`external_id`),
  CHECK (last_seen_at >= first_seen_at),
  FOREIGN KEY (`source_id`) REFERENCES `data_sources` (`id`) ON UPDATE RESTRICT ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

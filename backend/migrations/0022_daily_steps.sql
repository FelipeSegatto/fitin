-- FitIn: daily_steps. Applied migrations are immutable; add a new file for changes.
CREATE TABLE `daily_steps` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `local_date` DATE NOT NULL,
  `timezone` VARCHAR(64) NOT NULL,
  `steps` INT UNSIGNED NOT NULL,
  `origin` VARCHAR(16) NOT NULL,
  `provider_source_id` BIGINT UNSIGNED NULL,
  `row_version` INT UNSIGNED NOT NULL DEFAULT 1,
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  CHECK (`row_version` > 0),
  UNIQUE (`user_id`,`local_date`),
  CHECK (`origin` IN ('manual','device','import')),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON UPDATE RESTRICT ON DELETE RESTRICT,
  FOREIGN KEY (`provider_source_id`) REFERENCES `data_sources` (`id`) ON UPDATE RESTRICT ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- FitIn: search_equivalences. Applied migrations are immutable; add a new file for changes.
CREATE TABLE `search_equivalences` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `source_language` VARCHAR(16) NOT NULL,
  `target_language` VARCHAR(16) NOT NULL,
  `term_normalized` VARCHAR(191) NOT NULL,
  `translated_term` VARCHAR(191) NOT NULL,
  `qualifier` VARCHAR(100) NOT NULL DEFAULT '',
  `target_source_id` BIGINT UNSIGNED NULL,
  `priority` SMALLINT UNSIGNED NOT NULL DEFAULT 100,
  `status` VARCHAR(16) NOT NULL DEFAULT 'active',
  `created_by_user_id` BIGINT UNSIGNED NULL,
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  UNIQUE (`source_language`,`target_language`,`term_normalized`,`qualifier`,`translated_term`),
  CHECK (`status` IN ('active','disabled')),
  INDEX (`source_language`,`target_language`,`term_normalized`,`status`,`priority`),
  FOREIGN KEY (`target_source_id`) REFERENCES `data_sources` (`id`) ON UPDATE RESTRICT ON DELETE RESTRICT,
  FOREIGN KEY (`created_by_user_id`) REFERENCES `users` (`id`) ON UPDATE RESTRICT ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

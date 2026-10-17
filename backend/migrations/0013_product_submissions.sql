-- FitIn: product_submissions. Applied migrations are immutable; add a new file for changes.
CREATE TABLE `product_submissions` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `submitted_by_user_id` BIGINT UNSIGNED NOT NULL,
  `food_id` BIGINT UNSIGNED NOT NULL,
  `food_version_id` BIGINT UNSIGNED NOT NULL,
  `status` VARCHAR(24) NOT NULL DEFAULT 'pending',
  `submitted_at` DATETIME(6) NOT NULL,
  `decided_at` DATETIME(6) NULL,
  `published_food_version_id` BIGINT UNSIGNED NULL,
  `row_version` INT UNSIGNED NOT NULL DEFAULT 1,
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  CHECK (`row_version` > 0),
  FOREIGN KEY (`food_id`) REFERENCES `foods` (`id`) ON UPDATE RESTRICT ON DELETE RESTRICT,
  FOREIGN KEY (`food_version_id`,`food_id`) REFERENCES `food_versions` (`id`,`food_id`) ON UPDATE RESTRICT ON DELETE RESTRICT,
  UNIQUE (`food_version_id`),
  CHECK (`status` IN ('pending','under_review','needs_changes','approved','rejected','withdrawn')),
  CHECK ((status='approved' AND published_food_version_id IS NOT NULL AND decided_at IS NOT NULL) OR (status='rejected' AND published_food_version_id IS NULL AND decided_at IS NOT NULL) OR (status NOT IN ('approved','rejected') AND published_food_version_id IS NULL AND decided_at IS NULL)),
  INDEX (`status`,`submitted_at`,`id`),
  FOREIGN KEY (`submitted_by_user_id`) REFERENCES `users` (`id`) ON UPDATE RESTRICT ON DELETE RESTRICT,
  FOREIGN KEY (`published_food_version_id`) REFERENCES `food_versions` (`id`) ON UPDATE RESTRICT ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

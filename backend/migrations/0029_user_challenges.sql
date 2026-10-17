-- FitIn: user_challenges. Applied migrations are immutable; add a new file for changes.
CREATE TABLE `user_challenges` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `edition_id` BIGINT UNSIGNED NOT NULL,
  `selected_at` DATETIME(6) NOT NULL,
  `timezone` VARCHAR(64) NOT NULL,
  `status` VARCHAR(16) NOT NULL DEFAULT 'selected',
  `completed_at` DATETIME(6) NULL,
  `withdrawn_at` DATETIME(6) NULL,
  `completion_snapshot` JSON NULL,
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  UNIQUE (`user_id`,`edition_id`),
  CHECK (`status` IN ('selected','completed','withdrawn')),
  CHECK ((status='selected' AND completed_at IS NULL AND withdrawn_at IS NULL AND completion_snapshot IS NULL) OR (status='completed' AND completed_at IS NOT NULL AND completion_snapshot IS NOT NULL AND withdrawn_at IS NULL) OR (status='withdrawn' AND withdrawn_at IS NOT NULL AND completed_at IS NULL AND completion_snapshot IS NULL)),
  INDEX (`user_id`,`status`,`id`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON UPDATE RESTRICT ON DELETE RESTRICT,
  FOREIGN KEY (`edition_id`) REFERENCES `challenge_editions` (`id`) ON UPDATE RESTRICT ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

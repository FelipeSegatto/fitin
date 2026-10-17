-- FitIn: submission_events. Applied migrations are immutable; add a new file for changes.
CREATE TABLE `submission_events` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `submission_id` BIGINT UNSIGNED NOT NULL,
  `actor_user_id` BIGINT UNSIGNED NULL,
  `event_type` VARCHAR(32) NOT NULL,
  `from_status` VARCHAR(24) NULL,
  `to_status` VARCHAR(24) NOT NULL,
  `reason_code` VARCHAR(64) NULL,
  `message` TEXT NULL,
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  CHECK (`event_type` IN ('submitted','review_started','changes_requested','approved','rejected','withdrawn')),
  CHECK (`from_status` IN ('pending','under_review','needs_changes','approved','rejected','withdrawn')),
  CHECK (`to_status` IN ('pending','under_review','needs_changes','approved','rejected','withdrawn')),
  INDEX (`submission_id`,`created_at`,`id`),
  FOREIGN KEY (`submission_id`) REFERENCES `product_submissions` (`id`) ON UPDATE RESTRICT ON DELETE RESTRICT,
  FOREIGN KEY (`actor_user_id`) REFERENCES `users` (`id`) ON UPDATE RESTRICT ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- FitIn: ai_decisions. Applied migrations are immutable; add a new file for changes.
CREATE TABLE `ai_decisions` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `ai_request_id` BIGINT UNSIGNED NOT NULL,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `action` VARCHAR(16) NOT NULL,
  `accepted_payload` JSON NULL,
  `created_record_id` BIGINT UNSIGNED NULL,
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  FOREIGN KEY (`ai_request_id`,`user_id`) REFERENCES `ai_requests` (`id`,`user_id`) ON UPDATE RESTRICT ON DELETE RESTRICT,
  FOREIGN KEY (`created_record_id`,`user_id`) REFERENCES `records` (`id`,`user_id`) ON UPDATE RESTRICT ON DELETE RESTRICT,
  UNIQUE (`ai_request_id`),
  CHECK (`action` IN ('accepted','edited','rejected')),
  CHECK ((action IN ('accepted','edited') AND accepted_payload IS NOT NULL AND created_record_id IS NOT NULL) OR (action='rejected' AND accepted_payload IS NULL AND created_record_id IS NULL))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

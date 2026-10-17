-- FitIn: processing_jobs. Applied migrations are immutable; add a new file for changes.
CREATE TABLE `processing_jobs` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `outbox_event_id` BIGINT UNSIGNED NULL,
  `job_type` VARCHAR(64) NOT NULL,
  `idempotency_key` VARCHAR(191) COLLATE utf8mb4_0900_bin NOT NULL,
  `payload` JSON NOT NULL,
  `status` VARCHAR(16) NOT NULL DEFAULT 'pending',
  `attempt_count` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  `max_attempts` SMALLINT UNSIGNED NOT NULL DEFAULT 5,
  `available_at` DATETIME(6) NOT NULL,
  `locked_until` DATETIME(6) NULL,
  `lock_token` BINARY(16) NULL,
  `last_error_code` VARCHAR(64) NULL,
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  UNIQUE (`idempotency_key`),
  CHECK (`status` IN ('pending','running','retry','succeeded','failed','cancelled')),
  CHECK (max_attempts > 0 AND attempt_count <= max_attempts),
  CHECK ((status='running' AND locked_until IS NOT NULL AND lock_token IS NOT NULL) OR (status<>'running' AND lock_token IS NULL AND locked_until IS NULL)),
  INDEX (`status`,`available_at`,`id`),
  FOREIGN KEY (`outbox_event_id`) REFERENCES `outbox_events` (`id`) ON UPDATE RESTRICT ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

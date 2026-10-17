-- FitIn: processing_runs. Applied migrations are immutable; add a new file for changes.
CREATE TABLE `processing_runs` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `job_id` BIGINT UNSIGNED NOT NULL,
  `attempt_no` SMALLINT UNSIGNED NOT NULL,
  `pipeline_version` VARCHAR(64) NOT NULL,
  `input_sha256` BINARY(32) NOT NULL,
  `status` VARCHAR(16) NOT NULL,
  `started_at` DATETIME(6) NOT NULL,
  `finished_at` DATETIME(6) NULL,
  `error_code` VARCHAR(64) NULL,
  `error_message` VARCHAR(1000) NULL,
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  UNIQUE (`job_id`,`attempt_no`),
  CHECK (attempt_no > 0),
  CHECK (`status` IN ('running','succeeded','failed','cancelled')),
  CHECK (finished_at IS NULL OR finished_at >= started_at),
  CHECK ((status='running' AND finished_at IS NULL) OR (status<>'running' AND finished_at IS NOT NULL)),
  INDEX (`status`,`started_at`),
  FOREIGN KEY (`job_id`) REFERENCES `processing_jobs` (`id`) ON UPDATE RESTRICT ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

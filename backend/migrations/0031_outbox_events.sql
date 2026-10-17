-- FitIn: outbox_events. Applied migrations are immutable; add a new file for changes.
CREATE TABLE `outbox_events` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `event_type` VARCHAR(100) NOT NULL,
  `aggregate_type` VARCHAR(64) NOT NULL,
  `aggregate_id` BIGINT UNSIGNED NOT NULL,
  `aggregate_version` INT UNSIGNED NOT NULL,
  `payload` JSON NOT NULL,
  `available_at` DATETIME(6) NOT NULL,
  `published_at` DATETIME(6) NULL,
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  UNIQUE (`event_type`,`aggregate_type`,`aggregate_id`,`aggregate_version`),
  CHECK (aggregate_version > 0),
  INDEX (`published_at`,`available_at`,`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

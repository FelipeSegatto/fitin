-- FitIn: source_snapshots. Applied migrations are immutable; add a new file for changes.
CREATE TABLE `source_snapshots` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `source_record_id` BIGINT UNSIGNED NOT NULL,
  `fetched_at` DATETIME(6) NOT NULL,
  `upstream_version` VARCHAR(100) NULL,
  `payload_sha256` BINARY(32) NOT NULL,
  `payload_json` JSON NULL,
  `payload_object_key` VARCHAR(500) NULL,
  `retention_until` DATETIME(6) NULL,
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  UNIQUE (`source_record_id`,`payload_sha256`),
  CHECK ((payload_json IS NOT NULL) <> (payload_object_key IS NOT NULL)),
  INDEX (`source_record_id`,`fetched_at`),
  FOREIGN KEY (`source_record_id`) REFERENCES `source_records` (`id`) ON UPDATE RESTRICT ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

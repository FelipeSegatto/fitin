-- FitIn: processing_inputs. Applied migrations are immutable; add a new file for changes.
CREATE TABLE `processing_inputs` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `run_id` BIGINT UNSIGNED NOT NULL,
  `source_snapshot_id` BIGINT UNSIGNED NULL,
  `food_version_id` BIGINT UNSIGNED NULL,
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  UNIQUE (`id`,`run_id`),
  UNIQUE (`run_id`,`source_snapshot_id`),
  UNIQUE (`run_id`,`food_version_id`),
  CHECK ((source_snapshot_id IS NOT NULL) <> (food_version_id IS NOT NULL)),
  FOREIGN KEY (`run_id`) REFERENCES `processing_runs` (`id`) ON UPDATE RESTRICT ON DELETE RESTRICT,
  FOREIGN KEY (`source_snapshot_id`) REFERENCES `source_snapshots` (`id`) ON UPDATE RESTRICT ON DELETE RESTRICT,
  FOREIGN KEY (`food_version_id`) REFERENCES `food_versions` (`id`) ON UPDATE RESTRICT ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

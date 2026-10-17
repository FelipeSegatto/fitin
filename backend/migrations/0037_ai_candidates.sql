-- FitIn: ai_candidates. Applied migrations are immutable; add a new file for changes.
CREATE TABLE `ai_candidates` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `ai_request_id` BIGINT UNSIGNED NOT NULL,
  `position` SMALLINT UNSIGNED NOT NULL,
  `proposed_name` VARCHAR(200) NOT NULL,
  `proposed_quantity` DECIMAL(12,4) NULL,
  CHECK (`proposed_quantity` >= 0),
  `proposed_unit` VARCHAR(4) NULL,
  `matched_food_version_id` BIGINT UNSIGNED NULL,
  `structured_output` JSON NOT NULL,
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  UNIQUE (`ai_request_id`,`position`),
  CHECK ((proposed_quantity IS NULL) = (proposed_unit IS NULL)),
  CHECK (proposed_quantity > 0),
  CHECK (`proposed_unit` IN ('g','ml')),
  FOREIGN KEY (`ai_request_id`) REFERENCES `ai_requests` (`id`) ON UPDATE RESTRICT ON DELETE RESTRICT,
  FOREIGN KEY (`matched_food_version_id`) REFERENCES `food_versions` (`id`) ON UPDATE RESTRICT ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

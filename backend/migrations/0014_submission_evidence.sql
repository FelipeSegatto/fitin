-- FitIn: submission_evidence. Applied migrations are immutable; add a new file for changes.
CREATE TABLE `submission_evidence` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `submission_id` BIGINT UNSIGNED NOT NULL,
  `object_key` VARCHAR(500) NOT NULL,
  `media_type` VARCHAR(100) NOT NULL,
  `byte_size` BIGINT UNSIGNED NOT NULL,
  `sha256` BINARY(32) NOT NULL,
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  UNIQUE (`submission_id`,`sha256`),
  CHECK (byte_size > 0),
  FOREIGN KEY (`submission_id`) REFERENCES `product_submissions` (`id`) ON UPDATE RESTRICT ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

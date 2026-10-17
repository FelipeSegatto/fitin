-- FitIn: user_medals. Applied migrations are immutable; add a new file for changes.
CREATE TABLE `user_medals` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `medal_id` BIGINT UNSIGNED NOT NULL,
  `award_key` VARCHAR(64) COLLATE utf8mb4_0900_bin NOT NULL,
  `earned_at` DATETIME(6) NOT NULL,
  `xp_awarded` INT UNSIGNED NOT NULL,
  `evidence_snapshot` JSON NOT NULL,
  `evaluation_version` VARCHAR(32) NOT NULL,
  `revoked_at` DATETIME(6) NULL,
  `revocation_reason` VARCHAR(500) NULL,
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  UNIQUE (`user_id`,`medal_id`,`award_key`),
  CHECK ((revoked_at IS NULL) = (revocation_reason IS NULL)),
  INDEX (`user_id`,`earned_at`,`id`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON UPDATE RESTRICT ON DELETE RESTRICT,
  FOREIGN KEY (`medal_id`) REFERENCES `medals` (`id`) ON UPDATE RESTRICT ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

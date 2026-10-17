-- FitIn: medals. Applied migrations are immutable; add a new file for changes.
CREATE TABLE `medals` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `code` VARCHAR(64) COLLATE utf8mb4_0900_bin NOT NULL,
  `version_no` INT UNSIGNED NOT NULL,
  `design_id` BIGINT UNSIGNED NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `description` VARCHAR(500) NOT NULL,
  `background_token` VARCHAR(64) NOT NULL,
  `xp_reward` INT UNSIGNED NOT NULL,
  `rule_operator` VARCHAR(8) NOT NULL DEFAULT 'all',
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  UNIQUE (`code`,`version_no`),
  CHECK (version_no > 0),
  CHECK (`rule_operator` IN ('all','any')),
  FOREIGN KEY (`design_id`) REFERENCES `medal_designs` (`id`) ON UPDATE RESTRICT ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

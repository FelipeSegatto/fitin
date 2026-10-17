-- FitIn: challenges. Applied migrations are immutable; add a new file for changes.
CREATE TABLE `challenges` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `code` VARCHAR(64) COLLATE utf8mb4_0900_bin NOT NULL,
  `version_no` INT UNSIGNED NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `description` VARCHAR(500) NOT NULL,
  `metric_code` VARCHAR(40) NOT NULL,
  `target_value` DECIMAL(12,4) NOT NULL,
  CHECK (`target_value` >= 0),
  `reward_medal_id` BIGINT UNSIGNED NULL,
  `background_token` VARCHAR(64) NOT NULL,
  `illustration_key` VARCHAR(500) NULL,
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  UNIQUE (`code`,`version_no`),
  CHECK (version_no > 0),
  CHECK (`metric_code` IN ('meal_count','meal_days','activity_count','activity_days','record_days','active_kcal','streak_days','weight_measurement_count')),
  CHECK (target_value > 0),
  FOREIGN KEY (`reward_medal_id`) REFERENCES `medals` (`id`) ON UPDATE RESTRICT ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

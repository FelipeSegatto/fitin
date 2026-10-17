-- FitIn: medal_rules. Applied migrations are immutable; add a new file for changes.
CREATE TABLE `medal_rules` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `medal_id` BIGINT UNSIGNED NOT NULL,
  `position` SMALLINT UNSIGNED NOT NULL,
  `metric_code` VARCHAR(40) NOT NULL,
  `target_value` DECIMAL(12,4) NOT NULL,
  CHECK (`target_value` >= 0),
  `window_kind` VARCHAR(16) NOT NULL,
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  UNIQUE (`medal_id`,`position`),
  CHECK (`metric_code` IN ('meal_count','meal_days','activity_count','activity_days','record_days','active_kcal','streak_days','weight_measurement_count')),
  CHECK (target_value > 0),
  CHECK (`window_kind` IN ('lifetime','calendar_week')),
  FOREIGN KEY (`medal_id`) REFERENCES `medals` (`id`) ON UPDATE RESTRICT ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

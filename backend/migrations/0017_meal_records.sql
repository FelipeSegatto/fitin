-- FitIn: meal_records. Applied migrations are immutable; add a new file for changes.
CREATE TABLE `meal_records` (
  `record_id` BIGINT UNSIGNED NOT NULL PRIMARY KEY,
  `kind` VARCHAR(16) NOT NULL DEFAULT 'food',
  `meal_type` VARCHAR(24) NOT NULL,
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  FOREIGN KEY (`record_id`,`kind`) REFERENCES `records` (`id`,`kind`) ON UPDATE RESTRICT ON DELETE RESTRICT,
  CHECK (kind='food'),
  CHECK (`meal_type` IN ('breakfast','morning_snack','lunch','afternoon_snack','dinner','supper','other'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

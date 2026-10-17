-- FitIn: food_aliases. Applied migrations are immutable; add a new file for changes.
CREATE TABLE `food_aliases` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `food_id` BIGINT UNSIGNED NOT NULL,
  `language_code` VARCHAR(16) NOT NULL,
  `alias` VARCHAR(191) NOT NULL,
  `alias_normalized` VARCHAR(191) NOT NULL,
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  UNIQUE (`food_id`,`language_code`,`alias_normalized`),
  INDEX (`language_code`,`alias_normalized`),
  FOREIGN KEY (`food_id`) REFERENCES `foods` (`id`) ON UPDATE RESTRICT ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

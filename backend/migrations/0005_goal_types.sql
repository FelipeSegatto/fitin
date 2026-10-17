-- FitIn: goal_types. Applied migrations are immutable; add a new file for changes.
CREATE TABLE `goal_types` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `code` VARCHAR(24) COLLATE utf8mb4_0900_bin NOT NULL,
  `name` VARCHAR(60) NOT NULL,
  `balance_direction` SMALLINT NOT NULL,
  `active` BOOLEAN NOT NULL DEFAULT 1,
  CHECK (`active` IN (0,1)),
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  UNIQUE (`code`),
  CHECK (balance_direction IN (-1,0,1))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

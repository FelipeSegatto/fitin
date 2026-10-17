-- FitIn: challenge_editions. Applied migrations are immutable; add a new file for changes.
CREATE TABLE `challenge_editions` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `challenge_id` BIGINT UNSIGNED NOT NULL,
  `starts_on` DATE NOT NULL,
  `ends_on` DATE NOT NULL,
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  UNIQUE (`challenge_id`,`starts_on`),
  CHECK (ends_on > starts_on),
  INDEX (`starts_on`,`ends_on`),
  FOREIGN KEY (`challenge_id`) REFERENCES `challenges` (`id`) ON UPDATE RESTRICT ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- FitIn: account_tokens. Applied migrations are immutable; add a new file for changes.
CREATE TABLE `account_tokens` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `purpose` VARCHAR(24) NOT NULL,
  `token_hash` BINARY(32) NOT NULL,
  `expires_at` DATETIME(6) NOT NULL,
  `used_at` DATETIME(6) NULL,
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  UNIQUE (`token_hash`),
  CHECK (`purpose` IN ('verify_email','reset_password')),
  CHECK (expires_at > created_at),
  INDEX (`user_id`,`purpose`,`expires_at`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON UPDATE RESTRICT ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

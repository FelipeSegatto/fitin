-- FitIn: users. Applied migrations are immutable; add a new file for changes.
CREATE TABLE `users` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `email` VARCHAR(254) NOT NULL,
  `email_normalized` VARCHAR(254) COLLATE utf8mb4_0900_bin NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `display_name` VARCHAR(100) NOT NULL,
  `birth_date` DATE NULL,
  `gender_identity` VARCHAR(40) NULL,
  `calculation_sex` VARCHAR(16) NULL,
  `timezone` VARCHAR(64) NOT NULL DEFAULT 'America/Sao_Paulo',
  `locale` VARCHAR(16) NOT NULL DEFAULT 'pt-BR',
  `character_code` VARCHAR(32) NOT NULL DEFAULT 'blue',
  `status` VARCHAR(16) NOT NULL DEFAULT 'active',
  `email_verified_at` DATETIME(6) NULL,
  `deleted_at` DATETIME(6) NULL,
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  UNIQUE (`email_normalized`),
  CHECK (`calculation_sex` IN ('male','female','unspecified')),
  CHECK (`status` IN ('active','disabled','deletion_pending','deleted'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

#!/bin/bash
# Executed only when the named volume is empty. Never log credentials.
set -euo pipefail
if [[ ! "$MYSQL_DATABASE" =~ ^[a-zA-Z][a-zA-Z0-9_]{0,63}$ ]]; then
  echo 'MYSQL_DATABASE must be a simple SQL identifier.' >&2
  exit 1
fi
# Use SQL-standard quote escaping with NO_BACKSLASH_ESCAPES.
app_password=${FITIN_APP_PASSWORD//\'/\'\'}
migration_password=${FITIN_MIGRATION_PASSWORD//\'/\'\'}
MYSQL_PWD="$MYSQL_ROOT_PASSWORD" mysql --protocol=socket -uroot <<SQL
SET SESSION sql_mode = 'NO_BACKSLASH_ESCAPES';
CREATE USER 'fitin_app'@'%' IDENTIFIED BY '$app_password';
CREATE USER 'fitin_migrator'@'%' IDENTIFIED BY '$migration_password';
GRANT SELECT, INSERT, UPDATE, DELETE ON \`$MYSQL_DATABASE\`.* TO 'fitin_app'@'%';
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, DROP, INDEX, REFERENCES ON \`$MYSQL_DATABASE\`.* TO 'fitin_migrator'@'%';
SQL

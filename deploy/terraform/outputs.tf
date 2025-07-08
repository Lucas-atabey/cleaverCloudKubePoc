output "POSTGRESQL_HOST" {
  value = clevercloud_postgresql.postgresql_database.host
}

output "POSTGRESQL_PORT" {
  value = clevercloud_postgresql.postgresql_database.port
}

output "POSTGRESQL_USER" {
  value = clevercloud_postgresql.postgresql_database.user
  sensitive = true
}

output "POSTGRESQL_PASSWORD" {
  value = clevercloud_postgresql.postgresql_database.password
  sensitive = true
}

output "POSTGRESQL_DBNAME" {
  value = clevercloud_postgresql.postgresql_database.name
}

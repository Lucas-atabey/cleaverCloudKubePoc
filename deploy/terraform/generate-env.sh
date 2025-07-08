#!/bin/bash

echo "# Auto-generated .env from Terraform" > .env

terraform output -raw POSTGRESQL_HOST     > .env.tmp && echo "POSTGRESQL_HOST=$(<.env.tmp)" >> .env
terraform output -raw POSTGRESQL_PORT     > .env.tmp && echo "POSTGRESQL_PORT=$(<.env.tmp)" >> .env
terraform output -raw POSTGRESQL_USER     > .env.tmp && echo "POSTGRESQL_USER=$(<.env.tmp)" >> .env
terraform output -raw POSTGRESQL_PASSWORD > .env.tmp && echo "POSTGRESQL_PASSWORD=$(<.env.tmp)" >> .env
terraform output -raw POSTGRESQL_DBNAME   > .env.tmp && echo "POSTGRESQL_DBNAME=$(<.env.tmp)" >> .env

rm -f .env.tmp

echo "✅ .env file generated!"

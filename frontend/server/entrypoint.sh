#!/bin/bash


echo "[entrypoint] Checking config.json"

if [ -f /tmp/config/config.json ]; then
  echo "[entrypoint] Copying /tmp/config/config.json -> /app/server/public/config/config.json"
  cp /tmp/config/config.json /app/server/public/config/config.json
else
  echo "[entrypoint] No config.json found in /tmp/config/, skipping"
fi

# Lancement du serveur
exec node server.js

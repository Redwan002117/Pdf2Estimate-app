#!/bin/bash
echo "Updating Repair Base App..."

echo "1. Pulling latest image from GitHub Container Registry..."
docker-compose pull

echo "2. Restarting container 'repair-base-unique-container'..."
docker-compose up -d --remove-orphans

echo "3. Cleaning up old images..."
docker image prune -f

echo "Update Complete! Access at http://localhost:6969"

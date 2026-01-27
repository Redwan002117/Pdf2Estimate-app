#!/bin/bash

# Function to print error and exit
error_exit() {
    echo ""
    echo "❌ [ERROR] $1"
    echo "Possible reasons:"
    echo "$2"
    echo ""
    read -p "Press Enter to exit..."
    exit 1
}

echo "=========================================="
echo "     Repair Base App - Update Utility"
echo "=========================================="
echo ""

echo "[Step 1/3] Checking for updates from GitHub..."
if ! docker compose pull; then
    error_exit "Could not download the update." " - No internet connection.\n - Docker is not running.\n - Image name in docker-compose.yml is incorrect."
fi
echo "✅ [SUCCESS] Updates downloaded successfully."
echo ""

echo "[Step 2/3] Restarting the application container..."
if ! docker compose up -d --remove-orphans; then
    error_exit "Could not restart the application." " - Port 6969 might be in use.\n - Docker internal error."
fi
echo "✅ [SUCCESS] Application restarted."
echo ""

echo "[Step 3/3] Cleaning up old temporary files..."
docker image prune -f
echo "✅ [SUCCESS] Cleanup finished."
echo ""

echo "=========================================="
echo "       UPDATE SUCCESSFUL!"
echo "=========================================="
echo ""
echo "The app is running at: http://localhost:6969"
echo ""

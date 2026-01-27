@echo off
setlocal
echo ==========================================
echo      Repair Base App - Update Utility
echo ==========================================
echo.

echo [Step 1/3] Checking for updates from GitHub...
docker-compose pull
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Could not download the update.
    echo Possible reasons:
    echo  - You are not connected to the internet.
    echo  - Docker is not running.
    echo  - The image name in docker-compose.yml is incorrect.
    echo.
    pause
    exit /b %errorlevel%
)
echo [SUCCESS] Updates downloaded successfully.
echo.

echo [Step 2/3] Restarting the application container...
docker-compose up -d --remove-orphans
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Could not restart the application.
    echo Possible reasons:
    echo  - Port 6969 might be used by another program.
    echo  - Docker encountered an internal error.
    echo.
    pause
    exit /b %errorlevel%
)
echo [SUCCESS] Application restarted.
echo.

echo [Step 3/3] Cleaning up old temporary files...
docker image prune -f
echo [SUCCESS] Cleanup finished.
echo.

echo ==========================================
echo       UPDATE SUCCESSFUL!
echo ==========================================
echo.
echo The app is running at: http://localhost:6969
echo.
pause

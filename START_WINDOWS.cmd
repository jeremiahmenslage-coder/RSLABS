@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js was not found. Install Node.js 20 or newer, then retry.
  pause
  exit /b 1
)
echo Phase 1 local editor - using a stable localhost origin.
echo Keep this window open while editing.
echo Open http://127.0.0.1:4173/ in Chrome or Edge.
node scripts\serve.mjs
echo.
echo Server stopped. If unexpected, check that port 4173 is not already occupied.
pause

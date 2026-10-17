@echo off
setlocal
cd /d "%~dp0"
if "%~1"=="--open-browser" goto :OpenBrowser

title KimiWise - AI Smartboard Classroom
color 0B
cls
echo.
echo  =======================================================
echo   KIMIWISE - AI Smartboard Classroom (Localhost Launcher)
echo  =======================================================
echo.

:: 1. Check if KimiWise is ALREADY running on port 3030
curl -s --max-time 1 http://localhost:3030/api/health >nul 2>&1
if %errorlevel% equ 0 (
  echo  [OK] KimiWise server is already active at http://localhost:3030
  echo  Opening KimiWise in your browser...
  call "%~f0" --open-browser
  exit /b 0
)

:: 2. Check Node.js installation
where node >nul 2>&1
if %errorlevel% neq 0 (
  echo  [ERROR] Node.js is not installed on this system.
  echo  Please download and install Node.js from https://nodejs.org
  start "" "https://nodejs.org"
  pause
  exit /b 1
)

:: 3. Install dependencies ONLY if node_modules is missing
if not exist "node_modules\tsx" (
  echo  [1/2] Installing application dependencies for first run ^(please wait 1-2 minutes^)...
  call npm.cmd install --no-audit --no-fund --loglevel=error
  if %errorlevel% neq 0 (
    echo  [ERROR] Failed to install dependencies. Check your internet connection.
    pause
    exit /b 1
  )
) else (
  echo  [1/2] Application dependencies ready.
)

:: 4. Start Server & Auto-Open Browser
echo  [2/2] Launching KimiWise AI Smartboard at http://localhost:3030 ...
echo.
echo  =======================================================
echo   STATUS : ACTIVE (http://localhost:3030)
echo   TIPS   : Keep this terminal window open while using KimiWise.
echo            Press Ctrl+C to stop the server when finished.
echo  =======================================================
echo.

start "" /b cmd /c "timeout /t 3 /nobreak >nul && "%~f0" --open-browser"

set "SERVER_PORT=3030"
set "PORT=3030"

call npx.cmd tsx src/server/server.ts
pause
exit /b 0

:OpenBrowser
set "CHROME_PATH="
for %%p in (
  "%ProgramFiles%\Google\Chrome\Application\chrome.exe"
  "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"
  "%LocalAppData%\Google\Chrome\Application\chrome.exe"
) do (
  if exist %%p (
    set "CHROME_PATH=%%~p"
    goto :LaunchChrome
  )
)

:LaunchChrome
if defined CHROME_PATH (
  start "" "%CHROME_PATH%" "http://localhost:3030/?app=true"
  goto :eof
)

for %%p in (
  "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"
  "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe"
) do (
  if exist %%p (
    start "" "%%~p" "http://localhost:3030/?app=true"
    goto :eof
  )
)

start "" "http://localhost:3030/?app=true"
goto :eof

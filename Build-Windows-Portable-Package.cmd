@echo off
setlocal
cd /d "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%CD%\tools\runtime\Build-Windows-Portable-Package.ps1"
if errorlevel 1 (
  echo.
  echo FEHLER: Das portable Windows-Paket konnte nicht erstellt werden.
  pause
  exit /b 1
)
echo.
echo Das portable Windows-Paket wurde unter dist erstellt.
pause
endlocal

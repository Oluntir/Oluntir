@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo FEHLER: Keine lokale Node.js-Installation gefunden.
  echo Fuer die portable Ausfuehrung bitte Start-Oluntir-API-Analyzer.cmd verwenden.
  pause
  exit /b 1
)
set "OLUNTIR_ALLOW_DEVELOPMENT_RUNTIME=1"
node analyzer\bin\portable-bootstrap.js
if errorlevel 1 pause
endlocal

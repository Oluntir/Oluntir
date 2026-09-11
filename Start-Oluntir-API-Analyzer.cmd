@echo off
setlocal
cd /d "%~dp0"
set "OLUNTIR_NODE=%CD%\runtime\node\win32-x64\node.exe"
if not exist "%OLUNTIR_NODE%" (
  echo FEHLER: Die portable Oluntir-Runtime fehlt.
  echo Erwartet: runtime\node\win32-x64\node.exe
  echo Bitte das vollstaendige Windows-x64-Paket erneut entpacken.
  pause
  exit /b 1
)
"%OLUNTIR_NODE%" analyzer\bin\portable-bootstrap.js
if errorlevel 1 pause
endlocal

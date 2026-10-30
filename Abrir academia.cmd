@echo off
rem Abre la academia de guitarra en una ventana de Brave y, si hace falta, arranca su servidor sin ventana.
cd /d "%~dp0"
powershell -NoProfile -WindowStyle Hidden -Command "Start-Process node -ArgumentList 'servidor/servidor.js','--abrir' -WorkingDirectory $PWD -WindowStyle Hidden"

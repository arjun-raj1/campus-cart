@echo off
cd backend
echo Installing dependencies...
cmd /c npm install
echo Starting server...
cmd /c node server.js
pause

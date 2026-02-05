@echo off

:: Start backend (Node.js)
cd project-backend
start cmd /k "node Server.js"
cd..

timeout /t 3 /nobreak

:: Start frontend (React)
cd my-app
start cmd /k "npm start"
cd..

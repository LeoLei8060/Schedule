@echo off
setlocal

echo 正在安装依赖...
npm install

echo.
echo 正在启动后端服务 (http://localhost:4000)...
set PORT=4000
start "backend-server" node server\index.js

echo 等待后端启动...
timeout /t 2 /nobreak >nul

echo.
echo 正在启动前端开发服务器 (默认 http://localhost:3000)...
echo 如果端口占用，Vite 会自动选择其他端口。
npm run dev

echo.
echo 前端已停止。后端服务仍在另一个窗口中运行（如需关闭请手动关闭该窗口）。
pause
endlocal
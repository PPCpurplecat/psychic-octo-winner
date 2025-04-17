@echo off
chcp 65001 > nul
echo 正在启动游戏服务器...
echo.

REM 检查Python是否安装
python --version > nul 2>&1
if %errorlevel% equ 0 (
    echo 使用Python启动HTTP服务器...
    start /B python -m http.server 8000
    echo 游戏服务器已启动！
    echo 请在浏览器中访问: http://localhost:8000
) else (
    REM 尝试使用Node.js
    node --version > nul 2>&1
    if %errorlevel% equ 0 (
        echo 使用Node.js启动HTTP服务器...
        start /B npx http-server -p 8000
        echo 游戏服务器已启动！
        echo 请在浏览器中访问: http://localhost:8000
    ) else (
        echo 未找到Python或Node.js。请安装其中之一以启动HTTP服务器。
        echo 或者，您可以直接在浏览器中打开game.html文件。
    )
)

echo.
echo 提示：请先运行start_ollama.bat启动OLLAMA服务，然后再使用对话功能。
echo 按任意键退出...
pause > nul 
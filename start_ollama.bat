@echo off
chcp 65001 > nul
echo 正在启动OLLAMA服务...
echo 请确保您已经安装了OLLAMA，并且已经下载了mistral或llama3模型。
echo.

REM 检查OLLAMA是否已经运行
curl -s http://localhost:11434/api/version > nul 2>&1
if %errorlevel% equ 0 (
    echo OLLAMA服务已经在运行中。
) else (
    echo 正在启动OLLAMA服务...
    start /B ollama serve
    echo 等待服务启动...
    timeout /t 5 /nobreak > nul
    
    REM 再次检查服务是否成功启动
    curl -s http://localhost:11434/api/version > nul 2>&1
    if %errorlevel% equ 0 (
        echo OLLAMA服务已成功启动！
    ) else (
        echo OLLAMA服务启动失败。请确保OLLAMA已正确安装。
        echo 您可以从 https://ollama.ai/download 下载OLLAMA。
    )
)

echo.
echo 现在您可以打开游戏页面，使用对话功能了。
echo 按任意键退出...
pause > nul 
@echo off
chcp 65001 > nul
echo OLLAMA服务诊断工具
echo ===================
echo.

REM 检查OLLAMA是否安装
where ollama > nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未找到OLLAMA程序。请从 https://ollama.ai/download 下载并安装OLLAMA。
    echo.
    echo 按任意键退出...
    pause > nul
    exit /b 1
) else (
    echo [成功] OLLAMA已安装。
    for /f "tokens=*" %%a in ('ollama --version') do echo 版本: %%a
)

echo.

REM 检查端口11434是否被占用
netstat -ano | findstr :11434 > nul
if %errorlevel% equ 0 (
    echo [信息] 端口11434已被占用，可能是OLLAMA服务正在运行。
    echo 详细信息:
    netstat -ano | findstr :11434
) else (
    echo [警告] 端口11434未被占用，OLLAMA服务可能未运行。
)

echo.

REM 尝试连接到OLLAMA API
echo 正在测试OLLAMA API连接...
curl -s http://localhost:11434/api/version > nul 2>&1
if %errorlevel% equ 0 (
    echo [成功] 可以连接到OLLAMA API。
    echo 正在获取API版本信息:
    curl -s http://localhost:11434/api/version
) else (
    echo [错误] 无法连接到OLLAMA API。
    echo 可能的原因:
    echo 1. OLLAMA服务未运行
    echo 2. 防火墙阻止了连接
    echo 3. 端口11434被占用
    echo 4. 网络连接问题
)

echo.

REM 检查模型是否已下载
echo 正在检查模型...
ollama list > nul 2>&1
if %errorlevel% equ 0 (
    echo [成功] 可以获取模型列表。
    echo 已下载的模型:
    ollama list
) else (
    echo [错误] 无法获取模型列表。
)

echo.

echo 诊断完成。
echo.
echo 如果OLLAMA服务未运行，请运行start_ollama.bat启动服务。
echo 如果模型未下载，请运行: ollama pull mistral 或 ollama pull llama3
echo.
echo 按任意键退出...
pause > nul 
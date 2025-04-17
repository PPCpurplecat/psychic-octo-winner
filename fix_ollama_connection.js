// OLLAMA连接诊断工具
// 将此文件保存为fix_ollama_connection.js，然后在浏览器控制台中运行

// 检查OLLAMA服务是否可用
async function checkOllamaService() {
    console.log('正在检查OLLAMA服务...');
    try {
        const response = await fetch('http://localhost:11434/api/version', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        
        if (!response.ok) {
            console.error(`OLLAMA服务检查失败: ${response.status} ${response.statusText}`);
            return false;
        }
        
        const data = await response.json();
        console.log('OLLAMA服务版本:', data);
        return true;
    } catch (error) {
        console.error('OLLAMA服务检查错误:', error);
        return false;
    }
}

// 测试OLLAMA API连接
async function testOllamaConnection() {
    console.log('正在测试OLLAMA API连接...');
    try {
        const response = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'mistral',
                prompt: '你好',
                stream: false
            })
        });
        
        if (!response.ok) {
            console.error(`OLLAMA API测试失败: ${response.status} ${response.statusText}`);
            return false;
        }
        
        const data = await response.json();
        console.log('OLLAMA API测试成功:', data);
        return true;
    } catch (error) {
        console.error('OLLAMA API测试错误:', error);
        return false;
    }
}

// 修复CORS问题
function fixCorsIssue() {
    console.log('正在尝试修复CORS问题...');
    
    // 创建一个iframe来绕过CORS限制
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = 'about:blank';
    document.body.appendChild(iframe);
    
    // 尝试在iframe中设置CORS头
    try {
        const iframeWindow = iframe.contentWindow;
        iframeWindow.fetch = window.fetch;
        console.log('已尝试修复CORS问题');
    } catch (error) {
        console.error('修复CORS问题失败:', error);
    }
    
    // 移除iframe
    setTimeout(() => {
        document.body.removeChild(iframe);
    }, 1000);
}

// 主函数
async function diagnoseAndFixOllamaConnection() {
    console.log('开始诊断OLLAMA连接问题...');
    
    // 检查服务是否可用
    const serviceAvailable = await checkOllamaService();
    if (!serviceAvailable) {
        console.error('OLLAMA服务不可用。请确保已运行start_ollama.bat启动服务。');
        return;
    }
    
    // 测试API连接
    const apiWorking = await testOllamaConnection();
    if (!apiWorking) {
        console.error('OLLAMA API连接失败。尝试修复CORS问题...');
        fixCorsIssue();
        return;
    }
    
    console.log('OLLAMA连接正常！');
}

// 运行诊断
diagnoseAndFixOllamaConnection(); 
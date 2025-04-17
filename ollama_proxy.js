// OLLAMA API代理服务器
// 使用Node.js创建一个简单的代理服务器，避免CORS问题
// 使用方法: node ollama_proxy.js

const http = require('http');
const httpProxy = require('http-proxy');

// 创建代理服务器
const proxy = httpProxy.createProxyServer({});

// 创建HTTP服务器
const server = http.createServer((req, res) => {
    // 设置CORS头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // 处理OPTIONS请求
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    // 代理请求到OLLAMA服务
    proxy.web(req, res, {
        target: 'http://localhost:11434',
        changeOrigin: true
    }, (err) => {
        console.error('代理请求错误:', err);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('代理请求失败: ' + err.message);
    });
});

// 监听错误
proxy.on('error', (err, req, res) => {
    console.error('代理错误:', err);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('代理错误: ' + err.message);
});

// 启动服务器
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`OLLAMA代理服务器运行在 http://localhost:${PORT}`);
    console.log('请修改game.js中的OLLAMA API地址为: http://localhost:3000/api/generate');
}); 
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// 当前文件所在目录，用于拼接前端静态资源目录的绝对路径
const __dirname = path.dirname(fileURLToPath(import.meta.url));
// 前端静态资源根目录：项目根目录/front
const FRONT_DIR = path.resolve(__dirname, '..', 'front');
// 服务监听端口，按需求固定为 3000
const PORT = 3000;

// 常见静态资源扩展名与 Content-Type 的映射表
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.woff2': 'font/woff2',
};

/**
 * 将请求路径解析为 front 目录内的安全文件路径。
 * @param {string} requestPath 浏览器请求的路径，例如 "/" 或 "/style.css"
 * @returns {string | null} 合法文件的绝对路径；越界或非法路径返回 null
 */
function resolveStaticPath(requestPath) {
  // 访问根路径时默认返回首页 index.html
  const relativePath = requestPath === '/' ? 'index.html' : requestPath;
  // 解码 URL 编码字符，去掉开头的斜杠后规范化路径
  const normalized = path
    .normalize(decodeURIComponent(relativePath))
    .replace(/^([/\\])+/, '');
  const filePath = path.resolve(FRONT_DIR, normalized);

  // 校验目标文件必须位于 front 目录内，防止 ../ 路径穿越
  if (filePath !== FRONT_DIR && !filePath.startsWith(FRONT_DIR + path.sep)) {
    return null;
  }
  return filePath;
}

/**
 * 发送纯文本响应。
 * @param {http.ServerResponse} res HTTP 响应对象
 * @param {number} statusCode HTTP 状态码
 * @param {string} message 响应正文
 * @returns {void}
 */
function sendText(res, statusCode, message) {
  res.writeHead(statusCode, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end(message);
}

const server = http.createServer(async (req, res) => {
  // 仅支持 GET 与 HEAD，其余请求方法返回 405
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    sendText(res, 405, '405 Method Not Allowed');
    return;
  }

  let pathname;
  try {
    // 借助 URL 解析请求路径，自动剥离查询字符串
    pathname = new URL(req.url, `http://${req.headers.host ?? 'localhost'}`).pathname;
  } catch {
    sendText(res, 400, '400 Bad Request');
    return;
  }

  let filePath;
  try {
    filePath = resolveStaticPath(pathname);
  } catch {
    // decodeURIComponent 遇到非法编码时会抛出异常
    sendText(res, 400, '400 Bad Request');
    return;
  }

  if (!filePath) {
    sendText(res, 403, '403 Forbidden');
    return;
  }

  try {
    const content = await readFile(filePath);
    const contentType =
      MIME_TYPES[path.extname(filePath).toLowerCase()] ?? 'application/octet-stream';
    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': content.byteLength,
      'Cache-Control': 'no-cache',
    });
    // HEAD 请求只返回响应头，不返回正文
    res.end(req.method === 'HEAD' ? undefined : content);
  } catch (error) {
    if (error.code === 'ENOENT' || error.code === 'EISDIR') {
      sendText(res, 404, '404 Not Found');
      return;
    }
    console.error('读取静态文件失败：', error);
    sendText(res, 500, '500 Internal Server Error');
  }
});

// 监听启动错误，给出明确的排查提示
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`端口 ${PORT} 已被占用，请先停止占用该端口的程序。`);
  } else {
    console.error('服务启动失败：', error);
  }
  process.exitCode = 1;
});

server.listen(PORT, () => {
  console.log(`服务已启动：http://localhost:${PORT}`);
  console.log(`静态资源目录：${FRONT_DIR}`);
});

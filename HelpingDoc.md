# 帮助文档

## 环境要求

- Node.js 18 及以上版本（推荐使用 LTS 版本，本项目验证版本为 v26.10.0）
- 无需安装任何第三方依赖

## 启动服务

在项目根目录执行：

```bash
npm start
```

也可以直接运行：

```bash
node backend/server.js
```

启动成功后终端会输出：

```text
服务已启动：http://localhost:3000
静态资源目录：<项目根目录>/front
```

在浏览器中访问 <http://localhost:3000> 即可看到页面。

## 停止服务

在运行服务的终端中按 `Ctrl + C`。

## 目录结构

```text
Hello_Claude/
├── backend/
│   └── server.js     # Node.js 原生 HTTP 静态服务器
├── front/
│   ├── index.html    # 页面结构，显示 hello claude vibecoding
│   └── style.css     # 页面样式与动画
├── API.md            # 接口说明
├── HelpingDoc.md     # 本文档
├── package.json      # 项目信息与启动脚本
└── .claude-logs/     # 操作日志
```

## 修改页面文字

编辑 `front/index.html` 中 `<h1 class="title">` 里的文字，保存后刷新浏览器即可生效，无需重启服务。

## 常见问题

### 端口 3000 已被占用

服务会输出 `端口 3000 已被占用`。先查找占用端口的进程：

```bash
netstat -ano | findstr :3000
```

根据输出最后一列的 PID 结束进程（请确认该进程可以安全关闭）：

```bash
taskkill /PID <PID> /F
```

### 页面样式未更新

服务已设置 `Cache-Control: no-cache`，通常刷新页面即可。如仍无效，可按 `Ctrl + F5` 强制刷新。

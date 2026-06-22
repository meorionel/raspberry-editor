# Raspberry Editor

一个基于 Cloudflare Workers 的轻量级在线代码编辑器，使用 Monaco Editor 提供 VS Code 级别的编辑体验。

## 功能特性

- **Monaco Editor** - 完整的代码编辑器，支持语法高亮、自动补全、代码折叠等
- **多语言支持** - 支持 JavaScript、TypeScript、Python、Go、Rust、Java 等多种编程语言
- **文件管理** - 创建、编辑、重命名、删除文件和目录
- **主题切换** - 内置 Rosé Pine 系列主题（包括深色和浅色模式）
- **字体自定义** - 可调整编辑器字体
- **JWT 认证** - 密码保护，支持登录锁定机制
- **云端存储** - 使用 Cloudflare R2 存储文件
- **响应式设计** - 可调整侧边栏宽度，支持键盘快捷键

## 技术栈

- **后端**: [Hono](https://hono.dev/) - 轻量级 Web 框架
- **前端**: Monaco Editor - VS Code 的核心编辑器
- **运行时**: Cloudflare Workers
- **存储**: Cloudflare R2
- **构建工具**: Vite
- **语言**: TypeScript / JSX

## 快速开始

### 安装依赖

```bash
npm install
# 或
bun install
```

### 本地开发

```bash
npm run dev
# 或
bun run dev
```

访问 `http://localhost:5173` 即可使用编辑器。

### 配置密钥

编辑器使用密码保护和 JWT 认证。需要设置以下密钥：

```bash
wrangler secret put PASSWORD     # 登录密码
wrangler secret put JWT_SECRET   # 用于 JWT 签名的随机长字符串
```

### 部署到 Cloudflare

```bash
npm run deploy
# 或
bun run deploy
```

### 生成类型定义

```bash
npm run cf-typegen
```

## 项目结构

```
raspberry-editor/
├── public/              # 静态资源
│   ├── fonts/          # 编辑器字体
│   ├── icons/          # 文件图标
│   └── themes/         # Monaco Editor 主题文件
├── src/
│   ├── client/         # 客户端 JavaScript
│   │   ├── api.js      # API 请求和工具函数
│   │   ├── main.js     # 主入口文件
│   │   ├── themes.js   # 主题管理
│   │   ├── tabs.js     # 标签页管理
│   │   ├── filetree.js # 文件树管理
│   │   └── ...
│   ├── middleware/      # Hono 中间件
│   │   └── auth.ts     # JWT 认证中间件
│   ├── routes/         # API 路由
│   │   ├── auth.ts     # 认证路由
│   │   └── files.ts    # 文件操作路由
│   ├── views/          # 页面视图 (JSX)
│   │   ├── index.tsx   # 编辑器主页面
│   │   └── login.tsx   # 登录页面
│   ├── bindings.ts     # Cloudflare Bindings 类型定义
│   ├── index.tsx       # Hono 应用入口
│   └── renderer.tsx    # JSX 渲染器
├── wrangler.jsonc      # Cloudflare Workers 配置
├── vite.config.ts      # Vite 配置
└── tsconfig.json       # TypeScript 配置
```

## 键盘快捷键

| 快捷键 | 功能 |
|--------|------|
| `Ctrl/Cmd + S` | 保存文件 |
| `Ctrl/Cmd + W` | 关闭当前标签页 |
| `Ctrl/Cmd + N` | 新建文件 |

## API 掫口

### 认证

- `POST /api/auth/login` - 用户登录，返回 JWT Token

### 文件操作（需要认证）

- `GET /api/files` - 获取文件列表
- `GET /api/files/:key` - 获取文件内容
- `POST /api/files/:key` - 创建/更新文件
- `POST /api/files/rename` - 重命名文件/目录
- `DELETE /api/files/:key` - 删除文件/目录

## 安全特性

- 密码保护登录
- JWT Token 认证（24 小时过期）
- 登录失败锁定（5 次失败后锁定，需重新部署解锁）
- Bearer Token 验证

## 许可证

MIT

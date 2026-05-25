# NAS Web 管理后台

个人 NAS 存储管理后台 — 文件管理、用户管理、系统监控。

## 技术栈

- **框架**：Next.js 16 (App Router) + TypeScript
- **样式**：Tailwind CSS 4 + shadcn/ui (Radix Nova)
- **图标**：Lucide React
- **图表**：recharts（仪表盘环形图/面积图）
- **字体**：Geist Sans / Geist Mono
- **部署**：Docker (standalone + nginx 反代)

## 快速开始

```bash
# 0. 切换 Node 版本（项目已配置 .nvmrc）
nvm use

# 1. 安装依赖
pnpm install

# 2. 启动开发服务器
pnpm dev
# → http://localhost:3000

# 3. 构建生产版本
pnpm build

# 4. 启动生产服务器
pnpm start
```

> **注意**：开发模式下需要 authd 后端在本机 `:8080` 运行，API 代理方案见 [CLAUDE.md](CLAUDE.md)。

## Docker 部署

```bash
# 前置条件：authd 后端已在本机 :8080 运行

# 使用 docker compose（推荐）
sudo docker compose up --build -d

# 或手动构建
docker build -t nas-web .
docker run --network host nas-web
```

容器内部：
- nginx 监听 `:80`，反代 API 请求到 authd (`:8080`)
- Next.js standalone 运行在 `:3000`（仅内部访问）

## 目录结构

```
src/
├── app/                  # Next.js App Router 页面
│   ├── (dashboard)/      # 已登录页面（带导航壳）
│   └── login/            # 登录页（独立布局）
├── components/
│   ├── layout/           # 布局组件（Sidebar/Topbar）
│   ├── dashboard/        # 仪表盘组件
│   └── ui/               # shadcn/ui 基础组件
├── hooks/                # React hooks
├── lib/                  # 工具库（API/Auth/Types/Utils）
└── providers/            # Context Providers（Theme/Nav）
```

## 文档

| 文档 | 说明 |
|------|------|
| [architecture.md](docs/architecture.md) | 整体架构设计 |
| [design-system.md](docs/design-system.md) | UI 设计系统 |
| [api-map.md](docs/api-map.md) | 前后端 API 对照表 |
| [development.md](docs/development.md) | 开发指南 |

## 设计风格

「Precision」— 黑白极简，冷峻克制。全线黑白灰，仅聚焦环使用蓝色。支持 Light/Dark 主题切换，侧栏/顶栏双布局模式。

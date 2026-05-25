# CLAUDE.md

NAS Web 管理后台 — 面向家庭用户的 NAS 存储管理界面，提供文件管理、用户管理、系统监控功能。

## 常用命令

```bash
pnpm install          # 安装依赖
pnpm dev              # 启动开发服务器（→ localhost:3000）
pnpm build            # 生产构建
npx tsc --noEmit      # TypeScript 类型检查
```

Docker 部署：

```bash
sudo docker compose up --build -d    # 独立部署（无需 ldap-demo docker compose）
# → 监听 :80（nginx 反代 API 到 authd:8080）
```

## 技术栈

| 层 | 选型 | 说明 |
|----|------|------|
| 框架 | Next.js 16.2 App Router | TypeScript，`output: "standalone"` |
| 样式 | Tailwind CSS 4 + shadcn/ui (Radix Nova) | oklch 色彩空间，class 切换 dark mode |
| 图标 | Lucide React | 黑白风格匹配 Precision 设计 |
| 图表 | recharts 3.8 | Dashboard 环形图 + 面积图 |
| 字体 | Geist Sans / Geist Mono | next/font/google 加载 |
| 状态 | React Context | ThemeProvider / NavProvider，不用 Redux/Zustand |
| HTTP | 原生 fetch 封装 | `lib/api.ts`：JWT 注入 + 401 拦截 |

## 架构关键决策

### 为何不用 Redux/Zustand

全局状态只有主题和导航模式两个，React Context 足够。页面数据各自 useEffect fetch，不跨页面共享。

### 双布局模式（sidebar / topbar）

- localStorage key `nas-nav-mode`，默认 `sidebar`
- 切换按钮放在顶栏右侧
- 所有页面自动适应，通过 CSS 类名控制

### 主题（system / light / dark）

- 默认 `dark`（`getStoredTheme()` 无存储时返回 `"dark"`）
- `<html class="dark">` 切换
- Tailwind `darkMode: "class"`
- 使用 oklch CSS 变量，暗色/亮色模式自动切换

### JWT 鉴权

- token 存 localStorage key `nas-token`
- `lib/api.ts` 的 ApiClient 自动注入 `Authorization: Bearer <token>`
- 401 响应自动清除 token 并重定向 `/login`
- 不校验 token 有效期，只检查存在性

### 开发环境 API 代理

生产环境由 nginx 反代 API 请求到 authd (`:8080`)，开发环境需要 Next.js 自身来处理代理：

- **Next.js 16 变更**：`middleware.ts` 已重命名为 `proxy.ts`，函数名从 `middleware()` 改为 `proxy()`，运行时从 Edge 改为 Node.js
- 推荐方案分两步：`/api/*` 路径用 `next.config.ts` 的 `beforeFiles` rewrites（无页面路由冲突）；`/login`、`/register` 等需要区分 GET（渲染页面）/ POST（代理后端）的路径用 `proxy.ts` + `NextResponse.rewrite()`

**已知遗留问题**：`pnpm dev` 下 API 代理尚未完全跑通，当前 `middleware.ts` 使用 `fetch()` 手动转发的方式仍有个别问题，需要切换到 `proxy.ts` + `NextResponse.rewrite()` 方案。详见 `proxy.ts` 注释。

## 踩坑记录

### NavProvider SSR 问题

**现象**：`pnpm build` 时报 `useNavMode must be used within NavProvider`

**根因**：NavProvider 原本有 `if (!mounted) return <>{children}</>` 逻辑，SSR 阶段 `mounted=false` 直接返回 children，跳过了 Context.Provider 的渲染

**修复**：移除 early return，始终渲染 NavContext.Provider，初始值从 localStorage 读取默认值

### Docker 构建：pnpm onlyBuiltDependencies

**现象**：`docker build` 时 `ERR_PNPM_IGNORED_BUILDS` 错误，sharp、msw 等包的构建脚本被阻止

**根因**：pnpm 10+ 默认阻止 build scripts，而 `pnpm install --frozen-lockfile` 不让修改 lockfile

**修复**：
1. 在 `package.json` 添加 `pnpm.onlyBuiltDependencies: ["sharp", "msw", "unrs-resolver"]`
2. Dockerfile 中改用 `pnpm install --ignore-scripts`（Docker 构建不需要 build scripts）

### Docker 构建：npm 镜像超时

**现象**：Docker 构建时拉取依赖超时

**根因**：默认 npm registry (`https://registry.npmjs.org/`) 在国内访问不稳定

**修复**：创建 `.npmrc`，设置 `registry=https://registry.npmmirror.com`，Dockerfile 中 COPY .npmrc 到构建阶段

### Docker 构建：node:24-alpine 拉取失败

**现象**：`docker build` 时 `short read: unexpected EOF`

**根因**：镜像版本较新，网络不稳定导致拉取失败

**修复**：改用 `node:22-alpine`（22.22.3），同时创建 `.nvmrc` 固定本地 Node 版本

### shadcn/ui CLI：必须用 npx

**现象**：`pnpm exec shadcn add <component>` 不工作

**根因**：当前环境 shadcn CLI 路径解析问题

**解决**：使用 `npx shadcn@latest add <component>`（注意这是完全不同包的路径）

## 约束

- **Node 版本**：固定 22（见 `.nvmrc`），不要用 24（Docker 镜像不稳定）
- **包管理器**：必须用 `pnpm`，不用 npm/yarn
- **Docker 镜像**：`node:22-alpine`，不要升级到 24
- **npm 镜像**：`.npmrc` 设置为 `https://registry.npmmirror.com`，不要删除
- **基础 UI 组件**：用 `npx shadcn@latest add` 安装，不要手写
- **所有导出函数/组件/类型**：必须写 JSDoc 注释
- **组件文件**：kebab-case 命名
- **默认主题**：dark（不是 system）

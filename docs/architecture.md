# 架构设计

## 系统组成

```
┌─────────────────┐         ┌───────────────┐
│   nas-web       │         │   authd       │
│  (Next.js +     │ ──API──▶│  (Go + Gin)   │
│   nginx)        │         │               │
│   :80           │         │   :8080       │
└─────────────────┘         └───────────────┘
        │                          │
        │ 同一宿主机                 │ LDAP/文件系统
        │ network_mode: host       │
```

- **nas-web**：前端容器，nginx 反代 + Next.js standalone
- **authd**：Go 后端，JWT 认证 + 文件操作 + 用户管理

## 前端架构

### 路由结构

```
/login          → 登录页（独立布局，无导航）
/               → 仪表盘（系统资源概览 + 最近操作）
/files          → 文件管理（目录树 + 文件列表）
/users          → 用户管理（列表 + 创建/删除）
/logs           → 审计日志（筛选 + 表格）
/settings       → 系统设置
```

### 布局层级

```
RootLayout (html + body + Toaster)
├── LoginLayout (ThemeProvider only)
│   └── LoginPage
└── DashboardLayout (AppShell = ThemeProvider + NavProvider + TooltipProvider + Auth)
    ├── DashboardPage
    ├── FilesPage
    ├── UsersPage
    ├── LogsPage
    └── SettingsPage
```

### 数据流

1. 用户通过 `/login` 输入凭证
2. 前端调用 `POST /login` 获取 JWT token，存入 localStorage
3. 已登录页面通过 `useAuth` hook 检查 token 存在性
4. API 请求通过 `lib/api.ts` 自动注入 Authorization header
5. 401 响应自动清除 token 并重定向到 `/login`

### 状态管理

| 状态 | 存储位置 | 管理方式 |
|------|----------|----------|
| JWT Token | localStorage `nas-token` | `lib/auth.ts` |
| 用户名 | localStorage `nas-username` | `lib/auth.ts` |
| 主题模式 | localStorage `nas-theme` | ThemeProvider |
| 导航模式 | localStorage `nas-nav-mode` | NavProvider |
| 页面数据 | 组件 state | 各页面 useEffect fetch |

## 部署架构

单容器模式（nginx + Next.js）：

- nginx 监听 `:80`
  - `/api/*` → authd `:8080`
  - `/login`, `/register`, `/ping`, `/device-info` → authd `:8080`
  - `/_next/static/` → 本地文件（1 年缓存）
  - 其他 → Next.js `:3000`
- `network_mode: host`：与 authd 共享宿主网络栈

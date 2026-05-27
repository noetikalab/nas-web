/**
 * 共享 TypeScript 类型定义 — 与 Go 后端 DTO 结构一一对应
 * 文件：ldap-demo/authd/handler/dto.go
 */

// ============================================================
// Auth（对应 handler/dto.go 中的认证相关类型）
// ============================================================

export interface LoginRequest {
  username: string;
  password: string;
}

/** 登录响应，含 JWT token 和用户角色 */
export interface LoginResponse {
  token: string;
  /** 用户角色："admin" 可访问管理功能，"user" 仅文件操作 */
  role: "admin" | "user";
}

export interface RegisterRequest {
  username: string;
  password: string;
}

export interface RegisterResponse {
  token: string;
  uid: number;
  /** 注册后的角色，首个用户自动为 "admin" */
  role: "admin" | "user";
}

// ============================================================
// Dashboard（对应 DashboardStatsResponse / RecentEntry）
// ============================================================

/** 系统资源概览，Dashboard 统计卡片数据源 */
export interface DashboardStats {
  storage_used: number;
  storage_total: number;
  cpu_percent: number;
  mem_used: number;
  mem_total: number;
  uptime: number;
  device_count: number;
}

/** 最近文件操作记录 */
export interface RecentEntry {
  name: string;
  path: string;
  action: "upload" | "delete" | "mkdir" | "move" | "download";
  user: string;
  time: string;
  size: number;
}

// ============================================================
// Users（对应 UserEntry / UserListResponse）
// ============================================================

/** 用户条目，含 LDAP employeeType 角色 */
export interface UserEntry {
  username: string;
  uid: number;
  gid: number;
  home: string;
  /** 用户角色："admin" 或 "user" */
  role: "admin" | "user";
}

// ============================================================
// Files（对应 system/file.go 中的 FileInfo）
// ============================================================

/** 文件/目录信息 */
export interface FileInfo {
  name: string;
  size: number;
  type: "file" | "directory";
  modified: string;
  permission: string;
}

/** 文件列表响应 */
export interface FileListResponse {
  path: string;
  files: FileInfo[];
}

// ============================================================
// Services（对应 ServicesResponse / ServiceStatus）
// ============================================================

/** 单个服务状态 */
export interface ServiceStatus {
  running: boolean;
  port: number;
}

/** 所有服务状态 */
export interface ServicesResponse {
  smb: ServiceStatus;
  nfs: ServiceStatus;
  webdav: ServiceStatus;
}

// ============================================================
// Logs（对应 LogEntry / LogListResponse）
// ============================================================

/** 审计日志条目 */
export interface LogEntry {
  timestamp: string;
  type: "file" | "auth" | "system";
  user: string;
  action: string;
  detail: string;
}

/** 审计日志分页列表响应 */
export interface LogListResponse {
  entries: LogEntry[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

// ============================================================
// API 通用响应
// ============================================================

/** 操作成功响应（含路径） */
export interface OKPathResponse {
  ok: boolean;
  path: string;
}

// ============================================================
// Device（对应 DeviceInfoResponse）
// ============================================================

/** 设备身份信息 */
export interface DeviceInfo {
  device_id: string;
  hostname: string;
  version: string;
}

// ============================================================
// Generic
// ============================================================

export interface OKResponse {
  ok: boolean;
}

export interface ErrorResponse {
  error: string;
}

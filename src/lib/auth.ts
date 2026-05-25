/**
 * 鉴权工具函数 — JWT token 管理 + 登录/登出流程。
 *
 * Token 存储键：
 *   nas-token     — JWT token 字符串
 *   nas-username  — 当前登录用户名（用于 UI 展示）
 */

import { api } from "./api";
import type { LoginResponse } from "./types";

const TOKEN_KEY = "nas-token";
const USER_KEY = "nas-username";

/** 执行登录请求，成功后将 token 和用户名存入 localStorage */
export async function login(
  username: string,
  password: string,
): Promise<LoginResponse> {
  const res = await api.post<LoginResponse>("/login", { username, password });
  if (typeof window !== "undefined") {
    localStorage.setItem(TOKEN_KEY, res.token);
    localStorage.setItem(USER_KEY, username);
  }
  return res;
}

/** 清除登录状态并重定向到登录页 */
export function logout(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    window.location.href = "/login";
  }
}

/** 获取当前 JWT token，未登录返回 null */
export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

/** 获取当前登录用户名 */
export function getUsername(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(USER_KEY);
}

/** 判断是否已登录（仅检查 token 是否存在，不验证有效性） */
export function isAuthenticated(): boolean {
  return !!getToken();
}

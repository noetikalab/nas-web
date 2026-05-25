"use client";

/**
 * useAuth — 鉴权状态 hook
 *
 * 用途：
 *   - 检查登录状态（从 localStorage 读取 token）
 *   - 未登录时自动重定向到 /login
 *   - 提供 user 信息和 logout 方法
 *
 * 使用方式：
 *   const { user, loading, logout } = useAuth();
 *   if (loading) return <Spinner />;
 *   if (!user) return null; // 会重定向到 /login
 */

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getToken, getUsername, logout as doLogout } from "@/lib/auth";

interface AuthState {
  user: string | null;
  loading: boolean;
  logout: () => void;
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // 登录页不需要检查鉴权
    if (pathname === "/login") {
      setLoading(false);
      return;
    }

    const token = getToken();
    const username = getUsername();
    if (!token || !username) {
      router.replace("/login");
      return;
    }
    setUser(username);
    setLoading(false);
  }, [pathname, router]);

  const logout = () => {
    setUser(null);
    doLogout();
  };

  return { user, loading, logout };
}

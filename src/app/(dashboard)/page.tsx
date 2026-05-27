"use client";

/**
 * Dashboard 首页 — 系统资源概览 + 最近文件操作
 *
 * 数据来源：
 *   - GET /api/dashboard/stats  → CPU/内存/存储/运行时长
 *   - GET /api/dashboard/recent → 最近文件操作列表
 */

import { useEffect, useState } from "react";
import { dashboardApi } from "@/services";
import type { DashboardStats, RecentEntry } from "@/lib/types";
import { StatCards } from "@/components/dashboard/stat-cards";
import { DashboardCharts } from "@/components/dashboard/charts";
import { RecentFiles } from "@/components/dashboard/recent-files";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recent, setRecent] = useState<RecentEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [s, r] = await Promise.all([
          dashboardApi.getStats(),
          dashboardApi.getRecent(10),
        ]);
        setStats(s);
        setRecent(r);
      } catch {
        // 错误已由 api.ts 全局处理（401 重定向等）
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold">仪表盘</h1>
      <StatCards stats={stats} />
      <DashboardCharts stats={stats} />
      <RecentFiles entries={recent} />
    </div>
  );
}

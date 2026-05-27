/**
 * 审计日志 API（admin only）
 */

import { api } from "@/lib/api";
import type { LogListResponse } from "@/lib/types";

export const logsApi = {
  /** 分页查询审计日志 */
  list: (page = 1, limit = 20, type?: string) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (type) params.set("type", type);
    return api.get<LogListResponse>(`/logs?${params.toString()}`);
  },
};

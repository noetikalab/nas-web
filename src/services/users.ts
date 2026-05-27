/**
 * 用户管理 API（admin only）
 */

import { api } from "@/lib/api";
import type { UserEntry } from "@/lib/types";

export const usersApi = {
  /** 用户列表 */
  list: () =>
    api.get<UserEntry[]>("/users"),

  /** 用户总数 */
  count: () =>
    api.get<{ count: number }>("/users/count"),

  /** 删除用户 */
  delete: (username: string) =>
    api.del<{ ok: boolean }>(`/users/${encodeURIComponent(username)}`),
};

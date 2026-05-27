/**
 * 文件操作 API — list / download / upload / mkdir / delete / move
 */

import { api } from "@/lib/api";
import type { FileInfo } from "@/lib/types";

export interface FileListResult {
  path: string;
  files: FileInfo[];
}

export interface MkdirParams {
  path: string;
}

export interface MoveParams {
  from: string;
  to: string;
}

export const filesApi = {
  /** 列出目录内容 */
  list: (path?: string) => {
    const params = new URLSearchParams();
    if (path) params.set("path", path);
    return api.get<FileListResult>(`/files?${params.toString()}`);
  },

  /** 下载文件（触发浏览器下载） */
  download: (filePath: string, fileName: string) =>
    api.download(`/files/download?path=${encodeURIComponent(filePath)}`, fileName),

  /** 获取文件 Blob URL（预览用） */
  getBlobUrl: async (filePath: string): Promise<string | null> => {
    const token = typeof window !== "undefined" ? localStorage.getItem("nas-token") : null;
    const res = await fetch(`/files/download?path=${encodeURIComponent(filePath)}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) return null;
    const blob = await res.blob();
    return URL.createObjectURL(blob);
  },

  /** 获取文件文本内容（预览用，限制 2MB） */
  getText: async (filePath: string): Promise<string | null> => {
    const token = typeof window !== "undefined" ? localStorage.getItem("nas-token") : null;
    const res = await fetch(`/files/download?path=${encodeURIComponent(filePath)}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) return null;
    return res.text();
  },

  /** 上传文件（FormData） */
  upload: (formData: FormData) =>
    api.upload<{ ok: boolean }>("/files/upload", formData),

  /** 新建目录 */
  mkdir: (params: MkdirParams) =>
    api.post<{ ok: boolean }>("/files/mkdir", params),

  /** 删除文件或目录 */
  delete: (filePath: string) =>
    api.del<{ ok: boolean }>(`/files?path=${encodeURIComponent(filePath)}`),

  /** 移动/重命名 */
  move: (params: MoveParams) =>
    api.post<{ ok: boolean }>("/files/move", params),
};

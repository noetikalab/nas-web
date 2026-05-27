"use client";

/**
 * DirectoryTree — 目录树侧边栏组件
 *
 * 特性：
 *   - 递归展示目录结构，点击展开/折叠子目录
 *   - 懒加载：展开时才请求子目录内容（调用 /files?path=...）
 *   - 当前选中的目录高亮
 *   - 与 Breadcrumb 联动：点击目录节点 → 更新文件列表
 *
 * Props：
 *   - currentPath: 当前文件列表所在的路径（高亮对应节点）
 *   - onSelect: 选中目录时的回调（更新文件列表区域的 path）
 *
 * 使用 react-resizable-panels 包裹时可拖拽调整宽度。
 */

import { useCallback, useEffect, useState } from "react";
import { ChevronRight, Folder, FolderOpen } from "lucide-react";
import { filesApi } from "@/services";
import type { FileInfo } from "@/lib/types";

// ---- 树节点数据结构 ----

/** 目录树节点，仅包含目录（过滤掉文件） */
interface TreeNode {
  name: string;
  path: string;
  loaded: boolean;       // 是否已从后端加载过子节点
  children: TreeNode[];
}

// ---- Props ----

interface DirectoryTreeProps {
  /** 当前文件列表所在路径，用于高亮对应节点 */
  currentPath: string;
  /** 点击目录节点时回调 */
  onSelect: (path: string) => void;
}

// ---- 递归树节点组件 ----

interface TreeItemProps {
  node: TreeNode;
  depth: number;
  currentPath: string;
  onSelect: (path: string) => void;
  onToggle: (node: TreeNode) => void;
}

function TreeItem({ node, depth, currentPath, onSelect, onToggle }: TreeItemProps) {
  const isExpanded = node.children.length > 0;
  const isActive = currentPath === node.path;

  return (
    <div>
      {/* 节点行：展开按钮 + 图标 + 名称 */}
      <button
        type="button"
        className={`flex w-full items-center gap-1 rounded px-2 py-1 text-sm transition-colors cursor-pointer
          ${isActive
            ? "bg-accent text-accent-foreground font-medium"
            : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
          }`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={() => {
          // 展开/折叠
          onToggle(node);
          // 选中目录 → 右侧文件列表切换到该目录
          onSelect(node.path);
        }}
      >
        {/* 展开/折叠箭头：仅加载后无子目录时隐藏箭头 */}
        {node.loaded && node.children.length === 0 ? (
          <span className="size-4 shrink-0" />
        ) : (
          <ChevronRight
            className={`size-3.5 shrink-0 transition-transform ${isExpanded ? "rotate-90" : ""}`}
          />
        )}
        {/* 文件夹图标：展开时用打开图标 */}
        {isExpanded ? (
          <FolderOpen className="size-4 shrink-0" />
        ) : (
          <Folder className="size-4 shrink-0" />
        )}
        <span className="truncate">{node.name}</span>
      </button>

      {/* 子节点（递归） */}
      {isExpanded &&
        node.children.map((child) => (
          <TreeItem
            key={child.path}
            node={child}
            depth={depth + 1}
            currentPath={currentPath}
            onSelect={onSelect}
            onToggle={onToggle}
          />
        ))}
    </div>
  );
}

// ---- 主组件 ----

export function DirectoryTree({ currentPath, onSelect }: DirectoryTreeProps) {
  const [rootNodes, setRootNodes] = useState<TreeNode[]>([]);

  /** 从后端加载指定目录的子目录列表（仅 directories） */
  const loadChildren = useCallback(async (dirPath: string): Promise<TreeNode[]> => {
    try {
      const res = await filesApi.list(dirPath);
      // 仅保留目录类型，过滤掉文件
      return res.files
        .filter((f) => f.type === "directory")
        .map((d) => ({
          name: d.name,
          path: `${dirPath.replace(/\/$/, "")}/${d.name}`,
          loaded: false,
          children: [],
        }));
    } catch {
      return [];
    }
  }, []);

  /** 初始加载根目录（/data） */
  useEffect(() => {
    loadChildren("/data").then((nodes) => setRootNodes(nodes));
  }, [loadChildren]);

  /** 展开/折叠节点：展开时懒加载子目录 */
  const handleToggle = useCallback(
    async (node: TreeNode) => {
      if (node.children.length > 0) {
        // 已展开 → 折叠：清空子节点
        // 注意：这里我们通过修改 loaded 和 children 来控制
        // 由于 TreeNode 不在 state 中直接修改，需要重新构建树
        setRootNodes((prev) => updateTreeNode(prev, node.path, (n) => ({
          ...n,
          children: [],
        })));
        return;
      }

      if (!node.loaded) {
        // 尚未加载 → 懒加载子目录
        const children = await loadChildren(node.path);
        setRootNodes((prev) =>
          updateTreeNode(prev, node.path, (n) => ({
            ...n,
            loaded: true,
            children,
          })),
        );
      }
    },
    [loadChildren],
  );

  return (
    <div className="flex h-full flex-col">
      {/* 标题栏 */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
        <Folder className="size-4 text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          目录
        </span>
      </div>

      {/* 树节点列表 */}
      <div className="flex-1 overflow-auto py-1">
        {rootNodes.map((node) => (
          <TreeItem
            key={node.path}
            node={node}
            depth={0}
            currentPath={currentPath}
            onSelect={onSelect}
            onToggle={handleToggle}
          />
        ))}
        {rootNodes.length === 0 && (
          <p className="px-3 py-4 text-xs text-muted-foreground text-center">
            暂无目录
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * 递归更新树中的指定节点。
 *
 * @param nodes 当前节点数组
 * @param targetPath 要更新的节点路径
 * @param updater 更新函数，接收匹配到的节点，返回新节点
 * @returns 更新后的节点数组（不可变更新）
 */
function updateTreeNode(
  nodes: TreeNode[],
  targetPath: string,
  updater: (n: TreeNode) => TreeNode,
): TreeNode[] {
  return nodes.map((node) => {
    if (node.path === targetPath) {
      return updater(node);
    }
    if (node.children.length > 0) {
      return {
        ...node,
        children: updateTreeNode(node.children, targetPath, updater),
      };
    }
    return node;
  });
}

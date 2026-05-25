"use client";

/**
 * TopbarNav — 顶部横向导航栏
 *
 * 水平排列导航项，选中态为底部 2px 下划线指示器。
 * 包含：Logo + 导航 + 右侧工具（主题切换/用户菜单/模式切换）
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderOpen,
  Users,
  Settings,
  ScrollText,
  PanelLeftOpen,
  HardDrive,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavMode } from "@/providers/nav-provider";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ThemeToggle } from "./theme-toggle";
import { UserMenu } from "./user-menu";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { label: "仪表盘", href: "/", icon: LayoutDashboard },
  { label: "文件管理", href: "/files", icon: FolderOpen },
  { label: "用户管理", href: "/users", icon: Users },
  { label: "审计日志", href: "/logs", icon: ScrollText },
  { label: "设置", href: "/settings", icon: Settings },
];

export function TopbarNav() {
  const pathname = usePathname();
  const { toggle } = useNavMode();

  return (
    <header className="flex h-14 items-center border-b border-border bg-card px-4">
      {/* Logo */}
      <div className="flex items-center gap-2 mr-8">
        <HardDrive className="h-5 w-5" />
        <span className="text-sm font-semibold">NAS</span>
      </div>

      {/* 导航项 */}
      <nav className="flex items-center gap-1">
        {navItems.map((item) => {
          const isActive =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors",
                isActive
                  ? "font-medium text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
              {isActive && (
                <span className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* 右侧工具 */}
      <div className="ml-auto flex items-center gap-1">
        <ThemeToggle collapsed />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={toggle}>
              <PanelLeftOpen className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>切换侧栏模式</TooltipContent>
        </Tooltip>

        <UserMenu />
      </div>
    </header>
  );
}

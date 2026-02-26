"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Palette,
  BookOpen,
  Library,
  FolderOpen,
  Activity,
  FileDown,
  Settings,
  Menu,
  ChevronLeft,
  Map,
} from "lucide-react";
import { CommandPaletteTriggerMobile } from "@/components/CommandPaletteTrigger";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/builder", label: "Builder Canvas", icon: Palette },
  { href: "/body-map", label: "Body Map", icon: Map },
  { href: "/compendium", label: "Compendium", icon: Library },
  { href: "/library", label: "Library", icon: BookOpen },
  { href: "/plans", label: "My Plans", icon: FolderOpen },
  { href: "/tracker", label: "Tracker", icon: Activity },
  { href: "/export", label: "Export", icon: FileDown },
];

export function AppSidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "glass-sidebar hidden md:flex flex-col transition-all duration-300",
          collapsed ? "w-[72px]" : "w-56"
        )}
      >
        <div className="flex h-14 items-center justify-between border-b border-[var(--card-border)] px-4">
          {!collapsed && (
            <span className="font-bold text-[var(--gut-green)]" title="Open command palette (Ctrl+K)">BioForgeOS</span>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="hidden md:flex"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <Menu className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </Button>
        </div>
        <nav className="flex-1 space-y-1 p-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-[var(--gut-green)]/20 text-[var(--gut-green)]"
                    : "text-[var(--foreground)]/80 hover:bg-white/5 hover:text-[var(--foreground)]"
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
          <Link
            href="/settings"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-[var(--foreground)]/60 hover:bg-white/5 hover:text-[var(--foreground)] mt-4"
            )}
          >
            <Settings className="h-5 w-5 shrink-0" />
            {!collapsed && <span>Settings</span>}
          </Link>
        </nav>
      </aside>

      {/* Mobile menu button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Button
          variant="secondary"
          size="icon"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={cn(
          "md:hidden fixed top-0 left-0 z-40 h-full w-64 glass-sidebar transition-transform duration-300",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-14 items-center justify-between border-b border-[var(--card-border)] px-4">
          <span className="font-bold text-[var(--gut-green)]">BioForgeOS</span>
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </div>
        <nav className="space-y-1 p-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-[var(--gut-green)]/20 text-[var(--gut-green)]"
                    : "text-[var(--foreground)]/80 hover:bg-white/5"
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
          <Link
            href="/settings"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-[var(--foreground)]/60 hover:bg-white/5 mt-4"
          >
            <Settings className="h-5 w-5 shrink-0" />
            <span>Settings</span>
          </Link>
        </nav>
      </aside>

      <main className="flex-1 overflow-auto p-4 md:p-6 pt-16 md:pt-6 pb-20 md:pb-6">
        {children}
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around h-14 glass border-t border-[var(--card-border)] safe-area-pb">
        <Link
          href="/dashboard"
          onClick={() => setMobileOpen(false)}
          className={cn(
            "flex flex-col items-center justify-center gap-0.5 py-2 px-3 text-xs font-medium min-w-[56px]",
            pathname === "/dashboard" ? "text-[var(--gut-green)]" : "text-[var(--foreground)]/70"
          )}
        >
          <LayoutDashboard className="h-5 w-5" />
          <span>Dashboard</span>
        </Link>
        <Link
          href="/builder"
          onClick={() => setMobileOpen(false)}
          className={cn(
            "flex flex-col items-center justify-center gap-0.5 py-2 px-3 text-xs font-medium min-w-[56px]",
            pathname === "/builder" ? "text-[var(--gut-green)]" : "text-[var(--foreground)]/70"
          )}
        >
          <Palette className="h-5 w-5" />
          <span>Builder</span>
        </Link>
        <Link
          href="/body-map"
          onClick={() => setMobileOpen(false)}
          className={cn(
            "flex flex-col items-center justify-center gap-0.5 py-2 px-3 text-xs font-medium min-w-[56px]",
            pathname === "/body-map" ? "text-[var(--gut-green)]" : "text-[var(--foreground)]/70"
          )}
        >
          <Map className="h-5 w-5" />
          <span>Map</span>
        </Link>
        <Link
          href="/compendium"
          onClick={() => setMobileOpen(false)}
          className={cn(
            "flex flex-col items-center justify-center gap-0.5 py-2 px-3 text-xs font-medium min-w-[56px]",
            pathname === "/compendium" ? "text-[var(--gut-green)]" : "text-[var(--foreground)]/70"
          )}
        >
          <Library className="h-5 w-5" />
          <span>Compendium</span>
        </Link>
        <CommandPaletteTriggerMobile />
        <Link
          href="/tracker"
          onClick={() => setMobileOpen(false)}
          className={cn(
            "flex flex-col items-center justify-center gap-0.5 py-2 px-3 text-xs font-medium min-w-[56px]",
            pathname === "/tracker" ? "text-[var(--gut-green)]" : "text-[var(--foreground)]/70"
          )}
        >
          <Activity className="h-5 w-5" />
          <span>Tracker</span>
        </Link>
        <Link
          href="/export"
          onClick={() => setMobileOpen(false)}
          className={cn(
            "flex flex-col items-center justify-center gap-0.5 py-2 px-3 text-xs font-medium min-w-[56px]",
            pathname === "/export" ? "text-[var(--gut-green)]" : "text-[var(--foreground)]/70"
          )}
        >
          <FileDown className="h-5 w-5" />
          <span>Export</span>
        </Link>
      </nav>
    </div>
  );
}

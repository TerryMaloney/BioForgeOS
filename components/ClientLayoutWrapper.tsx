"use client";

import { useEffect } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { QuickAddModal } from "@/components/QuickAddModal";
import { CommandPalette } from "@/components/command-palette";
import { ParticlesBg } from "@/components/particles-bg";
import { CommandPaletteTrigger } from "@/components/CommandPaletteTrigger";
import { useStore } from "@/lib/store";

export function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const quickAddOpen = useStore((s) => s.ui.quickAddOpen ?? false);
  const setUI = useStore((s) => s.setUI);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "A") {
        e.preventDefault();
        setUI({ quickAddOpen: true });
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [setUI]);

  return (
    <>
      <ParticlesBg />
      {/* Desktop: fixed top-right trigger */}
      <div className="hidden md:block fixed top-4 right-4 z-30">
        <CommandPaletteTrigger />
      </div>
      <AppSidebar>{children}</AppSidebar>
      <QuickAddModal open={quickAddOpen} onOpenChange={(open) => setUI({ quickAddOpen: open })} />
      <CommandPalette />
    </>
  );
}

"use client";

import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function CommandPaletteTrigger() {
  const setUI = useStore((s) => s.setUI);

  const openPalette = () => setUI({ commandPaletteOpen: true });

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={openPalette}
            className="shrink-0"
            aria-label="Quick Search & Add (Ctrl+K)"
          >
            <Search className="h-5 w-5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left">
          <p>Quick Search & Add (Ctrl+K / Cmd+K)</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/** For mobile bottom nav: same trigger, compact label. */
export function CommandPaletteTriggerMobile() {
  const setUI = useStore((s) => s.setUI);

  return (
    <button
      type="button"
      onClick={() => setUI({ commandPaletteOpen: true })}
      className="flex flex-col items-center justify-center gap-0.5 py-2 px-3 text-xs font-medium min-w-[56px] text-[var(--foreground)]/70 hover:text-[var(--gut-green)] active:opacity-80"
      aria-label="Quick Search & Add"
    >
      <Search className="h-5 w-5" />
      <span>Quick Search</span>
    </button>
  );
}

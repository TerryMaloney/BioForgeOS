"use client";

import { motion } from "framer-motion";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LayoutGrid, Dna, Baby, Bug, Library, ChevronDown } from "lucide-react";
import type { FocusMode } from "@/lib/types";

const FOCUS_OPTIONS: { mode: FocusMode; label: string; icon: typeof LayoutGrid }[] = [
  { mode: "full", label: "Full Protocol", icon: LayoutGrid },
  { mode: "peptides-only", label: "Peptides Only", icon: Dna },
  { mode: "preconception", label: "Preconception Timeline", icon: Baby },
  { mode: "gut-repair", label: "Gut Repair Module", icon: Bug },
];

export function FocusModeBar() {
  const focusMode = useStore((s) => s.focusMode);
  const focusModuleId = useStore((s) => s.focusModuleId);
  const setFocusMode = useStore((s) => s.setFocusMode);
  const savedModules = useStore((s) => s.savedModules);

  return (
    <motion.div
      className="flex flex-wrap items-center gap-2 mb-3"
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <span className="text-xs font-medium text-[var(--foreground)]/60 mr-1">View:</span>
      {FOCUS_OPTIONS.map(({ mode, label, icon: Icon }) => (
        <Button
          key={mode}
          variant={focusMode === mode && mode !== "compendium-custom" ? "default" : "secondary"}
          size="sm"
          onClick={() => setFocusMode(mode)}
          className={cn(
            focusMode === mode && mode !== "compendium-custom" && "ring-1 ring-[var(--gut-green)]"
          )}
        >
          <Icon className="h-3.5 w-3.5 mr-1" />
          {label}
        </Button>
      ))}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={focusMode === "compendium-custom" ? "default" : "secondary"}
            size="sm"
            className={cn(
              focusMode === "compendium-custom" && "ring-1 ring-[var(--gut-green)]"
            )}
          >
            <Library className="h-3.5 w-3.5 mr-1" />
            My Custom Compendium
            <ChevronDown className="h-3.5 w-3.5 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="glass border border-[var(--card-border)]">
          {savedModules.length === 0 ? (
            <DropdownMenuItem disabled>No modules saved yet</DropdownMenuItem>
          ) : (
            savedModules.map((m) => (
              <DropdownMenuItem
                key={m.id}
                onClick={() => setFocusMode("compendium-custom", m.id)}
                className={cn(focusMode === "compendium-custom" && focusModuleId === m.id && "bg-[var(--gut-green)]/20")}
              >
                {m.name}
              </DropdownMenuItem>
            ))
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </motion.div>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import { useStore } from "@/lib/store";
import { parseQuickAddInput } from "@/lib/quickAddParser";
import type { CompendiumItem } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export function QuickAddModal({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (id: string) => void;
}) {
  const [input, setInput] = useState("");
  const addCompendiumItem = useStore((s) => s.addCompendiumItem);
  const addCompendiumItemToPlan = useStore((s) => s.addCompendiumItemToPlan);

  const handleSubmit = useCallback(() => {
    const parsed = parseQuickAddInput(input);
    if (parsed) {
      const id = crypto.randomUUID();
      const item: CompendiumItem = {
        id,
        name: parsed.name,
        type: parsed.type,
        refId: parsed.refId,
        doseExamples: parsed.doseExamples,
        personalNotes: parsed.personalNotes,
        tags: [],
        versionHistory: [{ at: new Date().toISOString(), note: "Quick-add" }],
        links: [],
      };
      addCompendiumItem(item);
      addCompendiumItemToPlan(0, item);
      setInput("");
      onOpenChange(false);
      onCreated?.(id);
    }
  }, [input, addCompendiumItem, addCompendiumItemToPlan, onOpenChange, onCreated]);

  useEffect(() => {
    if (open) setInput("");
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg" showClose={true}>
        <DialogHeader>
          <DialogTitle>Quick add (Ctrl+Shift+A)</DialogTitle>
          <p className="text-sm text-[var(--foreground)]/70">
            e.g. &quot;Add Urolithin A 1000mg daily for 12 weeks with mitophagy note&quot;
          </p>
        </DialogHeader>
        <textarea
          className="flex min-h-[100px] w-full rounded-md border border-[var(--card-border)] bg-white/5 px-3 py-2 text-sm placeholder:text-[var(--foreground)]/50"
          placeholder="Add Urolithin A 1000mg daily for 12 weeks..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.metaKey || e.ctrlKey) && handleSubmit()}
        />
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!parseQuickAddInput(input)}>
            Add to compendium & plan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

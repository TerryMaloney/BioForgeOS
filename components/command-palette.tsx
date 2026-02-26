"use client";

import { useEffect, useState, useCallback } from "react";
import { Command } from "cmdk";
import { useStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { parseQuickAddInput, parseQuickAddInputMultiple } from "@/lib/quickAddParser";
import type { CompendiumItem } from "@/lib/types";
import { seedData } from "@/lib/seedData";
import {
  Dna,
  FlaskConical,
  Layers,
  UtensilsCrossed,
  ListTodo,
  Zap,
  LayoutGrid,
  Baby,
  Bug,
  Activity,
  Download,
  Search,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function CommandPalette() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const open = useStore((s) => s.ui.commandPaletteOpen ?? false);
  const setUI = useStore((s) => s.setUI);
  const addRecentCommandSearch = useStore((s) => s.addRecentCommandSearch);
  const recentCommandSearches = useStore((s) => s.ui.recentCommandSearches ?? []);
  const compendiumItems = useStore((s) => s.compendiumItems);
  const addCompendiumItem = useStore((s) => s.addCompendiumItem);
  const addCompendiumItemToPlan = useStore((s) => s.addCompendiumItemToPlan);
  const setFocusMode = useStore((s) => s.setFocusMode);

  const setOpen = useCallback((o: boolean) => setUI({ commandPaletteOpen: o }), [setUI]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(!open);
      }
    };
    window.addEventListener("keydown", down);
    return () => window.removeEventListener("keydown", down);
  }, [open, setOpen]);

  const runParsed = useCallback(() => {
    addRecentCommandSearch(search);
    const multi = parseQuickAddInputMultiple(search);
    if (multi.length > 1) {
      multi.forEach((parsed) => {
        const id = crypto.randomUUID();
        const item: CompendiumItem = {
          id,
          name: parsed.name,
          type: parsed.type,
          refId: parsed.refId,
          doseExamples: parsed.doseExamples,
          personalNotes: parsed.personalNotes,
          tags: [],
          versionHistory: [{ at: new Date().toISOString(), note: "Command palette" }],
          links: [],
        };
        addCompendiumItem(item);
        addCompendiumItemToPlan(0, item);
      });
      setSearch("");
      setOpen(false);
      return;
    }
    const parsed = parseQuickAddInput(search);
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
        versionHistory: [{ at: new Date().toISOString(), note: "Command palette" }],
        links: [],
      };
      addCompendiumItem(item);
      addCompendiumItemToPlan(0, item);
      setSearch("");
      setOpen(false);
    }
  }, [search, addCompendiumItem, addCompendiumItemToPlan, addRecentCommandSearch, setOpen]);

  const parsed = parseQuickAddInput(search);
  const parsedMulti = parseQuickAddInputMultiple(search);
  const showRunParsed = search.length > 3 && (parsed || parsedMulti.length > 1);

  const peptides = compendiumItems.filter((i) => i.type === "peptide");
  const tests = compendiumItems.filter((i) => i.type === "test");
  const fiveR = compendiumItems.filter((i) => i.type === "5r");
  const diets = compendiumItems.filter((i) => i.type === "diet");
  const monitoring = compendiumItems.filter((i) => i.type === "monitoring");
  const goals = compendiumItems.filter((i) => i.type === "goal");
  const getMoa = (item: CompendiumItem) =>
    item.moa ?? seedData.peptides.find((p) => p.id === item.refId)?.moa ?? "";
  const getTier = (item: CompendiumItem) =>
    item.evidenceTier ?? (seedData.peptides.find((p) => p.id === item.refId)?.tier as "S" | "A" | "Frontier" | undefined);

  const itemGroups = [
    { heading: "Peptides", items: peptides, icon: Dna },
    { heading: "Tests", items: tests, icon: FlaskConical },
    { heading: "5R Stages", items: fiveR, icon: Layers },
    { heading: "Diets", items: diets, icon: UtensilsCrossed },
    { heading: "Monitoring", items: monitoring, icon: ListTodo },
    { heading: "Goals", items: goals, icon: Zap },
  ];

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Command palette"
      overlayClassName="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
      contentClassName="fixed left-[50%] top-[15%] md:top-[20%] z-50 w-full max-w-xl -translate-x-1/2 rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-0 shadow-2xl overflow-hidden max-h-[85vh] flex flex-col"
    >
      <Command.Input
        value={search}
        onValueChange={setSearch}
        placeholder="Search peptides, tests, diets… or type a stack (e.g. Urolithin A + SS-31 8 weeks)"
        className="w-full border-b border-[var(--card-border)] bg-transparent px-4 py-3 text-[var(--foreground)] placeholder:text-[var(--foreground)]/50 focus:outline-none"
      />
      <Command.List className="max-h-[320px] md:max-h-[380px] overflow-auto p-2 flex-1">
        <Command.Empty className="py-6 text-center text-sm text-[var(--foreground)]/60">
          No results.
        </Command.Empty>
        {recentCommandSearches.length > 0 && !search.trim() && (
          <Command.Group heading="Recent searches">
            {recentCommandSearches.slice(0, 5).map((q) => (
              <Command.Item
                key={q}
                value={`recent: ${q}`}
                onSelect={() => setSearch(q)}
                className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-[var(--foreground)]/80 data-[selected=true]:bg-[var(--gut-green)]/20"
              >
                <Search className="h-4 w-4 shrink-0 opacity-60" />
                <span>{q}</span>
              </Command.Item>
            ))}
          </Command.Group>
        )}
        {showRunParsed && (
          <Command.Group heading="Run">
            {parsedMulti.length > 1 ? (
              <Command.Item
                value={`run: ${parsedMulti.map((p) => p.name).join(", ")}`}
                onSelect={() => runParsed()}
                className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm data-[selected=true]:bg-[var(--gut-green)]/20 data-[selected=true]:text-[var(--gut-green)]"
              >
                Add {parsedMulti.map((p) => p.name).join(", ")} to plan (Phase 0)
              </Command.Item>
            ) : parsed ? (
              <Command.Item
                value={`run: ${parsed.name}`}
                onSelect={() => runParsed()}
                className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm data-[selected=true]:bg-[var(--gut-green)]/20 data-[selected=true]:text-[var(--gut-green)]"
              >
                Add &quot;{parsed.name}&quot; to plan (Phase 0)
              </Command.Item>
            ) : null}
          </Command.Group>
        )}
        <Command.Group heading="Actions">
          <Command.Item
            value="isolate peptides"
            onSelect={() => {
              addRecentCommandSearch("Isolate peptides");
              setFocusMode("peptides-only");
              setOpen(false);
            }}
            className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm data-[selected=true]:bg-[var(--gut-green)]/20"
          >
            <Dna className="h-4 w-4 shrink-0" />
            <span>Isolate peptides</span>
          </Command.Item>
          <Command.Item
            value="full protocol"
            onSelect={() => {
              setFocusMode("full");
              setOpen(false);
            }}
            className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm data-[selected=true]:bg-[var(--gut-green)]/20"
          >
            <LayoutGrid className="h-4 w-4 shrink-0" />
            <span>Full protocol view</span>
          </Command.Item>
          <Command.Item
            value="preconception"
            onSelect={() => {
              setFocusMode("preconception");
              setOpen(false);
            }}
            className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm data-[selected=true]:bg-[var(--gut-green)]/20"
          >
            <Baby className="h-4 w-4 shrink-0" />
            <span>Switch to Preconception mode</span>
          </Command.Item>
          <Command.Item
            value="gut repair"
            onSelect={() => {
              setFocusMode("gut-repair");
              setOpen(false);
            }}
            className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm data-[selected=true]:bg-[var(--gut-green)]/20"
          >
            <Bug className="h-4 w-4 shrink-0" />
            <span>Gut Repair module</span>
          </Command.Item>
          <Command.Item
            value="tracker n-of-1"
            onSelect={() => {
              router.push("/tracker");
              setOpen(false);
            }}
            className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm data-[selected=true]:bg-[var(--gut-green)]/20"
          >
            <Activity className="h-4 w-4 shrink-0" />
            <span>New N-of-1 experiment (Tracker)</span>
          </Command.Item>
          <Command.Item
            value="export compendium"
            onSelect={() => {
              const state = useStore.getState();
              const data = {
                compendiumItems: state.compendiumItems,
                savedModules: state.savedModules,
                exportedAt: new Date().toISOString(),
              };
              const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `bioforgeos-compendium-${new Date().toISOString().slice(0, 10)}.json`;
              a.click();
              URL.revokeObjectURL(url);
              setOpen(false);
            }}
            className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm data-[selected=true]:bg-[var(--gut-green)]/20"
          >
            <Download className="h-4 w-4 shrink-0" />
            <span>Export full compendium</span>
          </Command.Item>
        </Command.Group>
        {itemGroups.map(({ heading, items, icon: Icon }) =>
          items.length > 0 ? (
            <Command.Group key={heading} heading={heading}>
              {items.slice(0, 12).map((item) => {
                const moa = getMoa(item);
                const tier = getTier(item);
                return (
                  <Command.Item
                    key={item.id}
                    value={`${item.name} ${item.type} ${heading}`}
                    onSelect={() => {
                      addRecentCommandSearch(item.name);
                      addCompendiumItemToPlan(0, item);
                      setOpen(false);
                    }}
                    className="flex cursor-pointer items-start gap-2 rounded-lg px-3 py-2 text-sm data-[selected=true]:bg-[var(--gut-green)]/20"
                  >
                    <Icon className="h-4 w-4 shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">{item.name}</span>
                        {tier && (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                            {tier}
                          </Badge>
                        )}
                      </div>
                      {moa && (
                        <p className="text-xs text-[var(--foreground)]/60 truncate max-w-[280px] mt-0.5">
                          {moa.slice(0, 60)}{moa.length > 60 ? "…" : ""}
                        </p>
                      )}
                    </div>
                  </Command.Item>
                );
              })}
            </Command.Group>
          ) : null
        )}
      </Command.List>
    </Command.Dialog>
  );
}

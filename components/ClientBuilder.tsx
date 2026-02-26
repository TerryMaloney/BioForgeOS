"use client";

import { useState, useMemo } from "react";
import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCenter,
  rectIntersection,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { useStore } from "@/lib/store";
import { seedData } from "@/lib/seedData";
import { generateProtocol } from "@/lib/protocolGenerator";
import { getFilteredPhases, getFilteredPlan } from "@/lib/focusFilter";
import { FocusModeBar } from "@/components/focus-mode-bar";
import { SynergyGraph } from "@/components/synergy-graph";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Search, Trash2, GripVertical } from "lucide-react";
import type { PlanBlock, PlanBlockType, UserPlan } from "@/lib/types";

function BuilderQuickSearchFAB() {
  const setUI = useStore((s) => s.setUI);
  return (
    <button
      type="button"
      onClick={() => setUI({ commandPaletteOpen: true })}
      className="fixed bottom-20 md:bottom-6 right-6 z-20 h-12 w-12 rounded-full bg-[var(--gut-green)] text-white shadow-lg flex items-center justify-center hover:opacity-90 active:scale-95 transition-transform"
      aria-label="Quick Search & Add"
    >
      <Search className="h-5 w-5" />
    </button>
  );
}

interface LibraryItem {
  id: string;
  label: string;
  type: PlanBlockType;
}

const LIBRARY_CATEGORIES: { id: string; label: string; items: LibraryItem[] }[] = [
  {
    id: "goals",
    label: "Goals",
    items: seedData.missionModes.map((m) => ({ id: m.id, label: m.name, type: "goal" as PlanBlockType })),
  },
  {
    id: "tests",
    label: "Tests",
    items: [
      ...seedData.biomarkerHierarchy.tier1.map((b) => ({ id: `test-${b}`, label: b, type: "test" as PlanBlockType })),
      ...seedData.biomarkerHierarchy.tier2.map((b) => ({ id: `test-${b}`, label: b, type: "test" as PlanBlockType })),
    ],
  },
  { id: "5r", label: "5R Stages", items: [
    { id: "5r-remove", label: "Remove (eliminate)", type: "5r" as PlanBlockType },
    { id: "5r-replace", label: "Replace (digestive support)", type: "5r" as PlanBlockType },
    { id: "5r-reinoculate", label: "Reinoculate (probiotics)", type: "5r" as PlanBlockType },
    { id: "5r-repair", label: "Repair (gut lining)", type: "5r" as PlanBlockType },
    { id: "5r-rebalance", label: "Rebalance (lifestyle)", type: "5r" as PlanBlockType },
  ] },
  { id: "peptides", label: "Peptides", items: seedData.peptides.map((p) => ({ id: p.id, label: p.name, type: "peptide" as PlanBlockType })) },
  { id: "diet", label: "Diet", items: [
    { id: "diet-green-med", label: "Green-Mediterranean diet", type: "diet" as PlanBlockType },
    { id: "diet-low-fodmap", label: "Low FODMAP", type: "diet" as PlanBlockType },
    { id: "diet-elimination", label: "Elimination protocol", type: "diet" as PlanBlockType },
  ] },
  { id: "monitoring", label: "Monitoring", items: [
    ...seedData.biomarkerHierarchy.tier1.map((b) => ({ id: `mon-${b}`, label: `Track ${b}`, type: "monitoring" as PlanBlockType })),
  ] },
];

function DraggableLibraryItem({
  item,
  categoryId,
}: { item: LibraryItem; categoryId: string }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `library-${categoryId}-${item.id}`,
    data: { type: "library", categoryId, item },
  });
  const peptide = seedData.peptides.find((p) => p.id === item.id);

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`glass rounded-lg border border-[var(--card-border)] p-2 cursor-grab active:cursor-grabbing ${isDragging ? "opacity-50" : ""}`}
    >
      <div className="flex items-center gap-2">
        <GripVertical className="h-4 w-4 text-[var(--foreground)]/50 shrink-0" />
        <span className="text-sm font-medium truncate">{item.label}</span>
        {item.type === "peptide" && peptide && (
          <Badge variant="secondary" className="shrink-0 text-[10px]">{peptide.tier}</Badge>
        )}
      </div>
    </div>
  );
}

function CanvasBlock({ block, phaseIndex, onRemove }: { block: PlanBlock; phaseIndex: number; onRemove: () => void }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: block.id,
    data: { type: "block", block, phaseIndex },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`flex items-center justify-between gap-2 rounded-lg border border-[var(--card-border)] bg-white/5 p-2 text-sm ${isDragging ? "opacity-50" : ""}`}
    >
      <span className="truncate flex-1">{block.label}</span>
      <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={(e) => { e.stopPropagation(); onRemove(); }}>
        <Trash2 className="h-3 w-3" />
      </Button>
    </div>
  );
}

function DroppablePhaseColumn({
  phase,
  phaseIndex,
  blocks,
  onRemoveBlock,
}: {
  phase: { id: string; name: string; weekStart: number; weekEnd: number };
  phaseIndex: number;
  blocks: PlanBlock[];
  onRemoveBlock: (blockId: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `phase-${phaseIndex}`,
    data: { phaseIndex },
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex-1 min-w-[200px] min-h-[220px] rounded-xl border-2 border-dashed p-3 transition-colors ${
        isOver ? "border-[var(--gut-green)] bg-[var(--gut-green)]/10" : "border-[var(--card-border)]"
      }`}
    >
      <div className="mb-2 text-sm font-semibold text-[var(--gut-green)]">
        {phase.name} (Week {phase.weekStart}-{phase.weekEnd})
      </div>
      <div className="space-y-2">
        {blocks.map((block) => (
          <CanvasBlock
            key={block.id}
            block={block}
            phaseIndex={phaseIndex}
            onRemove={() => onRemoveBlock(block.id)}
          />
        ))}
      </div>
    </div>
  );
}

function PlanPreview({ planOverride }: { planOverride?: UserPlan | null }) {
  const currentPlan = useStore((s) => s.currentPlan);
  const plan = planOverride ?? currentPlan;
  const protocol = useMemo(() => generateProtocol(plan ?? null), [plan]);

  if (!protocol) {
    return (
      <Card className="h-full">
        <CardHeader><CardTitle className="text-lg">Plan Preview</CardTitle></CardHeader>
        <CardContent><p className="text-sm text-[var(--foreground)]/70">No plan loaded.</p></CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Plan Preview</CardTitle>
        <p className="text-xs text-[var(--foreground)]/70">{protocol.planName}</p>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto space-y-4">
        {protocol.phases.map((p) => (
          <div key={p.name} className="space-y-1">
            <h4 className="text-sm font-semibold text-[var(--gut-green)]">{p.name} — {p.weekRange}</h4>
            <ul className="text-xs space-y-0.5 text-[var(--foreground)]/90">
              {p.blocks.map((b, i) => (
                <li key={i}>• {b.label}{b.form ? ` (${b.form})` : ""}</li>
              ))}
            </ul>
            {p.doses.length > 0 && (
              <p className="text-xs text-[var(--foreground)]/70">Doses: {p.doses.join("; ")}</p>
            )}
          </div>
        ))}
        {protocol.doctorScripts.length > 0 && (
          <div className="pt-2 border-t border-[var(--card-border)]">
            <h4 className="text-sm font-semibold mb-1">Doctor script</h4>
            <p className="text-xs text-[var(--foreground)]/80">{protocol.doctorScripts[0]}</p>
          </div>
        )}
        {protocol.biomarkerGates.length > 0 && (
          <div className="pt-2 border-t border-[var(--card-border)]">
            <h4 className="text-sm font-semibold mb-1">Biomarker gates</h4>
            <ul className="text-xs text-[var(--foreground)]/80 space-y-0.5">
              {protocol.biomarkerGates.slice(0, 5).map((g, i) => <li key={i}>• {g}</li>)}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function ClientBuilder() {
  const currentPlan = useStore((s) => s.currentPlan);
  const focusMode = useStore((s) => s.focusMode);
  const focusModuleId = useStore((s) => s.focusModuleId);
  const savedModules = useStore((s) => s.savedModules);
  const addBlockToPhase = useStore((s) => s.addBlockToPhase);
  const removeBlock = useStore((s) => s.removeBlock);
  const [search, setSearch] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);

  const getModuleItemIds = (id: string) => savedModules.find((m) => m.id === id)?.itemIds ?? [];
  const filteredPhases = useMemo(
    () => getFilteredPhases(currentPlan, focusMode, focusModuleId, getModuleItemIds),
    [currentPlan, focusMode, focusModuleId, savedModules]
  );
  const displayPlan = useMemo(
    () => getFilteredPlan(currentPlan, focusMode, focusModuleId, getModuleItemIds),
    [currentPlan, focusMode, focusModuleId, savedModules]
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  );

  const filteredCategories = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return LIBRARY_CATEGORIES;
    return LIBRARY_CATEGORIES.map((cat) => ({
      ...cat,
      items: cat.items.filter((i) => i.label.toLowerCase().includes(q) || i.id.toLowerCase().includes(q)),
    })).filter((c) => c.items.length > 0);
  }, [search]);

  const handleDragStart = (e: DragStartEvent) => setActiveId(String(e.active.id));

  const handleDragEnd = (e: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = e;
    if (!over) return;

    const overId = String(over.id);
    const isPhase = overId.startsWith("phase-");
    if (!isPhase) return;

    const phaseIndex = parseInt(overId.replace("phase-", ""), 10);
    if (isNaN(phaseIndex)) return;

    const activeData = active.data.current;
    if (activeData?.type === "library" && activeData.item) {
      const { item } = activeData as { type: "library"; item: { id: string; label: string; type: PlanBlockType } };
      const blockId = `block-${item.id}-${Date.now()}`;
      addBlockToPhase(phaseIndex, 0, {
        id: blockId,
        type: item.type,
        refId: item.id,
        label: item.label,
      });
    }
  };

  const handleRemoveBlock = (phaseIndex: number, blockId: string) => {
    removeBlock(phaseIndex, blockId);
  };

  if (!currentPlan) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-[var(--foreground)]/70">No plan loaded. Create one from Dashboard.</p>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <DndContext
        sensors={sensors}
        collisionDetection={rectIntersection}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[calc(100vh-8rem)]">
          {/* Left: Library */}
          <div className="lg:col-span-3 flex flex-col glass rounded-xl border border-[var(--card-border)] overflow-hidden">
            <div className="p-3 border-b border-[var(--card-border)]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--foreground)]/50" />
                <Input
                  placeholder="Search library..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 bg-white/5"
                />
              </div>
            </div>
            <ScrollArea className="flex-1 p-3">
              <div className="space-y-4">
                {filteredCategories.map((cat) => (
                  <div key={cat.id}>
                    <h3 className="text-xs font-semibold text-[var(--foreground)]/70 mb-2 uppercase tracking-wider">
                      {cat.label}
                    </h3>
                    <div className="space-y-1.5">
                      {cat.items.map((item) => (
                        <DraggableLibraryItem key={`${cat.id}-${item.id}`} item={item} categoryId={cat.id} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Center: Canvas */}
          <div className="lg:col-span-5 flex flex-col gap-4 overflow-auto">
            <FocusModeBar />
            <h2 className="text-lg font-semibold">Canvas</h2>
            <div className="flex gap-4 flex-1 min-h-0">
              {currentPlan.phases.map((phase, phaseIndex) => (
                <DroppablePhaseColumn
                  key={phase.id}
                  phase={phase}
                  phaseIndex={phaseIndex}
                  blocks={filteredPhases[phaseIndex]?.blocks ?? []}
                  onRemoveBlock={(blockId) => handleRemoveBlock(phaseIndex, blockId)}
                />
              ))}
            </div>
          </div>

          {/* Right: Preview + Synergy Graph */}
          <div className="lg:col-span-4 min-h-0 flex flex-col gap-4">
            <PlanPreview planOverride={displayPlan} />
            <SynergyGraph plan={currentPlan} />
          </div>
        </div>

        <DragOverlay>
          {activeId ? (
            <div className="glass rounded-lg border border-[var(--gut-green)] p-3 shadow-xl opacity-95">
              <span className="text-sm font-medium">Dragging...</span>
            </div>
          ) : null}
        </DragOverlay>
        {/* FAB: Quick Search on builder */}
        <BuilderQuickSearchFAB />
      </DndContext>
    </TooltipProvider>
  );
}

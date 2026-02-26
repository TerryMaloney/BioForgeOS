"use client";

import { useCallback } from "react";
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  useDraggable,
  type DragEndEvent,
} from "@dnd-kit/core";
import { useStore } from "@/lib/store";
import { BodyMap } from "@/components/body-map";
import { ORGAN_IDS } from "@/lib/bodyMapOrgans";
import type { OrganId } from "@/lib/bodyMapOrgans";
import type { PlanBlock } from "@/lib/types";
import { GripVertical } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

function DraggablePlanBlock({ block }: { block: PlanBlock }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: block.id,
    data: { type: "plan-block", block },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-white/5 px-2 py-1.5 text-sm ${isDragging ? "opacity-80 ring-2 ring-[var(--gut-green)]" : ""}`}
    >
      <GripVertical className="h-4 w-4 text-[var(--foreground)]/50 shrink-0" />
      <span className="truncate flex-1">{block.label}</span>
    </div>
  );
}

export default function BodyMapPage() {
  const setUIState = useStore((s) => s.setUI);
  const currentPlan = useStore((s) => s.currentPlan);
  const updateBlockOrganIds = useStore((s) => s.updateBlockOrganIds);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  );

  const handleAddToOrgan = useCallback((organId: string) => {
    setUIState({ commandPaletteOpen: true });
    sessionStorage.setItem("bodyMapAddToOrgan", organId);
  }, [setUIState]);

  const handleDragEnd = useCallback(
    (e: DragEndEvent) => {
      const { active, over } = e;
      if (!over || String(active.id) === String(over.id)) return;
      const activeData = active.data.current;
      const organId = String(over.id);
      const organIds = ORGAN_IDS.includes(organId as OrganId) ? [organId as OrganId] : null;
      if (!organIds) return;
      if (activeData?.type === "plan-block" && activeData.block) {
        const block = activeData.block as PlanBlock;
        const existing = block.organIds ?? [];
        const next = existing.includes(organId) ? existing : [...existing, organId];
        updateBlockOrganIds(block.id, next);
      }
    },
    [updateBlockOrganIds]
  );

  const allBlocks: PlanBlock[] = [];
  if (currentPlan) {
    for (const phase of currentPlan.phases) {
      for (const block of phase.blocks) allBlocks.push(block);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Body Map</h1>
        <p className="text-sm text-[var(--foreground)]/70 mt-1">
          Tap an organ to see impact, active blocks, and notes. Drag a block from the list onto an organ to tag it. Long-press or use &quot;Add block&quot; to add from Compendium.
        </p>
      </div>

      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-3 flex flex-col glass rounded-xl border border-[var(--card-border)] p-3">
            <h3 className="text-sm font-semibold text-[var(--foreground)]/80 mb-2">Plan blocks — drag to organ</h3>
            {allBlocks.length === 0 ? (
              <p className="text-xs text-[var(--foreground)]/50">No blocks in current plan. Add from Builder or Compendium.</p>
            ) : (
              <ScrollArea className="flex-1 max-h-[240px]">
                <div className="space-y-1.5">
                  {allBlocks.map((block) => (
                    <DraggablePlanBlock key={block.id} block={block} />
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
          <div className="lg:col-span-9">
            <BodyMap onAddToOrgan={handleAddToOrgan} enableDroppables />
          </div>
        </div>
      </DndContext>
    </div>
  );
}

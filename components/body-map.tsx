"use client";

import { useMemo, useCallback, useRef } from "react";
import type { RefCallback } from "react";
import { useDroppable } from "@dnd-kit/core";
import { useStore } from "@/lib/store";
import { ORGANS, getOrganConnections } from "@/lib/bodyMapOrgans";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { X, Plus } from "lucide-react";

const VIEW_BOX = "0 0 200 400";

function DroppableOrgan({
  organ,
  active,
  selected,
  onClick,
  onContextMenu,
  onTouchStart,
  onTouchEnd,
  children,
}: {
  organ: { id: string; cx: number; cy: number; r: number; label: string };
  active: boolean;
  selected: boolean;
  onClick: (e: React.MouseEvent) => void;
  onContextMenu: (e: React.MouseEvent) => void;
  onTouchStart: () => void;
  onTouchEnd: () => void;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: organ.id, data: { organId: organ.id } });
  return (
    <g
      ref={setNodeRef as RefCallback<SVGGElement | null>}
      onClick={onClick}
      onContextMenu={onContextMenu}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      style={{ cursor: "pointer", touchAction: "manipulation" }}
    >
      {children}
      {isOver && (
        <circle cx={organ.cx} cy={organ.cy} r={organ.r + 4} fill="rgba(34,197,94,0.2)" stroke="var(--gut-green)" strokeWidth={2} strokeDasharray="4 2" />
      )}
    </g>
  );
}

interface BodyMapProps {
  compact?: boolean;
  onAddToOrgan?: (organId: string) => void;
  enableDroppables?: boolean;
}

export function BodyMap({ compact = false, onAddToOrgan, enableDroppables = false }: BodyMapProps) {
  const currentPlan = useStore((s) => s.currentPlan);
  const bodyMapAnnotations = useStore((s) => s.bodyMapAnnotations);
  const setUI = useStore((s) => s.setUI);
  const selectedOrgan = useStore((s) => s.ui.bodyMapSelectedOrgan ?? null);
  const setSelectedOrgan = useCallback(
    (id: string | null) => setUI({ bodyMapSelectedOrgan: id }),
    [setUI]
  );

  const blocksByOrgan = useMemo(() => {
    const map: Record<string, { label: string; id: string }[]> = {};
    if (!currentPlan) return map;
    for (const phase of currentPlan.phases) {
      for (const block of phase.blocks) {
        const ids = block.organIds ?? [];
        if (ids.length === 0) continue;
        for (const oid of ids) {
          if (!map[oid]) map[oid] = [];
          map[oid].push({ label: block.label, id: block.id });
        }
      }
    }
    return map;
  }, [currentPlan]);

  const connectionStrength = useMemo(() => {
    const strength: Record<string, number> = {};
    for (const conn of getOrganConnections()) {
      const key = [conn.from, conn.to].sort().join("-");
      const fromBlocks = blocksByOrgan[conn.from]?.length ?? 0;
      const toBlocks = blocksByOrgan[conn.to]?.length ?? 0;
      strength[key] = Math.min(3, Math.max(0, fromBlocks + toBlocks));
    }
    return strength;
  }, [blocksByOrgan]);

  const longPressFiredRef = useRef(false);
  const longPressTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleOrganClick = useCallback(
    (e: React.MouseEvent, organId: string) => {
      e.stopPropagation();
      e.preventDefault();
      if (longPressFiredRef.current) {
        longPressFiredRef.current = false;
        return;
      }
      setSelectedOrgan(selectedOrgan === organId ? null : organId);
    },
    [selectedOrgan, setSelectedOrgan]
  );

  const handleTouchStart = useCallback(
    (organId: string) => {
      longPressTimeoutRef.current = setTimeout(() => {
        longPressFiredRef.current = true;
        onAddToOrgan?.(organId);
      }, 450);
    },
    [onAddToOrgan]
  );

  const handleTouchEnd = useCallback(() => {
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current);
      longPressTimeoutRef.current = null;
    }
  }, []);

  const handleContextMenu = useCallback(
    (e: React.MouseEvent, organId: string) => {
      e.preventDefault();
      onAddToOrgan?.(organId);
    },
    [onAddToOrgan]
  );

  return (
    <div className={compact ? "relative" : "relative w-full max-w-lg mx-auto"}>
      <svg
        viewBox={VIEW_BOX}
        className="w-full h-auto min-h-[320px] select-none"
        style={{ maxHeight: compact ? 280 : 480 }}
      >
        {/* Subtle body outline */}
        <ellipse cx={100} cy={200} rx={55} ry={180} fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
        {/* Synergy connections */}
        {getOrganConnections().map((conn, i) => {
          const from = ORGANS.find((o) => o.id === conn.from);
          const to = ORGANS.find((o) => o.id === conn.to);
          if (!from || !to) return null;
          const key = [conn.from, conn.to].sort().join("-");
          const str = connectionStrength[key] ?? 0;
          const opacity = 0.2 + str * 0.2;
          return (
            <line
              key={i}
              x1={from.cx}
              y1={from.cy}
              x2={to.cx}
              y2={to.cy}
              stroke={`rgba(34,197,94,${opacity})`}
              strokeWidth={1 + str * 0.8}
            />
          );
        })}
        {/* Organ circles */}
        {ORGANS.map((organ) => {
          const active = (blocksByOrgan[organ.id]?.length ?? 0) > 0 || !!bodyMapAnnotations[organ.id];
          const selected = selectedOrgan === organ.id;
          const circleEl = (
            <>
              <circle
                cx={organ.cx}
                cy={organ.cy}
                r={organ.r}
                fill={selected ? "rgba(34,197,94,0.4)" : active ? "rgba(34,197,94,0.25)" : "rgba(255,255,255,0.08)"}
                stroke={selected ? "var(--gut-green)" : "rgba(255,255,255,0.2)"}
                strokeWidth={selected ? 2.5 : 1}
                className="cursor-pointer transition-all hover:fill-[rgba(34,197,94,0.3)] pointer-events-auto"
              />
              {!compact && (
                <text
                  x={organ.cx}
                  y={organ.cy + 4}
                  textAnchor="middle"
                  className="fill-[var(--foreground)]/80 text-[8px] pointer-events-none"
                >
                  {organ.label.split(/[\s/]/)[0]}
                </text>
              )}
            </>
          );
          if (enableDroppables && !compact) {
            return (
              <DroppableOrgan
                key={organ.id}
                organ={organ}
                active={active}
                selected={selected}
                onClick={(e) => handleOrganClick(e, organ.id)}
                onContextMenu={(e) => handleContextMenu(e, organ.id)}
                onTouchStart={() => handleTouchStart(organ.id)}
                onTouchEnd={handleTouchEnd}
              >
                {circleEl}
              </DroppableOrgan>
            );
          }
          return (
            <g
              key={organ.id}
              onClick={(e) => handleOrganClick(e, organ.id)}
              onContextMenu={(e) => handleContextMenu(e, organ.id)}
              onTouchStart={() => handleTouchStart(organ.id)}
              onTouchEnd={handleTouchEnd}
              className="cursor-pointer"
              style={{ touchAction: "manipulation" }}
            >
              {circleEl}
            </g>
          );
        })}
      </svg>

      {/* Full-screen slide-up detail (Dialog: sheet-like on mobile) */}
      <Dialog open={!!selectedOrgan} onOpenChange={(open) => !open && setSelectedOrgan(null)}>
        <DialogContent
          showClose={false}
          className="fixed left-0 right-0 top-auto bottom-0 max-h-[90vh] w-full translate-x-0 translate-y-0 rounded-t-2xl border-t p-6 md:left-[50%] md:right-auto md:top-[50%] md:bottom-auto md:max-h-[85vh] md:w-full md:max-w-md md:translate-x-[-50%] md:translate-y-[-50%] md:rounded-xl"
        >
          {selectedOrgan && (
            <OrganDetailCard
              organId={selectedOrgan}
              onClose={() => setSelectedOrgan(null)}
              onAddToOrgan={onAddToOrgan}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function impactRingColor(score: number): string {
  if (score === 0) return "border-[var(--foreground)]/30";
  if (score <= 2) return "border-[var(--gut-green)]";
  if (score <= 4) return "border-amber-400";
  return "border-amber-500";
}

function OrganDetailCard({
  organId,
  onClose,
  onAddToOrgan,
}: {
  organId: string;
  onClose: () => void;
  onAddToOrgan?: (organId: string) => void;
}) {
  const currentPlan = useStore((s) => s.currentPlan);
  const bodyMapAnnotations = useStore((s) => s.bodyMapAnnotations);
  const organ = ORGANS.find((o) => o.id === organId);
  const blocks = useMemo(() => {
    if (!currentPlan) return [];
    const out: { label: string; id: string; phase: string }[] = [];
    for (const phase of currentPlan.phases) {
      for (const block of phase.blocks) {
        if (block.organIds?.includes(organId))
          out.push({ label: block.label, id: block.id, phase: phase.name });
      }
    }
    return out;
  }, [currentPlan, organId]);
  const annotation = bodyMapAnnotations[organId];
  const impactScore = blocks.length + (annotation?.chemicalLoad ? 1 : 0);

  if (!organ) return null;

  return (
    <>
      <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-2 text-left">
        <DialogTitle className="text-lg flex items-center gap-3">
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-4 bg-transparent ${impactRingColor(impactScore)} text-sm font-bold text-[var(--foreground)]`}
            aria-hidden
          >
            {impactScore}
          </span>
          {organ.label}
        </DialogTitle>
        <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
          <X className="h-4 w-4" />
        </Button>
      </DialogHeader>
      <div className="space-y-4 pt-2">
        {annotation?.notes && (
          <p className="text-sm text-[var(--foreground)]/80">{annotation.notes}</p>
        )}
        {annotation?.chemicalLoad != null && (
          <p className="text-xs text-amber-400">Chemical load: {annotation.chemicalLoad}</p>
        )}
        <div>
          <p className="text-xs font-medium text-[var(--foreground)]/70 mb-2">Active blocks</p>
          {blocks.length === 0 ? (
            <p className="text-sm text-[var(--foreground)]/60 rounded-lg border border-dashed border-[var(--card-border)] p-4">
              No active blocks tagged to this organ yet. Drag a block from the list on the left, or use Quick Search to add one.
            </p>
          ) : (
            <ScrollArea className="h-32 max-h-[40vh]">
              <ul className="text-sm space-y-2">
                {blocks.map((b) => (
                  <li key={b.id} className="flex items-center gap-2">
                    <span className="text-[var(--foreground)]/90">{b.label}</span>
                    <span className="text-[var(--foreground)]/50 text-xs">({b.phase})</span>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          )}
        </div>
        {onAddToOrgan && (
          <Button
            size="sm"
            className="w-full bg-[var(--gut-green)]/20 text-[var(--gut-green)] hover:bg-[var(--gut-green)]/30"
            onClick={() => onAddToOrgan(organId)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add block to {organ.label.split(/[\s/]/)[0]}
          </Button>
        )}
      </div>
    </>
  );
}

"use client";

import { useMemo, useCallback, useState } from "react";
import type { RefCallback } from "react";
import { useDroppable } from "@dnd-kit/core";
import { useStore } from "@/lib/store";
import { ORGANS, getOrganConnections, type OrganId } from "@/lib/bodyMapOrgans";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Plus, GripVertical } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const VIEW_BOX = "0 0 200 400";

function DroppableOrgan({
  organ,
  active,
  selected,
  onClick,
  onContextMenu,
  children,
}: {
  organ: { id: string; cx: number; cy: number; r: number; label: string };
  active: boolean;
  selected: boolean;
  onClick: (e: React.MouseEvent) => void;
  onContextMenu: (e: React.MouseEvent) => void;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: organ.id, data: { organId: organ.id } });
  return (
    <g
      ref={setNodeRef as RefCallback<SVGGElement | null>}
      onClick={onClick}
      onContextMenu={onContextMenu}
      style={{ cursor: "pointer" }}
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

  const handleOrganClick = useCallback(
    (e: React.MouseEvent, organId: string) => {
      e.stopPropagation();
      setSelectedOrgan(selectedOrgan === organId ? null : organId);
    },
    [selectedOrgan, setSelectedOrgan]
  );

  const handleLongPress = useCallback(
    (organId: string) => {
      onAddToOrgan?.(organId);
    },
    [onAddToOrgan]
  );

  return (
    <div className={compact ? "relative" : "relative w-full max-w-lg mx-auto"}>
      <svg
        viewBox={VIEW_BOX}
        className="w-full h-auto min-h-[320px] touch-none"
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
                className="pointer-events-none"
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
                onContextMenu={(e) => {
                  e.preventDefault();
                  handleLongPress(organ.id);
                }}
              >
                {circleEl}
              </DroppableOrgan>
            );
          }
          return (
            <g key={organ.id}>
              <circle
                cx={organ.cx}
                cy={organ.cy}
                r={organ.r}
                fill={selected ? "rgba(34,197,94,0.4)" : active ? "rgba(34,197,94,0.25)" : "rgba(255,255,255,0.08)"}
                stroke={selected ? "var(--gut-green)" : "rgba(255,255,255,0.2)"}
                strokeWidth={selected ? 2.5 : 1}
                className="cursor-pointer transition-all hover:fill-[rgba(34,197,94,0.3)]"
                onClick={(e) => handleOrganClick(e, organ.id)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  handleLongPress(organ.id);
                }}
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
            </g>
          );
        })}
      </svg>

      {/* Detail card (desktop: side panel, mobile: full-screen slide up) */}
      <AnimatePresence>
        {selectedOrgan && (
          <>
            <div
              className="fixed inset-0 z-40 bg-black/40 md:bg-transparent"
              onClick={() => setSelectedOrgan(null)}
              aria-hidden
            />
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed left-4 right-4 bottom-4 md:left-auto md:right-4 md:top-20 md:bottom-auto z-50 md:w-80 md:max-h-[70vh]"
            >
              <OrganDetailCard
                organId={selectedOrgan}
                onClose={() => setSelectedOrgan(null)}
                onAddToOrgan={onAddToOrgan}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
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
    <Card className="glass border-[var(--card-border)] shadow-xl">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          {organ.label}
          <Badge variant="secondary" className="text-xs">
            Impact {impactScore}
          </Badge>
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {annotation?.notes && (
          <p className="text-sm text-[var(--foreground)]/80">{annotation.notes}</p>
        )}
        {annotation?.chemicalLoad != null && (
          <p className="text-xs text-amber-400">Chemical load: {annotation.chemicalLoad}</p>
        )}
        <div>
          <p className="text-xs font-medium text-[var(--foreground)]/70 mb-1">Active blocks</p>
          {blocks.length === 0 ? (
            <p className="text-xs text-[var(--foreground)]/50">None tagged yet</p>
          ) : (
            <ScrollArea className="h-24">
              <ul className="text-xs space-y-1">
                {blocks.map((b) => (
                  <li key={b.id} className="flex items-center gap-1">
                    <span className="text-[var(--foreground)]/90">{b.label}</span>
                    <span className="text-[var(--foreground)]/50">({b.phase})</span>
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
      </CardContent>
    </Card>
  );
}

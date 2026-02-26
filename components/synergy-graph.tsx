"use client";

import { useMemo, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { getSynergyGraphData, type SynergyNode, type SynergyEdge } from "@/lib/synergyGraph";
import type { UserPlan } from "@/lib/types";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), { ssr: false });

/** Hardcoded biomarker impact copy for Science Mode (MVP). */
const BIOMARKER_IMPACT: Record<string, string> = {
  "Anti-inflammatory stack": "Expected hs-CRP drop: 25–40%",
  "Mitochondrial stack": "Expected energy markers improvement; consider CoQ10 / NAD+ retest.",
  "Gut repair": "Expected calprotectin / I-FABP improvement over 8–12 weeks.",
  "default": "Add tracking for tier-1 biomarkers (HbA1c, hs-CRP, Vitamin D) to see impact.",
};

function getScienceCopy(node: SynergyNode, edges: SynergyEdge[]): string {
  const hasSynergy = edges.some((e) => e.source === node.id || e.target === node.id);
  if (node.type === "peptide" && hasSynergy) return BIOMARKER_IMPACT["Mitochondrial stack"] ?? BIOMARKER_IMPACT["default"];
  if (node.type === "diet") return BIOMARKER_IMPACT["Anti-inflammatory stack"] ?? BIOMARKER_IMPACT["default"];
  if (node.label.toLowerCase().includes("gut") || node.label.toLowerCase().includes("5r")) return BIOMARKER_IMPACT["Gut repair"];
  return BIOMARKER_IMPACT["default"];
}

export function SynergyGraph({ plan }: { plan: UserPlan | null }) {
  const [hoverNode, setHoverNode] = useState<SynergyNode | null>(null);
  const [scienceMode, setScienceMode] = useState(false);

  const graphData = useMemo(() => {
    const data = getSynergyGraphData(plan);
    if (!data || data.nodes.length < 2) return null;
    return {
      nodes: data.nodes,
      links: data.edges.map((e) => ({ ...e, source: e.source, target: e.target })),
    };
  }, [plan]);

  const handleNodeHover = useCallback((node: SynergyNode | null) => {
    setHoverNode(node);
  }, []);

  if (!plan) return null;
  if (!graphData || graphData.nodes.length < 2) {
    return (
      <div className="rounded-xl border border-[var(--card-border)] bg-white/5 p-4 text-center text-sm text-[var(--foreground)]/70">
        Add at least 2 blocks (e.g. peptides with synergies) to see the synergy graph.
      </div>
    );
  }

  return (
    <motion.div
      className="flex flex-col gap-2 rounded-xl border border-[var(--card-border)] bg-white/5 p-3"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[var(--gut-green)]">Synergy Graph</h3>
        <label className="flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={scienceMode}
            onChange={(e) => setScienceMode(e.target.checked)}
            className="rounded border-[var(--card-border)]"
          />
          Science Mode
        </label>
      </div>
      <div className="relative h-[280px] w-full rounded-lg bg-[var(--background)]/80">
        <ForceGraph2D
          graphData={graphData}
          nodeId="id"
          linkSource="source"
          linkTarget="target"
          nodeLabel={(n: unknown) => {
            const node = n as SynergyNode;
            const base = `${node.label}${node.moa ? ` — ${node.moa}` : ""}`;
            if (scienceMode) return `${base}\n\n${getScienceCopy(node, graphData.links as SynergyEdge[])}`;
            return base;
          }}
          linkLabel={(l: unknown) => (l as { label?: string }).label ?? "synergy"}
          onNodeHover={(node, prev) => handleNodeHover(node as SynergyNode | null)}
          nodeColor={() => "var(--gut-green)"}
          linkColor={() => "rgba(255,255,255,0.35)"}
          backgroundColor="transparent"
        />
      </div>
      {scienceMode && (
        <p className="text-xs text-[var(--foreground)]/60">
          Science Mode: hover nodes for biomarker impact estimates (2026 refs).
        </p>
      )}
      {hoverNode && (
        <div className="absolute bottom-2 left-2 right-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-2 text-xs shadow-lg">
          <strong>{hoverNode.label}</strong>
          {hoverNode.moa && <p className="mt-1 text-[var(--foreground)]/80">{hoverNode.moa}</p>}
          {scienceMode && <p className="mt-1 text-[var(--gut-green)]">{getScienceCopy(hoverNode, graphData.links as SynergyEdge[])}</p>}
        </div>
      )}
    </motion.div>
  );
}

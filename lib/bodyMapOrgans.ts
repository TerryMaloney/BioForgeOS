/**
 * Body Map organ definitions: id, label, position (SVG viewBox 0 0 200 400), and connections for synergy web.
 */

export type OrganId =
  | "gut"
  | "brain"
  | "liver"
  | "heart"
  | "mitochondria"
  | "lungs"
  | "kidneys"
  | "skin"
  | "reproductive"
  | "bone-muscle"
  | "vagus"
  | "epigenetic"
  | "blood";

export interface OrganDef {
  id: OrganId;
  label: string;
  cx: number;
  cy: number;
  r: number;
  connections: OrganId[];
}

export const ORGANS: OrganDef[] = [
  { id: "brain", label: "Brain / CNS", cx: 100, cy: 45, r: 22, connections: ["vagus", "epigenetic"] },
  { id: "vagus", label: "Vagus Nerve", cx: 100, cy: 95, r: 12, connections: ["brain", "gut", "heart"] },
  { id: "lungs", label: "Lungs", cx: 100, cy: 130, r: 20, connections: ["heart", "blood"] },
  { id: "heart", label: "Heart", cx: 100, cy: 165, r: 18, connections: ["vagus", "lungs", "blood", "mitochondria"] },
  { id: "liver", label: "Liver", cx: 100, cy: 210, r: 20, connections: ["gut", "blood", "mitochondria"] },
  { id: "gut", label: "Gut", cx: 100, cy: 255, r: 22, connections: ["vagus", "liver", "blood"] },
  { id: "mitochondria", label: "Mitochondria", cx: 100, cy: 295, r: 14, connections: ["heart", "liver", "bone-muscle"] },
  { id: "kidneys", label: "Kidneys", cx: 70, cy: 230, r: 12, connections: ["blood"] },
  { id: "blood", label: "Blood / Plasma", cx: 100, cy: 180, r: 10, connections: ["liver", "lungs", "gut", "kidneys"] },
  { id: "skin", label: "Skin", cx: 100, cy: 330, r: 12, connections: [] },
  { id: "reproductive", label: "Reproductive", cx: 100, cy: 360, r: 12, connections: ["epigenetic"] },
  { id: "bone-muscle", label: "Bone / Muscle", cx: 100, cy: 320, r: 14, connections: ["mitochondria"] },
  { id: "epigenetic", label: "Epigenetic", cx: 100, cy: 25, r: 10, connections: ["brain", "reproductive"] },
];

export const ORGAN_IDS = ORGANS.map((o) => o.id);

/** Organ IDs that glow when they have active blocks or annotations */
export function getOrganConnections(): { from: OrganId; to: OrganId; label?: string }[] {
  const out: { from: OrganId; to: OrganId; label?: string }[] = [];
  const seen = new Set<string>();
  for (const o of ORGANS) {
    for (const toId of o.connections) {
      const key = [o.id, toId].sort().join("-");
      if (seen.has(key)) continue;
      seen.add(key);
      const label =
        o.id === "vagus" && toId === "gut" ? "Gut–Brain axis" :
        o.id === "liver" && toId === "mitochondria" ? "Bile acids" :
        o.id === "gut" && toId === "blood" ? "Gut–Blood axis" :
        undefined;
      out.push({ from: o.id, to: toId, label });
    }
  }
  return out;
}

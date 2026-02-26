import type { UserPlan, PlanBlock } from "./types";
import { seedData } from "./seedData";

export interface SynergyNode {
  id: string;
  label: string;
  type: string;
  refId?: string;
  moa?: string;
  tier?: string;
}

export interface SynergyEdge {
  source: string;
  target: string;
  label?: string;
  strength?: number;
}

export interface SynergyGraphData {
  nodes: SynergyNode[];
  edges: SynergyEdge[];
}

function getPeptide(refId: string) {
  return seedData.peptides.find((p) => p.id === refId);
}

/** Resolve a synergy string (e.g. "SS-31", "Urolithin A") to a block in the list. */
function findBlockBySynergy(blocks: PlanBlock[], synergy: string): PlanBlock | undefined {
  const s = synergy.toLowerCase().trim();
  return blocks.find((b) => {
    const labelLower = b.label.toLowerCase();
    const pep = getPeptide(b.refId);
    const nameLower = pep?.name.toLowerCase() ?? "";
    return labelLower.includes(s) || nameLower.includes(s) || b.refId === s.replace(/\s+/g, "-");
  });
}

export function getSynergyGraphData(plan: UserPlan | null): SynergyGraphData | null {
  if (!plan) return null;

  const blocks: PlanBlock[] = plan.phases.flatMap((p) => p.blocks);
  if (blocks.length < 2) return null;

  const nodes: SynergyNode[] = blocks.map((b) => {
    const pep = getPeptide(b.refId);
    return {
      id: b.id,
      label: b.label,
      type: b.type,
      refId: b.refId,
      moa: pep?.moa,
      tier: pep?.tier,
    };
  });

  const edges: SynergyEdge[] = [];
  const tierStrength: Record<string, number> = { S: 1, A: 0.7, Frontier: 0.5 };

  for (const blockA of blocks) {
    const pepA = getPeptide(blockA.refId);
    if (!pepA?.synergies?.length) continue;

    for (const synergyName of pepA.synergies) {
      const blockB = findBlockBySynergy(blocks, synergyName);
      if (!blockB || blockB.id === blockA.id) continue;

      const strength = tierStrength[pepA.tier] ?? 0.6;
      edges.push({
        source: blockA.id,
        target: blockB.id,
        label: `${pepA.name} + ${synergyName}`,
        strength,
      });
    }
  }

  if (edges.length === 0 && nodes.length < 2) return null;

  return { nodes, edges };
}

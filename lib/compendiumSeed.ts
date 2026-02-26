import type { CompendiumItem } from "./types";
import { seedData } from "./seedData";

function tierToEvidenceTier(tier: string): "S" | "A" | "Frontier" {
  if (tier === "S") return "S";
  if (tier === "A") return "A";
  if (tier === "Frontier") return "Frontier";
  return "A";
}

export function getCompendiumSeed(): CompendiumItem[] {
  const items: CompendiumItem[] = [];

  seedData.peptides.forEach((p) => {
    items.push({
      id: `compendium-peptide-${p.id}`,
      name: p.name,
      type: "peptide",
      refId: p.id,
      doseExamples: p.form ? [p.form] : undefined,
      moa: p.moa,
      evidenceTier: tierToEvidenceTier(p.tier),
      tags: p.synergies ?? [],
      versionHistory: [{ at: new Date().toISOString(), note: "2026 seed – " + (p.status ?? "") }],
      links: [],
    });
  });

  const fiveR = [
    { id: "5r-remove", name: "Remove (eliminate)", type: "5r" as const },
    { id: "5r-replace", name: "Replace (digestive support)", type: "5r" as const },
    { id: "5r-reinoculate", name: "Reinoculate (probiotics)", type: "5r" as const },
    { id: "5r-repair", name: "Repair (gut lining)", type: "5r" as const },
    { id: "5r-rebalance", name: "Rebalance (lifestyle)", type: "5r" as const },
  ];
  fiveR.forEach((r) => {
    items.push({
      id: `compendium-${r.id}`,
      name: r.name,
      type: r.type,
      tags: [],
      versionHistory: [],
      links: [],
    });
  });

  [...seedData.biomarkerHierarchy.tier1, ...seedData.biomarkerHierarchy.tier2].forEach((b) => {
    items.push({
      id: `compendium-test-${b.replace(/\s+/g, "-")}`,
      name: b,
      type: "test",
      refId: `test-${b}`,
      tags: [],
      versionHistory: [],
      links: [],
    });
  });

  const diets = [
    { id: "diet-green-med", name: "Green-Mediterranean diet" },
    { id: "diet-low-fodmap", name: "Low FODMAP" },
    { id: "diet-elimination", name: "Elimination protocol" },
  ];
  diets.forEach((d) => {
    items.push({
      id: `compendium-${d.id}`,
      name: d.name,
      type: "diet",
      refId: d.id,
      tags: [],
      versionHistory: [],
      links: [],
    });
  });

  seedData.missionModes.forEach((m) => {
    items.push({
      id: `compendium-goal-${m.id}`,
      name: m.name,
      type: "goal",
      refId: m.id,
      tags: [m.id],
      versionHistory: [],
      links: [],
    });
  });

  return items;
}

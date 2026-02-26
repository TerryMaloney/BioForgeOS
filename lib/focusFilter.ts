import type { Phase, PlanBlock, UserPlan, FocusMode } from "./types";

function filterBlock(block: PlanBlock, focusMode: FocusMode, focusModuleItemIds: Set<string>): boolean {
  switch (focusMode) {
    case "full":
      return true;
    case "peptides-only":
      return block.type === "peptide";
    case "preconception":
      return (
        block.refId?.includes("preconception") === true ||
        block.label?.toLowerCase().includes("preconception") === true ||
        block.notes?.toLowerCase().includes("preconception") === true
      );
    case "gut-repair":
      return (
        block.refId?.includes("gut-repair") === true ||
        block.label?.toLowerCase().includes("gut repair") === true ||
        block.notes?.toLowerCase().includes("gut repair") === true
      );
    case "compendium-custom":
      return focusModuleItemIds.has(block.refId) || focusModuleItemIds.has(block.id);
    default:
      return true;
  }
}

export function getFilteredPhases(
  plan: UserPlan | null,
  focusMode: FocusMode,
  focusModuleId: string | null,
  getModuleItemIds: (moduleId: string) => string[]
): Phase[] {
  if (!plan) return [];
  if (focusMode === "full") return plan.phases;

  const moduleItemIds =
    focusMode === "compendium-custom" && focusModuleId
      ? new Set(getModuleItemIds(focusModuleId))
      : new Set<string>();

  return plan.phases.map((phase) => ({
    ...phase,
    blocks: phase.blocks.filter((b) => filterBlock(b, focusMode, moduleItemIds)),
  }));
}

export function getFilteredPlan(
  plan: UserPlan | null,
  focusMode: FocusMode,
  focusModuleId: string | null,
  getModuleItemIds: (moduleId: string) => string[]
): UserPlan | null {
  if (!plan) return null;
  const phases = getFilteredPhases(plan, focusMode, focusModuleId, getModuleItemIds);
  return { ...plan, phases };
}

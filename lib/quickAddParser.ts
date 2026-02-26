import { seedData } from "./seedData";
import type { PlanBlockType } from "./types";

export interface ParsedQuickAdd {
  name: string;
  type: PlanBlockType;
  doseExamples?: string[];
  personalNotes?: string;
  refId?: string;
}

const PEPTIDE_NAMES = seedData.peptides.flatMap((p) => [
  p.name.toLowerCase(),
  p.name.split(/[\s(/]/)[0].toLowerCase(),
  p.id,
]);

export function parseQuickAddInput(raw: string): ParsedQuickAdd | null {
  const text = raw.trim();
  if (!text) return null;

  const lower = text.toLowerCase();
  const isAdd = lower.startsWith("add ") || lower.startsWith("start ");

  let name = "";
  let type: PlanBlockType = "peptide";
  const doseParts: string[] = [];
  let note = "";

  let rest = text.replace(/^(add|start)\s+/i, "").trim();

  const withMatch = rest.match(/\s+with\s+(.+)$/i);
  if (withMatch) {
    note = withMatch[1].trim();
    rest = rest.replace(/\s+with\s+.+$/i, "").trim();
  }

  const forMatch = rest.match(/\s+for\s+(\d+\s*weeks?|\d+\s*months?|\d+\s*days?)/i);
  if (forMatch) {
    doseParts.push(forMatch[1].trim());
    rest = rest.replace(/\s+for\s+\d+\s*(weeks?|months?|days?)/i, "").trim();
  }

  const doseMgMatch = rest.match(/(\d+\s*mg\s*(?:daily|per day|\/day)?)/i);
  if (doseMgMatch) {
    doseParts.push(doseMgMatch[1].trim());
    rest = rest.replace(/(\d+\s*mg\s*(?:daily|per day|\/day)?)/i, "").trim();
  }

  const andParts = rest.split(/\s+and\s+|\s*\+\s*|\s+stack\s+/i).map((s) => s.trim()).filter(Boolean);
  let refId: string | undefined;
  if (andParts.length >= 1) {
    name = andParts[0];
    const matchedPeptide = seedData.peptides.find(
      (p) =>
        p.name.toLowerCase().includes(name.toLowerCase()) ||
        name.toLowerCase().includes(p.name.split(/[\s(/]/)[0].toLowerCase()) ||
        p.id === name.toLowerCase().replace(/\s+/g, "-")
    );
    if (matchedPeptide) {
      name = matchedPeptide.name;
      type = "peptide";
      refId = matchedPeptide.id;
    }
  }
  if (!name && rest) {
    name = rest;
    const matchedPeptide = seedData.peptides.find(
      (p) =>
        p.name.toLowerCase().includes(name.toLowerCase()) ||
        name.toLowerCase().includes(p.name.split(/[\s(/]/)[0].toLowerCase())
    );
    if (matchedPeptide) {
      name = matchedPeptide.name;
      type = "peptide";
      refId = matchedPeptide.id;
    } else {
      type = "peptide";
    }
  }

  if (!name) return null;

  return {
    name,
    type,
    refId,
    doseExamples: doseParts.length > 0 ? doseParts : undefined,
    personalNotes: note || undefined,
  };
}

/** Parse input like "Start 8-week Urolithin A + SS-31 stack for energy" into multiple items. */
export function parseQuickAddInputMultiple(raw: string): ParsedQuickAdd[] {
  const text = raw.trim().replace(/^(add|start)\s+/i, "").trim();
  if (!text) return [];

  let note = "";
  let doseParts: string[] = [];
  let rest = text;
  const withMatch = rest.match(/\s+with\s+(.+)$/i);
  if (withMatch) {
    note = withMatch[1].trim();
    rest = rest.replace(/\s+with\s+.+$/i, "").trim();
  }
  const forMatch = rest.match(/\s+for\s+(\d+\s*weeks?|\d+\s*months?|\d+\s*days?)/i);
  if (forMatch) {
    doseParts = [forMatch[1].trim()];
    rest = rest.replace(/\s+for\s+\d+\s*(weeks?|months?|days?)/i, "").trim();
  }
  const parts = rest.split(/\s+and\s+|\s*\+\s*|\s+stack\s+/i).map((s) => s.trim()).filter(Boolean);
  const results: ParsedQuickAdd[] = [];
  for (const part of parts) {
    const matched = seedData.peptides.find(
      (p) =>
        p.name.toLowerCase().includes(part.toLowerCase()) ||
        part.toLowerCase().includes(p.name.split(/[\s(/]/)[0].toLowerCase()) ||
        p.id === part.toLowerCase().replace(/\s+/g, "-")
    );
    results.push({
      name: matched ? matched.name : part,
      type: "peptide",
      refId: matched?.id,
      doseExamples: doseParts.length > 0 ? doseParts : undefined,
      personalNotes: note || undefined,
    });
  }
  return results.filter((r) => r.name.length > 0);
}

import { seedData } from "./seedData";
import type { PlanBlockType } from "./types";

export interface ParsedImportItem {
  name: string;
  type: PlanBlockType;
  doseExamples?: string[];
  moa?: string;
  personalNotes?: string;
  refId?: string;
  tags?: string[];
}

const PEPTIDES = seedData.peptides;
const BIOMARKERS = [
  ...seedData.biomarkerHierarchy.tier1,
  ...seedData.biomarkerHierarchy.tier2,
];
const FIVE_R = ["Remove", "Replace", "Reinoculate", "Repair", "Rebalance", "eliminate", "digestive support", "probiotics", "gut lining", "lifestyle"];
const DIET_TERMS = ["diet", "Green-Med", "Mediterranean", "FODMAP", "elimination", "protocol"];
const CONTEXT_TAGS = ["gut repair", "energy", "preconception", "mitochondria", "case study", "RCT", "2025", "2026", "Nature"];

function findPeptide(name: string): { name: string; id: string; moa?: string } | undefined {
  const lower = name.toLowerCase();
  return PEPTIDES.find(
    (p) =>
      p.name.toLowerCase().includes(lower) ||
      lower.includes(p.name.split(/[\s(/]/)[0].toLowerCase()) ||
      p.id === lower.replace(/\s+/g, "-")
  );
}

function extractDoses(text: string): string[] {
  const doses: string[] = [];
  const mgMatch = text.match(/(\d+\s*mg\s*(?:daily|per day|\/day|BID|QD)?)/gi);
  if (mgMatch) doses.push(...mgMatch.map((s) => s.trim()));
  const gMatch = text.match(/(\d+(?:\.\d+)?\s*g\s*(?:daily|per day)?)/gi);
  if (gMatch) doses.push(...gMatch.map((s) => s.trim()));
  const weekMatch = text.match(/(\d+\s*weeks?|\d+\s*months?)/gi);
  if (weekMatch) doses.push(...weekMatch.map((s) => s.trim()));
  return [...new Set(doses)];
}

function extractContextTags(text: string): string[] {
  const lower = text.toLowerCase();
  return CONTEXT_TAGS.filter((t) => lower.includes(t.toLowerCase()));
}

/**
 * Parse raw text (from paste, PDF, or file) into structured items for Compendium.
 * Detects peptides, biomarkers, doses, durations, and context.
 */
export function parseKnowledgeImportText(raw: string): ParsedImportItem[] {
  const text = raw.trim();
  if (!text) return [];

  const results: ParsedImportItem[] = [];
  const seen = new Set<string>();

  // 1) Find peptide mentions and create one item per unique peptide
  for (const pep of PEPTIDES) {
    const re = new RegExp(pep.name.replace(/[()]/g, "\\$&").split(/\s+/).join("\\s*"), "i");
    if (re.test(text)) {
      const key = pep.id;
      if (seen.has(key)) continue;
      seen.add(key);
      const snippet = text.slice(Math.max(0, text.search(re) - 20), text.search(re) + 80);
      const doses = extractDoses(snippet);
      const tags = extractContextTags(snippet);
      results.push({
        name: pep.name,
        type: "peptide",
        refId: pep.id,
        moa: pep.moa,
        doseExamples: doses.length > 0 ? doses : undefined,
        personalNotes: snippet.length > 60 ? snippet.slice(0, 120).trim() + "…" : undefined,
        tags: tags.length > 0 ? tags : ["Imported from text"],
      });
    }
  }

  // 2) Find biomarker mentions (as tests)
  for (const bm of BIOMARKERS) {
    if (text.toLowerCase().includes(bm.toLowerCase()) && !seen.has(`test-${bm}`)) {
      seen.add(`test-${bm}`);
      results.push({
        name: bm,
        type: "test",
        refId: `test-${bm}`,
        tags: ["Imported from text"],
      });
    }
  }

  // 3) If nothing matched, create a single "custom" item from the first line or first 200 chars
  if (results.length === 0) {
    const firstLine = text.split(/\n/)[0]?.trim().slice(0, 120) || text.slice(0, 120);
    const doses = extractDoses(text);
    results.push({
      name: firstLine || "Imported note",
      type: "peptide",
      doseExamples: doses.length > 0 ? doses : undefined,
      personalNotes: text.length > 120 ? text.slice(0, 300).trim() + "…" : text,
      tags: ["Imported from text"],
    });
  }

  return results;
}

/**
 * Parse JSON that may be an array of { name, type?, dose?, moa?, ... } or a single object.
 */
export function parseKnowledgeImportJson(raw: string): ParsedImportItem[] {
  try {
    const data = JSON.parse(raw);
    const arr = Array.isArray(data) ? data : [data];
    const results: ParsedImportItem[] = [];
    const types: PlanBlockType[] = ["goal", "test", "5r", "peptide", "diet", "monitoring"];
    for (const item of arr) {
      const name = item.name ?? item.label ?? item.title ?? "Unnamed";
      const type = types.includes(item.type) ? item.type : "peptide";
      const doseExamples: string[] = [];
      if (item.dose) doseExamples.push(String(item.dose));
      if (item.doseExamples && Array.isArray(item.doseExamples)) doseExamples.push(...item.doseExamples);
      if (item.duration) doseExamples.push(String(item.duration));
      const pep = type === "peptide" ? findPeptide(name) : undefined;
      results.push({
        name: pep?.name ?? name,
        type,
        refId: pep?.id ?? item.refId ?? item.id,
        moa: item.moa ?? item.description ?? pep?.moa,
        doseExamples: doseExamples.length > 0 ? doseExamples : undefined,
        personalNotes: item.notes ?? item.personalNotes ?? item.note,
        tags: item.tags ? (Array.isArray(item.tags) ? item.tags : [String(item.tags)]) : ["Imported from JSON"],
      });
    }
    return results;
  } catch {
    return [];
  }
}

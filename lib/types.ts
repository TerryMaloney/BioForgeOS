export interface MissionMode {
  id: string;
  name: string;
  icon: string;
}

export interface BiomarkerHierarchy {
  tier1: string[];
  tier2: string[];
  tier3: string[];
}

export interface Peptide {
  id: string;
  name: string;
  tier: string;
  moa: string;
  form?: string;
  status?: string;
  synergies?: string[];
  warning?: string;
}

export interface SeedData {
  version: string;
  missionModes: MissionMode[];
  biomarkerHierarchy: BiomarkerHierarchy;
  peptides: Peptide[];
  coreFrameworks: string[];
  starterProtocol: string;
}

export type PlanBlockType = "goal" | "test" | "5r" | "peptide" | "diet" | "monitoring";

export type EvidenceTier = "S" | "A" | "Frontier";

export interface CompendiumItem {
  id: string;
  name: string;
  type: PlanBlockType;
  doseExamples?: string[];
  moa?: string;
  evidenceTier?: EvidenceTier;
  personalNotes?: string;
  tags: string[];
  versionHistory: { at: string; note: string }[];
  links: { label: string; url: string }[];
  refId?: string; // link to seed peptide/test
}

export interface SavedModule {
  id: string;
  name: string;
  itemIds: string[]; // compendium item IDs
}

export type FocusMode =
  | "full"
  | "peptides-only"
  | "preconception"
  | "gut-repair"
  | "compendium-custom";

export interface PlanBlock {
  id: string;
  type: PlanBlockType;
  refId: string; // id in seed (e.g. peptide id, or custom)
  label: string;
  phaseIndex: number;
  weekIndex: number;
  notes?: string;
}

export interface Phase {
  id: string;
  name: string;
  weekStart: number;
  weekEnd: number;
  blocks: PlanBlock[];
}

export interface UserPlan {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  phases: Phase[];
}

export interface DoseLogEntry {
  date: string; // YYYY-MM-DD
  planBlockId: string;
  refId: string;
  label: string;
  taken: boolean;
}

export interface BiomarkerLog {
  id: string;
  date: string;
  biomarkerId: string;
  biomarkerName: string;
  value: number;
  unit?: string;
}

export interface SymptomEntry {
  id: string;
  date: string;
  text: string;
}

export interface RetestAlert {
  id: string;
  biomarkerId: string;
  biomarkerName: string;
  dueDate: string;
  dismissed: boolean;
}

export interface SettingsState {
  supabaseSync: boolean;
  pwaInstalled: boolean;
}

export interface UIState {
  quickAddOpen: boolean;
  commandPaletteOpen?: boolean;
  recentCommandSearches?: string[];
}

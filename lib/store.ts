import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  UserPlan,
  PlanBlock,
  Phase,
  DoseLogEntry,
  BiomarkerLog,
  SymptomEntry,
  RetestAlert,
  SettingsState,
  CompendiumItem,
  SavedModule,
  FocusMode,
  UIState,
} from "./types";

function defaultPhases(): Phase[] {
  return [
    { id: "p1", name: "Phase 1", weekStart: 1, weekEnd: 4, blocks: [] },
    { id: "p2", name: "Phase 2", weekStart: 5, weekEnd: 8, blocks: [] },
    { id: "p3", name: "Phase 3", weekStart: 9, weekEnd: 12, blocks: [] },
  ];
}

interface AppState {
  currentPlan: UserPlan | null;
  savedPlans: UserPlan[];
  doseLogs: DoseLogEntry[];
  biomarkerLogs: BiomarkerLog[];
  symptomEntries: SymptomEntry[];
  retestAlerts: RetestAlert[];
  settings: SettingsState;
  compendiumItems: CompendiumItem[];
  savedModules: SavedModule[];
  focusMode: FocusMode;
  focusModuleId: string | null;
  ui: UIState;

  setCurrentPlan: (plan: UserPlan | null) => void;
  updateCurrentPlanPhases: (phases: Phase[]) => void;
  addBlockToPhase: (phaseIndex: number, weekIndex: number, block: Omit<PlanBlock, "phaseIndex" | "weekIndex">) => void;
  removeBlock: (phaseIndex: number, blockId: string) => void;
  moveBlock: (fromPhase: number, fromBlockId: string, toPhase: number, toWeekIndex: number) => void;

  saveCurrentPlan: (name: string) => void;
  loadPlan: (id: string) => void;
  deletePlan: (id: string) => void;
  duplicatePlan: (id: string) => void;

  addCompendiumItem: (item: Omit<CompendiumItem, "id"> | CompendiumItem) => void;
  updateCompendiumItem: (id: string, patch: Partial<CompendiumItem>) => void;
  removeCompendiumItem: (id: string) => void;
  setCompendiumItems: (items: CompendiumItem[]) => void;

  addSavedModule: (module: Omit<SavedModule, "id">) => void;
  removeSavedModule: (id: string) => void;

  addCompendiumItemToPlan: (phaseIndex: number, item: CompendiumItem) => void;
  addCompendiumItemsToPlan: (phaseIndex: number, itemIds: string[]) => void;

  setFocusMode: (mode: FocusMode, moduleId?: string | null) => void;

  setUI: (patch: Partial<UIState>) => void;
  addRecentCommandSearch: (query: string) => void;

  createPlanFromBlocks: (blocks: PlanBlock[], planName?: string) => void;
  appendBlocksToPlan: (planId: string, blocks: Omit<PlanBlock, "phaseIndex" | "weekIndex">[], phaseIndex: number) => void;

  logDose: (entry: DoseLogEntry) => void;
  getDosesForDate: (date: string) => DoseLogEntry[];

  addBiomarkerLog: (log: Omit<BiomarkerLog, "id">) => void;
  setBiomarkerLogs: (logs: BiomarkerLog[]) => void;

  addSymptom: (entry: Omit<SymptomEntry, "id">) => void;
  deleteSymptom: (id: string) => void;

  addRetestAlert: (alert: Omit<RetestAlert, "id">) => void;
  dismissRetestAlert: (id: string) => void;
  setRetestAlerts: (alerts: RetestAlert[]) => void;

  setSettings: (s: Partial<SettingsState>) => void;
}

const now = () => new Date().toISOString();

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentPlan: {
        id: "default",
        name: "My Protocol",
        createdAt: now(),
        updatedAt: now(),
        phases: defaultPhases(),
      },
      savedPlans: [],
      doseLogs: [],
      biomarkerLogs: [],
      symptomEntries: [],
      retestAlerts: [],
      settings: { supabaseSync: false, pwaInstalled: false },
      compendiumItems: [],
      savedModules: [],
      focusMode: "full",
      focusModuleId: null,
      ui: { quickAddOpen: false, commandPaletteOpen: false, recentCommandSearches: [] },

      setCurrentPlan: (plan) => set({ currentPlan: plan }),

      updateCurrentPlanPhases: (phases) =>
        set((s) =>
          s.currentPlan
            ? { currentPlan: { ...s.currentPlan, phases, updatedAt: now() } }
            : {}
        ),

      addBlockToPhase: (phaseIndex, weekIndex, block) => {
        const fullBlock: PlanBlock = {
          ...block,
          phaseIndex,
          weekIndex,
        };
        set((s) => {
          if (!s.currentPlan) return {};
          const phases = [...s.currentPlan.phases];
          const phase = phases[phaseIndex];
          if (!phase) return {};
          const blocks = [...phase.blocks, fullBlock];
          phases[phaseIndex] = { ...phase, blocks };
          return {
            currentPlan: { ...s.currentPlan, phases, updatedAt: now() },
          };
        });
      },

      removeBlock: (phaseIndex, blockId) =>
        set((s) => {
          if (!s.currentPlan) return {};
          const phases = s.currentPlan.phases.map((p, i) =>
            i === phaseIndex
              ? { ...p, blocks: p.blocks.filter((b) => b.id !== blockId) }
              : p
          );
          return {
            currentPlan: { ...s.currentPlan, phases, updatedAt: now() },
          };
        }),

      moveBlock: (fromPhase, fromBlockId, toPhase, toWeekIndex) => {
        const state = get();
        const plan = state.currentPlan;
        if (!plan) return;
        const fromP = plan.phases[fromPhase];
        const block = fromP?.blocks.find((b) => b.id === fromBlockId);
        if (!block) return;
        state.removeBlock(fromPhase, fromBlockId);
        state.addBlockToPhase(toPhase, toWeekIndex, {
          id: block.id,
          type: block.type,
          refId: block.refId,
          label: block.label,
          notes: block.notes,
        });
      },

      saveCurrentPlan: (name) =>
        set((s) => {
          if (!s.currentPlan) return {};
          const plan: UserPlan = {
            ...s.currentPlan,
            id: s.currentPlan.id === "default" ? crypto.randomUUID() : s.currentPlan.id,
            name,
            createdAt: now(),
            updatedAt: now(),
          };
          const saved = s.savedPlans.some((p) => p.id === plan.id)
            ? s.savedPlans.map((p) => (p.id === plan.id ? plan : p))
            : [...s.savedPlans, plan];
          return {
            savedPlans: saved,
            currentPlan: plan,
          };
        }),

      loadPlan: (id) => {
        const plan = get().savedPlans.find((p) => p.id === id);
        if (plan) set({ currentPlan: plan });
      },

      deletePlan: (id) =>
        set((s) => ({
          savedPlans: s.savedPlans.filter((p) => p.id !== id),
          currentPlan: s.currentPlan?.id === id ? null : s.currentPlan,
        })),

      duplicatePlan: (id) => {
        const plan = get().savedPlans.find((p) => p.id === id);
        if (!plan) return;
        const copy: UserPlan = {
          ...plan,
          id: crypto.randomUUID(),
          name: plan.name + " (copy)",
          createdAt: now(),
          updatedAt: now(),
        };
        set((s) => ({ savedPlans: [...s.savedPlans, copy], currentPlan: copy }));
      },

      logDose: (entry) =>
        set((s) => {
          const existing = s.doseLogs.filter(
            (e) =>
              e.date === entry.date &&
              e.planBlockId === entry.planBlockId
          );
          const rest = s.doseLogs.filter(
            (e) =>
              !(e.date === entry.date && e.planBlockId === entry.planBlockId)
          );
          if (existing.length) {
            return { doseLogs: [...rest, { ...entry }] };
          }
          return { doseLogs: [...s.doseLogs, entry] };
        }),

      getDosesForDate: (date) => get().doseLogs.filter((e) => e.date === date),

      addBiomarkerLog: (log) =>
        set((s) => ({
          biomarkerLogs: [
            ...s.biomarkerLogs,
            { ...log, id: crypto.randomUUID() },
          ],
        })),

      setBiomarkerLogs: (logs) => set({ biomarkerLogs: logs }),

      addSymptom: (entry) =>
        set((s) => ({
          symptomEntries: [
            ...s.symptomEntries,
            { ...entry, id: crypto.randomUUID() },
          ],
        })),

      deleteSymptom: (id) =>
        set((s) => ({
          symptomEntries: s.symptomEntries.filter((e) => e.id !== id),
        })),

      addRetestAlert: (alert) =>
        set((s) => ({
          retestAlerts: [
            ...s.retestAlerts,
            { ...alert, id: crypto.randomUUID(), dismissed: false },
          ],
        })),

      dismissRetestAlert: (id) =>
        set((s) => ({
          retestAlerts: s.retestAlerts.map((a) =>
            a.id === id ? { ...a, dismissed: true } : a
          ),
        })),

      setRetestAlerts: (alerts) => set({ retestAlerts: alerts }),

      setSettings: (s) => set((state) => ({ settings: { ...state.settings, ...s } })),

      addCompendiumItem: (item) =>
        set((s) => {
          const id = "id" in item && item.id ? item.id : crypto.randomUUID();
          const full: CompendiumItem = {
            ...item,
            id,
            tags: item.tags ?? [],
            versionHistory: item.versionHistory ?? [],
            links: item.links ?? [],
          };
          return { compendiumItems: [...s.compendiumItems, full] };
        }),

      updateCompendiumItem: (id, patch) =>
        set((s) => ({
          compendiumItems: s.compendiumItems.map((i) => (i.id === id ? { ...i, ...patch } : i)),
        })),

      removeCompendiumItem: (id) =>
        set((s) => ({
          compendiumItems: s.compendiumItems.filter((i) => i.id !== id),
          savedModules: s.savedModules.map((m) => ({ ...m, itemIds: m.itemIds.filter((iid) => iid !== id) })),
        })),

      setCompendiumItems: (items) => set({ compendiumItems: items }),

      addSavedModule: (module) =>
        set((s) => ({
          savedModules: [...s.savedModules, { ...module, id: crypto.randomUUID() }],
        })),

      removeSavedModule: (id) =>
        set((s) => ({
          savedModules: s.savedModules.filter((m) => m.id !== id),
        })),

      addCompendiumItemToPlan: (phaseIndex, item) => {
        get().addBlockToPhase(phaseIndex, 0, {
          id: `block-${item.id}-${Date.now()}`,
          type: item.type,
          refId: item.refId ?? item.id,
          label: item.name,
          notes: item.personalNotes,
        });
      },

      addCompendiumItemsToPlan: (phaseIndex, itemIds) => {
        const items = get().compendiumItems.filter((i) => itemIds.includes(i.id));
        items.forEach((item) => get().addCompendiumItemToPlan(phaseIndex, item));
      },

      setFocusMode: (mode, moduleId) =>
        set({ focusMode: mode, focusModuleId: moduleId ?? null }),

      setUI: (patch) => set((s) => ({ ui: { ...s.ui, ...patch } })),

      addRecentCommandSearch: (query) =>
        set((s) => {
          const q = query.trim();
          if (!q) return {};
          const recent = s.ui.recentCommandSearches ?? [];
          const filtered = [q, ...recent.filter((r) => r !== q)].slice(0, 15);
          return { ui: { ...s.ui, recentCommandSearches: filtered } };
        }),

      createPlanFromBlocks: (blocks, planName) => {
        const plan: UserPlan = {
          id: crypto.randomUUID(),
          name: planName ?? "From subset",
          createdAt: now(),
          updatedAt: now(),
          phases: defaultPhases().map((p, i) => ({
            ...p,
            blocks: i === 0 ? blocks.map((b) => ({ ...b, phaseIndex: 0, weekIndex: 0 })) : [],
          })),
        };
        set((s) => ({ savedPlans: [...s.savedPlans, plan], currentPlan: plan }));
      },

      appendBlocksToPlan: (planId, blocks, phaseIndex) => {
        const plan = get().savedPlans.find((p) => p.id === planId);
        if (!plan) return;
        const phases = [...plan.phases];
        const phase = phases[phaseIndex];
        if (!phase) return;
        const fullBlocks: PlanBlock[] = blocks.map((b) => ({ ...b, phaseIndex, weekIndex: 0 }));
        phases[phaseIndex] = { ...phase, blocks: [...phase.blocks, ...fullBlocks] };
        const updated: UserPlan = { ...plan, phases, updatedAt: now() };
        set((s) => ({
          savedPlans: s.savedPlans.map((p) => (p.id === planId ? updated : p)),
          currentPlan: s.currentPlan?.id === planId ? updated : s.currentPlan,
        }));
      },
    }),
    {
      name: "bioforgeos-storage",
      partialize: (s) => ({
        currentPlan: s.currentPlan,
        savedPlans: s.savedPlans,
        doseLogs: s.doseLogs,
        biomarkerLogs: s.biomarkerLogs,
        symptomEntries: s.symptomEntries,
        retestAlerts: s.retestAlerts,
        settings: s.settings,
        compendiumItems: s.compendiumItems,
        savedModules: s.savedModules,
        focusMode: s.focusMode,
        focusModuleId: s.focusModuleId,
        ui: { recentCommandSearches: s.ui.recentCommandSearches ?? [] },
      }),
    }
  )
);

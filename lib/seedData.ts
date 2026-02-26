import type { SeedData } from "./types";

export const seedData: SeedData = {
  "version": "2026-02-25",
  "missionModes": [
    { "id": "gut-repair", "name": "Gut Repair Extreme", "icon": "🦠" },
    { "id": "energy", "name": "Energy & Mitochondria Overhaul", "icon": "⚡" },
    { "id": "brain", "name": "Brain-Gut Mood Upgrade", "icon": "🧠" },
    { "id": "performance", "name": "Performance & Muscle", "icon": "💪" },
    { "id": "preconception", "name": "Preconception Legacy Builder", "icon": "👨‍👩‍👧" },
    { "id": "longevity", "name": "Full Longevity God-Mode", "icon": "🌌" }
  ],
  "biomarkerHierarchy": {
    "tier1": ["HbA1c", "hs-CRP", "Vitamin D", "Omega-3 Index", "Homocysteine"],
    "tier2": ["Stool SCFAs", "Calprotectin", "I-FABP"],
    "tier3": ["Full multi-omics", "Telomere length"]
  },
  "peptides": [
    { "id": "urolithin-a", "name": "Urolithin A (Mitopure)", "tier": "S", "moa": "Gut-made mitophagy activator. 2025 Nature Aging RCT: improved immune cells, muscle endurance, energy.", "form": "Pill 500-1000mg", "status": "Legal supplement", "synergies": ["pomegranate diet", "SS-31"] },
    { "id": "ss31", "name": "SS-31 / Elamipretide (Forzinity)", "tier": "S", "moa": "Cardiolipin stabilizer - FDA accelerated approval Sept 2025. Massive mitochondrial energy boost.", "form": "Injection (clinic)", "status": "Real drug - off-label for optimization", "synergies": ["MOTS-c", "Urolithin A"] },
    { "id": "ghk-cu", "name": "GHK-Cu", "tier": "S", "moa": "Gut lining healer + collagen", "form": "Oral or topical", "status": "Safe clinic favorite" },
    { "id": "kpv", "name": "KPV", "tier": "S", "moa": "Ultra-fast gut inflammation calmer", "form": "Oral capsule" },
    { "id": "mots-c", "name": "MOTS-c", "tier": "A", "moa": "Metabolism & fat-burning mitochondrial peptide", "form": "Injection" },
    { "id": "bpc157", "name": "BPC-157", "tier": "A", "moa": "Legendary gut/tissue repair (gray area)", "form": "Oral or injection", "warning": "FDA compounding ban - research sources only" },
    { "id": "epitalon", "name": "Epitalon", "tier": "A", "moa": "Telomere support (Russian human data)" },
    { "id": "selank", "name": "Selank", "tier": "A", "moa": "Gut-brain calm, anti-anxiety (nasal)" },
    { "id": "fisetin-dq", "name": "Fisetin + Quercetin senolytic pulse", "tier": "Frontier", "moa": "Clears senescent cells" }
  ],
  "coreFrameworks": ["5R Gut Kernel", "Mitochondrial Power Layer", "Peptide Application Layer", "AI Adaptive Engine"],
  "starterProtocol": "12-week Green-Med diet + Urolithin A + basics + N-of-1 tracking"
};

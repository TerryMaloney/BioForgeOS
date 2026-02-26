# BioForgeOS

**Gut Command Center for Brandon** — Build, customize, and track personalized gut-microbiome-orchestrated health protocols with 2026 peptides and biomarkers. Works offline-first, PWA installable.

---

## Create repo and push (run these 3 commands)

```bash
gh auth login
gh repo create BioForgeOS --public --source=. --push -d "BioForgeOS - Gut Command Center for Brandon"
```

Then go to [vercel.com](https://vercel.com) → **Import Git Repository** → select **TerryMaloney/BioForgeOS** → Deploy (free).

---

## Add to Home Screen (for Brandon)

- **iOS:** Open the app in Safari → tap **Share** → **Add to Home Screen**. Name it "BioForgeOS".
- **Android:** Open in Chrome → tap menu (⋮) → **Add to Home screen** or **Install app**.

---

## Turn on Supabase sync (optional, ~2 minutes)

1. Create a project at [supabase.com](https://supabase.com).
2. In Supabase: **Settings** → **API** — copy **Project URL** and **anon public** key.
3. In this repo, create `.env.local` and add:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
4. In the app, go to **Settings** and toggle **Supabase sync** ON. Data will sync to Supabase (tables can be created from the app or via Supabase SQL editor).

---

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Default route redirects to `/dashboard`.

---

## Tech stack

- Next.js 15 App Router, TypeScript, Tailwind CSS, shadcn-style UI
- dnd-kit (drag-and-drop), Recharts (biomarker timelines), react-pdf (PDF export)
- Zustand + localStorage; optional Supabase sync
- PWA manifest; dark theme (gut green, energy blue, orange accents)

---

## NEXT INSTRUCTIONS FOR TERRY (Phase 2 – Make it Legendary)

Phase 2 is implemented: compendium, focus modes, command palette (Ctrl+K), synergy graph with Science Mode, and UI polish (glassmorphism, particles bg, mobile bottom nav, keyboard hints). Use the app and then prioritize the next steps below.

### Prioritized next 4 features

1. **Onboarding wizard with lab input and auto-suggest protocols from baseline labs** — New users enter baseline labs (e.g. hs-CRP, HbA1c, Vitamin D); app suggests starter protocols (e.g. "if hs-CRP > 3, consider anti-inflammatory stack") and pre-fills the builder.
2. **Rules engine for auto-adds** — E.g. "If hs-CRP > 3, suggest anti-inflammatory stack"; "If Vitamin D < 30, add D3 + K2"; configurable rules that push blocks or modules into the current plan.
3. **N-of-1 experiment builder** — Hypothesis, duration, metrics, and simple analysis (e.g. before/after biomarker deltas, symptom notes) tied to the tracker.
4. **Doctor PDF v2 with Gantt-style timeline** — Export PDF that includes a Gantt-style visual timeline of phases and blocks (weeks on one axis, interventions on the other) for sharing with clinicians.

### Copy-paste prompt for implementing #1 (onboarding wizard)

Use this prompt with your AI or dev:

```
Implement an onboarding wizard for BioForgeOS that:
1. Shows on first visit (or when a "Start onboarding" is clicked from Dashboard) a short flow: Welcome → Mission mode choice (from seedData.missionModes) → Baseline labs input (tier1 biomarkers: HbA1c, hs-CRP, Vitamin D, Omega-3 Index, Homocysteine) with optional numeric values and units.
2. Persists the chosen mission mode and baseline labs in the store (add onboardingComplete: boolean, baselineLabs: { biomarkerId: string; value: number; unit?: string }[] to store and persist).
3. After onboarding, auto-suggest a starter protocol: e.g. if hs-CRP > 3, add "anti-inflammatory" related blocks (from compendium or seed) to phase 0; if Vitamin D < 30, suggest D3+K2 or similar. Show a single "Suggested for you" card on the Dashboard with "Add to plan" that adds these blocks to the current plan.
4. Skip onboarding if onboardingComplete is true or if user dismisses (with a "Skip for now" that sets onboardingComplete true with empty baseline labs).
Use the existing store, types, and UI (e.g. Card, Button, Input); keep it simple and mobile-friendly.
```

### Vercel redeploy steps

1. Run `npm run build` locally and fix any TypeScript or lint errors.
2. Push to `main` (e.g. `git add -A && git commit -m "Phase 2 Legendary" && git push origin main`).
3. In Vercel: either let the push trigger an automatic deploy, or open the project → **Deployments** → **Redeploy** on the latest deployment.

### Local test commands

```bash
npm run dev
```

Then test:

- **Compendium:** Open `/compendium`, search, add/edit items, "Add to Plan", "Save as Module", Quick add (Ctrl+Shift+A).
- **Builder:** Open `/builder`, use focus bar: Full Protocol, Peptides Only, Preconception Timeline, Gut Repair Module, My Custom Compendium; drag blocks; check "Export Subset PDF" and "Add to Another Plan" on `/export` when a focus mode is active.
- **Command palette:** Press **Ctrl+K** (or Cmd+K on Mac); search compendium, run actions (Isolate peptides, Full protocol, Preconception, Gut Repair, N-of-1 tracker, Export compendium); try smart parsing (e.g. "Start Urolithin A + SS-31 for 8 weeks").
- **Synergy graph:** On builder, add at least two peptides with synergies (e.g. Urolithin A, SS-31); check the Synergy Graph section and toggle "Science Mode" for biomarker copy.
- **Mobile:** Resize to mobile width; check bottom nav (Dashboard, Builder, Compendium, Tracker, Export) and sidebar drawer.

---

## NEXT INSTRUCTIONS FOR TERRY (Phase 3 – Intelligence & Mobile Mastery)

Phase 3 is implemented: mobile-first command palette access (Quick Search button in bottom nav, fixed top-right on desktop, FAB on builder), enhanced palette with grouped results (Peptides, Tests, 5R, Diets, etc.), icons, tier badges, MOA snippets, recent search history, and smarter parsing. All existing features (synergy graph, focus modes, glassmorphism, particles) are unchanged.

### Prioritized next 3 features

1. **Onboarding wizard with lab input and auto-suggest protocols from baseline labs** — New users enter baseline labs; app suggests starter protocols and pre-fills the builder.
2. **Rules engine for auto-adds** — Configurable rules that push blocks or modules into the current plan (e.g. if hs-CRP > 3, suggest anti-inflammatory stack).
3. **N-of-1 experiment builder** — Hypothesis, duration, metrics, and simple analysis tied to the tracker.

### Copy-paste prompt for implementing #1 (onboarding wizard)

Use this prompt with your AI or dev:

```
Implement an onboarding wizard for BioForgeOS that:
1. Shows on first visit (or when a "Start onboarding" is clicked from Dashboard) a short flow: Welcome → Mission mode choice (from seedData.missionModes) → Baseline labs input (tier1 biomarkers: HbA1c, hs-CRP, Vitamin D, Omega-3 Index, Homocysteine) with optional numeric values and units.
2. Persists the chosen mission mode and baseline labs in the store (add onboardingComplete: boolean, baselineLabs: { biomarkerId: string; value: number; unit?: string }[] to store and persist).
3. After onboarding, auto-suggest a starter protocol: e.g. if hs-CRP > 3, add "anti-inflammatory" related blocks (from compendium or seed) to phase 0; if Vitamin D < 30, suggest D3+K2 or similar. Show a single "Suggested for you" card on the Dashboard with "Add to plan" that adds these blocks to the current plan.
4. Skip onboarding if onboardingComplete is true or if user dismisses (with a "Skip for now" that sets onboardingComplete true with empty baseline labs).
Use the existing store, types, and UI (e.g. Card, Button, Input); keep it simple and mobile-friendly.
```

### Mobile test checklist

- **Quick Search:** On phone, open bottom nav → tap "Quick Search" → palette opens; search and add item to plan.
- **Builder FAB:** On /builder, tap green FAB (bottom-right) → palette opens.
- **Desktop:** Top-right magnifying glass opens palette; tooltip shows "Quick Search & Add (Ctrl+K)".
- **Recent searches:** Run a few searches or add items from palette → reopen palette with empty search → "Recent searches" group shows previous queries.
- **Grouped results:** In palette, confirm Peptides, Tests, 5R, Diets, etc. show with icons and tier badges; MOA snippet visible per item.

### Vercel redeploy steps

1. Run `npm run build` locally and confirm zero errors.
2. Push to main: `git add -A && git commit -m "Phase 3: mobile-first Quick Search, enhanced palette" && git push origin main`.
3. In Vercel: Deployments → Redeploy on latest, or let push trigger deploy.
4. Test live URL on a real device (add to home screen, use Quick Search from bottom nav).

---

## FINAL READY FOR BRANDON

After deploying to Vercel, your live app will be at a URL like **https://bioforgeos.vercel.app**. Replace the placeholder below with your actual URL before sending to Brandon.

**Live URL:** https://your-bioforgeos-url.vercel.app — Add to home screen on your phone for one-tap access.

**Message for Brandon (copy and send):** Your BioForge OS is live. Use "Feed the OS — Import Knowledge" on the Compendium page to paste or drop PDF/text/JSON and turn research into compendium items and plan blocks. On phone, use the "Quick Search" tab in the bottom nav (no keyboard). Open the link, add to home screen, and you are set. [PASTE YOUR VERCEL URL HERE]

**Mobile test checklist:** Feed the OS (Compendium → Import Knowledge → paste or drop file); Quick Search (bottom nav); drag library items into phases in every focus mode (Peptides Only, Gut Repair, etc.).

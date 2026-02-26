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

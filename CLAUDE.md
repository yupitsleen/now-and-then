# Now & Then - Developer Guide

**Palestinian cultural heritage destruction tracker with interactive satellite comparison**

**Stack:** React 19 + TypeScript + Vite + Tailwind CSS v4 + Leaflet + D3.js + Supabase + PWA (vite-plugin-pwa) + Vitest + Playwright

Counts (sites, tests, components, lines) are never written in docs — the code is the source of truth. Count them when you need them.

**Session orientation:** run `git log --oneline -5 && git status -sb` before starting work — recent commits are the real "current status", not docs.

---

## Commands

```bash
npm run dev             # Vite dev server → http://localhost:5173
npm test                # Unit tests (vitest --run) THEN e2e (playwright) — full suite, single run
npx vitest --run        # Unit tests only
npm run test:watch      # Unit tests, watch mode
npm run test:ui         # Vitest UI
npm run test:coverage   # Coverage report → coverage/index.html (80% thresholds)
npm run e2e             # Playwright e2e (chromium, headless); :ui :headed :debug :report variants
npm run lint            # ESLint (zero warnings allowed)
npm run test:links      # Live-check every source URL in mockSites.ts (network; monthly in CI)
npm run build           # tsc -b && vite build → dist/
```

Unit tests for a subset: `npx vitest --run src/hooks` (never `npm test <path>` — extra args land on playwright).
Only what your edit affects: `npx vitest --run --changed HEAD` — walks the module graph from the files
modified against HEAD, so timeline work doesn't re-run the Resources page tests.

---

## Critical Rules

- Conventional commits: `feat:` `fix:` `refactor:` `perf:` etc.
- Before commit: all tests pass, lint clean, dev server runs. A PreToolUse hook runs the unit tests
  affected by the commit (`vitest run --changed HEAD`) and blocks on failure. It lives in `.claude/`,
  which is gitignored — the hook is per-machine, so don't rely on a teammate having it. CI
  (`.github/workflows/pr-checks.yml`) runs the full suite; that's the real gate.
- LF line endings, enforced by `.gitattributes` (`* text=auto eol=lf`). When editing a file with a
  script rather than an editor, make it write LF: Python needs `open(p, "w", newline="")`,
  PowerShell's `Set-Content` defaults to CRLF. A whole-file diff for a small edit means the tool
  flipped the endings — check `git diff --stat` before committing and fix it, don't commit it.
- TypeScript strict mode, no `any`, explicit return types.
- Search `src/components/`, `src/hooks/`, `src/utils/` for existing code before writing new.

---

## Architecture

```
src/
├── api/            # Backend integration, 3 modes via adapters/
│   ├── adapters/   # MockAdapter | LocalBackendAdapter | SupabaseAdapter
│   ├── sites.ts    # CRUD (mode-agnostic)
│   └── database.types.ts  # Auto-generated Supabase types
├── components/     # Feature components (Map/, Timeline/, AdvancedTimeline/,
│                   #   FilterBar/, SitesTable/, Layout/, Icons/, shared UI)
├── pages/          # DashboardPage, Timeline, DataPage, AboutPage, DonatePage,
│   └── resources/  # Education, Legal, Media, Organizations, Research, Trackers
├── hooks/          # useAppState, useFilteredSites, useWaybackReleases,
│                   #   useSitesQuery, useTimelineData, useDebounce, ...
├── contexts/       # Animation, Calendar (Gregorian/Islamic), Locale, Theme
├── config/         # colorThemes, data.config, wayback, filters, animation
├── constants/      # layout (BREAKPOINTS, Z_INDEX), timeline, map, statistics
├── utils/          # formatters (BC/BCE), exporters (CSV/JSON/GeoJSON), validators
├── services/       # waybackService (ESRI Wayback API client)
├── i18n/           # en / ar (RTL) / it
├── types/
└── data/mockSites.ts   # Site database (source of truth for mock mode & seeds)

database/           # Local PostgreSQL: migrations/, scripts/, seeds/
server/             # Express backend: controllers/ → services/ → repositories/
```

### State

Centralized in `useAppState()` (no Redux). `useFilteredSites` for memoized filtering, `useSitesQuery` for React Query caching.

### Backend Modes (env vars only, zero code changes)

| Mode | Env (.env.development) | Notes |
|------|------------------------|-------|
| Mock (default) | `VITE_USE_MOCK_API=true` | `src/data/mockSites.ts`, no DB, simulated delay |
| Local backend | `VITE_USE_MOCK_API=false`, `VITE_USE_LOCAL_BACKEND=true` | Express :5000 + PostgreSQL :5432 (Docker) |
| Supabase | `VITE_USE_MOCK_API=false` + `VITE_SUPABASE_URL/ANON_KEY` | Production |

Local backend setup: `npm run db:setup` once, then `npm run dev:full` (or `server:dev` + `dev` separately). Other db commands: `db:start` `db:stop` `db:reset` `db:migrate` `db:seed`.

---

## Data Schema

```typescript
interface Site {
  id: string;
  name: string;
  nameArabic?: string;              // RTL support
  type: string;                     // mosque | church | archaeological_site | museum | ...
  yearBuilt: string;                // "1277" or "BCE 800"
  yearBuiltIslamic?: string;        // "676 AH"
  coordinates: [number, number];    // [lat, lng]
  coordinatesApproximate?: boolean; // no building-level source; area/village-level placement
  status: string;                   // destroyed | severely_damaged | partially_damaged | looted | threatened
  dateDestroyed?: string;           // ISO "YYYY-MM-DD", or "YYYY-MM" when sources only support the month
  dateDestroyedIslamic?: string;
  lastUpdated: string;
  description: string;
  historicalSignificance: string;
  culturalValue: string;
  verifiedBy: string[];             // UNESCO, Forensic Architecture, ...
  sources: Source[];                // { title, url, date?, organization? }
  images?: { before?: string; after?: string; satellite?: string };
  unescoListed?: boolean;
  artifactCount?: number;
  isUnique?: boolean;
  religiousSignificance?: boolean;
  communityGatheringPlace?: boolean;
  historicalEvents?: string[];
}
```

**BC/BCE dates:** `"BCE 800"` (no month/day). Ordering: 100 BCE < 50 BCE < 1 CE < 2024 CE. Use `parseYearBuilt()` from `src/utils/siteFilters.ts` (returns negative for BCE).

---

## Development Standards

- Functional components + hooks only; named exports preferred.
- Extract at 3+ uses; keep components small — split when they grow unwieldy.
- Accessibility: ARIA labels, keyboard nav (Tab/Enter/Escape), focus management, WCAG 2.1 AA contrast.
- Component folder: `index.tsx` + `ComponentName.test.tsx` + optional `types.ts`/`utils.ts`.
- Tests: AAA structure, smoke → interaction → edge cases. Unit tests for logic; e2e for user journeys and visual bugs only. MSW for API mocking.

### Cultural Sensitivity

- English primary; Arabic (RTL) and Italian translations in `src/i18n/`.
- Use original Arabic names when available.
- Evidence-based only (UNESCO, Forensic Architecture, Heritage for Peace); all sources linked and dated.
- Factual language: "destruction" not "damage"; avoid bias.

---

## Common Tasks

**New site:** add to `src/data/mockSites.ts` with sources + Arabic name; run tests.
**New filter:** `src/config/filters.ts` → `src/types/filters.ts` → `src/hooks/useFilteredSites.ts` → `src/components/FilterBar/`.
**New page:** `src/pages/` (or `pages/resources/` + its `index.ts`) → route in `App.tsx` → nav in `Layout/AppHeader.tsx` or `ResourcesDropdown.tsx` → i18n in `en.ts`/`ar.ts`/`it.ts` → tests.

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Map not rendering | Leaflet CSS import in `main.tsx` |
| BC/BCE dates wrong | Use `parseYearBuilt()` from `src/utils/siteFilters.ts` |
| FilterBar laggy/not updating | 300ms debounce is intentional |
| Docker won't start | Docker Desktop running? Port 5432 free? |
| Backend connection fails | Check `.env.development` mode flags |
| Diff shows a whole file for a small edit | The editing tool wrote CRLF. Confirm with `git diff --cached --ignore-cr-at-eol --stat`, then re-save as LF. |
| Link Check action red | Only 404/5xx and network failures that survive a retry are real. 403/429 are bot-blocking and rate-limiting — tolerated, verify in a browser. |

---

## Deployment

- `npm run build` → `dist/`. Vercel/Netlify: build `npm run build`, output `dist`, set `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`. Build-date config: see `DEPLOYMENT.md`.
- Supabase: run `database/migrations/001_initial_schema.sql` in the SQL editor — same schema as local.

## Constraints

- Budget: Supabase free tier; free APIs only (Leaflet, D3, ESRI Wayback).
- Public-domain data sources only; educational/non-profit use; attribution required.
- WCAG 2.1 AA compliance.

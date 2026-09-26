---
feature: "Heritage Tracker Knowledge Base"
mode: override
created: "2026-05-18"
---

> This is the knowledge base for Heritage Tracker. It primes AI with project-specific context -- tech stack, architecture, trusted sources, and project structure -- so generated code fits this codebase rather than defaulting to generic patterns.

---

## 1. Architecture Overview

Palestinian cultural heritage destruction tracker. Single-page React app with 3 interchangeable backend modes selected via `.env` — zero code changes needed to switch.

- **Frontend SPA** — React 19 + Vite, single-page (one route → Timeline)
- **Map Layer** — Leaflet with clustering, satellite/street toggle, ESRI Wayback comparison mode
- **Data Layer** — 3 modes via adapter pattern: Mock (in-memory, default), Local (Express + PostgreSQL 16 + PostGIS), Supabase Cloud
- **External APIs** — ESRI Wayback (`s3-us-west-2.amazonaws.com/config.maptiles.arcgis.com/waybackconfig.json`) for satellite imagery metadata

State is managed via custom hooks + React Context (no Redux). Components communicate via props and shared hooks, not a global store.

---

## 2. Tech Stack and Versions

- **Language**: TypeScript 5.9 (strict mode — no `any`)
- **Frontend**: React 19, Vite 7
- **Styling**: Tailwind CSS v4 (not v3, not styled-components, not CSS modules)
- **Mapping**: Leaflet + react-leaflet + leaflet.markercluster (not Mapbox, not Google Maps)
- **Visualization**: D3.js
- **Performance**: TanStack Virtual + TanStack Query (React Query) — not SWR
- **State**: React Context + custom hooks (not Redux, not Zustand)
- **Backend (local)**: Express + PostgreSQL 16 + PostGIS 3.4
- **Backend (cloud)**: Supabase
- **Testing**: Vitest + Testing Library + MSW 2.11.6 (not Jest); Playwright for E2E (chromium only)
- **i18n**: Custom implementation in `src/i18n/` (not i18next, not react-intl)
- **Build**: Vite 7 with manual chunk splitting (vendor / leaflet / d3)

---

## 3. Curated Knowledge Sources

### Official Documentation
| Topic | Source |
|-------|--------|
| React 19 | https://react.dev |
| Leaflet | https://leafletjs.com/reference.html |
| D3.js | https://observablehq.com/@d3/gallery |
| TanStack Query | https://tanstack.com/query/latest |
| Tailwind CSS v4 | https://tailwindcss.com/docs |
| Supabase | https://supabase.com/docs |
| ESRI Wayback | https://www.arcgis.com/home/item.html?id=08b4d8a8c0c44c559e021deae91f3a85 |

### Internal References
| Topic | Path |
|-------|------|
| Full developer guide | `CLAUDE.md` |
| Deployment guide | `DEPLOYMENT.md` |
| Known bugs | `bugs.md` |
| DB schema | `database/migrations/001_initial_schema.sql` |

---

## 4. Project Structure

```
src/
├── api/                 # Backend integration (adapter pattern, 3 modes)
│   └── adapters/        # MockAdapter, LocalBackendAdapter, SupabaseAdapter
├── components/          # feature components (co-located tests + types)
│   ├── AdvancedTimeline/ # WaybackSlider, IntervalSelector
│   ├── Map/             # HeritageMap, ComparisonMapView, SiteDetailView
│   ├── FilterBar/       # Multi-select filter UI
│   ├── SitesTable/      # Virtual-scrolling table
│   └── Layout/          # AppHeader, AppFooter, layouts
├── pages/               # Timeline.tsx (single-page app — only route is "/")
├── hooks/               # custom hooks (useAppState, useFilteredSites, useWaybackReleases…)
├── contexts/            # ThemeContext, LocaleContext, CalendarContext, AnimationContext
├── config/              # 30+ config files (colorThemes, tileLayers, filters, tooltips…)
├── constants/           # layout, timeline, map, statistics constants
├── i18n/                # Translations: en.ts, ar.ts, it.ts
├── data/mockSites.ts    # documented heritage sites (source of truth for mock mode + seeds)
├── types/               # TypeScript definitions (Site, FilterState, 30+ type files)
└── utils/               # formatters, exporters, calculations, validators

server/                  # Express REST API (controllers → services → repositories)
database/                # PostgreSQL migrations + seed scripts
e2e/                     # Playwright E2E specs (smoke, filters, timeline, comparison)
```

---

## 5. Project Conventions

- **Commits**: Conventional format — `feat:`, `fix:`, `refactor:`, `perf:` (enforced as quality gate)
- **Exports**: Named exports preferred over default exports
- **Text**: All UI labels must go through `src/i18n/` — no hardcoded strings in components
- **Dates**: BC/BCE dates use `"BCE YYYY"` string format; use `normalizeYear()` from `src/utils/formatters.ts` for comparisons
- **Backend mode**: Switched via `.env` variables (`VITE_USE_MOCK_API`, `VITE_USE_LOCAL_BACKEND`) — never in code
- **Tests**: Co-located with source (`Component.test.tsx` next to `Component.tsx`); backend tests in `server/**/__tests__/`
- **Quality gate**: All unit + E2E tests must pass before every commit (never write hardcoded counts in docs — code is the source of truth)

---
*Generated for Heritage Tracker on 2026-05-18. Mode: override.*
*Produced by the knowledge-priming-refiner skill.*

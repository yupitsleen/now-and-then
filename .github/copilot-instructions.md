# AI Coding Agent Instructions for Now & Then

**Project:** Palestinian cultural heritage destruction tracker with interactive satellite comparison
**Stack:** React 19 + TypeScript 5.9 + Vite 7 + Tailwind CSS v4 + Leaflet + D3.js + Supabase + Playwright
**Status:** Production-ready | 1,465 unit tests + 16 E2E tests | Zero-failing-tests policy

---

## Critical Rules (Non-Negotiable)

### Commits

- **Conventional format only:** `feat:`, `fix:`, `refactor:`, `perf:` (see `CLAUDE.md`)
- **Pre-commit gate:** ALL tests passing (1465 unit + 16 E2E), lint zero warnings, dev server runs
- **No hardcoded text:** All UI labels must use i18n from `src/i18n/`

### Quality Gates

- **Zero TypeScript errors** (strict mode, no `any` type)
- **Zero failing tests** before every commit
- **Check existing code first** before creating new components/hooks (avoid duplication)

---

## Architecture Overview

### Three-Backend Adapter Pattern (Critical)

All data flows through `src/api/sites.ts` → `src/api/adapters/`:

```
API Call → sites.ts (mode-agnostic) → adapter factory → correct backend
```

**Priority order (environment-driven):**

1. **MockAdapter** (`VITE_USE_MOCK_API=true`) - 70 sites hardcoded, no setup, testing
2. **LocalBackendAdapter** (`VITE_USE_LOCAL_BACKEND=true`) - PostgreSQL + PostGIS, local dev
3. **SupabaseAdapter** (default) - Cloud production

**Key principle:** Change `.env`, not code. Adapters implement identical `BackendAdapter` interface.

### Component Architecture

**Feature components (21 total) in `src/components/`:**

- `Map/` - Leaflet maps with clustering, glow layer, comparison mode
- `AdvancedTimeline/` - D3 scrubber with 186 Wayback releases (2014-2025)
- `FilterBar/` - Pill/badge UI with 300ms debounce
- `SitesTable/` - Virtual scrolling (TanStack Virtual) for 100+ sites
- `Stats/` - Dashboard with artifact/loss calculations
- `Layout/` - Responsive (mobile=MobileLayout, desktop=DesktopLayout)

**Data flow:** Pages → hooks → contexts → components (no prop drilling except positioning)

### State Management

- **useAppState()** - Centralized facade (filter + modal + selection state)
- **useFilterState()** - Filter logic with temp/applied state separation
- **useModalState()** - Modal visibility flags
- **useSiteSelection()** - Site highlighting across map/table
- **Contexts (4):** ThemeContext, LocaleContext, AnimationContext, CalendarContext

**Important:** `useAppState()` composes focused hooks → favor direct hook usage for new code.

### Data Access Patterns

**React Query caching (5min TTL):**

```typescript
// src/hooks/useSitesQuery.ts - cached data fetch
const sites = useSitesQuery(params); // Returns { data, isLoading, error }

// src/hooks/useSitesPaginated.ts - page-based pagination
const { items, hasMore } = useSitesPaginated(page, pageSize, filters);

// Filtering with memoization:
useFilteredSites(allSites, filters); // Prevents unnecessary re-renders
```

**Filter debouncing:** 300ms debounce in `useDebounce` (see `FilterBar/` usage)

---

## Testing Strategy

### Test Structure (1,396 total)

- **Unit tests:** 1,304 frontend + 77 backend
- **E2E tests:** 16 Playwright tests
- **Framework:** Vitest (globals, JSdom, 8 parallel forks)

### Vitest Setup (`vitest.setup.ts`)

Mocks non-DOM APIs:

- `matchMedia` (useMediaQuery)
- `ResizeObserver` (D3/timeline)
- `IntersectionObserver` (LazySection)
- Canvas context (leaflet.heat)

**Run tests:**

```bash
npm test              # All unit + E2E
npm run test:watch   # Watch mode
npm run test:ui      # Interactive UI
npm run test:coverage # Coverage report
```

### Test Patterns

**Smoke tests required** for new features (see `src/__tests__/` examples):

```typescript
describe("ComponentName", () => {
  it("renders without crashing", () => {
    render(<ComponentName />);
    expect(screen.getByRole(...)).toBeInTheDocument();
  });

  it("handles user interactions", async () => {
    render(<ComponentName />);
    await userEvent.click(screen.getByRole("button"));
    expect(screen.getByText("expected")).toBeInTheDocument();
  });
});
```

**Resilience:** Avoid overfitting tests to implementation details (use role queries, not selectors).

### E2E Tests (Playwright, 16 tests)

Located in `e2e/`. Run with:

```bash
npm run e2e          # Headless
npm run e2e:headed   # Visual
npm run e2e:debug    # Step-through debugger
```

---

## Developer Workflows

### Development Environment

- **Dev server:** `npm run dev` → http://localhost:5173 (user maintains)
- **Backend:** `npm run server:dev` (node + nodemon)
- **Full stack:** `npm run dev:full` (concurrently Vite + server)
- **Database:** `npm run db:start` → PostgreSQL in Docker

### Build & Deploy

```bash
npm run build         # Production build (base path = /now-and-then/gaza/ for GitHub Pages)
npm run preview       # Local production preview
```

**Important:** Base path logic in `vite.config.ts`:

- Dev/E2E tests: `/` (root)
- Production: `/now-and-then/gaza/` (GitHub Pages subdirectory)

### Database Commands

```bash
npm run db:migrate          # Run migrations from ./database/migrations/
npm run db:migrate:status   # Check migration state
npm run db:reset            # Drop + recreate database
npm run db:seed             # Seed mock data
npm run db:extract-json     # Export sites to JSON
```

---

## Project-Specific Patterns

### i18n (Bilingual: English/Arabic)

```typescript
// src/i18n/index.ts contains all translations
import { t } from "../i18n";

// Usage in components:
<h1>{t("site.title")}</h1>
<p>{t("filter.dateRange", { from, to })}</p>

// RTL handled automatically via LocaleContext
const { locale } = useLocale(); // "en" or "ar"
```

**Rule:** Never hardcode UI text. All labels/buttons/help text in `src/i18n/`.

### Z-Index Management

All z-index values from `src/constants/layout.ts`:

```typescript
import { Z_INDEX } from "../constants/layout";

// Valid:
style={{ zIndex: Z_INDEX.MODAL }}
// Invalid:
style={{ zIndex: 9999 }}
```

### Type System

- **Site types:** `src/types/siteTypes.ts` (definitions, enums)
- **Filter types:** `src/types/filters.ts` (filter state, validation)
- **Auto-generated:** `src/api/database.types.ts` (Supabase schema)
- **Error types:** `src/types/errors.ts` (custom error hierarchy)

### Color Theme System

```typescript
// src/config/colorThemes.ts - Palestinian flag colors
import { getThemeClasses } from "../hooks/useThemeClasses";

const classes = getThemeClasses("primary"); // Returns Tailwind classes for theme
```

### Performance Optimizations

- **Virtual scrolling:** `SitesTable/` uses TanStack Virtual (60 FPS for 100+ sites)
- **Lazy loading:** `LazySection` with IntersectionObserver (pages load incrementally)
- **React Query caching:** 5-minute TTL, prevents redundant API calls
- **Code splitting:** Vite chunks (`react-vendor`, `map-vendor`, `d3-vendor`)

### Error Handling

```typescript
// src/types/errors.ts - custom error hierarchy
import { HeritageTrackerError, ValidationError } from "../types/errors";

try {
  await fetchSites();
} catch (error) {
  if (error instanceof ValidationError) {
    // Handle validation
  }
}
```

### Filtering & Search

```typescript
// src/hooks/useFilteredSites.ts
// Memoized filtering: prevents re-render cascades
const filtered = useFilteredSites(allSites, {
  types: ["mosque", "church"],
  statuses: ["destroyed"],
  destructionDateRange: [2023, 2024],
  searchTerm: "al-quds",
});
```

---

## File Organization Reference

```
src/
├── api/                      # Backend abstraction (adapter pattern)
│   ├── adapters/             # Mock, Local, Supabase implementations
│   ├── sites.ts              # Mode-agnostic CRUD
│   ├── queryHelpers.ts       # Filter/pagination helpers
│   └── types.ts              # API contract types
├── components/               # 21 feature components (organized by feature)
├── hooks/                    # 24+ custom hooks (state, data, utilities)
├── contexts/                 # 4 contexts (theme, locale, animation, calendar)
├── pages/                    # 6 pages (Dashboard, Timeline, Data, Stats, About, Donate)
├── types/                    # Type definitions (enums, interfaces, unions)
├── config/                   # 30+ configuration files (themes, validations)
├── i18n/                     # Bilingual translations
├── utils/                    # Utilities (errors, logger, converters)
├── styles/                   # Global CSS (Tailwind config)
└── __tests__/                # Unit tests (mirror src/ structure)

server/                        # Express backend (local development)
├── controllers/              # Route handlers
├── middleware/               # Auth, logging, error handling
├── repositories/             # Data access (direct DB queries)
└── services/                 # Business logic
```

---

## Integration Points & External Dependencies

### ESRI Wayback API (Satellite Imagery)

- **Used in:** `AdvancedTimeline/` for 186 releases (2014-2025)
- **Rate limit:** Check before expanding usage
- **Docs:** ESRI Wayback API v1

### Supabase (Cloud Backend)

- **Client:** `src/api/supabaseClient.ts`
- **Auth:** Row-Level Security (RLS) for public read access
- **Geospatial:** PostGIS for radius queries
- **Real-time:** Available but not currently used

### Leaflet Libraries

- `leaflet` - Core mapping
- `leaflet.markercluster` - Site clustering
- `leaflet.heat` - Heatmap visualization (requires canvas mock in tests)

### TanStack Libraries

- `@tanstack/react-query` - Caching (5min TTL)
- `@tanstack/react-virtual` - Virtual scrolling for large lists

### D3.js (Timeline Visualization)

- Used in `AdvancedTimeline/WaybackSlider`
- Scrubber with play/pause, BC/BCE date support

---

## Code Review Checklist (Auto-apply)

✅ **Before committing, verify:**

- [ ] `npm test` passes (all 1396 tests)
- [ ] `npm run lint` passes (zero warnings)
- [ ] Dev server runs (`npm run dev`) without errors
- [ ] No hardcoded UI text (all i18n'd)
- [ ] No duplicate components/hooks (check existing code first)
- [ ] No generic TypeScript (`any` type forbidden)
- [ ] Z-index values from `Z_INDEX` constant
- [ ] Error handling with custom error types
- [ ] Tests added for new features (smoke test minimum)
- [ ] Production build tested (`npm run build && npm run preview`)

---

## Common Tasks

### Add a New Filter

1. Define filter type in `src/types/filters.ts`
2. Add to `useFilterState()` and temp state
3. Update `useFilteredSites()` logic
4. Add i18n strings in `src/i18n/index.ts`
5. Add UI in `FilterBar/`
6. Add tests in `src/__tests__/filterIntegration.test.tsx`

### Add a New Component

1. Check `src/components/` for existing similar component
2. Create in appropriate feature folder (e.g., `Map/`, `Stats/`)
3. Export from feature's `index.ts`
4. Add smoke test in `src/__tests__/`
5. Use contexts (no prop drilling) for state
6. Apply theme classes via `useThemeClasses()`

### Switch Backend (Dev Testing)

```bash
# Mock: VITE_USE_MOCK_API=true npm run dev
# Local: VITE_USE_LOCAL_BACKEND=true npm run dev
# Supabase: npm run dev (default)
```

### Debug E2E Tests

```bash
npm run e2e:debug    # Step through in Playwright Inspector
npm run e2e:report   # View previous run report
```

---

## References

- **Architecture:** `CLAUDE.md` (comprehensive guide)
- **Workflows:** `DEVELOPMENT_WORKFLOW.md` (commit standards, PR checklist)
- **API Contract:** `API_CONTRACT.md` (Supabase schema, data types)
- **Testing:** `vitest.config.ts`, `playwright.config.ts`
- **ESLint:** `eslint.config.js` (z-index rule enforcement)

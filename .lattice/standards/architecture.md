---
mode: override
---

> These are the architecture principles for Heritage Tracker, following a custom two-context architecture (React SPA frontend + Express API backend). This document is the sole reference for the `architecture` atom — there are no embedded defaults.

**Table of contents:**

1. [Layer Definitions](#1-layer-definitions)
2. [Dependency Rules](#2-dependency-rules)
3. [Boundary Rules](#3-boundary-rules)
4. [Per-Layer Rules](#4-per-layer-rules)
5. [Key Flows](#5-key-flows)
6. [Validation Checklist](#6-validation-checklist)
7. [Anti-Patterns](#7-anti-patterns)
8. [Ambiguity Signals](#8-ambiguity-signals)

---

## 1. Layer Definitions

This repo contains two distinct contexts that share types but have separate layer structures.

### Frontend (`src/`)

| Layer | Responsibility | Directory |
|-------|---------------|-----------|
| UI | React components, rendering, event wiring, layout, local UI state | `pages/`, `components/` |
| Application | Custom hooks, business logic, state management, data fetching orchestration | `hooks/` |
| Data Access | Adapter implementations, backend communication, env-based mode selection | `api/`, `api/adapters/` |
| Cross-cutting | Contexts, config, constants, i18n, types, utilities | `contexts/`, `config/`, `constants/`, `i18n/`, `types/`, `utils/` |

### Backend (`server/`)

| Layer | Responsibility | Directory |
|-------|---------------|-----------|
| Controller | HTTP request/response handling, parameter extraction | `controllers/` |
| Service | Business rules, validation, orchestration | `services/` |
| Repository | SQL queries, DB result mapping | `repositories/` |
| Cross-cutting | Error middleware, validation middleware, converters | `middleware/`, `utils/`, `constants/` |

---

## 2. Dependency Rules

```
Frontend:
  UI (pages/components)
      ↓ imports hooks, types, config, utils
  Application (hooks)
      ↓ imports api/adapters, types, utils
  Data Access (api/adapters)
      ↓ imports types only

Backend:
  Controller
      ↓ imports services, utils, constants
  Service
      ↓ imports repositories, utils, constants
  Repository
      ↓ imports db, utils, constants
```

No reverse dependencies in either context. Adapters import from `types/` only — no React imports, no hook imports.

**Data crossing boundaries**: Frontend↔backend via typed `Site` objects in JSON API responses. DB rows mapped to `Site` API shape via `converters.js` at the repository boundary.

---

## 3. Boundary Rules

**Frontend**: UI → hooks via return values (data, handlers, state). Hooks → adapters via async function calls returning typed `Site[]`. Adapter selection is fixed at module load time by env vars (`VITE_USE_MOCK_API`, `VITE_USE_LOCAL_BACKEND`) — never switched at runtime.

**Backend**: Controller → Service via direct function call with extracted params. Service → Repository via direct call. Repository → DB via `postgres` SQL library. No DI container in either context — dependencies wired via module imports and React Context.

---

## 4. Per-Layer Rules

### UI Layer (`pages/`, `components/`)

**What belongs here:**
- JSX rendering and layout
- Event handler wiring (onClick, onChange)
- Local UI state (dropdown open/closed, hover, focus)
- Accessibility attributes (aria-*, role, tabIndex)
- Calls to hooks for data and handlers

**What does not belong here:**
- Business logic or data transformations
- Direct API or fetch calls
- Hardcoded i18n strings (all text via `translate()`)
- Global state management

**Common violations:**
- Fetching data directly in a component instead of a hook
- Hardcoded English strings instead of `useTranslation()`
- Filter or sort logic duplicated across components

### Application Layer (`hooks/`)

**What belongs here:**
- Data fetching and caching logic
- Business logic, filtering, calculations, transformations
- State derived from multiple sources
- `useCallback`/`useMemo` for performance
- Loading and error state management

**What does not belong here:**
- JSX or React component rendering
- Direct `fetch()` calls (use adapters)
- Component-specific local UI state (belongs in component)

**Common violations:**
- Inline fetch instead of going through adapter
- Hook logic duplicated across components instead of extracted to shared hook

### Data Access Layer (`api/`, `api/adapters/`)

**What belongs here:**
- Adapter implementations for each backend mode (Mock, Local, Supabase)
- Data shape transformation between backend response and app `Site` type
- Mode selection logic driven by env vars

**What does not belong here:**
- Business logic or filtering rules
- React state or hooks
- Component imports

**Common violations:**
- Filtering or sorting logic inside an adapter
- Business rules encoded in adapter methods

### Controller Layer (`server/controllers/`)

**What belongs here:**
- HTTP request parameter extraction
- Calling service methods with extracted params
- HTTP response formatting and status codes
- Delegating validation to middleware

**What does not belong here:**
- Business logic or domain validation rules
- Direct database queries
- Data transformation beyond request/response mapping

**Common violations:**
- Calling repository directly, bypassing service
- Business rules or validation logic in controller

### Service Layer (`server/services/`)

**What belongs here:**
- Business rules and domain validation
- Orchestration across multiple repositories
- Domain-specific calculations
- Error wrapping with meaningful messages

**What does not belong here:**
- HTTP-specific concerns (status codes, headers)
- Direct SQL queries (use repositories)

**Common violations:**
- SQL leaking into service methods
- HTTP status codes set inside a service

### Repository Layer (`server/repositories/`)

**What belongs here:**
- SQL queries and query building (WHERE clauses, pagination)
- DB row → API type mapping via `converters.js`

**What does not belong here:**
- Business logic or filtering rules
- HTTP concerns
- Calling other repositories directly (orchestrate in service)

**Common violations:**
- Business filtering logic in repository instead of service
- Cross-repository calls instead of service orchestration

---

## 5. Key Flows

### Frontend Read Flow (e.g. Timeline loading sites)

```
Timeline renders
  → calls useSites() hook
    → useAsyncQuery({ queryFn: getAllSites })
      → active adapter (Mock/Local/Supabase).getAllSites()
        → returns Site[]
      ← data/isLoading/error state set on hook
    ← hook returns { data, isLoading, error } to component
  ← component renders based on state
```

### Backend API Request Flow (e.g. GET /api/sites)

```
HTTP GET /api/sites
  → middleware/validator.js (validates query params shape)
  → controllers/sitesController.js
      extracts filters from request, calls sitesService.getAllSites(filters)
    → services/sitesService.js
        applies business rules and validation, calls sitesRepository.findAll(filters)
      → repositories/sitesRepository.js
          builds SQL WHERE clause, executes query, maps rows via converters.dbToApi()
          returns Site[]
      ← Site[] returned to service
    ← Site[] returned to controller
  ← controller sends JSON response { data: Site[] }
```

---

## 6. Validation Checklist

STOP after generating each component. Verify ALL of the following before proceeding:

1. **LAYER PLACEMENT (Frontend)**: Is business logic in a hook? Is rendering in a component? Is fetching going through an adapter? Nothing mixed across layers.
2. **LAYER PLACEMENT (Backend)**: Are business rules in the service? Is SQL in the repository? Is HTTP handling in the controller only?
3. **DEPENDENCY DIRECTION**: Are there any reverse imports? Adapters must import `types/` only. Repositories must not call services. Components must not import from hooks they own.
4. **I18N**: Do all UI-facing strings go through `translate()` from `useTranslation()`? No hardcoded English strings in components or pages.
5. **ADAPTER ISOLATION**: Does `api/adapters/` contain any React imports, hook imports, or business logic?
6. **NO BYPASSED LAYERS**: Do controllers call repositories directly? Do hooks bypass adapters with raw `fetch()`?

---

## 7. Anti-Patterns

After verifying the checklist above, scan output for these anti-patterns. If found, fix before presenting.

- [ ] **Fat Component**: Business logic, calculations, or API calls directly in a React component → extract to a custom hook
- [ ] **Smart Adapter**: Business logic or filtering inside an adapter → move to hook (frontend) or service (backend)
- [ ] **Bypassed Service**: Controller calling repository directly → always route through service layer
- [ ] **Hardcoded Text**: UI string not going through `translate()` → use `useTranslation()` hook
- [ ] **Reversed Dependency**: Hook importing from a component, or service importing from a controller → invert the dependency
- [ ] **Duplicated Filter Logic**: Same filtering implemented in multiple places → centralize in `useFilteredSites` (frontend) or service layer (backend)

---

## 8. Ambiguity Signals

These checks often have multiple valid outcomes. When you encounter one, present options rather than silently choosing.

- Conditional logic in a component that could be rendering logic (stays in component) or business logic (moves to hook) — if it involves data shape, calculations, or domain knowledge, it belongs in a hook
- A transformation in an adapter that could be data mapping (stays in adapter/converter) or a business rule (moves to hook/service) — if it applies domain knowledge beyond shape translation, it's a business rule
- Validation that could live in middleware (HTTP request structure), service (business rule), or repository (data constraint) — prefer service for business rules, middleware for HTTP request structure only

---

*Generated for Heritage Tracker on 2026-05-18. Style: Custom (React SPA + Express API).*
*Produced by the architecture-refiner skill.*

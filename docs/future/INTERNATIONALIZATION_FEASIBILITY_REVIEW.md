# Regional Architecture Implementation Plan (West Bank Support)
**Date:** 2025-11-15
**Status:** 📋 Planning Phase - TDD Approach
**Goal:** Make Heritage Tracker support Gaza + West Bank via `VITE_REGION` environment variable

---

## Project Overview

**Current State:** Heritage Tracker is hardcoded for Gaza
**Target State:** Single codebase supporting Gaza + West Bank via `VITE_REGION` environment variable
**Approach:** Regional configuration registry with TDD (Test-Driven Development)

### Success Criteria
- ✅ Switch regions by changing one `.env` variable
- ✅ Zero code changes needed to add new regions
- ✅ All Gaza-specific code abstracted to region configs
- ✅ All tests pass (write tests FIRST, then implementation)
- ✅ Documentation for adding new regions

### Estimated Effort
**Total Time:** 7-11 hours
**Breakdown:**
- Region Config Infrastructure: 3-4 hours
- Component Updates: 2-3 hours
- Data Layer: 1-2 hours
- Testing (TDD - integrated throughout): Built into each task

---

## Key Simplification: West Bank vs Multi-Country

Since West Bank is **part of Palestine**, we can:
- ✅ **Keep same About/Stats/Donate pages** (Palestine-wide content)
- ✅ **Keep same color theme** (Palestinian flag)
- ✅ **Keep same verifiers** (UNESCO, Palestinian authorities)

**Only differences:**
- 📍 Map viewport (Gaza coordinates vs West Bank coordinates)
- 📊 Dataset (Gaza sites vs West Bank sites)
- 🏷️ Display name ("Gaza" vs "West Bank" in UI)

---

## Implementation Plan: TDD Approach

### **Phase 1: Region Infrastructure** (3-4 hours)

#### **Task 1.1: Create Region Config Types + Tests** (45 min)

**Test First (20 min):**
- [ ] **File:** `src/types/regionConfig.test.ts` (NEW)
```typescript
import { describe, it, expect } from 'vitest';
import type { RegionConfig } from './regionConfig';

describe('RegionConfig Types', () => {
  it('should define required fields for a region', () => {
    const gazaConfig: RegionConfig = {
      id: 'gaza',
      label: 'Gaza Strip',
      labelArabic: 'قطاع غزة',
      defaultViewport: 'gaza-overview',
      dataSource: {
        mockFile: 'mockSites',
      },
      displayName: 'Gaza',
      displayNameArabic: 'غزة',
    };

    expect(gazaConfig.id).toBe('gaza');
    expect(gazaConfig.defaultViewport).toBe('gaza-overview');
  });
});
```

**Implementation (25 min):**
- [ ] **File:** `src/types/regionConfig.ts` (NEW)
```typescript
export interface RegionConfig {
  id: string;
  label: string;
  labelArabic: string;

  // Geographic config
  defaultViewport: string;  // ID from VIEWPORT_REGISTRY

  // Data source
  dataSource: {
    mockFile?: string;      // 'mockSites' or 'mockSitesWestBank'
    supabaseTable?: string; // 'heritage_sites' with region filter
  };

  // UI customization
  displayName: string;      // "Gaza" or "West Bank"
  displayNameArabic: string; // "غزة" or "الضفة الغربية"
}
```

**Verify:**
```bash
npm test src/types/regionConfig.test.ts
```

---

#### **Task 1.2: Create Region Registry + Tests** (1.5 hours)

**Test First (45 min):**
- [ ] **File:** `src/config/region.test.ts` (NEW)
```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  REGION_REGISTRY,
  getActiveRegionConfig,
  getActiveRegionId,
  isRegionRegistered
} from './region';

describe('Region Registry', () => {
  beforeEach(() => {
    // Clear environment
    vi.stubEnv('VITE_REGION', '');
  });

  it('should have Gaza and West Bank regions registered', () => {
    expect(REGION_REGISTRY.gaza).toBeDefined();
    expect(REGION_REGISTRY['west-bank']).toBeDefined();
    expect(REGION_REGISTRY.gaza.label).toBe('Gaza Strip');
    expect(REGION_REGISTRY['west-bank'].label).toBe('West Bank');
  });

  it('should return Gaza config when no VITE_REGION is set', () => {
    const config = getActiveRegionConfig();
    expect(config.id).toBe('gaza');
    expect(config.label).toBe('Gaza Strip');
  });

  it('should return West Bank config when VITE_REGION=west-bank', () => {
    vi.stubEnv('VITE_REGION', 'west-bank');
    const config = getActiveRegionConfig();
    expect(config.id).toBe('west-bank');
    expect(config.label).toBe('West Bank');
  });

  it('should fallback to Gaza for invalid region', () => {
    vi.stubEnv('VITE_REGION', 'invalid');
    const config = getActiveRegionConfig();
    expect(config.id).toBe('gaza');
  });

  it('should correctly check if region is registered', () => {
    expect(isRegionRegistered('gaza')).toBe(true);
    expect(isRegionRegistered('west-bank')).toBe(true);
    expect(isRegionRegistered('invalid')).toBe(false);
  });

  it('should return correct viewport IDs', () => {
    expect(REGION_REGISTRY.gaza.defaultViewport).toBe('gaza-overview');
    expect(REGION_REGISTRY['west-bank'].defaultViewport).toBe('west-bank-overview');
  });
});
```

**Implementation (45 min):**
- [ ] **File:** `src/config/region.ts` (NEW)
```typescript
import type { RegionConfig } from '../types/regionConfig';

/**
 * Regional configuration registry
 *
 * Add new Palestinian regions here with complete configuration.
 * No code changes needed in components when adding regions.
 */
export const REGION_REGISTRY: Record<string, RegionConfig> = {
  gaza: {
    id: 'gaza',
    label: 'Gaza Strip',
    labelArabic: 'قطاع غزة',
    defaultViewport: 'gaza-overview',
    dataSource: {
      mockFile: 'mockSites',
    },
    displayName: 'Gaza',
    displayNameArabic: 'غزة',
  },

  'west-bank': {
    id: 'west-bank',
    label: 'West Bank',
    labelArabic: 'الضفة الغربية',
    defaultViewport: 'west-bank-overview',
    dataSource: {
      mockFile: 'mockSitesWestBank',
    },
    displayName: 'West Bank',
    displayNameArabic: 'الضفة الغربية',
  },
};

/**
 * Get active region configuration from environment variable
 * Falls back to 'gaza' if not set or invalid
 */
export function getActiveRegionConfig(): RegionConfig {
  const regionId = import.meta.env.VITE_REGION || 'gaza';

  if (!(regionId in REGION_REGISTRY)) {
    console.warn(`Region '${regionId}' not found in registry. Falling back to 'gaza'.`);
    return REGION_REGISTRY.gaza;
  }

  return REGION_REGISTRY[regionId];
}

/**
 * Get active region ID
 */
export function getActiveRegionId(): string {
  return import.meta.env.VITE_REGION || 'gaza';
}

/**
 * Check if a region is registered
 */
export function isRegionRegistered(regionId: string): boolean {
  return regionId in REGION_REGISTRY;
}

/**
 * Get all registered regions
 */
export function getAllRegions(): RegionConfig[] {
  return Object.values(REGION_REGISTRY);
}
```

**Verify:**
```bash
npm test src/config/region.test.ts
```

---

#### **Task 1.3: Add West Bank Viewport + Tests** (30 min)

**Test First (15 min):**
- [ ] **File:** `src/config/mapViewport.test.ts` (update existing)
```typescript
describe('Map Viewport Registry', () => {
  // ... existing tests ...

  it('should have West Bank viewport registered', () => {
    const viewport = getViewport('west-bank-overview');
    expect(viewport).toBeDefined();
    expect(viewport?.label).toBe('West Bank Overview');
    expect(viewport?.center).toEqual([31.9, 35.2]);
    expect(viewport?.zoom).toBe(9);
  });

  it('should have correct bounds for West Bank', () => {
    const viewport = getViewport('west-bank-overview');
    expect(viewport?.bounds?.north).toBe(32.55);
    expect(viewport?.bounds?.south).toBe(31.35);
  });
});
```

**Implementation (15 min):**
- [ ] **File:** `src/config/mapViewport.ts` (update)
```typescript
export const VIEWPORT_REGISTRY: Record<string, MapViewportConfig> = {
  "gaza-overview": {
    // ... existing Gaza viewport ...
  },

  "west-bank-overview": {
    id: "west-bank-overview",
    label: "West Bank Overview",
    labelArabic: "نظرة عامة على الضفة الغربية",
    center: [31.9, 35.2] as [number, number],  // Ramallah area
    zoom: 9,
    minZoom: 1,
    maxZoom: 19,
    isDefault: false,
    description: "Overview of West Bank territory",
    bounds: {
      north: 32.55,   // Northern West Bank
      south: 31.35,   // Southern West Bank (Hebron)
      east: 35.57,    // Jordan Valley
      west: 34.88,    // Green Line
    },
  },
};
```

**Verify:**
```bash
npm test src/config/mapViewport.test.ts
```

---

#### **Task 1.4: Update Environment Variables** (5 min)

- [ ] **File:** `.env.example`
```bash
# Regional Configuration
# Determines which Palestinian region to track
# Options: gaza, west-bank
VITE_REGION=gaza
```

- [ ] **File:** `.env.development`
```bash
VITE_REGION=gaza
```

**No test needed** (documentation)

---

### **Phase 2: Component Updates** (2-3 hours)

#### **Task 2.1: Update HeritageMap + Tests** (45 min)

**Test First (25 min):**
- [ ] **File:** `src/components/Map/HeritageMap.test.tsx` (update)
```typescript
import { vi } from 'vitest';
import * as regionConfig from '../../config/region';

describe('HeritageMap', () => {
  // ... existing tests ...

  it('should use Gaza viewport when VITE_REGION=gaza', () => {
    vi.spyOn(regionConfig, 'getActiveRegionConfig').mockReturnValue({
      id: 'gaza',
      defaultViewport: 'gaza-overview',
      // ... other Gaza config
    });

    const { container } = render(<HeritageMap sites={mockSites} />);

    // Assert map centers on Gaza coordinates [31.42, 34.38]
    expect(container.querySelector('[data-testid="map-center"]')).toBeTruthy();
  });

  it('should use West Bank viewport when VITE_REGION=west-bank', () => {
    vi.spyOn(regionConfig, 'getActiveRegionConfig').mockReturnValue({
      id: 'west-bank',
      defaultViewport: 'west-bank-overview',
      // ... other West Bank config
    });

    const { container } = render(<HeritageMap sites={mockSites} />);

    // Assert map centers on West Bank coordinates [31.9, 35.2]
  });
});
```

**Implementation (20 min):**
- [ ] **File:** `src/components/Map/HeritageMap.tsx` (update)
```typescript
import { getActiveRegionConfig } from '../../config/region';
import { getViewport } from '../../config/mapViewport';

export function HeritageMap({ sites, ... }: HeritageMapProps) {
  const regionConfig = getActiveRegionConfig();
  const defaultViewport = getViewport(regionConfig.defaultViewport);

  if (!defaultViewport) {
    console.error(`Viewport '${regionConfig.defaultViewport}' not found`);
    // Fallback to Gaza
    return null;
  }

  // Use defaultViewport.center and defaultViewport.zoom instead of GAZA_CENTER
  // ... rest of component
}
```

**Verify:**
```bash
npm test src/components/Map/HeritageMap.test.tsx
```

---

#### **Task 2.2: Update Help Modals + Tests** (45 min)

**Test First (25 min):**
- [ ] **File:** `src/components/Help/DashboardHelpModal.test.tsx` (update)
```typescript
describe('DashboardHelpModal', () => {
  it('should show "Gaza" when VITE_REGION=gaza', () => {
    vi.spyOn(regionConfig, 'getActiveRegionConfig').mockReturnValue({
      displayName: 'Gaza',
      // ... other config
    });

    const { getByText } = render(<DashboardHelpModal />);
    expect(getByText(/sites in the Gaza/i)).toBeInTheDocument();
  });

  it('should show "West Bank" when VITE_REGION=west-bank', () => {
    vi.spyOn(regionConfig, 'getActiveRegionConfig').mockReturnValue({
      displayName: 'West Bank',
      // ... other config
    });

    const { getByText } = render(<DashboardHelpModal />);
    expect(getByText(/sites in the West Bank/i)).toBeInTheDocument();
  });
});
```

**Implementation (20 min):**
- [ ] **File:** `src/components/Help/DashboardHelpModal.tsx`
```typescript
import { getActiveRegionConfig } from '../../config/region';

export function DashboardHelpModal() {
  const regionConfig = getActiveRegionConfig();
  const t = useThemeClasses();

  return (
    <div className="p-6">
      <h2>How to Use Heritage Tracker</h2>

      <section>
        <h3>Overview</h3>
        <p>
          Heritage Tracker documents cultural heritage sites in the {regionConfig.displayName}.
          Explore the interactive map, timeline, and table to learn about these historically significant locations.
        </p>
      </section>

      {/* ... rest of component ... */}
    </div>
  );
}
```

- [ ] **File:** `src/components/Help/TimelineHelpModal.tsx` (similar updates)

**Verify:**
```bash
npm test src/components/Help/
```

---

#### **Task 2.3: Update Page Title + Tests** (30 min)

**Test First (15 min):**
- [ ] **File:** `src/main.test.tsx` (NEW)
```typescript
describe('Page Title', () => {
  it('should set title to "Gaza Strip Heritage Tracker" when VITE_REGION=gaza', () => {
    vi.stubEnv('VITE_REGION', 'gaza');
    // Import main (triggers title setting)
    import('./main');
    expect(document.title).toBe('Gaza Strip Heritage Tracker');
  });

  it('should set title to "West Bank Heritage Tracker" when VITE_REGION=west-bank', () => {
    vi.stubEnv('VITE_REGION', 'west-bank');
    // Import main (triggers title setting)
    import('./main');
    expect(document.title).toBe('West Bank Heritage Tracker');
  });
});
```

**Implementation (15 min):**
- [ ] **File:** `src/main.tsx`
```typescript
import { getActiveRegionConfig } from './config/region';

const regionConfig = getActiveRegionConfig();
document.title = `${regionConfig.label} Heritage Tracker`;

// ... rest of main.tsx
```

**Verify:**
```bash
npm test src/main.test.tsx
```

---

#### **Task 2.4: Abstract Remaining Gaza References** (45 min)

**Search and test-fix strategy:**

```bash
# Find all "Gaza" references in shared components
grep -r "Gaza" src/components/Map/
grep -r "Gaza" src/components/Timeline/
grep -r "Gaza" src/pages/DashboardPage.tsx
grep -r "Gaza" src/pages/Timeline.tsx
grep -r "Gaza" src/pages/DataPage.tsx
```

**For each file with Gaza references:**
1. Write test expecting dynamic region name
2. Update code to use `regionConfig.displayName`
3. Verify test passes

**Estimated files to update:** 3-5 files
**Time per file:** 10 min (5 min test + 5 min implementation)

**Verify:**
```bash
npm test -- --run
# Should have zero Gaza references in non-Palestine-specific pages
```

---

### **Phase 3: Data Layer** (1-2 hours)

#### **Task 3.1: Update API Layer + Tests** (45 min)

**Test First (25 min):**
- [ ] **File:** `src/api/sites.test.ts` (update)
```typescript
describe('getAllSites', () => {
  it('should load Gaza sites when VITE_REGION=gaza', async () => {
    vi.stubEnv('VITE_REGION', 'gaza');
    vi.stubEnv('VITE_USE_MOCK_API', 'true');

    const sites = await getAllSites();

    // Verify sites are from mockSites.ts
    expect(sites.length).toBe(70);
    expect(sites[0].id).toMatch(/^gaza-/);
  });

  it('should load West Bank sites when VITE_REGION=west-bank', async () => {
    vi.stubEnv('VITE_REGION', 'west-bank');
    vi.stubEnv('VITE_USE_MOCK_API', 'true');

    const sites = await getAllSites();

    // Verify sites are from mockSitesWestBank.ts
    expect(sites[0].id).toMatch(/^wb-/);
  });
});
```

**Implementation (20 min):**
- [ ] **File:** `src/api/sites.ts`
```typescript
import { getActiveRegionConfig } from '../config/region';
import { mockSites } from '../data/mockSites';
// import { mockSitesWestBank } from '../data/mockSitesWestBank'; // TODO: Create this

export async function getAllSites(): Promise<Site[]> {
  if (shouldUseMockData()) {
    const regionConfig = getActiveRegionConfig();

    // Load correct dataset based on region
    if (regionConfig.dataSource.mockFile === 'mockSitesWestBank') {
      // TODO: Return mockSitesWestBank when file is created
      return mockGetAllSites([]); // Empty for now
    }

    return mockGetAllSites(mockSites);
  }

  // Production: query Supabase with region filter
  // ... existing code
}
```

**Verify:**
```bash
npm test src/api/sites.test.ts
```

---

#### **Task 3.2: Create West Bank Mock Data** (1-2 hours)

**This is research-heavy, not code-heavy.**

**Test First (10 min):**
- [ ] **File:** `src/data/mockSitesWestBank.test.ts` (NEW)
```typescript
describe('West Bank Mock Sites', () => {
  it('should have valid site structure', () => {
    expect(mockSitesWestBank).toBeDefined();
    expect(Array.isArray(mockSitesWestBank)).toBe(true);

    mockSitesWestBank.forEach(site => {
      expect(site.id).toMatch(/^wb-/);
      expect(site.coordinates).toHaveLength(2);
      // Coordinates should be in West Bank bounds
      expect(site.coordinates[0]).toBeGreaterThan(31.3);
      expect(site.coordinates[0]).toBeLessThan(32.6);
      expect(site.coordinates[1]).toBeGreaterThan(34.8);
      expect(site.coordinates[1]).toBeLessThan(35.6);
    });
  });

  it('should have required UNESCO verification', () => {
    mockSitesWestBank.forEach(site => {
      expect(site.verifiedBy).toContain('UNESCO');
    });
  });
});
```

**Implementation (1-2 hours):**
- [ ] **File:** `src/data/mockSitesWestBank.ts` (NEW)
```typescript
import type { Site } from '../types';

/**
 * Mock West Bank heritage sites
 *
 * Research sources:
 * - UNESCO World Heritage List (Bethlehem, Hebron Old Town)
 * - Palestinian Ministry of Tourism
 * - ICOMOS reports
 */
export const mockSitesWestBank: Site[] = [
  {
    id: "wb-001",
    name: "Church of the Nativity",
    nameArabic: "كنيسة المهد",
    type: "church",
    yearBuilt: "327",
    coordinates: [31.7044, 35.2066], // Bethlehem
    status: "threatened",
    dateDestroyed: undefined,
    lastUpdated: "2025-01-15",
    description: "One of the oldest continuously operating churches in the world, built over the grotto believed to be Jesus's birthplace.",
    historicalSignificance: "UNESCO World Heritage Site. Major Christian pilgrimage destination.",
    culturalValue: "Represents 1,700 years of Christian heritage in Palestine.",
    verifiedBy: ["UNESCO", "ICOMOS"],
    sources: [
      {
        title: "Church of the Nativity - UNESCO",
        url: "https://whc.unesco.org/en/list/1433",
        date: "2012-06-29",
        organization: "UNESCO"
      }
    ],
    unescoListed: true,
    religiousSignificance: true,
  },

  {
    id: "wb-002",
    name: "Hebron Old Town",
    nameArabic: "البلدة القديمة في الخليل",
    type: "archaeological",
    yearBuilt: "BCE 1000",
    coordinates: [31.5326, 35.0998],
    status: "threatened",
    // ... rest of site data
  },

  // TODO: Add more West Bank sites based on research
  // Priority: UNESCO sites, major churches, archaeological sites
];
```

**Research checklist:**
- [ ] Church of the Nativity (Bethlehem) - UNESCO site
- [ ] Hebron Old Town - UNESCO site
- [ ] Rachel's Tomb
- [ ] Hisham's Palace (Jericho)
- [ ] Tell es-Sultan (Ancient Jericho)
- [ ] Sebastia archaeological site

**Verify:**
```bash
npm test src/data/mockSitesWestBank.test.ts
```

---

### **Final Integration Testing** (30 min)

#### **Task 4.1: End-to-End Manual QA**

**Gaza Region Test:**
```bash
# .env.development
VITE_REGION=gaza

npm run dev
```

**Checklist:**
- [ ] Map centers on Gaza Strip (31.42, 34.38)
- [ ] Page title: "Gaza Strip Heritage Tracker"
- [ ] Help modal says "sites in the Gaza"
- [ ] Loads 70 sites from mockSites.ts
- [ ] All site IDs start with "gaza-"

**West Bank Region Test:**
```bash
# .env.development
VITE_REGION=west-bank

npm run dev
```

**Checklist:**
- [ ] Map centers on West Bank (~31.9, 35.2)
- [ ] Page title: "West Bank Heritage Tracker"
- [ ] Help modal says "sites in the West Bank"
- [ ] Loads sites from mockSitesWestBank.ts
- [ ] All site IDs start with "wb-"

---

#### **Task 4.2: Automated Test Suite**

**Run full test suite:**
```bash
npm run lint
npm test -- --run
```

**Expected results:**
- ✅ All 1,396+ unit tests pass
- ✅ No ESLint errors
- ✅ New tests for region config pass
- ✅ Updated component tests pass

---

## Success Criteria

✅ **Environment Variable Works:**
```bash
VITE_REGION=gaza npm run dev      # Shows Gaza
VITE_REGION=west-bank npm run dev # Shows West Bank
```

✅ **Zero Hardcoded References:**
```bash
grep -r "Gaza" src/components/ --exclude="*.test.*" --exclude="About.tsx" --exclude="StatsDashboard.tsx"
# Should return 0 results in shared components
```

✅ **All Tests Pass:**
```bash
npm run lint && npm test -- --run
# 1,396+ tests passing
```

✅ **Documentation Updated:**
- [ ] README.md mentions `VITE_REGION`
- [ ] .env.example has `VITE_REGION` documented
- [ ] This implementation plan marked COMPLETE

---

## TDD Benefits for This Project

1. **Catch regressions early** - Existing 1,396 tests ensure we don't break Gaza support
2. **Confident refactoring** - Tests prove region abstraction works
3. **Clear requirements** - Tests document expected behavior
4. **Faster debugging** - Failed test pinpoints exact issue
5. **Better design** - Writing tests first forces cleaner interfaces

---

## File Change Summary

### New Files (6)
- `src/types/regionConfig.ts` - Region TypeScript types
- `src/types/regionConfig.test.ts` - Type tests
- `src/config/region.ts` - Region registry
- `src/config/region.test.ts` - Registry tests
- `src/data/mockSitesWestBank.ts` - West Bank site data
- `src/data/mockSitesWestBank.test.ts` - Data validation tests

### Modified Files (~10)
- `src/config/mapViewport.ts` - Add West Bank viewport
- `src/config/mapViewport.test.ts` - Add viewport tests
- `src/components/Map/HeritageMap.tsx` - Use region viewport
- `src/components/Map/HeritageMap.test.tsx` - Test region switching
- `src/components/Help/DashboardHelpModal.tsx` - Use region name
- `src/components/Help/DashboardHelpModal.test.tsx` - Test dynamic text
- `src/components/Help/TimelineHelpModal.tsx` - Use region name
- `src/main.tsx` - Dynamic page title
- `src/api/sites.ts` - Region-aware data loading
- `src/api/sites.test.ts` - Test data loading per region
- `.env.example` - Document VITE_REGION
- `.env.development` - Add VITE_REGION

### Test Coverage
- **New tests:** ~15 test files/updates
- **Existing tests:** 1,396 tests must still pass
- **TDD approach:** Write test → Run (fail) → Implement → Run (pass) → Refactor

---

**Total Time Estimate:** 7-11 hours
**Confidence Level:** Very High (TDD approach reduces risk, existing architecture supports it well)

---

## Quick Start Implementation Order

**Day 1 (3-4 hours) - Infrastructure:**
1. Task 1.1: Types + tests (45 min)
2. Task 1.2: Registry + tests (1.5 hours)
3. Task 1.3: Viewport + tests (30 min)
4. Task 1.4: Env vars (5 min)

**Day 2 (2-3 hours) - Components:**
5. Task 2.1: HeritageMap + tests (45 min)
6. Task 2.2: Help modals + tests (45 min)
7. Task 2.3: Page title + tests (30 min)
8. Task 2.4: Abstract Gaza refs (45 min)

**Day 3 (2-4 hours) - Data + QA:**
9. Task 3.1: API layer + tests (45 min)
10. Task 3.2: West Bank data + tests (1-2 hours)
11. Task 4.1: Manual QA (30 min)
12. Task 4.2: Full test suite (15 min)

**Result:** Gaza + West Bank support with zero code changes to switch!

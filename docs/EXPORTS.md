# Export Pattern Style Guide

**Last Updated:** November 12, 2025

---

## Standard: Named Exports

Heritage Tracker uses **named exports** exclusively across the entire codebase. This provides several benefits:

- **Better Tree-Shaking:** Bundlers can eliminate unused exports more effectively
- **Greppability:** Easy to search for `export function ComponentName` or `import { ComponentName }`
- **Refactoring Safety:** IDEs can reliably rename across files
- **Consistency:** Single pattern reduces cognitive load
- **Discoverability:** Clear what's being exported from a file

---

## Rules

### ✅ DO: Use Named Exports

```typescript
// Components
export function MyComponent() {
  return <div>Hello</div>;
}

// Hooks
export function useMyHook() {
  return useState(0);
}

// Utilities
export function myUtility(value: string): string {
  return value.toUpperCase();
}

// Types
export interface MyType {
  id: string;
  name: string;
}

export type MyUnion = 'option1' | 'option2';

// Constants
export const MY_CONSTANT = 42;
```

### ❌ DON'T: Use Default Exports

```typescript
// ❌ Avoid this pattern
export default function MyComponent() {
  return <div>Hello</div>;
}

// ❌ Avoid this pattern
function MyComponent() {
  return <div>Hello</div>;
}
export default MyComponent;
```

---

## Import Patterns

### Single Export

```typescript
// Export
export function Button() { ... }

// Import
import { Button } from './Button';
```

### Multiple Exports

```typescript
// Export
export function Button() { ... }
export function ButtonGroup() { ... }
export interface ButtonProps { ... }

// Import
import { Button, ButtonGroup, type ButtonProps } from './Button';
```

### Barrel Exports (index.ts)

Use barrel exports to simplify imports from directories:

```typescript
// src/components/Button/index.ts
export { Button } from './Button';
export { ButtonGroup } from './ButtonGroup';
export type { ButtonProps, ButtonGroupProps } from './types';

// Usage
import { Button, ButtonGroup, type ButtonProps } from '@/components/Button';
```

---

## Current Status

**Audit Date:** November 12, 2025

- **Total Files:** 730+ TypeScript/TSX files
- **Named Exports:** 100% (730+ files)
- **Default Exports:** 0% (0 files)
- **Compliance:** ✅ 100%

All components, hooks, utilities, types, and constants use named exports.

---

## Migration Guide

If you encounter a file with default export, convert it following these steps:

### 1. Update Export Declaration

```typescript
// Before
function MyComponent() { ... }
export default MyComponent;

// After
export function MyComponent() { ... }
```

### 2. Update All Imports

```typescript
// Before
import MyComponent from './MyComponent';

// After
import { MyComponent } from './MyComponent';
```

### 3. Update Tests

```typescript
// Before
import MyComponent from './MyComponent';

// After
import { MyComponent } from './MyComponent';
```

### 4. Verify with Grep

```bash
# Check for remaining default exports
grep -r "export default" src --include="*.ts" --include="*.tsx"

# Check for default imports (may have false positives from node_modules)
grep -r "import .* from" src --include="*.ts" --include="*.tsx"
```

---

## Enforcement

### Manual Audit

```bash
# Find any default exports (should return 0 results)
grep -r "export default" src --include="*.ts" --include="*.tsx"

# Count named exports (should be 700+)
grep -r "export function\|export const\|export interface\|export type" src \
  --include="*.ts" --include="*.tsx" | wc -l
```

### ESLint Rule (Future)

Consider adding ESLint rule to prevent default exports:

```javascript
// eslint.config.js
rules: {
  'import/no-default-export': 'error',
  'import/prefer-default-export': 'off',
}
```

---

## Rationale

### Why Named Exports?

1. **Better IDE Support**
   - Auto-import suggests exact names
   - Refactoring renames work correctly
   - Find references is accurate

2. **Consistency**
   - No confusion about when to use default vs named
   - One pattern across entire codebase
   - Easier onboarding for new developers

3. **Tree-Shaking**
   - Bundlers can eliminate unused exports more effectively
   - Smaller production bundles
   - Better performance

4. **Greppability**
   - `export function Button` is easy to search
   - No ambiguity about what's exported
   - Clear file structure

5. **Multiple Exports**
   - Files can easily export multiple items
   - No awkward "main export + named exports" pattern
   - Clearer API surface

### Why Not Default Exports?

1. **Import Name Inconsistency**
   ```typescript
   // Different developers may use different names
   import MyButton from './Button';  // ❌
   import Btn from './Button';       // ❌
   import UIButton from './Button';  // ❌
   ```

2. **Refactoring Difficulty**
   - Renaming component doesn't update imports
   - Have to manually find and replace

3. **Ambiguity**
   - What is the "main" export?
   - Mixing default + named exports is confusing

---

## Examples from Codebase

### Components

```typescript
// src/components/Button/Button.tsx
export function Button({ children, ...props }: ButtonProps) {
  return <button {...props}>{children}</button>;
}

// src/pages/Timeline.tsx
export function Timeline() {
  return <div>Timeline</div>;
}
```

### Hooks

```typescript
// src/hooks/useAppState.ts
export function useAppState() {
  const [state, setState] = useState(initialState);
  return { state, setState };
}

// src/hooks/useFilteredSites.ts
export function useFilteredSites(sites: Site[], filters: FilterState) {
  return useMemo(() => filterSites(sites, filters), [sites, filters]);
}
```

### Utilities

```typescript
// src/utils/formatters.ts
export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString();
}

export function normalizeYear(year: string): number {
  return year.startsWith('BCE') ? -parseInt(year.slice(4)) : parseInt(year);
}
```

### Constants

```typescript
// src/constants/layout.ts
export const BREAKPOINTS = {
  MOBILE: 768,
  TABLET: 1024,
  DESKTOP: 1280,
} as const;

export const Z_INDEX = {
  BASE: 0,
  DROPDOWN: 1000,
  MODAL: 2000,
} as const;
```

---

## FAQ

### Q: What about React lazy() which requires default exports?

**A:** Use a wrapper pattern:

```typescript
// Button.tsx - Use named export
export function Button() { ... }

// App.tsx - Wrap for lazy loading
const Button = lazy(() =>
  import('./Button').then(module => ({ default: module.Button }))
);
```

### Q: What about Next.js pages that require default exports?

**A:** Not applicable - this is a Vite/React project, not Next.js.

### Q: Can I use default exports for constants or types?

**A:** No, use named exports for consistency:

```typescript
// ✅ Good
export const API_URL = 'https://api.example.com';
export interface User { ... }

// ❌ Avoid
export default 'https://api.example.com';
export default interface User { ... }
```

---

## Related Documentation

- [TypeScript Handbook - Modules](https://www.typescriptlang.org/docs/handbook/modules.html)
- [MDN - Export](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/export)
- [Airbnb Style Guide - Modules](https://github.com/airbnb/javascript#modules)

---

**Maintained by:** Heritage Tracker Team
**Questions?** Open an issue or discussion on GitHub

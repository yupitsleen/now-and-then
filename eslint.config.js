import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  // .remember is the remember plugin's scratch space, not source we own.
  globalIgnores(['dist', 'coverage', '.remember']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      // Tailwind dark: modifiers don't work here — theming is via React context
      // (useTheme/useThemeClasses), not Tailwind's darkMode config.
      'no-restricted-syntax': [
        'error',
        {
          selector: 'JSXAttribute[name.name="className"] Literal[value=/\\bdark:/]',
          message: 'Tailwind dark: modifiers are not wired up. Use isDark from useTheme() or useThemeClasses() instead.',
        },
      ],
      // Enforce consistent z-index usage
      // NOTE: While ESLint doesn't have a built-in rule to detect inline z-index values,
      // all z-index values should use the Z_INDEX constant from src/constants/layout.ts
      // Valid: zIndex={Z_INDEX.MODAL}, style={{ zIndex: Z_INDEX.DROPDOWN }}
      // Invalid: zIndex={100}, style={{ zIndex: 9999 }}
      // Use grep to audit: grep -rn "zIndex.*[0-9]" src/ --include="*.tsx" --include="*.ts"
    },
  },
])

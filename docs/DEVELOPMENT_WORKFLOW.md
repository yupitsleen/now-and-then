```markdown
# Development Workflow

## Testing Requirements

- All new features require at least smoke tests
- Avoid brittle tests - keep them resilient to future changes
- All tests (new and existing) must pass before committing

## Commit Standards

- Use conventional commit messages: `feat:`, `fix:`, `refactor:`
- Only commit when ALL of the following are true:
  - **MVP is complete and working** (doesn't need to be the full feature - just a useful, working increment for the user)
  - Test coverage exists
  - All tests passing
  - Linter passes
  - Documentation updated
  - User confirms dev server shows no UI issues

## Pre-PR Checklist

- Must run a test production build before creating a PR
- User reviews the PR and prepares local environment for next work session

## Development Environment

- Dev server runs on port 5173 (user maintains this)
- User actively monitors local site during development
- Do not start/stop dev server

## Code Review Focus

- Only flag areas for improvement
- No positive commentary needed
- Apply these principles for scalability:
  - **DRY** - Don't Repeat Yourself
  - **KISS** - Keep It Simple, Stupid
  - **SOLID** - Especially focus on abstraction

## Code Standards

- **No hardcoded text** - All UI labels/functionality text must use i18n translations
- **Check for existing code** - Before creating components or abstractions, verify we don't already have similar code
- **Data source awareness** - `mockData.ts` is temporary; we'll migrate to backend API calls via our mock API layer

## Remember

User is always watching the running dev server - no need to prompt them to check unless something specific needs verification.
```

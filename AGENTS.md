# AGENTS.md
Guidance for coding agents operating in this repository.

## Repository Snapshot
- Project type: Create React App (CRA) frontend.
- Package manager: npm (`package-lock.json` exists).
- Main source folder: `src/`.
- Entry point: `src/index.js`.
- Root component: `src/App.js`.
- CI/CD: Azure Static Web Apps GitHub Actions workflow.
- Build output directory: `build/`.
- API folder: none configured (`api_location` is empty in workflow).

## Environment and Setup
1. Use Node.js LTS (Node 18+ recommended for `react-scripts@5`).
2. Install with `npm ci` in CI, `npm install` locally.
3. Run commands from repository root.
4. Do not commit generated build artifacts unless explicitly requested.

## Core Commands
### Install
- `npm install` - install dependencies for local development.
- `npm ci` - clean deterministic install (preferred in CI).

### Development
- `npm start` - start CRA dev server with hot reload.
- Default URL is usually `http://localhost:3000`.

### Build
- `npm run build` - create production build in `build/`.
- Treat build failures as blocking.
- In CI, warnings may be elevated depending on env vars.

### Test
- `npm test` - run tests in watch mode (`react-scripts test`).
- `npm test -- --watchAll=false` - run tests once (CI-friendly).
- `CI=true npm test -- --watchAll=false` - strict CI-style run.

### Single Test Execution (Important)
- Run one test file: `npm test -- src/App.test.js`
- Run one test file once: `npm test -- --watchAll=false src/App.test.js`
- Run tests by name: `npm test -- -t "renders app"`
- Run tests by path regex: `npm test -- --testPathPattern=App.test.js`

### Lint
- No dedicated `lint` script exists in `package.json` today.
- ESLint base config comes from CRA (`"extends": "react-app"`).
- Preferred lint command for agents: `npx eslint "src/**/*.{js,jsx}"`.
- If lint tooling is unavailable, use `npm run build` as minimum quality gate.

## CI/CD Notes
- Workflow: `.github/workflows/azure-static-web-apps-polite-smoke-0261a5b1e.yml`.
- Deploy job runs on pushes to `main` and active PR events.
- Static Web Apps action config:
  - `app_location: "/"`
  - `api_location: ""`
  - `output_location: "build"`
- Closed PR events trigger a job with `action: "close"`.

## Code Style Guidelines
### General Principles
- Keep code simple, explicit, and readable.
- Prefer small focused components and functions.
- Match existing patterns before introducing new ones.
- Avoid speculative abstractions in this small codebase.

### JavaScript and React
- Use modern ES syntax supported by CRA/Babel.
- Prefer function components.
- Keep components pure where practical.
- Use JSX for UI structure; move complex logic outside JSX.
- Export one primary component per file by default.

### Imports
- Order imports consistently:
  1. External packages (`react`, `react-dom`).
  2. Side-effect/style imports (`./index.css`).
  3. Local modules/components.
- Use relative imports within `src/` unless aliases are introduced.
- Remove unused imports; treat them as lint issues.

### Formatting
- Follow existing repository style:
  - Semicolons enabled.
  - Single quotes for strings.
  - 2-space indentation.
- Keep lines reasonably short (aim for <= 100 chars).
- Use trailing commas where formatter/linter expects them.
- Prefer Prettier defaults if formatting tooling is added.

### Types and Runtime Safety
- Codebase is JavaScript-only (no TypeScript currently).
- Validate assumptions at boundaries (props, payloads, env).
- Prefer guard clauses over deeply nested conditionals.
- If TypeScript is added, migrate incrementally and consistently.

### Naming Conventions
- Components: `PascalCase` (for example `UserCard`).
- Variables/functions: `camelCase`.
- Constants: `UPPER_SNAKE_CASE` for true constants only.
- File names:
  - Components: `PascalCase.js` (or current local convention).
  - Utilities/helpers: `camelCase.js` or `kebab-case.js` consistently.
- Test files: `*.test.js` colocated with source or under `src/`.

### Error Handling
- Fail fast on invalid input using guard clauses.
- Wrap async flows with `try/catch` and provide actionable messages.
- Do not swallow errors silently.
- Show clear, non-technical messages for user-facing errors.
- Log contextual details for developer diagnostics.

### State and Side Effects
- Keep state minimal and derived where possible.
- Avoid duplicating source-of-truth state.
- Put side effects in `useEffect` with correct dependencies.
- Clean up subscriptions/timers in effect cleanup callbacks.

### Testing Guidelines
- Prefer behavior-oriented tests over implementation details.
- Use React Testing Library patterns (`screen`, interactions).
- Keep tests deterministic and isolated.
- Avoid brittle assertions on internal structure.
- Add or update tests whenever behavior changes.

## Agent Workflow Expectations
- Inspect nearby files before editing to match local style.
- Make minimal, targeted changes.
- Run relevant checks after changes:
  - At minimum: `npm test -- --watchAll=false` for test-impacting edits.
  - For release-impacting edits: `npm run build`.
- If checks cannot run, state that clearly in handoff notes.
- Do not modify CI/CD secrets or deployment tokens.

## Rule Files (Cursor / Copilot)
- Checked `.cursor/rules/`: none found.
- Checked `.cursorrules`: none found.
- Checked `.github/copilot-instructions.md`: none found.
- If these files are added later, treat them as highest-priority local rules.

## Quick Command Reference
- Install: `npm ci`
- Dev server: `npm start`
- Build: `npm run build`
- Test watch: `npm test`
- Test once: `npm test -- --watchAll=false`
- Single test file: `npm test -- src/App.test.js`
- Single test name: `npm test -- -t "test name"`
- Lint (manual): `npx eslint "src/**/*.{js,jsx}"`

# Contributing to Hamster of Orion

Welcome to the Hamster of Orion engineering team! We operate as a AAA studio. To ensure code quality, maintain velocity, and prevent the "spaghetti code" that plagues many strategy games, all contributors must adhere strictly to these guidelines.

## 1. Golden Rules of Architecture
Before you write any code, you must understand our architecture pattern defined in `design/technical/ARCHITECTURE.md`.
* **RULE 1:** The `src/game/` directory is **strictly DOM-free**. You may not import `window`, `document`, React, or Canvas into this directory. It is pure math and data manipulation.
* **RULE 2:** The `src/ui/` directory is **strictly logic-free**. It should only read from the GameState and dispatch actions. It should not calculate whether a ship can fire; it merely displays the result.

## 2. Branching Strategy
We use a structured feature-branch workflow.
* `main` - Always deployable. Represents the current stable build.
* `develop` - The active integration branch.
* Branches must be named using the following prefixes:
  * `feature/[issue-number]-short-description` (e.g., `feature/105-ship-designer-ui`)
  * `bugfix/[issue-number]-short-description` (e.g., `bugfix/201-fix-save-corruption`)
  * `refactor/[issue-number]-short-description`
  * `docs/update-architecture`

## 3. Commit Message Conventions
We follow [Conventional Commits](https://www.conventionalcommits.org/). This allows us to auto-generate changelogs.
Format: `<type>(<scope>): <subject>`

Examples:
* `feat(combat): implement quadtree spatial indexing for weapon range`
* `fix(economy): resolve floating point error in population growth`
* `style(ui): update glassmorphism CSS variables in fleet screen`

Allowed types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`.

## 4. Code Quality & Testing
* **TypeScript Strict Mode:** We compile with `strict: true`. Do not use `any`. Use generics and interfaces as defined in `data-structures.md`.
* **Testing:** Any new logic in `src/game/` must be accompanied by a Vitest unit test. 
* **Linting:** Your code must pass `npm run lint` (ESLint + Prettier) before a PR can be merged. No warnings are permitted.

## 5. Pull Request Process
1. Push your branch to the remote repository.
2. Open a Pull Request targeting the `develop` branch.
3. You **must** fill out the Pull Request Template completely.
4. Your PR requires at least **1 approving review** from a senior engineer or lead.
5. All CI checks (Lint, Unit Tests, Build) must pass.
6. Merge using "Squash and Merge" to keep the history clean.

## 6. Where to get help
If you are blocked, drop a message in the `#engineering` Slack channel or consult the `design/` documentation folder. The design docs are the ultimate source of truth. If the code disagrees with the design docs, the code is wrong.

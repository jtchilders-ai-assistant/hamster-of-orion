# Current Task: scaffold

## Task ID: scaffold
## Name: Project scaffold
## Type: setup

## Description
Initialize Vite + TypeScript project with folder structure per ARCHITECTURE.md

## Expected Output
src/, package.json, vite.config.ts, tsconfig.json

## Acceptance Criteria
- npm install succeeds
- npm run dev starts server on localhost:5173
- src/game/ and src/ui/ folders exist
- Basic index.html loads

## Dependencies
None

## Notes
This is the first task — build the full directory structure as described in design/technical/ARCHITECTURE.md.
Create a minimal working Vite + TypeScript app with all required folders:
- src/game/ (pure TypeScript, no DOM)
- src/ui/ (DOM/Canvas rendering)
- src/data/ (static JSON)
- test/ (Vitest unit tests)

Set up package.json with scripts: dev, build, typecheck, test
Use Vitest for testing.

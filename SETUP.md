# Engineer Setup Guide

Welcome to the Hamster of Orion project! This guide will take you from a fresh OS install to a running dev environment in under 5 minutes.

## Prerequisites
Ensure your local machine has the following installed:
1. **Git**
2. **Node.js** (v20.x or higher)
3. **npm** (v10.x or higher)
4. A modern code editor (we strongly recommend **VS Code** with the following extensions):
   - ESLint
   - Prettier - Code formatter
   - TypeScript Vue Plugin (Volar) if we pivot to Vue, or just standard TS tools.

## Initial Setup

### 1. Clone the Repository
```bash
git clone https://github.com/your-studio/hamster-of-orion.git
cd hamster-of-orion
```

### 2. Install Dependencies
We use exact version locking to prevent "works on my machine" issues.
```bash
npm ci
```
*(Note: Use `npm ci`, NOT `npm install`. This ensures you install the exact dependencies listed in `package-lock.json`.)*

### 3. Start the Development Server
```bash
npm run dev
```
The Vite development server should start instantly.
Open your browser to: `http://localhost:5173`

## Development Scripts

We have configured several npm scripts for your daily workflow:

- `npm run dev`: Starts the local Vite development server with Hot Module Replacement (HMR).
- `npm run build`: Compiles the TypeScript and outputs the optimized production build to the `/dist` directory.
- `npm run preview`: Bootstraps a local web server serving the `/dist` directory so you can test the production build locally.
- `npm run lint`: Runs ESLint and Prettier over the codebase to catch styling and syntax issues.
- `npm run test`: Runs the Vitest unit test suite.
- `npm run test:ui`: Opens the Vitest UI in your browser for graphical test debugging.

## Debugging State

As outlined in `ARCHITECTURE.md`, the game is designed to decouple logic from the UI.
If you need to inject state for testing a UI component, you can use the global debug hook in your browser console:

```javascript
// Load a predefined mid-game state to test fleet UI
window.__HAMSTER_DEBUG__.loadState(window.__HAMSTER_FIXTURES__.midGameState);
```

## Next Steps
Now that you're running, read the `CONTRIBUTING.md` file to understand our Git flow, and check the Issue Tracker for your first assignment. Welcome to the team!

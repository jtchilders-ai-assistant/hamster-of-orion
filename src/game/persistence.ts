/**
 * Save/load persistence — pure TypeScript, NO DOM.
 * src/game/persistence.ts
 *
 * Provides localStorage-based save/load and JSON serialization helpers.
 * UI helpers (file download/upload) live in src/ui/persistence.ts.
 */

import { GameState } from './state';

export const SAVE_KEY = 'hamster-of-orion-save';

// ── Serialization ─────────────────────────────────────────────────────────────

/**
 * Serialize a GameState to a JSON string.
 * Returns a versioned envelope so future migrations can detect old saves.
 */
export function serializeState(state: GameState): string {
  const envelope: SaveEnvelope = {
    version: 1,
    savedAt: Date.now(),
    state,
  };
  return JSON.stringify(envelope);
}

/**
 * Deserialize a JSON string back to a GameState.
 * Returns null if the string is invalid, missing required fields, or from an
 * incompatible save version.
 */
export function deserializeState(json: string): GameState | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    return null;
  }

  if (!isSaveEnvelope(parsed)) {
    return null;
  }

  // Future: run migrations here based on parsed.version
  if (parsed.version !== 1) {
    return null;
  }

  return parsed.state;
}

// ── localStorage persistence ──────────────────────────────────────────────────

/**
 * Save the full GameState to localStorage.
 * Silently ignores write failures (e.g. private-browsing quota exceeded).
 */
export function saveGame(state: GameState): void {
  try {
    const json = serializeState(state);
    localStorage.setItem(SAVE_KEY, json);
  } catch {
    // Storage quota exceeded or unavailable — ignore
  }
}

/**
 * Load the GameState from localStorage.
 * Returns null if no save exists or if the stored data cannot be parsed.
 */
export function loadGame(): GameState | null {
  let json: string | null;
  try {
    json = localStorage.getItem(SAVE_KEY);
  } catch {
    return null;
  }

  if (json === null) {
    return null;
  }

  return deserializeState(json);
}

/**
 * Delete the save from localStorage.
 */
export function deleteSave(): void {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch {
    // Ignore
  }
}

/**
 * Return true when a save exists in localStorage (does not validate content).
 */
export function hasSave(): boolean {
  try {
    return localStorage.getItem(SAVE_KEY) !== null;
  } catch {
    return false;
  }
}

// ── Save envelope type ────────────────────────────────────────────────────────

export interface SaveEnvelope {
  version: number;
  savedAt: number;  // Unix timestamp ms
  state: GameState;
}

function isSaveEnvelope(value: unknown): value is SaveEnvelope {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  return (
    typeof obj['version'] === 'number' &&
    typeof obj['savedAt'] === 'number' &&
    typeof obj['state'] === 'object' &&
    obj['state'] !== null
  );
}

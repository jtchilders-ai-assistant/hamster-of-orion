/**
 * UI helpers for file-based save/load — DOM only, touches window/document.
 * src/ui/persistence.ts
 *
 * Wraps the pure game functions from src/game/persistence.ts with browser
 * file-download and file-upload mechanics.
 */

import { GameState } from '../game/state';
import { serializeState, deserializeState } from '../game/persistence';

// ── Export (download) ─────────────────────────────────────────────────────────

/**
 * Trigger a browser download of the current GameState as a JSON file.
 * @param state  The state to export.
 * @param filename  Desired file name (default: hamster-of-orion-save.json).
 */
export function exportSaveFile(
  state: GameState,
  filename = 'hamster-of-orion-save.json',
): void {
  const json = serializeState(state);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = 'none';

  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);

  // Release the object URL after a tick so the download can start
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ── Import (upload) ───────────────────────────────────────────────────────────

/**
 * Open a file-picker dialog and parse the selected JSON file into a GameState.
 *
 * @returns A Promise that resolves with the loaded GameState, or null if the
 *          user cancelled or the file could not be parsed.
 */
export function importSaveFile(): Promise<GameState | null> {
  return new Promise<GameState | null>((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    input.style.display = 'none';

    input.addEventListener('change', () => {
      const file = input.files?.[0];
      if (!file) {
        resolve(null);
        return;
      }

      const reader = new FileReader();

      reader.addEventListener('load', () => {
        const text = reader.result;
        if (typeof text !== 'string') {
          resolve(null);
          return;
        }
        resolve(deserializeState(text));
      });

      reader.addEventListener('error', () => resolve(null));

      reader.readAsText(file);
    });

    // If the user closes the picker without selecting, resolve null.
    // We listen on window focus once to detect cancel.
    const onWindowFocus = (): void => {
      window.removeEventListener('focus', onWindowFocus);
      // Give the change event a chance to fire first
      setTimeout(() => {
        if (!input.files || input.files.length === 0) {
          resolve(null);
        }
      }, 300);
    };
    window.addEventListener('focus', onWindowFocus);

    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
  });
}

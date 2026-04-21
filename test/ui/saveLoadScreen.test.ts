/**
 * Save/Load screen tests.
 * test/ui/saveLoadScreen.test.ts
 *
 * Tests the localStorage helper pattern used by SaveLoadScreen.
 * Uses vi.stubGlobal to mock localStorage (environment is 'node').
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// ── localStorage mock (same pattern as persistence.test.ts) ──────────────────

function makeLocalStorageMock(): Storage {
  const store: Record<string, string> = {};
  return {
    getItem:    vi.fn((key: string) => store[key] ?? null),
    setItem:    vi.fn((key: string, val: string) => { store[key] = val; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear:      vi.fn(() => { Object.keys(store).forEach(k => delete store[k]); }),
    key:        vi.fn((i: number) => Object.keys(store)[i] ?? null),
    get length() { return Object.keys(store).length; },
  } as unknown as Storage;
}

let mockStorage: Storage;

beforeEach(() => {
  mockStorage = makeLocalStorageMock();
  vi.stubGlobal('localStorage', mockStorage);
});

// ── Helpers that mirror SaveLoadScreen's internal functions ───────────────────

const PREFIX = 'hamster_';

function saveSlot(slot: string, data: unknown): void {
  try {
    localStorage.setItem(PREFIX + slot, JSON.stringify(data));
  } catch { /* ignore quota */ }
}

function loadSlot(slot: string): unknown {
  try {
    const raw = localStorage.getItem(PREFIX + slot);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function deleteSlot(slot: string): void {
  try { localStorage.removeItem(PREFIX + slot); } catch { /* ignore */ }
}

// ── Format date helper (mirrors SaveLoadScreen formatDate) ────────────────────

function formatDate(ts: number): string {
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    pad(d.getMonth() + 1) + '/' +
    pad(d.getDate())       + '/' +
    d.getFullYear()        + ' ' +
    pad(d.getHours())      + ':' +
    pad(d.getMinutes())
  );
}

// ── Tests: localStorage cycle ─────────────────────────────────────────────────

describe('SaveLoadScreen – localStorage helpers', () => {
  it('returns null for a slot that was never written', () => {
    expect(loadSlot('save_99')).toBeNull();
  });

  it('saves and retrieves data for save_1', () => {
    const data = { turn: 42, year: 2187, empire: 'Terran' };
    saveSlot('save_1', data);
    expect(loadSlot('save_1')).toEqual(data);
  });

  it('overwrites existing data in the same slot', () => {
    saveSlot('save_2', { turn: 1 });
    saveSlot('save_2', { turn: 100 });
    expect(loadSlot('save_2')).toEqual({ turn: 100 });
  });

  it('deletes a slot, making it return null', () => {
    saveSlot('save_3', { turn: 5 });
    expect(loadSlot('save_3')).not.toBeNull();
    deleteSlot('save_3');
    expect(loadSlot('save_3')).toBeNull();
  });

  it('deleting one slot does not affect another', () => {
    saveSlot('save_4', { turn: 10 });
    saveSlot('save_5', { turn: 20 });
    deleteSlot('save_5');
    expect(loadSlot('save_4')).toEqual({ turn: 10 });
    expect(loadSlot('save_5')).toBeNull();
  });

  it('round-trips all 10 numbered slots independently', () => {
    for (let i = 1; i <= 10; i++) {
      saveSlot('save_' + i, { turn: i * 10 });
    }
    for (let i = 1; i <= 10; i++) {
      const d = loadSlot('save_' + i) as Record<string, number>;
      expect(d['turn']).toBe(i * 10);
    }
  });

  it('autosave slot saves and loads correctly', () => {
    saveSlot('autosave', { turn: 7, year: 2192 });
    const loaded = loadSlot('autosave') as Record<string, unknown>;
    expect(loaded).not.toBeNull();
    expect(loaded['turn']).toBe(7);
    expect(loaded['year']).toBe(2192);
  });

  it('deleting autosave slot returns null', () => {
    saveSlot('autosave', { turn: 3 });
    deleteSlot('autosave');
    expect(loadSlot('autosave')).toBeNull();
  });

  it('stores a full save envelope with all required fields', () => {
    const envelope = {
      version: 1,
      savedAt: 1713654480000,
      turn: 42,
      year: 2187,
      empire: 'TestEmpire',
    };
    saveSlot('save_1', envelope);
    const loaded = loadSlot('save_1') as typeof envelope;
    expect(loaded['version']).toBe(1);
    expect(loaded['turn']).toBe(42);
    expect(loaded['year']).toBe(2187);
    expect(loaded['empire']).toBe('TestEmpire');
    expect(loaded['savedAt']).toBe(1713654480000);
  });

  it('keys are namespaced with hamster_ prefix', () => {
    saveSlot('save_1', { x: 1 });
    expect(mockStorage.setItem).toHaveBeenCalledWith('hamster_save_1', JSON.stringify({ x: 1 }));
  });

  it('autosave key is namespaced correctly', () => {
    saveSlot('autosave', { x: 2 });
    expect(mockStorage.setItem).toHaveBeenCalledWith('hamster_autosave', JSON.stringify({ x: 2 }));
  });
});

// ── Tests: formatDate ─────────────────────────────────────────────────────────

describe('SaveLoadScreen – formatDate', () => {
  it('formats a known timestamp correctly', () => {
    const ts = new Date(2026, 3, 21, 5, 48).getTime();
    expect(formatDate(ts)).toBe('04/21/2026 05:48');
  });

  it('pads single-digit minutes', () => {
    const ts = new Date(2026, 0, 1, 10, 5).getTime();
    expect(formatDate(ts)).toBe('01/01/2026 10:05');
  });

  it('pads single-digit hours', () => {
    const ts = new Date(2026, 0, 1, 9, 30).getTime();
    expect(formatDate(ts)).toBe('01/01/2026 09:30');
  });

  it('handles midnight', () => {
    const ts = new Date(2026, 6, 15, 0, 0).getTime();
    expect(formatDate(ts)).toBe('07/15/2026 00:00');
  });

  it('handles end of year', () => {
    const ts = new Date(2026, 11, 31, 23, 59).getTime();
    expect(formatDate(ts)).toBe('12/31/2026 23:59');
  });
});

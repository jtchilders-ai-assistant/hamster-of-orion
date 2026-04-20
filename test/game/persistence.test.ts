/**
 * Unit tests for src/game/persistence.ts
 * test/game/persistence.test.ts
 *
 * Uses Vitest's vi.stubGlobal to mock localStorage.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  serializeState,
  deserializeState,
  saveGame,
  loadGame,
  deleteSave,
  hasSave,
  SAVE_KEY,
  SaveEnvelope,
} from '../../src/game/persistence';
import { initialState } from '../../src/game/initialState';
import { GameState } from '../../src/game/state';

// ── localStorage mock ─────────────────────────────────────────────────────────

function makeLocalStorageMock(): Storage {
  const store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { Object.keys(store).forEach(k => delete store[k]); }),
    key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
    get length() { return Object.keys(store).length; },
  } as unknown as Storage;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const testState: GameState = {
  ...initialState,
  turn: 42,
};

// ── serializeState / deserializeState ─────────────────────────────────────────

describe('serializeState', () => {
  it('produces valid JSON', () => {
    const json = serializeState(testState);
    expect(() => JSON.parse(json)).not.toThrow();
  });

  it('wraps state in a versioned envelope', () => {
    const json = serializeState(testState);
    const envelope = JSON.parse(json) as SaveEnvelope;
    expect(envelope.version).toBe(1);
    expect(typeof envelope.savedAt).toBe('number');
    expect(envelope.state).toBeDefined();
    expect(envelope.state.turn).toBe(42);
  });

  it('records savedAt as a recent timestamp', () => {
    const before = Date.now();
    const json = serializeState(testState);
    const after = Date.now();
    const { savedAt } = JSON.parse(json) as SaveEnvelope;
    expect(savedAt).toBeGreaterThanOrEqual(before);
    expect(savedAt).toBeLessThanOrEqual(after);
  });
});

describe('deserializeState', () => {
  it('round-trips a GameState', () => {
    const json = serializeState(testState);
    const loaded = deserializeState(json);
    expect(loaded).not.toBeNull();
    expect(loaded!.turn).toBe(42);
  });

  it('returns null for empty string', () => {
    expect(deserializeState('')).toBeNull();
  });

  it('returns null for invalid JSON', () => {
    expect(deserializeState('not-json{')).toBeNull();
  });

  it('returns null when envelope is missing required fields', () => {
    expect(deserializeState(JSON.stringify({ foo: 'bar' }))).toBeNull();
  });

  it('returns null when version is not 1', () => {
    const envelope = { version: 99, savedAt: Date.now(), state: testState };
    expect(deserializeState(JSON.stringify(envelope))).toBeNull();
  });

  it('returns null for a raw state object (no envelope)', () => {
    // A raw GameState has no `version` field → fails the type guard
    expect(deserializeState(JSON.stringify(testState))).toBeNull();
  });
});

// ── saveGame / loadGame / deleteSave / hasSave ────────────────────────────────

describe('localStorage integration', () => {
  let lsMock: Storage;

  beforeEach(() => {
    lsMock = makeLocalStorageMock();
    vi.stubGlobal('localStorage', lsMock);
  });

  describe('saveGame', () => {
    it('writes serialized state to the correct key', () => {
      saveGame(testState);
      expect(lsMock.setItem).toHaveBeenCalledOnce();
      const [key, value] = (lsMock.setItem as ReturnType<typeof vi.fn>).mock.calls[0] as [string, string];
      expect(key).toBe(SAVE_KEY);
      const envelope = JSON.parse(value) as SaveEnvelope;
      expect(envelope.state.turn).toBe(42);
    });

    it('does not throw when localStorage throws (e.g. quota exceeded)', () => {
      (lsMock.setItem as ReturnType<typeof vi.fn>).mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });
      expect(() => saveGame(testState)).not.toThrow();
    });
  });

  describe('loadGame', () => {
    it('returns null when nothing is saved', () => {
      expect(loadGame()).toBeNull();
    });

    it('returns the saved state after saveGame', () => {
      saveGame(testState);
      const loaded = loadGame();
      expect(loaded).not.toBeNull();
      expect(loaded!.turn).toBe(42);
    });

    it('returns null for corrupt data in localStorage', () => {
      (lsMock.getItem as ReturnType<typeof vi.fn>).mockReturnValue('corrupted!!!');
      expect(loadGame()).toBeNull();
    });

    it('returns null when localStorage.getItem throws', () => {
      (lsMock.getItem as ReturnType<typeof vi.fn>).mockImplementation(() => {
        throw new Error('SecurityError');
      });
      expect(loadGame()).toBeNull();
    });
  });

  describe('deleteSave', () => {
    it('removes the save key', () => {
      saveGame(testState);
      deleteSave();
      expect(lsMock.removeItem).toHaveBeenCalledWith(SAVE_KEY);
      expect(loadGame()).toBeNull();
    });

    it('does not throw when localStorage throws', () => {
      (lsMock.removeItem as ReturnType<typeof vi.fn>).mockImplementation(() => {
        throw new Error('SecurityError');
      });
      expect(() => deleteSave()).not.toThrow();
    });
  });

  describe('hasSave', () => {
    it('returns false when nothing is saved', () => {
      expect(hasSave()).toBe(false);
    });

    it('returns true after saving', () => {
      saveGame(testState);
      expect(hasSave()).toBe(true);
    });

    it('returns false after deleting', () => {
      saveGame(testState);
      deleteSave();
      expect(hasSave()).toBe(false);
    });

    it('returns false when localStorage.getItem throws', () => {
      (lsMock.getItem as ReturnType<typeof vi.fn>).mockImplementation(() => {
        throw new Error('SecurityError');
      });
      expect(hasSave()).toBe(false);
    });
  });
});

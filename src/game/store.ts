/**
 * Redux-compatible state store — pure TypeScript, NO DOM.
 * src/game/store.ts
 */

export const SHOW_TURN_SUMMARY = 'SHOW_TURN_SUMMARY';

export interface Action {
  type: string;
  payload?: unknown;
}

type Listener<T> = (state: T) => void;
type Reducer<T> = (state: T, action: Action) => T;

export class Store<T> {
  private state: T;
  private listeners: Set<Listener<T>> = new Set();
  private readonly reducer: Reducer<T>;

  constructor(reducer: Reducer<T>, initialState: T) {
    this.reducer = reducer;
    this.state = initialState;
  }

  getState(): T {
    return this.state;
  }

  dispatch(action: Action): void {
    this.state = this.reducer(this.state, action);
    this.listeners.forEach((listener) => listener(this.state));
  }

  subscribe(listener: Listener<T>): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}

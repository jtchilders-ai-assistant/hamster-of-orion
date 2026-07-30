import { GameState, initialState } from './state';

export type Listener<T> = (state: T) => void;
export type Reducer<T> = (state: T, action: Action) => T;

export interface Action {
  type: string;
  payload?: any;
}

export class Store<T> {
  private state: T;
  private listeners: Set<Listener<T>> = new Set();
  private reducer: Reducer<T>;

  constructor(reducer: Reducer<T>, initial: T) {
    this.reducer = reducer;
    this.state = initial;
  }

  getState(): T {
    return this.state;
  }

  dispatch(action: Action): void {
    this.state = this.reducer(this.state, action);
    this.listeners.forEach(listener => listener(this.state));
  }

  subscribe(listener: Listener<T>): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}

// Stub reducer
const rootReducer: Reducer<GameState> = (state, action) => {
  switch (action.type) {
    case 'NEXT_TURN':
      return { ...state, turn: state.turn + 1 };
    default:
      return state;
  }
};

export const store = new Store<GameState>(rootReducer, initialState);

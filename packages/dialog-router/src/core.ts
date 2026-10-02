export type ViewMap = Record<string, unknown>;

export type ViewState<T extends ViewMap, K extends keyof T = keyof T> = {
  [P in K]: undefined extends T[P] ? { view: P; params?: T[P] } : { view: P; params: T[P] };
}[K];

export type StackEntry<T extends ViewMap, K extends keyof T = keyof T> = ViewState<T, K> & {
  key: string;
};

export type Snapshot<T extends ViewMap> = {
  current: StackEntry<T>;
  stack: StackEntry<T>[];
  length: number;
};

export type NavigationAction = 'push' | 'replace' | 'back' | 'backTo' | 'reset';

export type ViewArgs<T extends ViewMap, K extends keyof T> = T[K] extends undefined | void
  ? [view: K]
  : [view: K, params: T[K]];

export type RouterState<T extends ViewMap> = {
  /** Pristine seed descriptors — never mutated; used by no-arg `reset`. */
  initial: ViewState<T>[];
  stack: StackEntry<T>[];
};

export type RouterAction<T extends ViewMap> =
  | { type: 'push'; view: keyof T; params?: T[keyof T] }
  | { type: 'replace'; view: keyof T; params?: T[keyof T] }
  | { type: 'back' }
  | { type: 'backTo'; view: keyof T; params?: T[keyof T] }
  | { type: 'reset'; views?: ViewState<T>[] };

function createKey(): string {
  return crypto.randomUUID();
}

function toEntry<T extends ViewMap>(state: ViewState<T>): StackEntry<T> {
  return { ...state, key: createKey() } as StackEntry<T>;
}

function cloneViewState<T extends ViewMap>(state: ViewState<T>): ViewState<T> {
  return { ...state } as ViewState<T>;
}

export function createSnapshot<T extends ViewMap>(stack: StackEntry<T>[]): Snapshot<T> {
  return {
    current: stack[stack.length - 1],
    stack: [...stack],
    length: stack.length,
  };
}

export function createRouterState<T extends ViewMap>(initial: ViewState<T>[]): RouterState<T> {
  const seed = initial.map(cloneViewState);
  return {
    initial: seed,
    stack: seed.map(toEntry),
  };
}

/** Pure stack reducer. No-ops return the same state reference. */
export function routerReducer<T extends ViewMap>(
  state: RouterState<T>,
  action: RouterAction<T>,
): RouterState<T> {
  switch (action.type) {
    case 'push':
      return {
        ...state,
        stack: [
          ...state.stack,
          {
            view: action.view,
            params: action.params,
            key: createKey(),
          } as StackEntry<T>,
        ],
      };

    case 'replace': {
      const stack = [...state.stack];
      const { key } = stack[stack.length - 1];
      stack[stack.length - 1] = {
        view: action.view,
        params: action.params,
        key,
      } as StackEntry<T>;
      return { ...state, stack };
    }

    case 'back': {
      if (state.stack.length <= 1) return state;
      return { ...state, stack: state.stack.slice(0, -1) };
    }

    case 'backTo': {
      const index = state.stack.findLastIndex((s) => s.view === action.view);
      if (index === -1 || index === state.stack.length - 1) return state;

      const stack = state.stack.slice(0, index + 1);
      if (action.params !== undefined) {
        const { key } = stack[index];
        stack[index] = {
          view: action.view,
          params: action.params,
          key,
        } as StackEntry<T>;
      }
      return { ...state, stack };
    }

    case 'reset': {
      const views = action.views ?? state.initial;
      return {
        ...state,
        stack: views.map(toEntry),
      };
    }
  }
}

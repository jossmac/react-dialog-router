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

export type NavigationEvent<T extends ViewMap> = {
  snapshot: Snapshot<T>;
  action: NavigationAction;
};

export type ViewArgs<T extends ViewMap, K extends keyof T> = T[K] extends undefined | void
  ? [view: K]
  : [view: K, params: T[K]];

/** Like ViewArgs, but params are optional — omit to keep the matched entry's params. */
export type BackToArgs<T extends ViewMap, K extends keyof T> = T[K] extends undefined | void
  ? [view: K]
  : [view: K, params?: T[K]];

function createKey(): string {
  return crypto.randomUUID();
}

function toEntry<T extends ViewMap>(state: ViewState<T>): StackEntry<T> {
  return { ...state, key: createKey() } as StackEntry<T>;
}

function cloneViewState<T extends ViewMap>(state: ViewState<T>): ViewState<T> {
  return { ...state } as ViewState<T>;
}

export class MemoryRouter<T extends ViewMap> {
  /** Pristine input descriptors — never mutated; used by no-arg `reset()`. */
  private readonly initial: ViewState<T>[];
  private stack: StackEntry<T>[];
  private listeners = new Set<(event: NavigationEvent<T>) => void>();
  private snapshot: Snapshot<T>;

  constructor(initial: ViewState<T>[]) {
    this.initial = initial.map(cloneViewState);
    this.stack = this.initial.map(toEntry);
    this.snapshot = this.createSnapshot();
  }

  private createSnapshot(): Snapshot<T> {
    return {
      current: this.stack[this.stack.length - 1],
      stack: [...this.stack],
      length: this.stack.length,
    };
  }

  private notify(action: NavigationAction) {
    this.snapshot = this.createSnapshot();
    const event: NavigationEvent<T> = { snapshot: this.snapshot, action };
    this.listeners.forEach((listener) => listener(event));
  }

  subscribe(listener: (event: NavigationEvent<T>) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  // Stable reference when unchanged — callers may rely on referential equality.
  getSnapshot(): Snapshot<T> {
    return this.snapshot;
  }

  navigate<K extends keyof T>(...args: ViewArgs<T, K>): void {
    const [view, params] = args;
    this.stack.push({ view, params, key: createKey() } as StackEntry<T>);
    this.notify('push');
  }

  replace<K extends keyof T>(...args: ViewArgs<T, K>): void {
    const [view, params] = args;
    const { key } = this.stack[this.stack.length - 1];
    this.stack[this.stack.length - 1] = { view, params, key } as StackEntry<T>;
    this.notify('replace');
  }

  back(): void {
    if (this.stack.length > 1) {
      this.stack.pop();
      this.notify('back');
    }
  }

  /** Pops back to the last matching target view; optionally replaces its params. */
  backTo<K extends keyof T>(...args: BackToArgs<T, K>): void {
    const [view, params] = args;
    const index = this.stack.findLastIndex((s) => s.view === view);
    if (index === -1 || index === this.stack.length - 1) return;

    this.stack = this.stack.slice(0, index + 1);
    if (params) {
      const { key } = this.stack[index];
      this.stack[index] = { view, params, key } as StackEntry<T>;
    }
    this.notify('backTo');
  }

  /** Restores the seed stack (fresh keys) or replaces the stack with the given views. */
  reset(...views: ViewState<T>[]): void {
    if (views.length === 0) {
      this.stack = this.initial.map(toEntry);
    } else {
      this.stack = views.map(toEntry);
    }
    this.notify('reset');
  }
}

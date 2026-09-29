import { isPlainObject } from '@jossmac/lil-libs/object';

export type ViewMap = Record<string, unknown>;

export type ViewState<T extends ViewMap, K extends keyof T = keyof T> = {
  view: K;
  params?: T[K];
};

export type Snapshot<T extends ViewMap> = {
  current: ViewState<T>;
  stack: ViewState<T>[];
  length: number;
};

export type ViewArgs<T extends ViewMap, K extends keyof T> = T[K] extends
  | undefined
  | void
  ? [view: K]
  : [view: K, params: T[K]];

export type NavigateOptions = {
  /**
   * When true, replace the current view in the stack instead of pushing a new one.
   * @default false
   */
  replace?: boolean;
  /**
   * When false, skip the view-transition wrapper for this call.
   * @default true
   */
  transition?: boolean;
};

export function isNavigateOptions(value: unknown): value is NavigateOptions {
  if (isPlainObject(value)) {
    return 'replace' in value || 'transition' in value;
  }
  return false;
}

const DEFAULT_NAVIGATE_OPTIONS: NavigateOptions = {
  replace: false,
  transition: true,
};

export class DialogMemoryRouter<T extends ViewMap> {
  private initialStack: ViewState<T>[];
  private stack: ViewState<T>[];
  private listeners = new Set<(snapshot: Snapshot<T>) => void>();
  private snapshot: Snapshot<T>;

  constructor(initial: ViewState<T>[]) {
    this.initialStack = [...initial];
    this.stack = this.initialStack;
    this.snapshot = this.createSnapshot();
  }

  private createSnapshot(): Snapshot<T> {
    return {
      current: this.stack[this.stack.length - 1],
      stack: [...this.stack],
      length: this.stack.length,
    };
  }

  private notify() {
    this.snapshot = this.createSnapshot();
    this.listeners.forEach((listener) => listener(this.snapshot));
  }

  subscribe(listener: (snapshot: Snapshot<T>) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  // Stable reference when unchanged — callers may rely on referential equality.
  getSnapshot(): Snapshot<T> {
    return this.snapshot;
  }

  navigate<K extends keyof T>(
    ...args: [...ViewArgs<T, K>, options?: NavigateOptions]
  ): void {
    const last = args[args.length - 1];
    const hasOptions = isNavigateOptions(last);

    const options = hasOptions ? last : DEFAULT_NAVIGATE_OPTIONS;
    const view = args[0] as K;
    const params = args[1] ?? undefined;

    const nextState = { view, params: params as T[K] };

    if (options.replace) {
      this.stack[this.stack.length - 1] = nextState;
    } else {
      this.stack.push(nextState);
    }

    this.notify();
  }

  back(): void {
    if (this.stack.length > 1) {
      this.stack.pop();
      this.notify();
    }
  }

  // Pops back to the first matching target view in the history stack
  backTo(targetView: keyof T): void {
    const index = this.stack.findLastIndex((s) => s.view === targetView);
    if (index !== -1 && index !== this.stack.length - 1) {
      this.stack = this.stack.slice(0, index + 1);
      this.notify();
    }
  }

  // Truncates back to the root or resets to a specified view state
  reset(...views: ViewState<T>[]): void {
    if (views.length === 0) {
      this.stack = this.initialStack;
    } else {
      this.stack = views;
    }
    this.notify();
  }
}

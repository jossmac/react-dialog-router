export type ViewMap = Record<string, unknown>;

export type ViewState<T extends ViewMap, K extends keyof T = keyof T> = {
  view: K;
  params: T[K];
};

export type DismissPolicy = 'allow' | 'block';
export type EscBehaviour = 'back' | 'dismiss' | null;

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
  replace?: boolean;
};

export class DialogMemoryRouter<T extends ViewMap> {
  private stack: ViewState<T>[];
  private initial: ViewState<T>;
  private listeners = new Set<() => void>();
  private onDismiss?: () => void;
  private snapshot: Snapshot<T>;

  constructor(initial: ViewState<T>, onDismiss?: () => void) {
    this.initial = initial;
    this.stack = [initial];
    this.onDismiss = onDismiss;
    this.snapshot = this.createSnapshot();
  }

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  // Must return a stable reference when unchanged — required by useSyncExternalStore.
  getSnapshot = (): Snapshot<T> => {
    return this.snapshot;
  };

  private createSnapshot = (): Snapshot<T> => {
    return {
      current: this.stack[this.stack.length - 1],
      stack: [...this.stack],
      length: this.stack.length,
    };
  };

  navigate = <K extends keyof T>(
    ...args: [...ViewArgs<T, K>, options?: NavigateOptions]
  ) => {
    const opts = args[args.length - 1] as NavigateOptions | undefined;
    const isOptionsObj = opts && typeof opts === 'object' && 'replace' in opts;

    const options = isOptionsObj ? opts : {};
    const view = args[0] as K;
    const params = isOptionsObj
      ? args.length === 3
        ? args[1]
        : undefined
      : args.length === 2
        ? args[1]
        : undefined;

    const nextState = { view, params: params as T[K] };

    if (options.replace) {
      this.stack[this.stack.length - 1] = nextState;
    } else {
      this.stack.push(nextState);
    }

    this.notify();
  };

  back = () => {
    if (this.stack.length > 1) {
      this.stack.pop();
      this.notify();
    }
  };

  // Truncates back to the root or resets to a specified view state
  reset = <K extends keyof T>(...args: ViewArgs<T, K> | []) => {
    if (args.length === 0) {
      this.stack = [this.initial];
    } else {
      const [view, params] = args as ViewArgs<T, K>;
      this.stack = [{ view, params: params as T[K] }];
    }
    this.notify();
  };

  // Pops back to the first matching target view in the history stack
  backTo = (targetView: keyof T) => {
    const index = this.stack.findLastIndex((s) => s.view === targetView);
    if (index !== -1 && index !== this.stack.length - 1) {
      this.stack = this.stack.slice(0, index + 1);
      this.notify();
    }
  };

  dismiss = () => {
    this.onDismiss?.();
  };

  private notify() {
    this.snapshot = this.createSnapshot();
    this.listeners.forEach((listener) => listener());
  }
}

import { useState, useCallback, startTransition, addTransitionType, useReducer } from 'react';
import type {
  ViewMap,
  ViewState,
  Snapshot,
  EscBehaviour,
  DismissPolicy,
  ViewArgs,
  NavigateOptions,
} from './dialogRouterCore';
import { DialogMemoryRouter, isNavigateOptions } from './dialogRouterCore';

const DEFAULT_VIEW_TRANSITIONS = {
  backwards: 'dialog-router-backwards',
  forwards: 'dialog-router-forwards',
};

export type ViewTransitionTypes = typeof DEFAULT_VIEW_TRANSITIONS;
export type ViewTransitionKeys = keyof ViewTransitionTypes;

export type DialogRouterOptions<T extends ViewMap> = {
  /**
   * The root view state. Seeds the stack and is restored by `reset()` with no args.
   */
  initial: ViewState<T>;
  /**
   * Called when the dialog should close — via `dismiss()` or `requestDismiss()`
   * when `dismissPolicy` is `'allow'`.
   */
  onDismiss?: () => void;
  /**
   * Whether the user can navigate back. A function is re-evaluated against the
   * current snapshot on each render.
   *
   * @default `snapshot.length > 1`
   */
  allowBack?: (snapshot: Snapshot<T>) => boolean;
  /**
   * Controls whether `requestDismiss()` may close the dialog.
   * - `'allow'` — `requestDismiss()` calls `onDismiss`
   * - `'block'` — `requestDismiss()` is a no-op
   *
   * Does not affect `dismiss()`, which always calls `onDismiss`.
   * A function is re-evaluated against the current snapshot on each render.
   *
   * @default `'allow'`
   */
  dismissPolicy?: (snapshot: Snapshot<T>) => DismissPolicy;
  /**
   * How Escape should be handled by the dialog host.
   * - `'back'` — pop the stack
   * - `'dismiss'` — close the dialog
   * - `null` — ignore Escape
   *
   * A function is re-evaluated against the current snapshot on each render.
   *
   * @default `'back'` when `canGoBack`, otherwise `'dismiss'`
   */
  escapeBehaviour?: (snapshot: Snapshot<T>) => EscBehaviour;
  /**
   * Wrap navigate/back/backTo in startTransition and tag them with transition
   * types for `<ViewTransition>`. Pass `false` to disable, or override the
   * type names.
   *
   * @default
   * { forwards: 'forwards', backwards: 'backwards' }
   */
  viewTransitions?: false | ViewTransitionTypes;
};

function resolveType(
  viewTransitions: false | ViewTransitionTypes = DEFAULT_VIEW_TRANSITIONS,
  direction: ViewTransitionKeys,
): string | null {
  if (viewTransitions === false) return null;

  return viewTransitions[direction];
}

export function useDialogRouter<T extends ViewMap>(options: DialogRouterOptions<T>) {
  const { onDismiss, viewTransitions } = options;
  const forwardType = resolveType(viewTransitions, 'forwards');
  const backwardType = resolveType(viewTransitions, 'backwards');

  const [router] = useState(() => new DialogMemoryRouter<T>(options.initial));
  // React state (not useSyncExternalStore): ViewTransition only activates for
  // updates scheduled inside startTransition. Store subscriptions are urgent
  // and bypass that.
  const [snapshot, setSnapshot] = useReducer(() => router.getSnapshot(), router.getSnapshot());

  const commit = useCallback((action: () => void) => {
    action();
    setSnapshot();
  }, []);

  const commitTransition = useCallback((type: string, action: () => void) => {
    startTransition(() => {
      addTransitionType(type);
      action();
    });
  }, []);

  const canGoBack = options.allowBack?.(snapshot) ?? snapshot.length > 1;
  const dismissPolicy = options.dismissPolicy?.(snapshot) ?? 'allow';
  const escapeAction = options.escapeBehaviour?.(snapshot) ?? (canGoBack ? 'back' : 'dismiss');

  const navigate = useCallback(
    <K extends keyof T>(...args: [...ViewArgs<T, K>, options?: NavigateOptions]) => {
      const last = args[args.length - 1];
      const navOpts = isNavigateOptions(last) ? last : undefined;
      const skipTransition = forwardType == null || navOpts?.transition === false;

      const run = () => commit(() => router.navigate(...args));
      if (skipTransition) {
        run();
      } else {
        commitTransition(forwardType, run);
      }
    },
    [router, forwardType, commit, commitTransition],
  );

  const back = useCallback(() => {
    const run = () => commit(() => router.back());
    if (backwardType == null) {
      run();
    } else {
      commitTransition(backwardType, run);
    }
  }, [router, backwardType, commit, commitTransition]);

  const backTo = useCallback(
    (targetView: keyof T) => {
      const run = () => commit(() => router.backTo(targetView));
      if (backwardType == null) {
        run();
      } else {
        commitTransition(backwardType, run);
      }
    },
    [router, backwardType, commit, commitTransition],
  );

  const reset = useCallback(
    <K extends keyof T>(...args: ViewArgs<T, K> | []) => {
      // No navigation type — open/reset shouldn't slide like push/pop.
      commit(() => router.reset(...args));
    },
    [router, commit],
  );

  const dismiss = useCallback(() => {
    onDismiss?.();
  }, [onDismiss]);

  // Safe exit guard: checks dismissPolicy before calling dismiss()
  const requestDismiss = useCallback(() => {
    if (dismissPolicy === 'allow') {
      onDismiss?.();
    }
  }, [dismissPolicy, onDismiss]);

  return {
    current: snapshot.current,
    stack: snapshot.stack,
    canGoBack,
    dismissPolicy,
    escapeAction,
    navigate,
    back,
    backTo,
    reset,
    dismiss,
    requestDismiss,
  };
}

'use client';

import {
  addTransitionType,
  startTransition,
  useCallback,
  useEffect,
  useReducer,
  useState,
} from 'react';
import type {
  NavigateOptions,
  Snapshot,
  ViewArgs,
  ViewMap,
  ViewState,
} from './core';
import { DialogMemoryRouter, isNavigateOptions } from './core';

const DEFAULT_VIEW_TRANSITIONS = {
  backwards: 'dialog-router-backwards',
  forwards: 'dialog-router-forwards',
};

export type EscapeBehavior = 'back' | 'dismiss' | null;

export type ViewTransitionTypes = typeof DEFAULT_VIEW_TRANSITIONS;
export type ViewTransitionKeys = keyof ViewTransitionTypes;

export type DialogRouterOptions<T extends ViewMap> = {
  /**
   * The root view state. Seeds the stack and is restored by `reset()` with no args.
   */
  initial: ViewState<T>;
  /**
   * Whether the user can navigate back. A function is re-evaluated against the
   * current snapshot on each render.
   *
   * @default `snapshot.length > 1`
   */
  allowBack?: (snapshot: Snapshot<T>) => boolean;
  /**
   * How pressing Escape should be handled.
   * - `'back'` — pop the stack (handled by this hook)
   * - `'dismiss'` — close the dialog (consumer responsibility)
   * - `null` — ignore Escape
   *
   * A function is re-evaluated against the current snapshot on each render.
   *
   * @default `'back'` when `isBackAllowed`, otherwise `'dismiss'`
   */
  escapeBehavior?: (snapshot: Snapshot<T>) => EscapeBehavior;
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

export type DialogRouterResult<T extends ViewMap> = ReturnType<
  typeof useDialogRouter<T>
>;

export function useDialogRouter<T extends ViewMap>(
  options: DialogRouterOptions<T>,
) {
  const { viewTransitions } = options;
  const forwardType = resolveType(viewTransitions, 'forwards');
  const backwardType = resolveType(viewTransitions, 'backwards');

  const [router] = useState(() => new DialogMemoryRouter<T>(options.initial));

  // React state (not useSyncExternalStore): ViewTransition only activates for
  // updates scheduled inside startTransition. Store subscriptions are urgent
  // and bypass that.
  const [snapshot, setSnapshot] = useReducer(
    () => router.getSnapshot(),
    router.getSnapshot(),
  );

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

  const isBackAllowed = options.allowBack?.(snapshot) ?? snapshot.length > 1;
  const escapeAction =
    options.escapeBehavior?.(snapshot) ?? (isBackAllowed ? 'back' : 'dismiss');

  const navigate = useCallback(
    <K extends keyof T>(
      ...args: [...ViewArgs<T, K>, options?: NavigateOptions]
    ) => {
      const last = args[args.length - 1];
      const navOpts = isNavigateOptions(last) ? last : undefined;
      const skipTransition =
        forwardType == null || navOpts?.transition === false;

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

  const subscribe = useCallback(
    (listener: (snapshot: Snapshot<T>) => void) => router.subscribe(listener),
    [router],
  );

  // Enact escapeAction === 'back'. Dismiss remains the dialog host's job.
  useEffect(() => {
    if (escapeAction !== 'back') return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      event.stopPropagation();
      back();
    };

    document.addEventListener('keydown', onKeyDown, true);
    return () => document.removeEventListener('keydown', onKeyDown, true);
  }, [escapeAction, back]);

  return {
    snapshot,
    isBackAllowed,
    escapeAction,
    navigate,
    back,
    backTo,
    reset,
    subscribe,
  };
}

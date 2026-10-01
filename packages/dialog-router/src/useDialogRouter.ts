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
  BackToArgs,
  NavigationAction,
  NavigationEvent,
  Snapshot,
  ViewArgs,
  ViewMap,
  ViewState,
} from './core';
import { MemoryRouter } from './core';

const DEFAULT_VIEW_TRANSITIONS: Record<NavigationAction, string | false> = {
  back: 'dialog-router-backwards',
  backTo: 'dialog-router-backwards',
  push: 'dialog-router-forwards',
  replace: false,
  reset: false,
};

export type EscapeKeyBehavior = 'back' | 'dismiss' | null;

export type ViewTransitionTypes = typeof DEFAULT_VIEW_TRANSITIONS;

export type DialogRouterOptions<T extends ViewMap> = {
  /**
   * The initial view states. Seeds the stack and can be restored by calling `reset`
   * without arguments.
   */
  initial: ViewState<T>[];
  /**
   * Whether the user can navigate back. A function is re-evaluated against the
   * current snapshot on each render.
   *
   * @default (snapshot) => snapshot.stack.length > 1
   */
  allowBack?: (snapshot: Snapshot<T>) => boolean;
  /**
   * How `<Escape>` press should be handled:
   * - `'back'` — pop the stack (handled by this hook)
   * - `'dismiss'` — close the dialog (consumer responsibility)
   * - `null` — ignore Escape
   *
   * @default (snapshot) => allowBack(snapshot) ? 'back' : 'dismiss'
   */
  escapeBehavior?: (snapshot: Snapshot<T>) => EscapeKeyBehavior;
  /**
   * Wrap navigate/replace/back/backTo in startTransition and tag them with
   * transition types for `<ViewTransition>`. Pass `false` to disable, or
   * override the type names.
   *
   * @see https://react.dev/reference/react/ViewTransition
   *
   * @default
   * { forwards: 'forwards', backwards: 'backwards' }
   */
  viewTransitions?: false | ViewTransitionTypes;
};

function resolveType(
  viewTransitions: false | ViewTransitionTypes = DEFAULT_VIEW_TRANSITIONS,
  action: NavigationAction,
): string | false {
  if (viewTransitions === false) return false;

  return viewTransitions[action];
}

export type DialogRouterState<T extends ViewMap> = ReturnType<typeof useDialogRouter<T>>;

export function useDialogRouter<T extends ViewMap>(options: DialogRouterOptions<T>) {
  const { viewTransitions = DEFAULT_VIEW_TRANSITIONS } = options;

  const [router] = useState(() => new MemoryRouter<T>(options.initial));

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

  const isBackAllowed = options.allowBack?.(snapshot) ?? snapshot.length > 1;
  const escapeAction = options.escapeBehavior?.(snapshot) ?? (isBackAllowed ? 'back' : 'dismiss');

  const navigate = useCallback(
    <K extends keyof T>(...args: ViewArgs<T, K>) => {
      const run = () => commit(() => router.navigate(...args));
      const transitionType = resolveType(viewTransitions, 'push');
      if (transitionType) {
        commitTransition(transitionType, run);
      } else {
        run();
      }
    },
    [router, viewTransitions, commit, commitTransition],
  );

  const replace = useCallback(
    <K extends keyof T>(...args: ViewArgs<T, K>) => {
      const run = () => commit(() => router.replace(...args));
      const transitionType = resolveType(viewTransitions, 'replace');
      if (transitionType) {
        commitTransition(transitionType, run);
      } else {
        run();
      }
    },
    [router, viewTransitions, commit, commitTransition],
  );

  const back = useCallback(() => {
    const run = () => commit(() => router.back());
    const transitionType = resolveType(viewTransitions, 'back');
    if (transitionType) {
      commitTransition(transitionType, run);
    } else {
      run();
    }
  }, [router, viewTransitions, commit, commitTransition]);

  const backTo = useCallback(
    <K extends keyof T>(...args: BackToArgs<T, K>) => {
      const run = () => commit(() => router.backTo(...args));
      const transitionType = resolveType(viewTransitions, 'backTo');
      if (transitionType) {
        commitTransition(transitionType, run);
      } else {
        run();
      }
    },
    [router, viewTransitions, commit, commitTransition],
  );

  const reset = useCallback(
    (...views: ViewState<T>[]): void => {
      // No navigation type — open/reset shouldn't slide like push/pop.
      commit(() => router.reset(...views));
    },
    [router, commit],
  );

  const subscribe = useCallback(
    (listener: (event: NavigationEvent<T>) => void) => router.subscribe(listener),
    [router],
  );

  // Enact escapeAction === 'back'. Dismiss remains the dialog host's job.
  useEffect(() => {
    if (escapeAction !== 'back') return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.key !== 'Escape') return;

      event.preventDefault();
      event.stopPropagation();
      back();
    };

    document.addEventListener('keydown', onKeyDown, true);
    return () => document.removeEventListener('keydown', onKeyDown, true);
  }, [escapeAction, back]);

  return {
    current: snapshot.current,
    stack: snapshot.stack,
    isBackAllowed,
    escapeAction,
    navigate,
    replace,
    back,
    backTo,
    reset,
    subscribe,
  };
}

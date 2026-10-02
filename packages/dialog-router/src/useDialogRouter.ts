'use client';

import { addTransitionType, startTransition, useCallback, useReducer } from 'react';
import type { NavigationAction, Snapshot, ViewArgs, ViewMap, ViewState } from './core';
import { createRouterState, createSnapshot, routerReducer } from './core';

const DEFAULT_VIEW_TRANSITIONS: Record<NavigationAction, string | false> = {
  back: 'dialog-router-backwards',
  backTo: 'dialog-router-backwards',
  push: 'dialog-router-forwards',
  replace: 'dialog-router-forwards',
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
   * @default (snapshot) => snapshot.length > 1
   */
  allowBack?: (snapshot: Snapshot<T>) => boolean;
  /**
   * How `<Escape>` press should be handled by the dialog host:
   * - `'back'` — pop the stack (`back()`)
   * - `'dismiss'` — close the dialog
   * - `null` — ignore Escape
   *
   * The host is responsible for enacting this policy.
   *
   * @default (snapshot) => allowBack(snapshot) ? 'back' : 'dismiss'
   */
  escapeBehavior?: (snapshot: Snapshot<T>) => EscapeKeyBehavior;
  /**
   * Wrap push/replace/back/backTo in startTransition and tag them with
   * transition types for `<ViewTransition>`. Pass `false` to disable, or
   * override the type names.
   *
   * @see https://react.dev/reference/react/ViewTransition
   *
   * @default
   * {
   *   back: 'dialog-router-backwards',
   *   backTo: 'dialog-router-backwards',
   *   push: 'dialog-router-forwards',
   *   replace: 'dialog-router-forwards',
   *   reset: false,
   * }
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

  const [state, dispatch] = useReducer(routerReducer<T>, options.initial, createRouterState);
  const snapshot = createSnapshot(state.stack);

  const commit = useCallback(
    (action: Parameters<typeof dispatch>[0], transitionAction: NavigationAction) => {
      const transitionType = resolveType(viewTransitions, transitionAction);
      if (transitionType) {
        startTransition(() => {
          addTransitionType(transitionType);
          dispatch(action);
        });
      } else {
        dispatch(action);
      }
    },
    [viewTransitions],
  );

  const canGoBack = options.allowBack?.(snapshot) ?? snapshot.length > 1;
  const escapeAction = options.escapeBehavior?.(snapshot) ?? (canGoBack ? 'back' : 'dismiss');

  const push = useCallback(
    <K extends keyof T>(...args: ViewArgs<T, K>) => {
      const [view, params] = args;
      commit({ type: 'push', view, params }, 'push');
    },
    [commit],
  );

  const replace = useCallback(
    <K extends keyof T>(...args: ViewArgs<T, K>) => {
      const [view, params] = args;
      commit({ type: 'replace', view, params }, 'replace');
    },
    [commit],
  );

  const back = useCallback(() => {
    commit({ type: 'back' }, 'back');
  }, [commit]);

  const backTo = useCallback(
    <K extends keyof T>(...args: ViewArgs<T, K>) => {
      const [view, params] = args;
      commit({ type: 'backTo', view, params }, 'backTo');
    },
    [commit],
  );

  const reset = useCallback((...views: ViewState<T>[]): void => {
    // No navigation type — open/reset shouldn't slide like push/pop.
    dispatch({ type: 'reset', views: views.length > 0 ? views : undefined });
  }, []);

  return {
    current: snapshot.current,
    stack: snapshot.stack,
    canGoBack,
    escapeAction,
    push,
    replace,
    back,
    backTo,
    reset,
  };
}

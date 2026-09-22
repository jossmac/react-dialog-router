import { useState, useSyncExternalStore, useCallback } from 'react';
import type {
  ViewMap,
  ViewState,
  Snapshot,
  EscBehaviour,
  DismissPolicy,
  ViewArgs,
  NavigateOptions,
} from './dialogRouterCore';
import { DialogMemoryRouter } from './dialogRouterCore';

export type DialogRouterOptions<T extends ViewMap> = {
  initial: ViewState<T>;
  onDismiss?: () => void;
  allowBack?: boolean | ((snapshot: Snapshot<T>) => boolean);
  dismissPolicy?: DismissPolicy | ((snapshot: Snapshot<T>) => DismissPolicy);
  escapeBehaviour?: EscBehaviour | ((snapshot: Snapshot<T>) => EscBehaviour);
};

export function useDialogRouter<T extends ViewMap>(options: DialogRouterOptions<T>) {
  const { onDismiss } = options;

  const [router] = useState(() => new DialogMemoryRouter<T>(options.initial));

  const snapshot = useSyncExternalStore(router.subscribe, router.getSnapshot, router.getSnapshot);

  const canGoBack =
    typeof options.allowBack === 'function'
      ? options.allowBack(snapshot)
      : (options.allowBack ?? snapshot.length > 1);

  const dismissPolicy =
    typeof options.dismissPolicy === 'function'
      ? options.dismissPolicy(snapshot)
      : (options.dismissPolicy ?? 'allow');

  const escapeAction =
    typeof options.escapeBehaviour === 'function'
      ? options.escapeBehaviour(snapshot)
      : (options.escapeBehaviour ?? (canGoBack ? 'back' : 'dismiss'));

  const navigate = useCallback(
    <K extends keyof T>(...args: [...ViewArgs<T, K>, options?: NavigateOptions]) => {
      router.navigate(...args);
    },
    [router],
  );

  const back = useCallback(() => {
    router.back();
  }, [router]);

  const backTo = useCallback(
    (targetView: keyof T) => {
      router.backTo(targetView);
    },
    [router],
  );

  const reset = useCallback(
    <K extends keyof T>(...args: ViewArgs<T, K> | []) => {
      router.reset(...args);
    },
    [router],
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

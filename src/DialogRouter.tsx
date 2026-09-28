import { resolveMaybeFn } from '@jossmac/lil-libs/function';
import type { HTMLAttributes, ReactNode, Ref } from 'react';
import { createContext, use, useEffect, useRef } from 'react';

import { useDialogRouter } from './useDialogRouter';
import type { DialogRouterResult, DialogRouterOptions } from './useDialogRouter';
import type { ViewMap } from './dialogRouterCore';
import { mergeRefs } from './mergeRefs';

export const DialogRouterContext = createContext<DialogRouterResult<any> | null>(null);

export function DialogRouter<T extends ViewMap>(
  props: DialogRouterOptions<T> & {
    children: ReactNode | ((renderProps: DialogRouterResult<T>) => ReactNode);
  },
) {
  const { children, ...options } = props;
  const routeContext = useDialogRouter<T>(options);

  return (
    <DialogRouterContext value={routeContext as any}>
      {resolveMaybeFn(children, routeContext)}
    </DialogRouterContext>
  );
}

export function DialogRouterView(
  props: { ref?: Ref<HTMLDivElement> } & HTMLAttributes<HTMLDivElement>,
) {
  const { ref, ...otherProps } = props;

  const hasNavigated = useRef(false);
  const hasWarned = useRef(false);
  const localRef = useRef<HTMLDivElement>(null);
  const { stack } = use(DialogRouterContext)!;

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' && !hasWarned.current && localRef.current) {
      const element = localRef.current;
      const hasAriaLabel = element.hasAttribute('aria-label');
      const hasAriaLabelledby = element.hasAttribute('aria-labelledby');
      if (!hasAriaLabel && !hasAriaLabelledby) {
        console.warn(
          'A router view must have an aria-label or aria-labelledby prop for accessibility.',
        );
        hasWarned.current = true;
      }
    }
  });

  useEffect(() => {
    console.log(stack.length, hasNavigated.current);
    if (localRef.current && (stack.length > 1 || hasNavigated.current)) {
      localRef.current.focus();
      hasNavigated.current = true;
    }
  }, [stack]);

  return (
    <div role="region" ref={mergeRefs(localRef, ref)} tabIndex={-1} {...otherProps}>
      {props.children}
    </div>
  );
}

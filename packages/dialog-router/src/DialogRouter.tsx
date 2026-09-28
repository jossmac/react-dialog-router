'use client';

import { resolveMaybeFn } from '@jossmac/lil-libs/function';
import type { ReactNode } from 'react';
import { DialogRouterContext } from './context';

import { useDialogRouter } from './useDialogRouter';
import type {
  DialogRouterResult,
  DialogRouterOptions,
} from './useDialogRouter';
import type { ViewMap } from './core';

export type DialogRouterProps<T extends ViewMap> = DialogRouterOptions<T> & {
  children: ReactNode | ((renderProps: DialogRouterResult<T>) => ReactNode);
};

export function DialogRouter<T extends ViewMap>(props: DialogRouterProps<T>) {
  const { children, ...options } = props;
  const routeContext = useDialogRouter<T>(options);

  return (
    <DialogRouterContext value={routeContext as any}>
      {resolveMaybeFn(children, routeContext)}
    </DialogRouterContext>
  );
}

'use client';

import { createContext } from 'react';

import type { DialogRouterState } from './useDialogRouter';

export const DialogRouterContext = createContext<DialogRouterState<any> | null>(
  null,
);

export const hasNavigated = { value: false };

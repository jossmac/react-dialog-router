'use client';

import { createContext } from 'react';

import type { DialogRouterResult } from './useDialogRouter';

export const DialogRouterContext =
  createContext<DialogRouterResult<any> | null>(null);

export const hasNavigated = { value: false };

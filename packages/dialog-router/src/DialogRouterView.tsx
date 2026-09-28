'use client';

import type { HTMLAttributes, Ref } from 'react';
import { use, useEffect, useRef } from 'react';

import { mergeRefs } from './mergeRefs';
import { DialogRouterContext } from './context';

export type DialogRouterViewProps = {
  ref?: Ref<HTMLDivElement>;
} & HTMLAttributes<HTMLDivElement>;

export function DialogRouterView(props: DialogRouterViewProps) {
  const { children, ref, ...otherProps } = props;

  const hasWarned = useRef(false);
  const localRef = useRef<HTMLDivElement>(null);
  const { snapshot } = use(DialogRouterContext)!;

  useEffect(function checkAriaProps() {
    if (
      process.env.NODE_ENV !== 'production' &&
      !hasWarned.current &&
      localRef.current
    ) {
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

  useEffect(function focusOnNavigated() {
    if (localRef.current && snapshot.stack.length > 1) {
      localRef.current.focus();
    }
  });

  return (
    <div
      role="region"
      ref={mergeRefs(localRef, ref)}
      tabIndex={-1}
      {...otherProps}
    >
      {children}
    </div>
  );
}

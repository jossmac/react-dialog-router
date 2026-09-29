'use client';

import type { CSSProperties, HTMLAttributes, Ref } from 'react';
import { use, useEffect, useId, useRef } from 'react';

import { mergeRefs } from './mergeRefs';
import { DialogRouterContext } from './context';
import { createPortal } from 'react-dom';

const DESICRIPTION_TEXT = {
  dismiss: 'Escape to dismiss.',
  back: 'Escape to go back.',
} as const;

const visuallyHiddenStyles: CSSProperties = {
  border: 0,
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: '1px',
  margin: '-1px',
  overflow: 'hidden',
  padding: 0,
  position: 'absolute',
  width: '1px',
  whiteSpace: 'nowrap',
};

export type DialogRouterViewProps = {
  ref?: Ref<HTMLDivElement>;
} & HTMLAttributes<HTMLDivElement>;

export function DialogRouterView(props: DialogRouterViewProps) {
  const { children, ref, ...otherProps } = props;

  const descriptionId = useId();
  const hasWarned = useRef(false);
  const localRef = useRef<HTMLDivElement>(null);
  const { stack, escapeAction } = use(DialogRouterContext)!;

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
    if (localRef.current && stack.length > 1) {
      requestAnimationFrame(() => {
        localRef.current?.focus({ preventScroll: true });
      });
    }
  });

  return (
    <div
      role="region"
      ref={mergeRefs(localRef, ref)}
      tabIndex={-1}
      aria-describedby={descriptionId}
      {...otherProps}
    >
      {children}
      {/* TODO: localize description text. */}
      {createPortal(
        <span id={descriptionId} style={visuallyHiddenStyles}>
          {DESICRIPTION_TEXT[escapeAction]}
        </span>,
        document.body,
      )}
    </div>
  );
}

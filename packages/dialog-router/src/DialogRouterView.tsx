'use client';

import type { CSSProperties, HTMLAttributes, Ref } from 'react';
import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';

import { mergeRefs } from './mergeRefs';
import type { EscapeKeyBehavior } from './useDialogRouter';

const DESCRIPTION_TEXT = {
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
  /** Current Escape policy from `useDialogRouter`. When `null`, no description is announced. */
  escapeAction: EscapeKeyBehavior;
  /** Focus this region after mount when true (typically `stack.length > 1`). */
  shouldFocus?: boolean;
} & HTMLAttributes<HTMLDivElement>;

export function DialogRouterView(props: DialogRouterViewProps) {
  const { children, ref, escapeAction, shouldFocus = false, ...otherProps } = props;

  const descriptionId = useId();
  const hasWarned = useRef(false);
  const localRef = useRef<HTMLDivElement>(null);
  const descriptionText = escapeAction != null ? DESCRIPTION_TEXT[escapeAction] : null;

  useEffect(function checkAriaProps() {
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

  useEffect(
    function focusOnNavigated() {
      if (!shouldFocus || !localRef.current) return;
      requestAnimationFrame(() => {
        localRef.current?.focus({ preventScroll: true });
      });
    },
    [shouldFocus],
  );

  return (
    <div
      role="region"
      ref={mergeRefs(localRef, ref)}
      tabIndex={-1}
      aria-describedby={descriptionText ? descriptionId : undefined}
      {...otherProps}
    >
      {children}
      {/* TODO: localize description text. */}
      {descriptionText
        ? createPortal(
            <span id={descriptionId} style={visuallyHiddenStyles}>
              {descriptionText}
            </span>,
            document.body,
          )
        : null}
    </div>
  );
}

import type { HTMLProps, ReactNode } from 'react';
import { useId, useRef } from 'react';
// import './NativeDialog.css';
import { Button } from './Button';

export type NativeDialogProps = HTMLProps<HTMLDialogElement> & {
  title?: ReactNode;
};

export function NativeDialog(props: NativeDialogProps) {
  const { title, children, className, ...otherProps } = props;
  const headingId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  return (
    <dialog
      {...otherProps}
      ref={dialogRef}
      aria-labelledby={headingId}
      className={['dialog-surface', className].filter(Boolean).join(' ')}
    >
      {title != null && (
        <h3 id={headingId} className="dialog-title">
          {title}
        </h3>
      )}
      <Button
        variant="secondary"
        onPress={() => dialogRef.current?.close()}
        aria-label="Close"
        className="dialog-close"
      >
        &times;
      </Button>
      {children}
    </dialog>
  );
}

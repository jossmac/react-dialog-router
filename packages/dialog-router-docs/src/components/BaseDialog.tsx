import type { ReactNode } from 'react';
import { Dialog } from '@base-ui/react/dialog';
import './BaseDialog.css';

export type BaseDialogProps = {
  title?: ReactNode;
  isDismissable?: boolean;
  children?: ReactNode;
  className?: string;
};

export function BaseDialog(props: BaseDialogProps) {
  const { title, isDismissable, children, className } = props;

  return (
    <Dialog.Portal>
      <Dialog.Backdrop className="base-dialog-backdrop" />
      <Dialog.Popup
        className={['dialog-surface', 'base-dialog-popup', className].filter(Boolean).join(' ')}
      >
        {title != null && <Dialog.Title className="dialog-title">{title}</Dialog.Title>}
        {isDismissable && (
          <Dialog.Close aria-label="Close" className="dialog-close button" data-variant="secondary">
            &times;
          </Dialog.Close>
        )}
        {children}
      </Dialog.Popup>
    </Dialog.Portal>
  );
}

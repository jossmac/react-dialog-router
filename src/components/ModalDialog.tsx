import type { ReactNode } from 'react';
import type { ModalOverlayProps } from 'react-aria-components/Modal';
import { Modal, ModalOverlay } from 'react-aria-components/Modal';
import type { DialogRenderProps } from 'react-aria-components/Dialog';
import { Dialog } from 'react-aria-components/Dialog';
import { Heading } from 'react-aria-components/Heading';
import './ModalDialog.css';

export type ModalDialogProps = Omit<ModalOverlayProps, 'children'> & {
  title?: ReactNode;
  children?: ReactNode | ((opts: DialogRenderProps) => ReactNode);
};

export function ModalDialog({ title, children, className, ...props }: ModalDialogProps) {
  return (
    <ModalOverlay
      {...props}
      className={['react-aria-ModalOverlay', className].filter(Boolean).join(' ')}
    >
      <Modal className="react-aria-Modal">
        <Dialog className="react-aria-Dialog">
          {typeof children === 'function' ? (
            (opts) => (
              <>
                {title != null && (
                  <Heading slot="title" className="modal-dialog-title">
                    {title}
                  </Heading>
                )}
                {children(opts)}
              </>
            )
          ) : (
            <>
              {title != null && (
                <Heading slot="title" className="modal-dialog-title">
                  {title}
                </Heading>
              )}
              {children}
            </>
          )}
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}

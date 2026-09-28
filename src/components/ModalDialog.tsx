import type { ReactNode } from 'react';
import type { ModalOverlayProps } from 'react-aria-components/Modal';
import { Modal, ModalOverlay } from 'react-aria-components/Modal';
import type { DialogRenderProps } from 'react-aria-components/Dialog';
import { Dialog } from 'react-aria-components/Dialog';
import { Heading } from 'react-aria-components/Heading';
import './ModalDialog.css';
import { composeRenderProps } from 'react-aria-components';
import { Button } from './Button';

export type ModalDialogProps = Omit<ModalOverlayProps, 'children'> & {
  title?: ReactNode;
  children?: ReactNode | ((opts: DialogRenderProps) => ReactNode);
};

export function ModalDialog(props: ModalDialogProps) {
  const { title, className, ...otherProps } = props;
  return (
    <ModalOverlay
      {...otherProps}
      className={['react-aria-ModalOverlay', className].filter(Boolean).join(' ')}
    >
      <Modal className="react-aria-Modal">
        <Dialog className="react-aria-Dialog">
          {composeRenderProps(props.children, (children) => (
            <>
              {title != null && (
                <Heading slot="title" className="modal-dialog-title">
                  {title}
                </Heading>
              )}
              {props.isDismissable && (
                <Button
                  variant="secondary"
                  slot="close"
                  aria-label="Close"
                  className="modal-dialog-close"
                >
                  &times;
                </Button>
              )}
              {children}
            </>
          ))}
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}

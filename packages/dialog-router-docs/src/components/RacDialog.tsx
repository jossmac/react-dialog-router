import type { ReactNode } from 'react';
import type { ModalOverlayProps } from 'react-aria-components/Modal';
import { Modal, ModalOverlay } from 'react-aria-components/Modal';
import type { DialogProps } from 'react-aria-components/Dialog';
import { Dialog } from 'react-aria-components/Dialog';
import { Heading } from 'react-aria-components/Heading';
import './RacDialog.css';
import { composeRenderProps } from 'react-aria-components';
import { Button } from './Button';

export type RacDialogProps = Omit<ModalOverlayProps, 'children' | 'className' | 'style'> &
  Pick<DialogProps, 'children' | 'className' | 'style'> & {
    title?: ReactNode;
  };

export function RacDialog(props: RacDialogProps) {
  const { title, className, style, ...otherProps } = props;
  return (
    <ModalOverlay {...otherProps} className="react-aria-ModalOverlay">
      <Modal className="dialog-surface react-aria-Modal">
        <Dialog
          className={['react-aria-Dialog', className].filter(Boolean).join(' ')}
          style={style}
        >
          {composeRenderProps(props.children, (children) => (
            <>
              {title != null && (
                <Heading slot="title" className="dialog-title">
                  {title}
                </Heading>
              )}
              {props.isDismissable && (
                <Button
                  variant="secondary"
                  slot="close"
                  aria-label="Close"
                  className="dialog-close"
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

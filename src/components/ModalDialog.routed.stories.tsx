import { ViewTransition, useCallback, useEffect, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Heading } from 'react-aria-components/Heading';
import { ModalDialog } from './ModalDialog';
import { Button } from './Button';
import { useDialogRouter } from '../useDialogRouter';

const meta = {
  title: 'ModalDialog/Routed',
  parameters: {
    layout: 'centered',
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithRoutedViews: Story = {
  render: () => <RoutedModalExample />,
};

type Views = {
  home: undefined;
  details: { itemId: string };
  confirm: { itemId: string };
};

function RoutedModalExample() {
  const [isOpen, setOpen] = useState(false);

  const { current, canGoBack, dismissPolicy, escapeAction, navigate, back, reset, requestDismiss } =
    useDialogRouter<Views>({
      initial: { view: 'home' },
      onDismiss: () => setOpen(false),
    });

  const open = useCallback(() => {
    reset();
    setOpen(true);
  }, [reset]);

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) {
        requestDismiss();
      } else {
        setOpen(true);
      }
    },
    [requestDismiss],
  );

  useEffect(() => {
    if (!isOpen || escapeAction !== 'back') return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      event.stopPropagation();
      back();
    };

    document.addEventListener('keydown', onKeyDown, true);
    return () => document.removeEventListener('keydown', onKeyDown, true);
  }, [isOpen, escapeAction, back]);

  return (
    <>
      <Button onPress={open}>Open</Button>
      <ModalDialog
        isOpen={isOpen}
        onOpenChange={handleOpenChange}
        isDismissable={dismissPolicy === 'allow'}
        isKeyboardDismissDisabled={escapeAction !== 'dismiss'}
      >
        {current.view === 'home' && (
          <DialogView>
            <Heading slot="title" className="modal-dialog-title">
              Settings
            </Heading>
            <p className="modal-dialog-body">
              Choose an item to review. Escape dismisses; navigating deeper changes Escape to go
              back.
            </p>
            <div className="modal-dialog-actions">
              <Button variant="secondary" onPress={() => requestDismiss()}>
                Close
              </Button>
              <Button onPress={() => navigate('details', { itemId: 'widget-42' })}>
                View details
              </Button>
            </div>
          </DialogView>
        )}
        {current.view === 'details' && (
          <DetailsView
            itemId={(current.params as Views['details']).itemId}
            canGoBack={canGoBack}
            onBack={back}
            onContinue={(itemId) => navigate('confirm', { itemId })}
          />
        )}
        {current.view === 'confirm' && (
          <ConfirmView
            itemId={(current.params as Views['confirm']).itemId}
            canGoBack={canGoBack}
            onBack={back}
            onDone={() => requestDismiss()}
          />
        )}
      </ModalDialog>
    </>
  );
}

function DialogView(props: { children: React.ReactNode }) {
  return (
    <ViewTransition name="dialog-view">
      <div className="modal-dialog-view" {...props} />
    </ViewTransition>
  );
}

function DetailsView({
  itemId,
  canGoBack,
  onBack,
  onContinue,
}: {
  itemId: string;
  canGoBack: boolean;
  onBack: () => void;
  onContinue: (itemId: string) => void;
}) {
  return (
    <DialogView>
      <Heading slot="title" className="modal-dialog-title">
        Details
      </Heading>
      <p className="modal-dialog-body">
        Reviewing <code>{itemId}</code>. You can go back or continue to confirm.
      </p>
      <div className="modal-dialog-actions">
        {canGoBack && (
          <Button variant="secondary" onPress={onBack}>
            Back
          </Button>
        )}
        <Button onPress={() => onContinue(itemId)}>Continue</Button>
      </div>
    </DialogView>
  );
}

function ConfirmView({
  itemId,
  canGoBack,
  onBack,
  onDone,
}: {
  itemId: string;
  canGoBack: boolean;
  onBack: () => void;
  onDone: () => void;
}) {
  return (
    <DialogView>
      <Heading slot="title" className="modal-dialog-title">
        Confirm
      </Heading>
      <p className="modal-dialog-body">
        Confirm changes for <code>{itemId}</code>?
      </p>
      <div className="modal-dialog-actions">
        {canGoBack && (
          <Button variant="secondary" onPress={onBack}>
            Back
          </Button>
        )}
        <Button onPress={onDone}>Done</Button>
      </div>
    </DialogView>
  );
}

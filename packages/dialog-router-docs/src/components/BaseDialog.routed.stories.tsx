import { ViewTransition } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Dialog } from '@base-ui/react/dialog';

import type { DialogRouterState } from '@jossmac/dialog-router';
import { DialogRouterView, useDialogRouter } from '@jossmac/dialog-router';
import { ensure } from '@jossmac/lil-libs/assert';

import { BaseDialog } from './BaseDialog';

const meta = {
  title: 'Base UI/BaseDialog',
  parameters: {
    layout: 'centered',
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithRoutedViews: Story = {
  render: () => <RoutedBaseExample />,
};

type Views = {
  home: undefined;
  details: { itemId: string };
  confirm: { itemId: string };
};

function RoutedBaseExample() {
  const router = useDialogRouter<Views>({ initial: [{ view: 'home' }] });
  const { current, escapeAction, push, back } = router;

  return (
    <Dialog.Root
      disablePointerDismissal={current.view === 'confirm'}
      onOpenChange={(open, details) => {
        if (!open && details.reason === 'escape-key') {
          if (escapeAction === 'back') {
            details.cancel();
            back();
          } else if (escapeAction === null) {
            details.cancel();
          }
        }
      }}
    >
      <Dialog.Trigger className="button" data-variant="primary">
        Open
      </Dialog.Trigger>
      <BaseDialog isDismissable={current.view !== 'confirm'}>
        {current.view === 'home' && (
          <DialogView title="Settings" router={router}>
            <p className="dialog-body">
              Choose an item to review. Escape dismisses; navigating deeper changes Escape to go
              back.
            </p>
            <div className="dialog-actions">
              <Dialog.Close className="button" data-variant="secondary">
                Close
              </Dialog.Close>
              <button
                type="button"
                className="button"
                data-variant="primary"
                onClick={() => push('details', { itemId: 'widget-42' })}
              >
                View details
              </button>
            </div>
          </DialogView>
        )}
        {current.view === 'details' && (
          <DetailsView router={router} onContinue={(itemId) => push('confirm', { itemId })} />
        )}
        {current.view === 'confirm' && <ConfirmView router={router} />}
      </BaseDialog>
    </Dialog.Root>
  );
}

function DetailsView({
  router,
  onContinue,
}: {
  router: DialogRouterState<Views>;
  onContinue: (itemId: string) => void;
}) {
  const { canGoBack, back, current } = router;
  const itemId = ensure(current.params?.itemId, 'itemId is required');

  return (
    <DialogView title="Details" router={router}>
      <p className="dialog-body">
        Reviewing <code>{itemId}</code>. You can go back or continue to confirm.
      </p>
      <div className="dialog-actions">
        {canGoBack && (
          <button type="button" className="button" data-variant="secondary" onClick={back}>
            Back
          </button>
        )}
        <button
          type="button"
          className="button"
          data-variant="primary"
          onClick={() => onContinue(itemId)}
        >
          Continue
        </button>
      </div>
    </DialogView>
  );
}

function ConfirmView({ router }: { router: DialogRouterState<Views> }) {
  const { canGoBack, back, backTo, current } = router;
  return (
    <DialogView title="Confirm" router={router}>
      <p className="dialog-body">
        Confirm changes for <code>{current.params?.itemId}</code>?
      </p>
      <div className="dialog-actions">
        <button
          type="button"
          className="button"
          data-variant="secondary"
          onClick={() => backTo('home')}
        >
          Back to start
        </button>
        {canGoBack && (
          <button type="button" className="button" data-variant="secondary" onClick={back}>
            Back
          </button>
        )}
      </div>
    </DialogView>
  );
}

function DialogView(props: {
  children: React.ReactNode;
  title: string;
  router: DialogRouterState<Views>;
}) {
  const { current, escapeAction, stack } = props.router;
  return (
    <ViewTransition key={current.key} name="slide-x">
      <DialogRouterView
        className="dialog-view"
        aria-label={props.title}
        escapeAction={escapeAction}
        shouldFocus={stack.length > 1}
      >
        <Dialog.Title className="dialog-title">{props.title}</Dialog.Title>
        {props.children}
      </DialogRouterView>
    </ViewTransition>
  );
}

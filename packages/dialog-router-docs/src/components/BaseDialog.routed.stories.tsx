import { ViewTransition, use } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Dialog } from '@base-ui/react/dialog';

import type { DialogRouterResult } from '@jossmac/dialog-router';
import {
  DialogRouter,
  DialogRouterContext,
  DialogRouterView,
} from '@jossmac/dialog-router';
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
  return (
    <DialogRouter initial={{ view: 'home' }}>
      {({ snapshot, escapeAction, navigate }) => (
        <Dialog.Root
          disablePointerDismissal={snapshot.current.view === 'confirm'}
          onOpenChange={(open, details) => {
            if (
              !open &&
              details.reason === 'escape-key' &&
              escapeAction !== 'dismiss'
            ) {
              details.cancel();
            }
          }}
        >
          <Dialog.Trigger className="button" data-variant="primary">
            Open
          </Dialog.Trigger>
          <BaseDialog isDismissable={snapshot.current.view !== 'confirm'}>
            {snapshot.current.view === 'home' && (
              <DialogView title="Settings">
                <p className="dialog-body">
                  Choose an item to review. Escape dismisses; navigating deeper
                  changes Escape to go back.
                </p>
                <div className="dialog-actions">
                  <Dialog.Close
                    className="button"
                    data-variant="secondary"
                  >
                    Close
                  </Dialog.Close>
                  <button
                    type="button"
                    className="button"
                    data-variant="primary"
                    onClick={() => navigate('details', { itemId: 'widget-42' })}
                  >
                    View details
                  </button>
                </div>
              </DialogView>
            )}
            {snapshot.current.view === 'details' && (
              <DetailsView
                onContinue={(itemId) => navigate('confirm', { itemId })}
              />
            )}
            {snapshot.current.view === 'confirm' && <ConfirmView />}
          </BaseDialog>
        </Dialog.Root>
      )}
    </DialogRouter>
  );
}

function DetailsView({ onContinue }: { onContinue: (itemId: string) => void }) {
  const { isBackAllowed, back, snapshot } = useRouteContext();
  const itemId = ensure(snapshot.current.params?.itemId, 'itemId is required');

  return (
    <DialogView title="Details">
      <p className="dialog-body">
        Reviewing <code>{itemId}</code>. You can go back or continue to confirm.
      </p>
      <div className="dialog-actions">
        {isBackAllowed && (
          <button
            type="button"
            className="button"
            data-variant="secondary"
            onClick={back}
          >
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

function ConfirmView() {
  const { isBackAllowed, back, snapshot } = useRouteContext();
  return (
    <DialogView title="Confirm">
      <p className="dialog-body">
        Confirm changes for <code>{snapshot.current.params?.itemId}</code>?
      </p>
      <div className="dialog-actions">
        {isBackAllowed && (
          <button
            type="button"
            className="button"
            data-variant="secondary"
            onClick={back}
          >
            Back
          </button>
        )}
        <Dialog.Close className="button" data-variant="primary">
          Done
        </Dialog.Close>
      </div>
    </DialogView>
  );
}

function DialogView(props: { children: React.ReactNode; title: string }) {
  return (
    <ViewTransition name="dialog-view">
      <DialogRouterView className="dialog-view" aria-label={props.title}>
        <Dialog.Title className="dialog-title">{props.title}</Dialog.Title>
        {props.children}
      </DialogRouterView>
    </ViewTransition>
  );
}

function useRouteContext() {
  const ctx = ensure(use(DialogRouterContext), 'DialogRouterContext not found');
  return ctx as DialogRouterResult<Views>;
}

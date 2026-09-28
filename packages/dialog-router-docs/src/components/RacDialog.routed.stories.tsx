import { ViewTransition, use } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Heading } from 'react-aria-components/Heading';

import type { DialogRouterResult } from '@jossmac/dialog-router';
import {
  DialogRouter,
  DialogRouterContext,
  DialogRouterView,
} from '@jossmac/dialog-router';
import { ensure } from '@jossmac/lil-libs/assert';
import { DialogTrigger } from 'react-aria-components';

import { Button } from './Button';
import { RacDialog } from './RacDialog';

const meta = {
  title: 'React Aria/RacDialog',
  parameters: {
    layout: 'centered',
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithRoutedViews: Story = {
  render: () => (
    <DialogTrigger>
      <Button>Open</Button>
      <RoutedRacExample />
    </DialogTrigger>
  ),
};

type Views = {
  home: undefined;
  details: { itemId: string };
  confirm: { itemId: string };
};

function RoutedRacExample() {
  return (
    <DialogRouter<Views> initial={{ view: 'home' }}>
      {({ snapshot, escapeAction, navigate }) => (
        <RacDialog
          isDismissable={snapshot.current.view !== 'confirm'}
          isKeyboardDismissDisabled={escapeAction !== 'dismiss'}
        >
          {snapshot.current.view === 'home' && (
            <DialogView title="Settings">
              <p className="dialog-body">
                Choose an item to review. Escape dismisses; navigating deeper
                changes Escape to go back.
              </p>
              <div className="dialog-actions">
                <Button variant="secondary">Close</Button>
                <Button
                  onPress={() => navigate('details', { itemId: 'widget-42' })}
                >
                  View details
                </Button>
              </div>
            </DialogView>
          )}
          {snapshot.current.view === 'details' && (
            <DetailsView
              onContinue={(itemId) => navigate('confirm', { itemId })}
            />
          )}
          {snapshot.current.view === 'confirm' && (
            <ConfirmView onDone={() => {}} />
          )}
        </RacDialog>
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
          <Button variant="secondary" onPress={back}>
            Back
          </Button>
        )}
        <Button onPress={() => onContinue(itemId)}>Continue</Button>
      </div>
    </DialogView>
  );
}

function ConfirmView({ onDone }: { onDone: () => void }) {
  const { isBackAllowed, back, snapshot } = useRouteContext();
  return (
    <DialogView title="Confirm">
      <p className="dialog-body">
        Confirm changes for <code>{snapshot.current.params?.itemId}</code>?
      </p>
      <div className="dialog-actions">
        {isBackAllowed && (
          <Button variant="secondary" onPress={back}>
            Back
          </Button>
        )}
        <Button onPress={onDone}>Done</Button>
      </div>
    </DialogView>
  );
}

function DialogView(props: { children: React.ReactNode; title: string }) {
  return (
    <ViewTransition name="dialog-view">
      <DialogRouterView className="dialog-view" aria-label={props.title}>
        <Heading slot="title" className="dialog-title">
          {props.title}
        </Heading>
        {props.children}
      </DialogRouterView>
    </ViewTransition>
  );
}

function useRouteContext() {
  const ctx = ensure(use(DialogRouterContext), 'DialogRouterContext not found');
  return ctx as DialogRouterResult<Views>;
}

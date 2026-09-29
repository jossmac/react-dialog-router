import { ViewTransition, use } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Heading } from 'react-aria-components/Heading';

import type { DialogRouterState } from '@jossmac/dialog-router';
import { DialogRouter, DialogRouterContext, DialogRouterView } from '@jossmac/dialog-router';
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
    <DialogRouter<Views>
      initial={[{ view: 'home' }, { view: 'details', params: { itemId: 'widget-42' } }]}
    >
      {({ current, escapeAction, navigate }) => (
        <RacDialog
          isDismissable={current.view !== 'confirm'}
          isKeyboardDismissDisabled={escapeAction !== 'dismiss'}
        >
          {current.view === 'home' && (
            <DialogView title="Settings">
              <p className="dialog-body">
                Choose an item to review. Escape dismisses; navigating deeper changes Escape to go
                back.
              </p>
              <div className="dialog-actions">
                <Button variant="secondary">Close</Button>
                <Button onPress={() => navigate('details', { itemId: 'widget-42' })}>
                  View details
                </Button>
              </div>
            </DialogView>
          )}
          {current.view === 'details' && (
            <DetailsView onContinue={(itemId) => navigate('confirm', { itemId })} />
          )}
          {current.view === 'confirm' && <ConfirmView onDone={() => {}} />}
        </RacDialog>
      )}
    </DialogRouter>
  );
}

function DetailsView({ onContinue }: { onContinue: (itemId: string) => void }) {
  const { isBackAllowed, back, current } = useRouteContext();
  const itemId = ensure(current.params?.itemId, 'itemId is required');

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
  const { isBackAllowed, back, current } = useRouteContext();
  return (
    <DialogView title="Confirm">
      <p className="dialog-body">
        Confirm changes for <code>{current.params?.itemId}</code>?
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
    <ViewTransition name="slide-x">
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
  return ctx as DialogRouterState<Views>;
}

import { ViewTransition, useEffect } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Heading } from 'react-aria-components/Heading';

import type {
  DialogRouterState,
  EscapeKeyBehavior,
} from '@jossmac/dialog-router';
import { DialogRouterView, useDialogRouter } from '@jossmac/dialog-router';
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
  const router = useDialogRouter<Views>({
    initial: [
      { view: 'home' },
      { view: 'details', params: { itemId: 'widget-42' } },
    ],
  });
  const { current, escapeAction, push, back } = router;

  useEscapeBack(escapeAction, back);

  return (
    <RacDialog
      isDismissable={current.view !== 'confirm'}
      isKeyboardDismissDisabled={escapeAction !== 'dismiss'}
    >
      {current.view === 'home' && (
        <DialogView title="Settings" router={router}>
          <p className="dialog-body">
            Choose an item to review. Escape dismisses; navigating deeper
            changes Escape to go back.
          </p>
          <div className="dialog-actions">
            <Button variant="secondary">Close</Button>
            <Button onPress={() => push('details', { itemId: 'widget-42' })}>
              View details
            </Button>
          </div>
        </DialogView>
      )}
      {current.view === 'details' && (
        <DetailsView
          router={router}
          onContinue={(itemId) => push('confirm', { itemId })}
        />
      )}
      {current.view === 'confirm' && (
        <ConfirmView router={router} onDone={() => {}} />
      )}
    </RacDialog>
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
          <Button variant="secondary" onPress={back}>
            Back
          </Button>
        )}
        <Button onPress={() => onContinue(itemId)}>Continue</Button>
      </div>
    </DialogView>
  );
}

function ConfirmView({
  router,
  onDone,
}: {
  router: DialogRouterState<Views>;
  onDone: () => void;
}) {
  const { canGoBack, back, current } = router;
  return (
    <DialogView title="Confirm" router={router}>
      <p className="dialog-body">
        Confirm changes for <code>{current.params?.itemId}</code>?
      </p>
      <div className="dialog-actions">
        {canGoBack && (
          <Button variant="secondary" onPress={back}>
            Back
          </Button>
        )}
        <Button onPress={onDone}>Done</Button>
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
        <Heading slot="title" className="dialog-title">
          {props.title}
        </Heading>
        {props.children}
      </DialogRouterView>
    </ViewTransition>
  );
}

/** When the host disables Escape-dismiss, enact stack back ourselves. */
function useEscapeBack(escapeAction: EscapeKeyBehavior, back: () => void) {
  useEffect(() => {
    if (escapeAction !== 'back') return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.key !== 'Escape') return;
      event.preventDefault();
      event.stopPropagation();
      back();
    };

    document.addEventListener('keydown', onKeyDown, true);
    return () => document.removeEventListener('keydown', onKeyDown, true);
  }, [escapeAction, back]);
}

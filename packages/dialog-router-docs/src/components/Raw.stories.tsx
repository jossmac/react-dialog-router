import type { CSSProperties } from 'react';
import { ViewTransition, useId } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Heading } from 'react-aria-components/Heading';

import type { DialogRouterState } from '@jossmac/dialog-router';
import { DialogRouter, DialogRouterView } from '@jossmac/dialog-router';

import { Button } from './Button';
import { RacDialog } from './RacDialog';

const meta = {
  title: 'DialogRouter',
  parameters: {
    layout: 'centered',
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <DialogRouter<Views> initial={[{ view: 'first' }]}>
      {(renderProps) => {
        const { current } = renderProps;
        const view = VIEW_MAP[current.view];

        return (
          <RacDialog isOpen>
            <DialogView title={view.title}>
              <Content {...renderProps} />
              <Actions {...renderProps} />
            </DialogView>
          </RacDialog>
        );
      }}
    </DialogRouter>
  ),
};

export const AnimateViews: Story = {
  render: () => (
    <DialogRouter<Views> initial={[{ view: 'first' }]}>
      {(renderProps) => {
        const { current } = renderProps;
        const view = VIEW_MAP[current.view];

        return (
          <RacDialog isOpen>
            <DialogView title={view.title} includeViewTransition>
              <Content {...renderProps} />
              <Actions {...renderProps} />
            </DialogView>
          </RacDialog>
        );
      }}
    </DialogRouter>
  ),
};

export const AnimateDiscreteViews: Story = {
  render: function RenderAnimateDiscreteViews() {
    const rootId = useId();

    return (
      <DialogRouter<Views> initial={[{ view: 'first' }]}>
        {(renderProps) => {
          const { current } = renderProps;
          const view = VIEW_MAP[current.view];
          const headingId = `${rootId}-${view.title}`;

          return (
            <RacDialog
              isOpen
              style={{
                width: 440,
                paddingBlock: 16,
                display: 'grid',
                gap: 16,
              }}
            >
              <ViewTransition>
                <Heading
                  slot="title"
                  id={headingId}
                  className="dialog-title"
                  style={{ paddingInline: 16 }}
                >
                  {view.title}
                </Heading>
              </ViewTransition>
              <ViewTransition name="dialog-view">
                <DialogRouterView aria-labelledby={headingId} style={{ paddingInline: 16 }}>
                  <Content {...renderProps} />
                </DialogRouterView>
              </ViewTransition>
              <Actions {...renderProps} style={{ paddingInline: 16 }} />
            </RacDialog>
          );
        }}
      </DialogRouter>
    );
  },
};

type Views = Record<keyof typeof VIEW_MAP, undefined>;
const VIEW_MAP = {
  first: {
    title: 'First',
    next: 'second',
  },
  second: {
    title: 'Second',
    next: 'third',
  },
  third: {
    title: 'Third',
    next: undefined,
  },
} as const;

function DialogView(props: {
  children: React.ReactNode;
  includeViewTransition?: boolean;
  title: string;
}) {
  const { children, includeViewTransition, title } = props;
  const headingId = useId();
  const content = (
    <DialogRouterView
      aria-labelledby={headingId}
      style={{
        boxSizing: 'border-box',
        width: 440,
        display: 'grid',
        gap: 16,
        padding: 16,
      }}
    >
      <Heading slot="title" className="dialog-title" id={headingId}>
        {title}
      </Heading>
      {children}
    </DialogRouterView>
  );
  if (includeViewTransition) {
    return <ViewTransition name="dialog-view">{content}</ViewTransition>;
  }
  return content;
}

function Content(props: DialogRouterState<Views>) {
  const { current, escapeAction, isBackAllowed, stack } = props;
  return (
    <pre className="dialog-body">
      current: {current.view}
      <br />
      stack: [{stack.map((i) => i.view).join(', ')}]
      <br />
      escapeAction: {escapeAction}
      <br />
      isBackAllowed: {isBackAllowed ? 'true' : 'false'}
    </pre>
  );
}

function Actions(props: DialogRouterState<Views> & StyleProps) {
  const { back, navigate, isBackAllowed, current, ...styleProps } = props;
  const view = VIEW_MAP[current.view];
  return (
    <div className="dialog-actions" {...styleProps}>
      <Button isDisabled={!isBackAllowed} variant="secondary" onPress={back}>
        Back
      </Button>
      <Button isDisabled={!view.next} onPress={view.next ? () => navigate(view.next) : undefined}>
        Next
      </Button>
    </div>
  );
}

type StyleProps = {
  className?: string;
  style?: CSSProperties;
};

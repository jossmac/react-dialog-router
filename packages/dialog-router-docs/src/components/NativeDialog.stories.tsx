import type { CSSProperties } from 'react';
import { ViewTransition, useId } from 'react';
import type { SomeOptional } from '@jossmac/lil-libs/types';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Heading } from 'react-aria-components/Heading';

import type { DialogRouterState } from '@jossmac/dialog-router';
import { DialogRouter, DialogRouterView } from '@jossmac/dialog-router';

import { Button } from './Button';
import { NativeDialog } from './NativeDialog';
import { ListBox, ListBoxItem } from './ListBox';
import { Select, SelectItem } from './Select';
import { DialogTrigger, Form } from 'react-aria-components';
import { pluralize } from '@jossmac/lil-libs/string';
import { NumberField } from './NumberField';

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
          <>
            <Button onPress={() => document.querySelector('dialog')?.showModal()}>Open</Button>
            <NativeDialog open>
              <DialogView title={view.title}>
                <Content {...renderProps} />
                <Actions {...renderProps} />
              </DialogView>
            </NativeDialog>
          </>
        );
      }}
    </DialogRouter>
  ),
};

export const AnimateViewsVT: Story = {
  render: () => (
    <DialogRouter<Views> initial={[{ view: 'first' }]}>
      {(renderProps) => {
        const { current } = renderProps;
        const view = VIEW_MAP[current.view];

        return (
          <>
            <Button onPress={() => document.querySelector('dialog')?.showModal()}>Open</Button>
            <NativeDialog open>
              <DialogView title={view.title} includeViewTransition>
                <Content {...renderProps} />
                <Actions {...renderProps} />
              </DialogView>
            </NativeDialog>
          </>
        );
      }}
    </DialogRouter>
  ),
};

export const AnimateDiscreteViewsVT: Story = {
  render: function RenderAnimateDiscreteViewsVT() {
    const rootId = useId();

    return (
      <DialogRouter<Views> initial={[{ view: 'first' }]}>
        {(renderProps) => {
          const { current } = renderProps;
          const view = VIEW_MAP[current.view];
          const headingId = `${rootId}-${view.title}`;

          return (
            <>
              <Button onPress={() => document.querySelector('dialog')?.showModal()}>Open</Button>
              <NativeDialog open>
                <DialogRouterView
                  aria-labelledby={headingId}
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
                  <ViewTransition name="slide-x">
                    <Content {...renderProps} style={{ paddingInline: 16 }} />
                  </ViewTransition>
                  <Actions {...renderProps} style={{ paddingInline: 16 }} />
                </DialogRouterView>
              </NativeDialog>
            </>
          );
        }}
      </DialogRouter>
    );
  },
};

const FRUITS = [
  'apple',
  'banana',
  'cherry',
  'grape',
  'lemon',
  'mango',
  'orange',
  'pear',
  'strawberry',
  'watermelon',
] as const;
const VEGETABLES = [
  'broccoli',
  'carrot',
  'cucumber',
  'eggplant',
  'garlic',
  'onion',
  'pepper',
  'potato',
  'tomato',
  'zucchini',
] as const;
const TYPES = {
  fruit: FRUITS,
  vegetable: VEGETABLES,
};

type Fruit = (typeof FRUITS)[number];
type Vegetable = (typeof VEGETABLES)[number];
type SummaryParams = {
  type: keyof typeof TYPES;
  selection: Fruit | Vegetable;
  count: number;
};
type FormViews = {
  root: undefined;
  form: SomeOptional<SummaryParams, 'selection' | 'count'>;
  summary: SummaryParams;
};
export const Forms: Story = {
  render: () => (
    <DialogRouter<FormViews> initial={[{ view: 'root' }]}>
      {(renderProps) => {
        const { back, backTo, current, navigate } = renderProps;

        return (
          <>
            <Button onPress={() => document.querySelector('dialog')?.showModal()}>Open</Button>
            <NativeDialog
            // isDismissable
            // isKeyboardDismissDisabled={escapeAction !== 'dismiss'}
            >
              {current.view === 'root' && (
                <DialogView title="What would you like?" includeViewTransition>
                  <ListBox
                    aria-label="Select a type"
                    selectionMode="single"
                    items={[
                      { id: 'fruit', label: 'Fruit' },
                      { id: 'vegetable', label: 'Vegetable' },
                    ]}
                    onSelectionChange={(selection) => {
                      if (selection === 'all') return;
                      const key = selection.keys().next().value;
                      if (key === 'fruit' || key === 'vegetable') {
                        navigate('form', { type: key });
                      }
                    }}
                  >
                    {(item) => <ListBoxItem key={item.id}>{item.label}</ListBoxItem>}
                  </ListBox>
                </DialogView>
              )}
              {current.view === 'form' && (
                <DialogView title="Selection" includeViewTransition>
                  <Form
                    action={(formData) => {
                      const selection = formData.get('selection') as Fruit | Vegetable;
                      const count = Number(formData.get('count')) || 1;
                      // if (!selection || count < 1) return;
                      navigate('summary', {
                        count,
                        selection,
                        type: current.params.type,
                      });
                    }}
                    style={{ display: 'grid', gap: 16 }}
                  >
                    <Select
                      isRequired
                      name="selection"
                      label={current.params.type}
                      defaultValue={current.params.selection ?? TYPES[current.params.type][0]}
                      items={TYPES[current.params.type].map((item) => ({
                        id: item,
                        label: item,
                      }))}
                    >
                      {(item) => <SelectItem key={item.id}>{item.label}</SelectItem>}
                    </Select>
                    <NumberField
                      label="Count"
                      name="count"
                      minValue={1}
                      maxValue={10}
                      step={1}
                      defaultValue={current.params.count ?? 1}
                    />
                    <div className="dialog-actions">
                      <Button variant="secondary" onPress={back}>
                        Back
                      </Button>
                      <Button type="submit">Next</Button>
                    </div>
                  </Form>
                </DialogView>
              )}
              {current.view === 'summary' && (
                <DialogView title="Summary" includeViewTransition>
                  <div>
                    <p>
                      You have selected {pluralize(current.params.count, current.params.selection)}.
                    </p>
                  </div>
                  <div className="dialog-actions">
                    <Button variant="secondary" onPress={() => backTo('form', current.params)}>
                      Back
                    </Button>
                    <Button slot="close">Confirm</Button>
                  </div>
                </DialogView>
              )}
            </NativeDialog>
          </>
        );
      }}
    </DialogRouter>
  ),
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
        maxWidth: '100%',
      }}
    >
      <Heading slot="title" className="dialog-title" id={headingId}>
        {title}
      </Heading>
      {children}
    </DialogRouterView>
  );
  if (includeViewTransition) {
    return <ViewTransition name="slide-x">{content}</ViewTransition>;
  }
  return content;
}

function Content(props: DialogRouterState<Views> & StyleProps) {
  const { current, escapeAction, isBackAllowed, stack, ...styleProps } = props;
  return (
    <pre className="dialog-body" {...styleProps}>
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

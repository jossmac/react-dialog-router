import type { CSSProperties, SyntheticEvent } from 'react';
import { ViewTransition, useId } from 'react';
import type { SomeOptional } from '@jossmac/lil-libs/types';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Heading } from 'react-aria-components/Heading';

import type { DialogRouterState, EscapeKeyBehavior } from '@jossmac/dialog-router';
import { DialogRouterView, useDialogRouter } from '@jossmac/dialog-router';

import { Button } from './Button';
import { NativeDialog } from './NativeDialog';
import { ListBox, ListBoxItem } from './ListBox';
import { Select, SelectItem } from './Select';
import { Form } from 'react-aria-components';
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
  render: function RenderDefault() {
    const router = useDialogRouter<Views>({ initial: [{ view: 'first' }] });
    const view = VIEW_MAP[router.current.view];

    return (
      <>
        <Button onPress={() => document.querySelector('dialog')?.showModal()}>Open</Button>
        <NativeDialog
          onCancel={(event) => handleNativeEscape(event, router.escapeAction, router.back)}
        >
          <DialogView
            key={router.current.key}
            title={view.title}
            escapeAction={router.escapeAction}
            shouldFocus={router.stack.length > 1}
          >
            <Content {...router} />
            <Actions {...router} />
          </DialogView>
        </NativeDialog>
      </>
    );
  },
};

export const AnimateViewsVT: Story = {
  render: function RenderAnimateViewsVT() {
    const router = useDialogRouter<Views>({ initial: [{ view: 'first' }] });
    const view = VIEW_MAP[router.current.view];

    return (
      <>
        <Button onPress={() => document.querySelector('dialog')?.showModal()}>Open</Button>
        <NativeDialog
          onCancel={(event) => handleNativeEscape(event, router.escapeAction, router.back)}
        >
          <DialogView
            key={router.current.key}
            title={view.title}
            escapeAction={router.escapeAction}
            shouldFocus={router.stack.length > 1}
            includeViewTransition
          >
            <Content {...router} />
            <Actions {...router} />
          </DialogView>
        </NativeDialog>
      </>
    );
  },
};

export const AnimateDiscreteViewsVT: Story = {
  render: function RenderAnimateDiscreteViewsVT() {
    const rootId = useId();
    const router = useDialogRouter<Views>({ initial: [{ view: 'first' }] });
    const view = VIEW_MAP[router.current.view];
    const headingId = `${rootId}-${view.title}`;

    return (
      <>
        <Button onPress={() => document.querySelector('dialog')?.showModal()}>Open</Button>
        <NativeDialog
          onCancel={(event) => handleNativeEscape(event, router.escapeAction, router.back)}
        >
          <DialogRouterView
            key={router.current.key}
            aria-labelledby={headingId}
            escapeAction={router.escapeAction}
            shouldFocus={router.stack.length > 1}
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
              <Content {...router} style={{ paddingInline: 16 }} />
            </ViewTransition>
            <Actions {...router} style={{ paddingInline: 16 }} />
          </DialogRouterView>
        </NativeDialog>
      </>
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
  render: function RenderForms() {
    const { back, backTo, current, escapeAction, push, stack } = useDialogRouter<FormViews>({
      initial: [{ view: 'root' }],
    });

    return (
      <>
        <Button onPress={() => document.querySelector('dialog')?.showModal()}>Open</Button>
        <NativeDialog onCancel={(event) => handleNativeEscape(event, escapeAction, back)}>
          {current.view === 'root' && (
            <DialogView
              key={current.key}
              title="What would you like?"
              escapeAction={escapeAction}
              shouldFocus={stack.length > 1}
              includeViewTransition
            >
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
                    push('form', { type: key });
                  }
                }}
              >
                {(item) => <ListBoxItem key={item.id}>{item.label}</ListBoxItem>}
              </ListBox>
            </DialogView>
          )}
          {current.view === 'form' && (
            <DialogView
              key={current.key}
              title="Selection"
              escapeAction={escapeAction}
              shouldFocus={stack.length > 1}
              includeViewTransition
            >
              <Form
                action={(formData) => {
                  const selection = formData.get('selection') as Fruit | Vegetable;
                  const count = Number(formData.get('count')) || 1;
                  push('summary', {
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
            <DialogView
              key={current.key}
              title="Summary"
              escapeAction={escapeAction}
              shouldFocus={stack.length > 1}
              includeViewTransition
            >
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
  },
};

/** Native `<dialog>` closes on Escape via `cancel`. Prevent that when the stack should go back. */
function handleNativeEscape(
  event: SyntheticEvent<HTMLDialogElement, Event>,
  escapeAction: EscapeKeyBehavior,
  back: () => void,
) {
  if (escapeAction === 'back') {
    event.preventDefault();
    back();
  } else if (escapeAction === null) {
    event.preventDefault();
  }
}

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
  escapeAction: EscapeKeyBehavior;
  shouldFocus: boolean;
  includeViewTransition?: boolean;
  title: string;
}) {
  const { children, escapeAction, shouldFocus, includeViewTransition, title } = props;
  const headingId = useId();
  const content = (
    <DialogRouterView
      aria-labelledby={headingId}
      escapeAction={escapeAction}
      shouldFocus={shouldFocus}
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
  const { current, escapeAction, canGoBack, stack, ...styleProps } = props;
  return (
    <pre className="dialog-body" {...styleProps}>
      current: {current.view}
      <br />
      stack: [{stack.map((i) => i.view).join(', ')}]
      <br />
      escapeAction: {escapeAction}
      <br />
      canGoBack: {canGoBack ? 'true' : 'false'}
    </pre>
  );
}

function Actions(props: DialogRouterState<Views> & StyleProps) {
  const { back, push, canGoBack, current, ...styleProps } = props;
  const view = VIEW_MAP[current.view];
  return (
    <div className="dialog-actions" {...styleProps}>
      <Button isDisabled={!canGoBack} variant="secondary" onPress={back}>
        Back
      </Button>
      <Button isDisabled={!view.next} onPress={view.next ? () => push(view.next) : undefined}>
        Next
      </Button>
    </div>
  );
}

type StyleProps = {
  className?: string;
  style?: CSSProperties;
};

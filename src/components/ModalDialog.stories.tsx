import type { Meta, StoryObj } from '@storybook/react-vite';
import { DialogTrigger } from 'react-aria-components/Dialog';
import { ModalDialog } from './ModalDialog';
import { Button } from './Button';

const meta = {
  title: 'ModalDialog/Basic',
  component: ModalDialog,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof ModalDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <DialogTrigger>
      <Button>Open dialog</Button>
      <ModalDialog title="Subscribe" isDismissable>
        <p className="modal-dialog-body">
          Enter your information to subscribe and receive updates about new features and
          announcements.
        </p>
        <div className="modal-dialog-actions">
          <Button slot="close" variant="secondary">
            Cancel
          </Button>
          <Button slot="close">Subscribe</Button>
        </div>
      </ModalDialog>
    </DialogTrigger>
  ),
};

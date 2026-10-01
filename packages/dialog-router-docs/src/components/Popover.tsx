import type { ReactNode } from 'react';
import { composeRenderProps } from 'react-aria-components';
import type { PopoverProps as AriaPopoverProps } from 'react-aria-components/Popover';
import { OverlayArrow, Popover as AriaPopover } from 'react-aria-components/Popover';
import './Popover.css';

export type PopoverProps = Omit<AriaPopoverProps, 'children'> & {
  children: ReactNode;
  hideArrow?: boolean;
};

export function Popover({ children, hideArrow, className, ...props }: PopoverProps) {
  return (
    <AriaPopover
      {...props}
      className={composeRenderProps(className, (className) =>
        ['react-aria-Popover', className].filter(Boolean).join(' '),
      )}
    >
      {({ trigger }) => (
        <>
          {!hideArrow && trigger !== 'MenuTrigger' && trigger !== 'SubmenuTrigger' && (
            <OverlayArrow>
              <svg width={12} height={12} viewBox="0 0 12 12">
                <path d="M0 0 L6 6 L12 0" />
              </svg>
            </OverlayArrow>
          )}
          {children}
        </>
      )}
    </AriaPopover>
  );
}

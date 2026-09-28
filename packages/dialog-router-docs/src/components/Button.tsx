import type { ButtonProps as RACButtonProps } from 'react-aria-components/Button';
import { Button as RACButton } from 'react-aria-components/Button';
import './button.css';

export type ButtonProps = RACButtonProps & {
  variant?: 'primary' | 'secondary';
};

export function Button({ variant = 'primary', className, ...props }: ButtonProps) {
  return (
    <RACButton
      {...props}
      data-variant={variant}
      className={['button', className].filter(Boolean).join(' ')}
    />
  );
}

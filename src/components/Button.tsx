import {
  Button as RACButton,
  type ButtonProps as RACButtonProps,
} from 'react-aria-components/Button';
import './Button.css';

export type ButtonProps = RACButtonProps & {
  variant?: 'primary' | 'secondary';
};

export function Button({ variant = 'primary', className, ...props }: ButtonProps) {
  return (
    <RACButton
      {...props}
      data-variant={variant}
      className={['react-aria-Button', className].filter(Boolean).join(' ')}
    />
  );
}

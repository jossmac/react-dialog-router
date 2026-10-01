import type {
  NumberFieldProps as AriaNumberFieldProps,
  ValidationResult,
} from 'react-aria-components/NumberField';
import { Group, Input, NumberField as RACNumberField } from 'react-aria-components/NumberField';
import { Button } from './Button';
import { Description, FieldError, Label } from './Field';
import './NumberField.css';

export type NumberFieldProps = AriaNumberFieldProps & {
  label?: string;
  description?: string;
  errorMessage?: string | ((validation: ValidationResult) => string);
};

export function NumberField({ label, description, errorMessage, ...props }: NumberFieldProps) {
  return (
    <RACNumberField {...props}>
      {label && <Label>{label}</Label>}
      <Group>
        <Input />
        <Button slot="decrement" variant="secondary" aria-label="Decrement">
          <MinusIcon />
        </Button>
        <Button slot="increment" variant="secondary" aria-label="Increment">
          <PlusIcon />
        </Button>
      </Group>
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
    </RACNumberField>
  );
}

function MinusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
      <path d="M3 7h8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
      <path
        d="M7 3v8M3 7h8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

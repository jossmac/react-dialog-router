import type { Ref } from 'react';
import type {
  TextFieldProps as AriaTextFieldProps,
  ValidationResult,
} from 'react-aria-components/TextField';
import { Input, TextField as RACTextField } from 'react-aria-components/TextField';
import { Description, FieldError, Label } from './Field';
import './TextField.css';

export type TextFieldProps = AriaTextFieldProps & {
  label?: string;
  description?: string;
  errorMessage?: string | ((validation: ValidationResult) => string);
  placeholder?: string;
  inputRef?: Ref<HTMLInputElement>;
};

export function TextField({
  label,
  description,
  errorMessage,
  placeholder,
  inputRef,
  ...props
}: TextFieldProps) {
  return (
    <RACTextField {...props}>
      {label && <Label>{label}</Label>}
      <Input ref={inputRef} placeholder={placeholder} />
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
    </RACTextField>
  );
}

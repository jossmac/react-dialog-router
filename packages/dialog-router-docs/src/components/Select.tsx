import type {
  ListBoxItemProps,
  ListBoxProps,
  SelectProps as AriaSelectProps,
  ValidationResult,
} from 'react-aria-components/Select';
import { Select as AriaSelect, SelectValue } from 'react-aria-components/Select';
import { Button } from './Button';
import { Description, FieldError, Label } from './Field';
import { DropdownItem, DropdownListBox } from './ListBox';
import { Popover } from './Popover';
import './Select.css';

export type SelectProps<T extends object, M extends 'single' | 'multiple' = 'single'> = Omit<
  AriaSelectProps<T, M>,
  'children'
> & {
  label?: string;
  description?: string;
  errorMessage?: string | ((validation: ValidationResult) => string);
  items?: Iterable<T>;
  children: React.ReactNode | ((item: T) => React.ReactNode);
};

export function Select<T extends object, M extends 'single' | 'multiple' = 'single'>({
  label,
  description,
  errorMessage,
  children,
  items,
  ...props
}: SelectProps<T, M>) {
  return (
    <AriaSelect {...props}>
      {label && <Label>{label}</Label>}
      <Button variant="secondary">
        <SelectValue />
        <ChevronDownIcon />
      </Button>
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
      <Popover hideArrow className="select-popover">
        <SelectListBox items={items}>{children}</SelectListBox>
      </Popover>
    </AriaSelect>
  );
}

export function SelectListBox<T extends object>(props: ListBoxProps<T>) {
  return <DropdownListBox {...props} />;
}

export function SelectItem(props: ListBoxItemProps) {
  return <DropdownItem {...props} />;
}

function ChevronDownIcon() {
  return (
    <svg className="select-chevron" width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
      <path
        d="M3.5 5.5 7 9l3.5-3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

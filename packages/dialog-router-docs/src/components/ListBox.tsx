import { composeRenderProps } from 'react-aria-components';
import type { ListBoxItemProps, ListBoxProps } from 'react-aria-components/ListBox';
import {
  ListBox as AriaListBox,
  ListBoxItem as AriaListBoxItem,
  Text,
} from 'react-aria-components/ListBox';
import './ListBox.css';

export function ListBox<T extends object>({ children, ...props }: ListBoxProps<T>) {
  return <AriaListBox {...props}>{children}</AriaListBox>;
}

export function ListBoxItem(props: ListBoxItemProps) {
  const textValue =
    props.textValue || (typeof props.children === 'string' ? props.children : undefined);
  return (
    <AriaListBoxItem {...props} textValue={textValue}>
      {composeRenderProps(props.children, (children) =>
        typeof children === 'string' ? <Text slot="label">{children}</Text> : children,
      )}
    </AriaListBoxItem>
  );
}

export function DropdownListBox<T extends object>(props: ListBoxProps<T>) {
  return <AriaListBox {...props} className="dropdown-listbox" />;
}

export function DropdownItem(props: ListBoxItemProps) {
  const textValue =
    props.textValue || (typeof props.children === 'string' ? props.children : undefined);
  return (
    <ListBoxItem {...props} textValue={textValue} className="dropdown-item">
      {composeRenderProps(props.children, (children, { isSelected }) => (
        <>
          {isSelected && <CheckIcon />}
          {typeof children === 'string' ? <Text slot="label">{children}</Text> : children}
        </>
      ))}
    </ListBoxItem>
  );
}

function CheckIcon() {
  return (
    <svg className="dropdown-check" width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
      <path
        d="M2.5 7.5 5.5 10.5 11.5 3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export { Text };

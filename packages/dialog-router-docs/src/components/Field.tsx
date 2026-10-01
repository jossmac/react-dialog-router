import type { FieldErrorProps } from 'react-aria-components/FieldError';
import { FieldError as RACFieldError } from 'react-aria-components/FieldError';
import type { LabelProps } from 'react-aria-components/Label';
import { Label as RACLabel } from 'react-aria-components/Label';
import type { TextProps } from 'react-aria-components/Text';
import { Text } from 'react-aria-components/Text';

import './Field.css';

export function Label(props: LabelProps) {
  return <RACLabel {...props} />;
}

export function FieldError(props: FieldErrorProps) {
  return <RACFieldError {...props} />;
}

export function Description(props: TextProps) {
  return <Text slot="description" className="field-description" {...props} />;
}

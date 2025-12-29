import { createElement } from 'react';

import TextFilter from '../components/filters/TextFilter';
import EmailAndUrlFilter from '../components/filters/EmailAndUrlFilter';
import RadioDropdownFilter from '../components/filters/RadioDropdownFilter';

import { registerFilter } from './filterRegistry';
import type {
  FilterComponentProps,
  TextFilterData,
  EmailUrlFilterData,
  RadioDropdownFilterData,
} from './filterRegistry';
import BooleanFilter from '../components/filters/BooleanFilter';
import type { BooleanFilterData } from './filterRegistry';

// ✅ These IDs match your backend `field_type_id`
const TEXT_TYPE_ID = 1; // Text Input
const EMAIL_TYPE_ID = 2; // Email Input
const URL_TYPE_ID = 17; // URL Input
const CHECKBOX_TYPE_ID = 9; // Checkbox
const RADIO_TYPE_ID = 10; // Radio Button
const DROPDOWN_TYPE_ID = 11; // Dropdown Select

// Text
registerFilter<TextFilterData>(
  TEXT_TYPE_ID,
  TextFilter,
  'Text Input',
  () => null,
);

// Email (injects fieldTypeName)
const EmailFilterWrapper = (props: FilterComponentProps<EmailUrlFilterData>) =>
  createElement(EmailAndUrlFilter as any, {
    ...(props as any),
    fieldTypeName: 'Email Input',
  });

registerFilter<EmailUrlFilterData>(
  EMAIL_TYPE_ID,
  EmailFilterWrapper,
  'Email Input',
  () => null,
);

// URL (injects fieldTypeName)
const UrlFilterWrapper = (props: FilterComponentProps<EmailUrlFilterData>) =>
  createElement(EmailAndUrlFilter as any, {
    ...(props as any),
    fieldTypeName: 'URL Input',
  });

registerFilter<EmailUrlFilterData>(
  URL_TYPE_ID,
  UrlFilterWrapper,
  'URL Input',
  () => null,
);

// Checkbox (injects fieldTypeName and options)
const CheckboxFilterWrapper = (
  props: FilterComponentProps<BooleanFilterData>,
) =>
  createElement(BooleanFilter as any, {
    ...(props as any),
    fieldTypeName: 'Checkbox',
  });

registerFilter<BooleanFilterData>(
  CHECKBOX_TYPE_ID,
  CheckboxFilterWrapper,
  'Checkbox',
  () => null,
);

// Radio Button
const RadioFilterWrapper = (
  props: FilterComponentProps<RadioDropdownFilterData>,
) =>
  createElement(RadioDropdownFilter as any, {
    ...(props as any),
    fieldTypeName: 'Radio Button',
  });

registerFilter<RadioDropdownFilterData>(
  RADIO_TYPE_ID,
  RadioFilterWrapper,
  'Radio Button',
  () => null,
);

// Dropdown Select
const DropdownFilterWrapper = (
  props: FilterComponentProps<RadioDropdownFilterData>,
) =>
  createElement(RadioDropdownFilter as any, {
    ...(props as any),
    fieldTypeName: 'Dropdown Select',
  });

registerFilter<RadioDropdownFilterData>(
  DROPDOWN_TYPE_ID,
  DropdownFilterWrapper,
  'Dropdown Select',
  () => null,
);

export {};

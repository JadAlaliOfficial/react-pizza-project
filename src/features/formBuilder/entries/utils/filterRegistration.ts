import TextFilter from '../components/filters/TextFilter';
import { registerFilter } from './filterRegistry';
import type { TextFilterData } from './filterRegistry';

// Field Type ID "1" is assumed to be "Text" in your backend.
registerFilter<TextFilterData>(
  1,
  TextFilter,
  'Text Input',
  () => null
);

export {};

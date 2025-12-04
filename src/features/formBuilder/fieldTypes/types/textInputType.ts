// Field from backend API structure
export type Field = {
  id: number;
  sectionid: number;
  fieldtypeid: number;
  label: string;
  placeholder?: string;
  helpertext?: string;
  defaultvalue?: string;
  visibilitycondition?: Record<string, any>;
  fieldType?: {
    id: number;
    name: string;
  };
  rules?: FieldRule[];
};

// Field Rule from backend
export type FieldRule = {
  id: number;
  fieldid: number;
  inputruleid: number;
  ruleprops?: Record<string, any>;
  rulecondition?: Record<string, any>;
  inputRule: InputRule;
};

// Input Rule from backend
export type InputRule = {
  id: number;
  name: string;
  description: string;
  ispublic: boolean;
  fieldTypes?: Array<{
    id: number;
    name: string;
  }>;
};

// Validation Rule for frontend state
export type ValidationRule = {
  id: string; // unique client-side ID
  inputRuleId: number; // backend InputRule ID
  name: string;
  ruleProps?: Record<string, any>;
  rulecondition?: Record<string, any>;
};

// Available Rule for dropdown selection
export type AvailableRule = {
  id: number;
  name: string;
  description: string;
};

// Form field value state
export type FieldValue = {
  fieldId: number;
  value: string;
};

// Form field error state
export type FieldError = {
  fieldId: number;
  errors: string[];
};

// Text Input Props for rendering
export type TextInputProps = {
  id: string;
  name?: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  helperText?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
};

// Text Input Field Config Props for admin
export type TextInputFieldConfigProps = {
  label: string;
  placeholder?: string;
  helperText?: string;
  defaultValue?: string;
  validationRules: ValidationRule[];
  availableRules: AvailableRule[];
  onLabelChange: (value: string) => void;
  onPlaceholderChange: (value: string) => void;
  onHelperTextChange: (value: string) => void;
  onDefaultValueChange: (value: string) => void;
  onAddRule: (ruleId: number) => void;
  onRemoveRule: (ruleId: string) => void;
  onUpdateRuleProps: (ruleId: string, props: Record<string, any>) => void;
};

// API Response Types
export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
};

export type InputRulesResponse = ApiResponse<InputRule[]>;

export type FieldTypesResponse = ApiResponse<
  Array<{
    id: number;
    name: string;
  }>
>;

// Redux State Slice Types
export type FormBuilderState = {
  fields: Record<number, Field>;
  availableInputRules: InputRule[];
  availableFieldTypes: Array<{ id: number; name: string }>;
  loading: boolean;
  error: string | null;
};

export type FormSubmissionState = {
  values: Record<number, string>; // fieldId -> value
  errors: Record<number, string>; // fieldId -> error message
  touched: Record<number, boolean>; // fieldId -> touched status
  isSubmitting: boolean;
};

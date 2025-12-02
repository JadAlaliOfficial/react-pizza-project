// features/formBuilder/inputRules/types/rule-base.ts

// Backend rule definition from API
export type BackendRuleDefinition = {
  id: number;
  name: string; // backend rule name, e.g. "after", "after_or_equal"
  description: string;
  is_public: boolean;
  field_types: {
    id: number;
    name: string;
    created_at: string;
    updated_at: string;
    pivot?: unknown;
  }[];
  created_at: string;
  updated_at: string;
};

// All rule type names (MUST MATCH backend "name")
export type RuleType =
  // Date-related rules
  | "after"
  | "after_or_equal"
  | "before"
  | "before_or_equal"
  | "date"
  | "date_format"
  // Numeric-related rules
  | "min"
  | "max"
  | "between"
  | "numeric"
  | "integer"
  // File-related rules
  | "mimes"
  | "mimetypes"
  | "size"
  | "max_file_size"
  | "min_file_size"
  | "dimensions"
  // Logic / string / other rules
  | "required"
  | "email"
  | "url"
  | "regex"
  | "alpha"
  | "alpha_num"
  | "in"
  | "alpha_dash"
  | "not_in"
  | "confirmed"
  | "same"
  | "different"
  | "unique"
  | "starts_with"
  | "json"
  | "ends_with"
  | "latitude"
  | "longitude";

// Generic base for any rule instance stored in Redux
export type RuleBase<TType extends RuleType, TProps> = {
  id: string;          // local instance id (UUID)
  enabled: boolean;
  type: TType;         // backend rule name
  inputRuleId: number; // backend rule id (input_rule_id in payload)
  props: TProps;       // rule-specific props (rule_props in payload)
};

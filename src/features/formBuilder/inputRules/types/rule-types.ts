// Base & strongly-typed rule models for the form builder
// ------------------------------------------------------

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

// 1) All rule type names (MUST MATCH backend "name")
// --------------------------------------------------
export type RuleType =
  | "after" // e.g. id 17
  | "after_or_equal"; // e.g. id 19
  // add more here: | "required" | "min" | ...

// 2) Generic base for any rule instance stored in Redux
// -----------------------------------------------------
export type RuleBase<TType extends RuleType, TProps> = {
  id: string;          // local instance id
  enabled: boolean;
  type: TType;         // backend rule name
  inputRuleId: number; // backend rule id (input_rule_id in payload)
  props: TProps;       // rule-specific props (rule_props in payload)
};

// 3) Rule-specific props & types
// ------------------------------

// AFTER ("after")
export type AfterRuleProps = {
  date?: string; // yyyy-mm-dd
};

export type AfterRuleData = RuleBase<"after", AfterRuleProps>;

// AFTER_OR_EQUAL ("after_or_equal")
export type AfterOrEqualRuleProps = {
  date?: string; // yyyy-mm-dd
};

export type AfterOrEqualRuleData = RuleBase<"after_or_equal", AfterOrEqualRuleProps>;

// 4) Union of all rule data types used in Redux
// ---------------------------------------------
export type RuleData =
  | AfterRuleData
  | AfterOrEqualRuleData;
// add more here as you define them

// 5) Redux slice state
// --------------------
export type RulesState = {
  rules: RuleData[];
};

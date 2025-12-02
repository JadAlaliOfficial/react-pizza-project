// features/formBuilder/inputRules/types/numeric-rule-types.ts

import type { RuleBase, RuleType } from "./rule-base";

// Narrowed helper type for numeric-related rule names
export type NumericRuleType = Extract<
  RuleType,
  | "min"
  | "max"
  | "between"
  | "numeric"
  | "integer"
>;

// 1) MIN ("min") -------------------------------------

export type MinRuleProps = {
  value?: number; // minimum value or minimum length
};

export type MinRuleData = RuleBase<"min", MinRuleProps>;

// 2) MAX ("max") -------------------------------------

export type MaxRuleProps = {
  value?: number; // maximum value or maximum length
};

export type MaxRuleData = RuleBase<"max", MaxRuleProps>;

// 3) BETWEEN ("between") -----------------------------

export type BetweenRuleProps = {
  min?: number;
  max?: number;
};

export type BetweenRuleData = RuleBase<"between", BetweenRuleProps>;

// 4) NUMERIC ("numeric") – no props ------------------

export type NumericRuleProps = Record<string, never>;

export type NumericRuleData = RuleBase<"numeric", NumericRuleProps>;

// 5) INTEGER ("integer") – no props ------------------

export type IntegerRuleProps = Record<string, never>;

export type IntegerRuleData = RuleBase<"integer", IntegerRuleProps>;

// 6) Union of all numeric rule data types ------------

export type NumericRuleDataUnion =
  | MinRuleData
  | MaxRuleData
  | BetweenRuleData
  | NumericRuleData
  | IntegerRuleData;

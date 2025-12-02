// features/formBuilder/inputRules/types/date-rule-types.ts

import type { RuleBase, RuleType } from "./rule-base";

// Narrowed helper type for date-related rule names
export type DateRuleType = Extract<
  RuleType,
  | "after"
  | "after_or_equal"
  | "before"
  | "before_or_equal"
  | "date"
  | "date_format"
>;

// 1) AFTER ("after") ---------------------------------

export type AfterRuleProps = {
  date?: string; // yyyy-mm-dd or ISO depending on your UI
};

export type AfterRuleData = RuleBase<"after", AfterRuleProps>;

// 2) AFTER_OR_EQUAL ("after_or_equal") --------------

export type AfterOrEqualRuleProps = {
  date?: string;
};

export type AfterOrEqualRuleData = RuleBase<"after_or_equal", AfterOrEqualRuleProps>;

// 3) BEFORE ("before") ------------------------------

export type BeforeRuleProps = {
  date?: string;
};

export type BeforeRuleData = RuleBase<"before", BeforeRuleProps>;

// 4) BEFORE_OR_EQUAL ("before_or_equal") ------------

export type BeforeOrEqualRuleProps = {
  date?: string;
};

export type BeforeOrEqualRuleData = RuleBase<"before_or_equal", BeforeOrEqualRuleProps>;

// 5) DATE ("date") – no props -----------------------

export type DateRuleProps = Record<string, never>; // or {}

export type DateRuleData = RuleBase<"date", DateRuleProps>;

// 6) DATE_FORMAT ("date_format") --------------------

export type DateFormatRuleProps = {
  format?: string; // e.g. "Y-m-d", "d/m/Y", etc.
};

export type DateFormatRuleData = RuleBase<"date_format", DateFormatRuleProps>;

// 7) Union of all date-rule data types --------------

export type DateRuleDataUnion =
  | AfterRuleData
  | AfterOrEqualRuleData
  | BeforeRuleData
  | BeforeOrEqualRuleData
  | DateRuleData
  | DateFormatRuleData;

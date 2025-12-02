// features/formBuilder/inputRules/types/logic-rule-types.ts

import type { RuleBase, RuleType } from "./rule-base";

// Narrowed helper type for logic/string/other rule names
export type LogicRuleType = Extract<
  RuleType,
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
  | "longitude"
>;

// 1) REQUIRED ("required") ---------------------------

export type RequiredRuleProps = Record<string, never>;

export type RequiredRuleData = RuleBase<"required", RequiredRuleProps>;

// 2) EMAIL ("email") ---------------------------------

export type EmailRuleProps = Record<string, never>;

export type EmailRuleData = RuleBase<"email", EmailRuleProps>;

// 3) URL ("url") -------------------------------------

export type UrlRuleProps = Record<string, never>;

export type UrlRuleData = RuleBase<"url", UrlRuleProps>;

// 4) REGEX ("regex") ---------------------------------

export type RegexRuleProps = {
  pattern?: string;
};

export type RegexRuleData = RuleBase<"regex", RegexRuleProps>;

// 5) ALPHA ("alpha") ---------------------------------

export type AlphaRuleProps = Record<string, never>;

export type AlphaRuleData = RuleBase<"alpha", AlphaRuleProps>;

// 6) ALPHA_NUM ("alpha_num") -------------------------

export type AlphaNumRuleProps = Record<string, never>;

export type AlphaNumRuleData = RuleBase<"alpha_num", AlphaNumRuleProps>;

// 7) IN ("in") ---------------------------------------

export type InRuleProps = {
  values?: string[]; // allowed values
};

export type InRuleData = RuleBase<"in", InRuleProps>;

// 8) ALPHA_DASH ("alpha_dash") -----------------------

export type AlphaDashRuleProps = Record<string, never>;

export type AlphaDashRuleData = RuleBase<"alpha_dash", AlphaDashRuleProps>;

// 9) NOT_IN ("not_in") -------------------------------

export type NotInRuleProps = {
  values?: string[]; // disallowed values
};

export type NotInRuleData = RuleBase<"not_in", NotInRuleProps>;

// 10) CONFIRMED ("confirmed") ------------------------
//
// Field must match a confirmation field (e.g., password confirmation)
export type ConfirmedRuleProps = {
  confirmationvalue?: string; // field/key to confirm against
};

export type ConfirmedRuleData = RuleBase<"confirmed", ConfirmedRuleProps>;

// 11) SAME ("same") ----------------------------------
//
// Field must match another field
export type SameRuleProps = {
  comparevalue?: string; // field/key to compare with
};

export type SameRuleData = RuleBase<"same", SameRuleProps>;

// 12) DIFFERENT ("different") ------------------------
//
// Field must be different from another field
export type DifferentRuleProps = {
  comparevalue?: string; // field/key to compare with
};

export type DifferentRuleData = RuleBase<"different", DifferentRuleProps>;

// 13) UNIQUE ("unique") ------------------------------

export type UniqueRuleProps = Record<string, never>;

export type UniqueRuleData = RuleBase<"unique", UniqueRuleProps>;

// 14) STARTS_WITH ("starts_with") --------------------
//
// String must start with specified value(s)
export type StartsWithRuleProps = {
  values?: string[];
};

export type StartsWithRuleData = RuleBase<"starts_with", StartsWithRuleProps>;

// 15) JSON ("json") ----------------------------------

export type JsonRuleProps = Record<string, never>;

export type JsonRuleData = RuleBase<"json", JsonRuleProps>;

// 16) ENDS_WITH ("ends_with") ------------------------
//
// String must end with specified value(s)
export type EndsWithRuleProps = {
  values?: string[];
};

export type EndsWithRuleData = RuleBase<"ends_with", EndsWithRuleProps>;

// 17) LATITUDE ("latitude") --------------------------

export type LatitudeRuleProps = Record<string, never>;

export type LatitudeRuleData = RuleBase<"latitude", LatitudeRuleProps>;

// 18) LONGITUDE ("longitude") ------------------------

export type LongitudeRuleProps = Record<string, never>;

export type LongitudeRuleData = RuleBase<"longitude", LongitudeRuleProps>;

// 19) Union of all logic rule data types -------------

export type LogicRuleDataUnion =
  | RequiredRuleData
  | EmailRuleData
  | UrlRuleData
  | RegexRuleData
  | AlphaRuleData
  | AlphaNumRuleData
  | InRuleData
  | AlphaDashRuleData
  | NotInRuleData
  | ConfirmedRuleData
  | SameRuleData
  | DifferentRuleData
  | UniqueRuleData
  | StartsWithRuleData
  | JsonRuleData
  | EndsWithRuleData
  | LatitudeRuleData
  | LongitudeRuleData;

// features/formBuilder/inputRules/types/rule-data.ts

import type { DateRuleDataUnion } from "./date-rule-types";
import type { NumericRuleDataUnion } from "./numeric-rule-types";
import type { FileRuleDataUnion } from "./file-rule-types";
import type { LogicRuleDataUnion } from "./logic-rule-types";

// Global union of all rule data types used in Redux
export type RuleData =
  | DateRuleDataUnion
  | NumericRuleDataUnion
  | FileRuleDataUnion
  | LogicRuleDataUnion;

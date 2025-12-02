// features/formBuilder/inputRules/config/ruleRegistry.ts

import type { RuleType } from "@/features/formBuilder/inputRules/types/rule-base";
import type { RuleRegistryEntry } from "./ruleRegistry.types";

import { DATE_RULE_REGISTRY } from "./dateRuleRegistry";
import { NUMERIC_RULE_REGISTRY } from "./numericRuleRegistry";
import { FILE_RULE_REGISTRY } from "./fileRuleRegistry";
import { LOGIC_RULE_REGISTRY } from "./logicRuleRegistry";

export const RULE_REGISTRY: Record<RuleType, RuleRegistryEntry> = {
  // Date group
  ...DATE_RULE_REGISTRY,
  // Numeric group
  ...NUMERIC_RULE_REGISTRY,
  // File group
  ...FILE_RULE_REGISTRY,
  // Logic / string / other group
  ...LOGIC_RULE_REGISTRY,
};

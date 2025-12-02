// features/formBuilder/inputRules/types/rule-types.ts
// ------------------------------------------------------------------
// Barrel file to keep legacy imports working and point everything
// to the new modular type system.
//
// Any old code importing from "types/rule-types" will now receive:
// - RuleType, RuleBase, BackendRuleDefinition from rule-base.ts
// - RuleData from rule-data.ts (the full union of all rule groups)
// - RulesState from rules-state.ts
// ------------------------------------------------------------------

export type {
  BackendRuleDefinition,
  RuleType,
  RuleBase,
} from "./rule-base";

export type { RuleData } from "./rule-data";

export type { RulesState } from "./rules-state";

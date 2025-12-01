// config/ruleRegistry.ts
import type { FC } from "react";
import type {
  RuleData,
  RuleType,
  AfterRuleData,
  AfterOrEqualRuleData,
} from "@/features/formBuilder/inputRules/types/rule-types";
import { AfterDateRule } from "@/features/formBuilder/inputRules/components/AfterDateRuleNew";
import { AfterOrEqualRule } from "@/features/formBuilder/inputRules/components/AfterOrEqualRuleNew";

// Component props for rule UIs
type RuleComponentProps = { id: string };

// One registry entry per rule type
type RuleRegistryEntry = {
  // Creates a default rule instance for this type
  makeDefault: (inputRuleId: number) => RuleData;
  // React component that renders this rule's UI
  Component: FC<RuleComponentProps>;
  // Optional metadata for labels, etc.
  label: string;
  description?: string;
};

// Central registry of all rule types
// ----------------------------------
// When you add a new rule type, add one object here.
export const RULE_REGISTRY: Record<RuleType, RuleRegistryEntry> = {
  after: {
    label: "After Date",
    description: "Date must be after a specified date",
    makeDefault: (inputRuleId: number): RuleData => {
      const rule: AfterRuleData = {
        id: crypto.randomUUID(),
        type: "after",
        inputRuleId,
        enabled: false,
        props: {
          date: undefined, // no date chosen yet
        },
      };
      return rule;
    },
    Component: AfterDateRule,
  },

  after_or_equal: {
    label: "After Or Equal Date",
    description: "Date must be after or equal to the specified date",
    makeDefault: (inputRuleId: number): RuleData => {
      const rule: AfterOrEqualRuleData = {
        id: crypto.randomUUID(),
        type: "after_or_equal",
        inputRuleId,
        enabled: false,
        props: {
          date: undefined,
        },
      };
      return rule;
    },
    Component: AfterOrEqualRule,
  },

  // Example for a future rule:
  // required: {
  //   label: "Required",
  //   description: "Field must not be empty",
  //   makeDefault: (inputRuleId): RuleData => {
  //     const rule: RequiredRuleData = {
  //       id: crypto.randomUUID(),
  //       type: "required",
  //       inputRuleId,
  //       enabled: false,
  //       props: {}, // maybe no props at all
  //     };
  //     return rule;
  //   },
  //   Component: RequiredRule,
  // },
};

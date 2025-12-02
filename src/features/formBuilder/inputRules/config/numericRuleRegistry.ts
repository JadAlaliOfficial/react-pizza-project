// features/formBuilder/inputRules/config/numericRuleRegistry.ts

import type { RuleRegistryEntry } from "./ruleRegistry.types";
import type {
  NumericRuleType,
  NumericRuleDataUnion,
  MinRuleData,
  MaxRuleData,
  BetweenRuleData,
  NumericRuleData,
  IntegerRuleData,
} from "@/features/formBuilder/inputRules/types/numeric-rule-types";

import { MinRuleNew } from "@/features/formBuilder/inputRules/components/MinRuleNew";
import { MaxRuleNew } from "@/features/formBuilder/inputRules/components/MaxRuleNew";
import { BetweenRuleNew } from "@/features/formBuilder/inputRules/components/BetweenRuleNew";
import { NumericRuleNew } from "@/features/formBuilder/inputRules/components/NumericRuleNew";
import { IntegerRuleNew } from "@/features/formBuilder/inputRules/components/IntegerRuleNew";

export const NUMERIC_RULE_REGISTRY: Record<NumericRuleType, RuleRegistryEntry> = {
  min: {
    label: "Minimum",
    description: "Minimum length (for text) or minimum value (for numbers)",
    makeDefault: (inputRuleId: number): NumericRuleDataUnion => {
      const rule: MinRuleData = {
        id: crypto.randomUUID(),
        type: "min",
        inputRuleId,
        enabled: false,
        props: {
          value: undefined,
        },
      };
      return rule;
    },
    Component: MinRuleNew,
  },

  max: {
    label: "Maximum",
    description: "Maximum length (for text) or maximum value (for numbers)",
    makeDefault: (inputRuleId: number): NumericRuleDataUnion => {
      const rule: MaxRuleData = {
        id: crypto.randomUUID(),
        type: "max",
        inputRuleId,
        enabled: false,
        props: {
          value: undefined,
        },
      };
      return rule;
    },
    Component: MaxRuleNew,
  },

  between: {
    label: "Between",
    description: "Value must be between the specified minimum and maximum",
    makeDefault: (inputRuleId: number): NumericRuleDataUnion => {
      const rule: BetweenRuleData = {
        id: crypto.randomUUID(),
        type: "between",
        inputRuleId,
        enabled: false,
        props: {
          min: undefined,
          max: undefined,
        },
      };
      return rule;
    },
    Component: BetweenRuleNew,
  },

  numeric: {
    label: "Numeric",
    description: "Must be a numeric value",
    makeDefault: (inputRuleId: number): NumericRuleDataUnion => {
      const rule: NumericRuleData = {
        id: crypto.randomUUID(),
        type: "numeric",
        inputRuleId,
        enabled: false,
        props: {},
      };
      return rule;
    },
    Component: NumericRuleNew,
  },

  integer: {
    label: "Integer",
    description: "Must be an integer value",
    makeDefault: (inputRuleId: number): NumericRuleDataUnion => {
      const rule: IntegerRuleData = {
        id: crypto.randomUUID(),
        type: "integer",
        inputRuleId,
        enabled: false,
        props: {},
      };
      return rule;
    },
    Component: IntegerRuleNew,
  },
};

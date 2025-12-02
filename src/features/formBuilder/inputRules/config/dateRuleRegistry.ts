// features/formBuilder/inputRules/config/dateRuleRegistry.ts

import type { RuleRegistryEntry } from "./ruleRegistry.types";
import type {
  DateRuleType,
  DateRuleDataUnion,
  AfterRuleData,
  AfterOrEqualRuleData,
  BeforeRuleData,
  BeforeOrEqualRuleData,
  DateRuleData,
  DateFormatRuleData,
} from "@/features/formBuilder/inputRules/types/date-rule-types";

import { AfterDateRule } from "@/features/formBuilder/inputRules/components/AfterDateRuleNew";
import { AfterOrEqualRule } from "@/features/formBuilder/inputRules/components/AfterOrEqualRuleNew";

import { BeforeDateRuleNew } from "@/features/formBuilder/inputRules/components/BeforeDateRuleNew";
import { BeforeOrEqualRuleNew } from "@/features/formBuilder/inputRules/components/BeforeOrEqualRuleNew";
import { DateRuleNew } from "@/features/formBuilder/inputRules/components/DateRuleNew";
import { DateFormatRuleNew } from "@/features/formBuilder/inputRules/components/DateFormatRuleNew";

export const DATE_RULE_REGISTRY: Record<DateRuleType, RuleRegistryEntry> = {
  after: {
    label: "After Date",
    description: "Date must be after a specified date",
    makeDefault: (inputRuleId: number): DateRuleDataUnion => {
      const rule: AfterRuleData = {
        id: crypto.randomUUID(),
        type: "after",
        inputRuleId,
        enabled: false,
        props: {
          date: undefined,
        },
      };
      return rule;
    },
    Component: AfterDateRule,
  },

  after_or_equal: {
    label: "After Or Equal Date",
    description: "Date must be after or equal to a specified date",
    makeDefault: (inputRuleId: number): DateRuleDataUnion => {
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

  before: {
    label: "Before Date",
    description: "Date must be before a specified date",
    makeDefault: (inputRuleId: number): DateRuleDataUnion => {
      const rule: BeforeRuleData = {
        id: crypto.randomUUID(),
        type: "before",
        inputRuleId,
        enabled: false,
        props: {
          date: undefined,
        },
      };
      return rule;
    },
    Component: BeforeDateRuleNew,
  },

  before_or_equal: {
    label: "Before Or Equal Date",
    description: "Date must be before or equal to a specified date",
    makeDefault: (inputRuleId: number): DateRuleDataUnion => {
      const rule: BeforeOrEqualRuleData = {
        id: crypto.randomUUID(),
        type: "before_or_equal",
        inputRuleId,
        enabled: false,
        props: {
          date: undefined,
        },
      };
      return rule;
    },
    Component: BeforeOrEqualRuleNew,
  },

  date: {
    label: "Valid Date",
    description: "Must be a valid date",
    makeDefault: (inputRuleId: number): DateRuleDataUnion => {
      const rule: DateRuleData = {
        id: crypto.randomUUID(),
        type: "date",
        inputRuleId,
        enabled: false,
        props: {}, // no props
      };
      return rule;
    },
    Component: DateRuleNew,
  },

  date_format: {
    label: "Date Format",
    description: "Date must match a specific format",
    makeDefault: (inputRuleId: number): DateRuleDataUnion => {
      const rule: DateFormatRuleData = {
        id: crypto.randomUUID(),
        type: "date_format",
        inputRuleId,
        enabled: false,
        props: {
          format: undefined,
        },
      };
      return rule;
    },
    Component: DateFormatRuleNew,
  },
};

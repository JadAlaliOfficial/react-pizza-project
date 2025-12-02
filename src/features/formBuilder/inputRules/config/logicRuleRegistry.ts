// features/formBuilder/inputRules/config/logicRuleRegistry.ts

import type {
  LogicRuleType,
  LogicRuleDataUnion,
  RequiredRuleData,
  EmailRuleData,
  UrlRuleData,
  RegexRuleData,
  AlphaRuleData,
  AlphaNumRuleData,
  InRuleData,
  AlphaDashRuleData,
  NotInRuleData,
  ConfirmedRuleData,
  SameRuleData,
  DifferentRuleData,
  UniqueRuleData,
  StartsWithRuleData,
  JsonRuleData,
  EndsWithRuleData,
  LatitudeRuleData,
  LongitudeRuleData,
} from "@/features/formBuilder/inputRules/types/logic-rule-types";
import type { RuleRegistryEntry } from "./ruleRegistry.types";
import { RequiredRule } from "@/features/formBuilder/inputRules/components/RequiredRuleNew";
import { EmailRule } from "@/features/formBuilder/inputRules/components/EmailRuleNew";
import { UrlRule } from "@/features/formBuilder/inputRules/components/UrlRuleNew";
import { RegexRule } from "@/features/formBuilder/inputRules/components/RegexRuleNew";
import { AlphaRule } from "@/features/formBuilder/inputRules/components/AlphaRuleNew";
import { AlphaNumericRule } from "@/features/formBuilder/inputRules/components/AlphaNumericRuleNew";
import { InRule } from "@/features/formBuilder/inputRules/components/InRuleNew";
import { AlphaDashRule } from "@/features/formBuilder/inputRules/components/AlphaDashRuleNew";
import { NotInRule } from "@/features/formBuilder/inputRules/components/NotInRuleNew";
import { ConfirmedRule } from "@/features/formBuilder/inputRules/components/ConfirmedRuleNew";
import { SameRule } from "@/features/formBuilder/inputRules/components/SameRuleNew";
import { DifferentRule } from "@/features/formBuilder/inputRules/components/DifferentRuleNew";
import { UniqueRule } from "@/features/formBuilder/inputRules/components/UniqueRuleNew";
import { StartsWithRule } from "@/features/formBuilder/inputRules/components/StartsWithRuleNew";
import { JSONRule } from "@/features/formBuilder/inputRules/components/JSONRuleNew";
import { EndsWithRule } from "@/features/formBuilder/inputRules/components/EndsWithRuleNew";
import { LatitudeRule } from "@/features/formBuilder/inputRules/components/LatitudeRuleNew";
import { LongitudeRule } from "@/features/formBuilder/inputRules/components/LongitudeRuleNew";

export const LOGIC_RULE_REGISTRY: Record<LogicRuleType, RuleRegistryEntry> = {
  required: {
    label: "Required",
    description: "Field must have a value",
    makeDefault: (inputRuleId: number): LogicRuleDataUnion => {
      const rule: RequiredRuleData = {
        id: crypto.randomUUID(),
        type: "required",
        inputRuleId,
        enabled: false,
        props: {},
      };
      return rule;
    },
    Component: RequiredRule,
  },

  email: {
    label: "Email",
    description: "Must be a valid email address",
    makeDefault: (inputRuleId: number): LogicRuleDataUnion => {
      const rule: EmailRuleData = {
        id: crypto.randomUUID(),
        type: "email",
        inputRuleId,
        enabled: false,
        props: {},
      };
      return rule;
    },
    Component: EmailRule,
  },

  url: {
    label: "URL",
    description: "Must be a valid URL",
    makeDefault: (inputRuleId: number): LogicRuleDataUnion => {
      const rule: UrlRuleData = {
        id: crypto.randomUUID(),
        type: "url",
        inputRuleId,
        enabled: false,
        props: {},
      };
      return rule;
    },
    Component: UrlRule,
  },

  regex: {
    label: "Regex",
    description: "Must match a specific regular expression pattern",
    makeDefault: (inputRuleId: number): LogicRuleDataUnion => {
      const rule: RegexRuleData = {
        id: crypto.randomUUID(),
        type: "regex",
        inputRuleId,
        enabled: false,
        props: {
          pattern: undefined,
        },
      };
      return rule;
    },
    Component: RegexRule,
  },

  alpha: {
    label: "Alpha",
    description: "Must contain only alphabetic characters",
    makeDefault: (inputRuleId: number): LogicRuleDataUnion => {
      const rule: AlphaRuleData = {
        id: crypto.randomUUID(),
        type: "alpha",
        inputRuleId,
        enabled: false,
        props: {},
      };
      return rule;
    },
    Component: AlphaRule,
  },

  alpha_num: {
    label: "Alpha Numeric",
    description: "Must contain only alphanumeric characters",
    makeDefault: (inputRuleId: number): LogicRuleDataUnion => {
      const rule: AlphaNumRuleData = {
        id: crypto.randomUUID(),
        type: "alpha_num",
        inputRuleId,
        enabled: false,
        props: {},
      };
      return rule;
    },
    Component: AlphaNumericRule,
  },

  in: {
    label: "In",
    description: "Must be one of the specified values",
    makeDefault: (inputRuleId: number): LogicRuleDataUnion => {
      const rule: InRuleData = {
        id: crypto.randomUUID(),
        type: "in",
        inputRuleId,
        enabled: false,
        props: {
          values: undefined,
        },
      };
      return rule;
    },
    Component: InRule,
  },

  alpha_dash: {
    label: "Alpha Dash",
    description:
      "Must contain only alphanumeric characters, dashes, and underscores",
    makeDefault: (inputRuleId: number): LogicRuleDataUnion => {
      const rule: AlphaDashRuleData = {
        id: crypto.randomUUID(),
        type: "alpha_dash",
        inputRuleId,
        enabled: false,
        props: {},
      };
      return rule;
    },
    Component: AlphaDashRule,
  },

  not_in: {
    label: "Not In",
    description: "Must not be one of the specified values",
    makeDefault: (inputRuleId: number): LogicRuleDataUnion => {
      const rule: NotInRuleData = {
        id: crypto.randomUUID(),
        type: "not_in",
        inputRuleId,
        enabled: false,
        props: {
          values: undefined,
        },
      };
      return rule;
    },
    Component: NotInRule,
  },

  confirmed: {
    label: "Confirmed",
    description:
      "Field must match a confirmation field (e.g., password confirmation)",
    makeDefault: (inputRuleId: number): LogicRuleDataUnion => {
      const rule: ConfirmedRuleData = {
        id: crypto.randomUUID(),
        type: "confirmed",
        inputRuleId,
        enabled: false,
        props: {
          confirmationvalue: undefined,
        },
      };
      return rule;
    },
    Component: ConfirmedRule,
  },

  same: {
    label: "Same",
    description: "Field must match another field",
    makeDefault: (inputRuleId: number): LogicRuleDataUnion => {
      const rule: SameRuleData = {
        id: crypto.randomUUID(),
        type: "same",
        inputRuleId,
        enabled: false,
        props: {
          comparevalue: undefined,
        },
      };
      return rule;
    },
    Component: SameRule,
  },

  different: {
    label: "Different",
    description: "Field must be different from another field",
    makeDefault: (inputRuleId: number): LogicRuleDataUnion => {
      const rule: DifferentRuleData = {
        id: crypto.randomUUID(),
        type: "different",
        inputRuleId,
        enabled: false,
        props: {
          comparevalue: undefined,
        },
      };
      return rule;
    },
    Component: DifferentRule,
  },

  unique: {
    label: "Unique",
    description: "Value must be unique across all entries",
    makeDefault: (inputRuleId: number): LogicRuleDataUnion => {
      const rule: UniqueRuleData = {
        id: crypto.randomUUID(),
        type: "unique",
        inputRuleId,
        enabled: false,
        props: {},
      };
      return rule;
    },
    Component: UniqueRule,
  },

  starts_with: {
    label: "Starts With",
    description: "String must start with specified value(s)",
    makeDefault: (inputRuleId: number): LogicRuleDataUnion => {
      const rule: StartsWithRuleData = {
        id: crypto.randomUUID(),
        type: "starts_with",
        inputRuleId,
        enabled: false,
        props: {
          values: undefined,
        },
      };
      return rule;
    },
    Component: StartsWithRule,
  },

  json: {
    label: "JSON",
    description: "Field must be valid JSON",
    makeDefault: (inputRuleId: number): LogicRuleDataUnion => {
      const rule: JsonRuleData = {
        id: crypto.randomUUID(),
        type: "json",
        inputRuleId,
        enabled: false,
        props: {},
      };
      return rule;
    },
    Component: JSONRule,
  },

  ends_with: {
    label: "Ends With",
    description: "String must end with specified value(s)",
    makeDefault: (inputRuleId: number): LogicRuleDataUnion => {
      const rule: EndsWithRuleData = {
        id: crypto.randomUUID(),
        type: "ends_with",
        inputRuleId,
        enabled: false,
        props: {
          values: undefined,
        },
      };
      return rule;
    },
    Component: EndsWithRule,
  },

  latitude: {
    label: "Latitude",
    description: "Must be a valid latitude coordinate",
    makeDefault: (inputRuleId: number): LogicRuleDataUnion => {
      const rule: LatitudeRuleData = {
        id: crypto.randomUUID(),
        type: "latitude",
        inputRuleId,
        enabled: false,
        props: {},
      };
      return rule;
    },
    Component: LatitudeRule,
  },

  longitude: {
    label: "Longitude",
    description: "Must be a valid longitude coordinate",
    makeDefault: (inputRuleId: number): LogicRuleDataUnion => {
      const rule: LongitudeRuleData = {
        id: crypto.randomUUID(),
        type: "longitude",
        inputRuleId,
        enabled: false,
        props: {},
      };
      return rule;
    },
    Component: LongitudeRule,
  },
};

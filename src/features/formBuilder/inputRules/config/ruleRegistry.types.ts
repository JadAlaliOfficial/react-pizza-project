// features/formBuilder/inputRules/config/ruleRegistry.types.ts

import type { FC } from "react";
import type { RuleData } from "@/features/formBuilder/inputRules/types/rule-data";

export type RuleComponentProps = { id: string };

export type RuleRegistryEntry = {
  // Create a default rule instance for this type
  makeDefault: (inputRuleId: number) => RuleData;
  // React component that renders this rule's UI
  Component: FC<RuleComponentProps>;
  // Optional metadata for labels, etc.
  label: string;
  description?: string;
};

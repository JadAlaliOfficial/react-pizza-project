// features/formBuilder/inputRules/hooks/useRule.ts

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectRuleById } from "@/features/formBuilder/inputRules/store/rulesSelectors";
import {
  updateRule,
  removeRule,
} from "@/features/formBuilder/inputRules/store/rulesSlice";
import type { RuleData } from "@/features/formBuilder/inputRules/types/rule-data";

// Generic hook for working with a single rule instance
// ----------------------------------------------------
// - `T` is a specific RuleData type (e.g. AfterRuleData, AlphaDashRuleData).
// - `patch` lets you update ANY part of the rule (enabled, props, etc.).
// - `setEnabled` is a convenience for toggling enable/disable.
// - `deleteRule` removes the rule instance from Redux.
export function useRule<T extends RuleData>(id: string) {
  const dispatch = useAppDispatch();
  const rule = useAppSelector(selectRuleById(id)) as T | undefined;

  const patch = (p: Partial<T>) => {
    dispatch(updateRule({ id, patch: p as Partial<RuleData> }));
  };

  const setEnabled = (enabled: boolean) => {
    patch({ enabled } as Partial<T>);
  };

  const deleteRule = () => dispatch(removeRule({ id }));

  return { rule, patch, setEnabled, deleteRule };
}

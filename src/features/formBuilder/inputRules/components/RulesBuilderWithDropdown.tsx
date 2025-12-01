import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addRule } from "@/features/formBuilder/inputRules/store/rulesSlice";
import { selectRules } from "@/features/formBuilder/inputRules/store/rulesSelectors";
import type {
  RuleData,
  RuleType,
} from "@/features/formBuilder/inputRules/types/rule-types";
import { useInputRules } from "@/features/formBuilder/inputRules/hooks/useInputRules";
import { RULE_REGISTRY } from "@/features/formBuilder/inputRules/config/ruleRegistry";

export function RulesBuilderWithDropdown() {
  const dispatch = useAppDispatch();

  // Backend rule definitions
  const { items, loading, error } = useInputRules();
  const rules = useAppSelector(selectRules);

  // Stores backend rule "name" (e.g. "after" or "after_or_equal")
  const [selectedRuleName, setSelectedRuleName] = useState<string>("");

  const handleAddSelectedRule = () => {
    if (!selectedRuleName) return;

    const definition = items.find((r) => r.name === selectedRuleName);
    if (!definition) {
      console.warn(
        "[RulesBuilderWithDropdown] Selected rule not found in backend items:",
        selectedRuleName
      );
      return;
    }

    const type = definition.name as RuleType;

    if (!RULE_REGISTRY[type]) {
      console.warn(
        "[RulesBuilderWithDropdown] No registry entry for backend rule type:",
        type
      );
      return;
    }

    dispatch(
      addRule({
        type,
        inputRuleId: definition.id,
      })
    );

    setSelectedRuleName("");
  };

  const renderRule = (rule: RuleData) => {
    const entry = RULE_REGISTRY[rule.type];
    if (!entry) return null;

    const Component = entry.Component;
    return <Component key={rule.id} id={rule.id} />;
  };

  return (
    <div className="space-y-4">
      {/* Dropdown section */}
      <div className="flex items-end gap-2">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Add rule</label>

          <select
            className="h-9 w-56 rounded-md border bg-background px-2 text-sm"
            value={selectedRuleName}
            onChange={(e) => setSelectedRuleName(e.target.value)}
            disabled={loading}
          >
            <option value="">
              {loading ? "Loading rules..." : "Select a rule"}
            </option>

            {items.map((r) => (
              <option key={r.id} value={r.name}>
                {/* You can keep r.name or later map to RULE_REGISTRY[r.name]?.label */}
                {r.name}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleAddSelectedRule}
          disabled={!selectedRuleName || loading}
          className="h-9 rounded-md bg-primary px-3 text-sm text-primary-foreground disabled:opacity-50"
        >
          Add
        </button>
      </div>

      {/* Errors / empty state */}
      {error && (
        <p className="text-sm text-destructive">
          Failed to load rules: {error}
        </p>
      )}

      {/* Render chosen rules */}
      <div className="space-y-3">
        {rules.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No rules added yet.
          </p>
        ) : (
          rules.map(renderRule)
        )}
      </div>
    </div>
  );
}

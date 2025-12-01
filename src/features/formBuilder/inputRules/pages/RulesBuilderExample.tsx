import { useAppSelector } from "@/store/hooks";
import {
  selectRules,
  selectEnabledRules,
} from "@/features/formBuilder/inputRules/store/rulesSelectors";
import type {
  RuleData,
} from "@/features/formBuilder/inputRules/types/rule-types";
import { RulesBuilderWithDropdown } from "@/features/formBuilder/inputRules/components/RulesBuilderWithDropdown";
import { RULE_REGISTRY } from "@/features/formBuilder/inputRules/config/ruleRegistry";

export function RulesBuilderExample() {
  const rules = useAppSelector(selectRules);
  const enabledRules = useAppSelector(selectEnabledRules);

  const renderRule = (rule: RuleData) => {
    const entry = RULE_REGISTRY[rule.type];
    if (!entry) return null;

    const Component = entry.Component;
    return <Component key={rule.id} id={rule.id} />;
  };

  const handleSubmit = async () => {
    const finalPayload = {
      rules: enabledRules.map((r) => ({
        input_rule_id: r.inputRuleId,
        rule_props: r.props,
        rule_condition: null,
      })),
    };

    console.log("[RulesBuilder] finalPayload to save:", finalPayload);

    await fetch("/api/fields/rules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(finalPayload),
    });
  };

  return (
    <div className="space-y-4">
      <div className="text-sm font-medium text-muted-foreground">
        <RulesBuilderWithDropdown />
      </div>

      <div className="space-y-3">
        {rules.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No rules added yet.
          </p>
        ) : (
          rules.map(renderRule)
        )}
      </div>

      <div className="pt-2">
        <button
          onClick={handleSubmit}
          className="px-4 py-2 rounded bg-secondary"
        >
          Save Rules ({enabledRules.length} enabled)
        </button>
      </div>
    </div>
  );
}

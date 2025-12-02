// features/formBuilder/inputRules/components/NumericRuleNew.tsx

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

import { useRule } from "@/features/formBuilder/inputRules/hooks/useRule";
import type {
  NumericRuleData,
} from "@/features/formBuilder/inputRules/types/numeric-rule-types";

type Props = { id: string };

// UI for the "numeric" rule
// -------------------------
// Backend name: "numeric"
// Props: {} (no props, just enabled flag)
export function NumericRuleNew({ id }: Props) {
  const { rule, setEnabled } = useRule<NumericRuleData>(id);
  if (!rule) return null;

  const { enabled } = rule;

  return (
    <div className="flex items-center space-x-2 p-3 border rounded-md hover:bg-accent/50 transition-colors">
      <Checkbox
        id={`rule-numeric-${id}`}
        checked={enabled}
        onCheckedChange={(val) => setEnabled(!!val)}
      />
      <div className="flex-1">
        <Label
          htmlFor={`rule-numeric-${id}`}
          className="text-sm font-medium cursor-pointer"
        >
          Numeric
        </Label>
        <p className="text-xs text-muted-foreground mt-0.5">
          Field must be a numeric value
        </p>
      </div>
    </div>
  );
}

// features/formBuilder/inputRules/components/AlphaNumericRuleNew.tsx

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useRule } from "@/features/formBuilder/inputRules/hooks/useRule";
import type {
  AlphaNumRuleData,
} from "@/features/formBuilder/inputRules/types/logic-rule-types";

type Props = { id: string };

// UI for the "alpha_num" rule
// ---------------------------
// Backend name: "alpha_num"
// Props: {} (no props, only enabled flag)
export function AlphaNumericRule({ id }: Props) {
  const { rule, setEnabled } = useRule<AlphaNumRuleData>(id);
  if (!rule) return null;

  const { enabled } = rule;

  return (
    <div className="flex items-center space-x-2 p-3 border rounded-md hover:bg-accent/50 transition-colors">
      <Checkbox
        id={`rule-alpha-numeric-${id}`}
        checked={enabled}
        onCheckedChange={(val) => setEnabled(!!val)}
      />
      <div className="flex-1">
        <Label
          htmlFor={`rule-alpha-numeric-${id}`}
          className="text-sm font-medium cursor-pointer"
        >
          Alpha Numeric
        </Label>
        <p className="text-xs text-muted-foreground mt-0.5">
          Field must contain only alphabetic and numeric characters
        </p>
      </div>
    </div>
  );
}

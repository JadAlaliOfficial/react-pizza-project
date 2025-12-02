// features/formBuilder/inputRules/components/IntegerRuleNew.tsx

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

import { useRule } from "@/features/formBuilder/inputRules/hooks/useRule";
import type {
  IntegerRuleData,
} from "@/features/formBuilder/inputRules/types/numeric-rule-types";

type Props = { id: string };

// UI for the "integer" rule
// -------------------------
// Backend name: "integer"
// Props: {} (no props — only enabled flag)
export function IntegerRuleNew({ id }: Props) {
  const { rule, setEnabled } = useRule<IntegerRuleData>(id);
  if (!rule) return null;

  const { enabled } = rule;

  return (
    <div className="flex items-center space-x-2 p-3 border rounded-md hover:bg-accent/50 transition-colors">
      <Checkbox
        id={`rule-integer-${id}`}
        checked={enabled}
        onCheckedChange={(val) => setEnabled(!!val)}
      />

      <div className="flex-1">
        <Label
          htmlFor={`rule-integer-${id}`}
          className="text-sm font-medium cursor-pointer"
        >
          Integer
        </Label>

        <p className="text-xs text-muted-foreground mt-0.5">
          Field must be an integer value (no decimals)
        </p>
      </div>
    </div>
  );
}

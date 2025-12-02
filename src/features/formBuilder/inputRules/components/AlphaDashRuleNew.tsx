// features/formBuilder/inputRules/components/AlphaDashRuleNew.tsx

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useRule } from "@/features/formBuilder/inputRules/hooks/useRule";
import type {
  AlphaDashRuleData,
} from "@/features/formBuilder/inputRules/types/logic-rule-types";

type Props = { id: string };

// UI for the "alpha_dash" rule
// -----------------------------
// Backend name: "alpha_dash"
// Props: {} (no props, only enabled flag)
export function AlphaDashRule({ id }: Props) {
  const { rule, setEnabled } = useRule<AlphaDashRuleData>(id);
  if (!rule) return null;

  const { enabled } = rule;

  return (
    <div className="flex items-center space-x-2 p-3 border rounded-md hover:bg-accent/50 transition-colors">
      <Checkbox
        id={`rule-alpha-dash-${id}`}
        checked={enabled}
        onCheckedChange={(val) => setEnabled(!!val)}
      />
      <div className="flex-1">
        <Label
          htmlFor={`rule-alpha-dash-${id}`}
          className="text-sm font-medium cursor-pointer"
        >
          Alpha Dash
        </Label>
        <p className="text-xs text-muted-foreground mt-0.5">
          Field must contain only alphanumeric characters, dashes, and underscores
        </p>
      </div>
    </div>
  );
}

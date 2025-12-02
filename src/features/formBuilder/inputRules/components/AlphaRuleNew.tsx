// features/formBuilder/inputRules/components/AlphaRuleNew.tsx

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useRule } from "@/features/formBuilder/inputRules/hooks/useRule";
import type {
  AlphaRuleData,
} from "@/features/formBuilder/inputRules/types/logic-rule-types";

type Props = { id: string };

// UI for the "alpha" rule
// -----------------------
// Backend name: "alpha"
// Props: {} (no custom props, only enabled)
export function AlphaRule({ id }: Props) {
  const { rule, setEnabled } = useRule<AlphaRuleData>(id);
  if (!rule) return null;

  const { enabled } = rule;

  return (
    <div className="flex items-center space-x-2 p-3 border rounded-md hover:bg-accent/50 transition-colors">
      <Checkbox
        id={`rule-alpha-${id}`}
        checked={enabled}
        onCheckedChange={(val) => setEnabled(!!val)}
      />
      <div className="flex-1">
        <Label
          htmlFor={`rule-alpha-${id}`}
          className="text-sm font-medium cursor-pointer"
        >
          Alpha
        </Label>
        <p className="text-xs text-muted-foreground mt-0.5">
          Field must contain only alphabetic characters
        </p>
      </div>
    </div>
  );
}

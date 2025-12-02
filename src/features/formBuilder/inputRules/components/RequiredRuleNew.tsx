// features/formBuilder/inputRules/components/RequiredRuleNew.tsx

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useRule } from "@/features/formBuilder/inputRules/hooks/useRule";
import type {
  RequiredRuleData,
} from "@/features/formBuilder/inputRules/types/logic-rule-types";

type Props = { id: string };

// UI for the "required" rule
// --------------------------
// Backend name: "required"
// Props: {} (no custom props, only enabled)
export function RequiredRule({ id }: Props) {
  const { rule, setEnabled } = useRule<RequiredRuleData>(id);
  if (!rule) return null;

  const { enabled } = rule;

  return (
    <div className="flex items-center space-x-2 p-3 border rounded-md hover:bg-accent/50 transition-colors">
      <Checkbox
        id={`rule-required-${id}`}
        checked={enabled}
        onCheckedChange={(val) => setEnabled(!!val)}
      />
      <div className="flex-1">
        <Label
          htmlFor={`rule-required-${id}`}
          className="text-sm font-medium cursor-pointer"
        >
          Required
        </Label>
        <p className="text-xs text-muted-foreground mt-0.5">
          Field must have a value
        </p>
      </div>
    </div>
  );
}

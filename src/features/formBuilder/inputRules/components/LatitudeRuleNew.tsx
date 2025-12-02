// features/formBuilder/inputRules/components/LatitudeRuleNew.tsx

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useRule } from "@/features/formBuilder/inputRules/hooks/useRule";
import type {
  LatitudeRuleData,
} from "@/features/formBuilder/inputRules/types/logic-rule-types";

type Props = { id: string };

// UI for the "latitude" rule
// --------------------------
// Backend name: "latitude"
// Props: {} (no props, only enabled flag)
export function LatitudeRule({ id }: Props) {
  const { rule, setEnabled } = useRule<LatitudeRuleData>(id);
  if (!rule) return null;

  const { enabled } = rule;

  return (
    <div className="space-y-3 p-3 border rounded-md hover:bg-accent/50 transition-colors">
      <div className="flex items-center space-x-2">
        <Checkbox
          id={`rule-latitude-${id}`}
          checked={enabled}
          onCheckedChange={(val) => setEnabled(!!val)}
        />
        <div className="flex-1">
          <Label
            htmlFor={`rule-latitude-${id}`}
            className="text-sm font-medium cursor-pointer"
          >
            Latitude
          </Label>
          <p className="text-xs text-muted-foreground mt-0.5">
            Must be a valid latitude coordinate (-90 to 90)
          </p>
        </div>
      </div>
    </div>
  );
}

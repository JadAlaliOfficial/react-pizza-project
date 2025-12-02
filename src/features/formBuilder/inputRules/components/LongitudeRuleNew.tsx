// features/formBuilder/inputRules/components/LongitudeRuleNew.tsx

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useRule } from "@/features/formBuilder/inputRules/hooks/useRule";
import type {
  LongitudeRuleData,
} from "@/features/formBuilder/inputRules/types/logic-rule-types";

type Props = { id: string };

// UI for the "longitude" rule
// ----------------------------
// Backend name: "longitude"
// Props: {} (no props, only enabled flag)
export function LongitudeRule({ id }: Props) {
  const { rule, setEnabled } = useRule<LongitudeRuleData>(id);
  if (!rule) return null;

  const { enabled } = rule;

  return (
    <div className="space-y-3 p-3 border rounded-md hover:bg-accent/50 transition-colors">
      <div className="flex items-center space-x-2">
        <Checkbox
          id={`rule-longitude-${id}`}
          checked={enabled}
          onCheckedChange={(val) => setEnabled(!!val)}
        />
        <div className="flex-1">
          <Label
            htmlFor={`rule-longitude-${id}`}
            className="text-sm font-medium cursor-pointer"
          >
            Longitude
          </Label>
          <p className="text-xs text-muted-foreground mt-0.5">
            Must be a valid longitude coordinate (-180 to 180)
          </p>
        </div>
      </div>
    </div>
  );
}

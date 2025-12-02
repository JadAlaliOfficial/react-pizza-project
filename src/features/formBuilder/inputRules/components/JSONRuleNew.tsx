// features/formBuilder/inputRules/components/JSONRuleNew.tsx

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useRule } from "@/features/formBuilder/inputRules/hooks/useRule";
import type {
  JsonRuleData,
} from "@/features/formBuilder/inputRules/types/logic-rule-types";

type Props = { id: string };

// UI for the "json" rule
// ----------------------
// Backend name: "json"
// Props: {} (no props, only enabled flag)
export function JSONRule({ id }: Props) {
  const { rule, setEnabled } = useRule<JsonRuleData>(id);
  if (!rule) return null;

  const { enabled } = rule;

  return (
    <div className="space-y-3 p-3 border rounded-md hover:bg-accent/50 transition-colors">
      <div className="flex items-center space-x-2">
        <Checkbox
          id={`rule-json-${id}`}
          checked={enabled}
          onCheckedChange={(val) => setEnabled(!!val)}
        />
        <div className="flex-1">
          <Label
            htmlFor={`rule-json-${id}`}
            className="text-sm font-medium cursor-pointer"
          >
            JSON
          </Label>
          <p className="text-xs text-muted-foreground mt-0.5">
            Field must contain valid JSON format
          </p>
        </div>
      </div>
    </div>
  );
}

// features/formBuilder/inputRules/components/DateRuleNew.tsx

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useRule } from "@/features/formBuilder/inputRules/hooks/useRule";
import type {
  DateRuleData,
} from "@/features/formBuilder/inputRules/types/date-rule-types";

type Props = { id: string };

// UI for the "date" rule
// ----------------------
// Backend name: "date"
// Props: {} (no props, only enabled flag)
export function DateRuleNew({ id }: Props) {
  const { rule, setEnabled } = useRule<DateRuleData>(id);
  if (!rule) return null;

  const { enabled } = rule;

  return (
    <div className="flex items-center space-x-2 p-3 border rounded-md hover:bg-accent/50 transition-colors">
      <Checkbox
        id={`rule-date-${id}`}
        checked={enabled}
        onCheckedChange={(val) => setEnabled(!!val)}
      />
      <div className="flex-1">
        <Label
          htmlFor={`rule-date-${id}`}
          className="text-sm font-medium cursor-pointer"
        >
          Date
        </Label>
        <p className="text-xs text-muted-foreground mt-0.5">
          Field must be a valid date
        </p>
      </div>
    </div>
  );
}

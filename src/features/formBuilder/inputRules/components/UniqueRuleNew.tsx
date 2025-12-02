// features/formBuilder/inputRules/components/UniqueRuleNew.tsx

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useRule } from "@/features/formBuilder/inputRules/hooks/useRule";
import type {
  UniqueRuleData,
} from "@/features/formBuilder/inputRules/types/logic-rule-types";

type Props = { id: string };

// UI for the "unique" rule
// ------------------------
// Backend name: "unique"
// Props: {} (no props, only enabled flag)
export function UniqueRule({ id }: Props) {
  const { rule, setEnabled } = useRule<UniqueRuleData>(id);
  if (!rule) return null;

  const { enabled } = rule;

  return (
    <div className="space-y-3 p-3 border rounded-md hover:bg-accent/50 transition-colors">
      <div className="flex items-center space-x-2">
        <Checkbox
          id={`rule-unique-${id}`}
          checked={enabled}
          onCheckedChange={(val) => setEnabled(!!val)}
        />
        <div className="flex-1">
          <Label
            htmlFor={`rule-unique-${id}`}
            className="text-sm font-medium cursor-pointer"
          >
            Unique
          </Label>
          <p className="text-xs text-muted-foreground mt-0.5">
            Value must be unique across all entries
          </p>
        </div>
      </div>
    </div>
  );
}

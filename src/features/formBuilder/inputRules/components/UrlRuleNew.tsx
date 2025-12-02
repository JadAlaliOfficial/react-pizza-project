// features/formBuilder/inputRules/components/UrlRuleNew.tsx

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useRule } from "@/features/formBuilder/inputRules/hooks/useRule";
import type {
  UrlRuleData,
} from "@/features/formBuilder/inputRules/types/logic-rule-types";

type Props = { id: string };

// UI for the "url" rule
// ---------------------
// Backend name: "url"
// Props: {} (no custom props, only enabled)
export function UrlRule({ id }: Props) {
  const { rule, setEnabled } = useRule<UrlRuleData>(id);
  if (!rule) return null;

  const { enabled } = rule;

  return (
    <div className="flex items-center space-x-2 p-3 border rounded-md hover:bg-accent/50 transition-colors">
      <Checkbox
        id={`rule-url-${id}`}
        checked={enabled}
        onCheckedChange={(val) => setEnabled(!!val)}
      />
      <div className="flex-1">
        <Label
          htmlFor={`rule-url-${id}`}
          className="text-sm font-medium cursor-pointer"
        >
          URL
        </Label>
        <p className="text-xs text-muted-foreground mt-0.5">
          Field must be a valid URL
        </p>
      </div>
    </div>
  );
}

// features/formBuilder/inputRules/components/BeforeDateRuleNew.tsx

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { type ChangeEvent } from "react";
import { useRule } from "@/features/formBuilder/inputRules/hooks/useRule";
import type {
  BeforeRuleData,
} from "@/features/formBuilder/inputRules/types/date-rule-types";

type Props = { id: string };

// UI for the "before" rule
// ------------------------
// Backend name: "before"
// Props: { date?: string } stored under `rule.props`.
export function BeforeDateRuleNew({ id }: Props) {
  const { rule, setEnabled, patch } = useRule<BeforeRuleData>(id);
  if (!rule) return null;

  const { enabled, props } = rule;
  const { date } = props;

  const handleDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    patch({
      props: {
        ...props,
        date: value === "" ? undefined : value,
      },
    } as Partial<BeforeRuleData>);
  };

  return (
    <div className="space-y-3 p-3 border rounded-md hover:bg-accent/50 transition-colors">
      <div className="flex items-center space-x-2">
        <Checkbox
          id={`rule-before-date-${id}`}
          checked={enabled}
          onCheckedChange={(val) => setEnabled(!!val)}
        />
        <div className="flex-1">
          <Label
            htmlFor={`rule-before-date-${id}`}
            className="text-sm font-medium cursor-pointer"
          >
            Before Date
          </Label>
          <p className="text-xs text-muted-foreground mt-0.5">
            Field must be a date before the specified date
          </p>
        </div>
      </div>

      {enabled && (
        <div className="ml-6 space-y-2">
          <Label htmlFor={`before-date-value-${id}`} className="text-sm">
            Date <span className="text-destructive">*</span>
          </Label>
          <Input
            id={`before-date-value-${id}`}
            type="date"
            value={date ?? ""}
            onChange={handleDateChange}
            required={enabled}
            className="max-w-xs"
          />
        </div>
      )}
    </div>
  );
}

// features/formBuilder/inputRules/components/BeforeOrEqualRuleNew.tsx

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { type ChangeEvent } from "react";
import { useRule } from "@/features/formBuilder/inputRules/hooks/useRule";
import type {
  BeforeOrEqualRuleData,
} from "@/features/formBuilder/inputRules/types/date-rule-types";

type Props = { id: string };

// UI for the "before_or_equal" rule
// ---------------------------------
// Backend name: "before_or_equal"
// Props: { date?: string } stored under rule.props
export function BeforeOrEqualRuleNew({ id }: Props) {
  const { rule, setEnabled, patch } = useRule<BeforeOrEqualRuleData>(id);
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
    } as Partial<BeforeOrEqualRuleData>);
  };

  return (
    <div className="space-y-3 p-3 border rounded-md hover:bg-accent/50 transition-colors">
      <div className="flex items-center space-x-2">
        <Checkbox
          id={`rule-before-or-equal-${id}`}
          checked={enabled}
          onCheckedChange={(val) => setEnabled(!!val)}
        />
        <div className="flex-1">
          <Label
            htmlFor={`rule-before-or-equal-${id}`}
            className="text-sm font-medium cursor-pointer"
          >
            Before Or Equal
          </Label>
          <p className="text-xs text-muted-foreground mt-0.5">
            Date must be before or equal to the specified date
          </p>
        </div>
      </div>

      {enabled && (
        <div className="ml-6 space-y-2">
          <Label
            htmlFor={`before-or-equal-date-value-${id}`}
            className="text-sm"
          >
            Date <span className="text-destructive">*</span>
          </Label>
          <Input
            id={`before-or-equal-date-value-${id}`}
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

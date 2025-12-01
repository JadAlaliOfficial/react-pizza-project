// components/field-rules/AfterOrEqualRuleNew.tsx
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { type ChangeEvent } from "react";
import { useRule } from "@/features/formBuilder/inputRules/hooks/useRule";
import type {
  AfterOrEqualRuleData,
} from "@/features/formBuilder/inputRules/types/rule-types";

type Props = { id: string };

// UI for the "after_or_equal" rule
// --------------------------------
// Backend name: "after_or_equal"
// Props: { date?: string } stored under rule.props.date
export function AfterOrEqualRule({ id }: Props) {
  const { rule, setEnabled, patch } = useRule<AfterOrEqualRuleData>(id);
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
    } as Partial<AfterOrEqualRuleData>);
  };

  return (
    <div className="space-y-3 p-3 border rounded-md hover:bg-accent/50 transition-colors">
      <div className="flex items-center space-x-2">
        <Checkbox
          id={`rule-after-or-equal-${id}`}
          checked={enabled}
          onCheckedChange={(val) => setEnabled(!!val)}
        />
        <div className="flex-1">
          <Label
            htmlFor={`rule-after-or-equal-${id}`}
            className="text-sm font-medium cursor-pointer"
          >
            After Or Equal
          </Label>
          <p className="text-xs text-muted-foreground mt-0.5">
            Date must be after or equal to the specified date
          </p>
        </div>
      </div>

      {enabled && (
        <div className="ml-6 space-y-2">
          <Label
            htmlFor={`after-or-equal-date-value-${id}`}
            className="text-sm"
          >
            Date <span className="text-destructive">*</span>
          </Label>
          <Input
            id={`after-or-equal-date-value-${id}`}
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

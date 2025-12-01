import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { type ChangeEvent } from "react";
import { useRule } from "@/features/formBuilder/inputRules/hooks/useRule";
import type {
  AfterRuleData,
} from "@/features/formBuilder/inputRules/types/rule-types";

type Props = { id: string };

// UI for the "after" rule
// ------------------------
// Backend name: "after"
// Props: { date?: string } stored under `rule.props`.
// This component only cares about:
// - `rule.enabled`
// - `rule.props.date`
export function AfterDateRule({ id }: Props) {
  const { rule, setEnabled, patch } = useRule<AfterRuleData>(id);
  if (!rule) return null;

  const { enabled, props } = rule;
  const { date } = props;

  const handleDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // When updating props, always merge with existing props
    patch({
      props: {
        ...props,
        date: value === "" ? undefined : value,
      },
    } as Partial<AfterRuleData>);
  };

  return (
    <div className="space-y-3 p-3 border rounded-md hover:bg-accent/50 transition-colors">
      <div className="flex items-center space-x-2">
        <Checkbox
          id={`rule-after-date-${id}`}
          checked={enabled}
          onCheckedChange={(val) => setEnabled(!!val)}
        />
        <div className="flex-1">
          <Label
            htmlFor={`rule-after-date-${id}`}
            className="text-sm font-medium cursor-pointer"
          >
            After Date
          </Label>
          <p className="text-xs text-muted-foreground mt-0.5">
            Field must be a date after the specified date
          </p>
        </div>
      </div>

      {enabled && (
        <div className="ml-6 space-y-2">
          <Label htmlFor={`after-date-value-${id}`} className="text-sm">
            Date <span className="text-destructive">*</span>
          </Label>
          <Input
            id={`after-date-value-${id}`}
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

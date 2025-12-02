// features/formBuilder/inputRules/components/DateFormatRuleNew.tsx

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { type ChangeEvent } from "react";
import { useRule } from "@/features/formBuilder/inputRules/hooks/useRule";
import type {
  DateFormatRuleData,
} from "@/features/formBuilder/inputRules/types/date-rule-types";

type Props = { id: string };

// UI for the "date_format" rule
// -----------------------------
// Backend name: "date_format"
// Props: { format?: string } stored under rule.props.format
export function DateFormatRuleNew({ id }: Props) {
  const { rule, setEnabled, patch } = useRule<DateFormatRuleData>(id);
  if (!rule) return null;

  const { enabled, props } = rule;
  const { format } = props;

  const handleFormatChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();
    patch({
      props: {
        ...props,
        format: value === "" ? undefined : value,
      },
    } as Partial<DateFormatRuleData>);
  };

  return (
    <div className="space-y-3 p-3 border rounded-md hover:bg-accent/50 transition-colors">
      <div className="flex items-center space-x-2">
        <Checkbox
          id={`rule-date-format-${id}`}
          checked={enabled}
          onCheckedChange={(val) => setEnabled(!!val)}
        />
        <div className="flex-1">
          <Label
            htmlFor={`rule-date-format-${id}`}
            className="text-sm font-medium cursor-pointer"
          >
            Date Format
          </Label>
          <p className="text-xs text-muted-foreground mt-0.5">
            Date must match a specific format
          </p>
        </div>
      </div>

      {enabled && (
        <div className="ml-6 space-y-2">
          <Label
            htmlFor={`date-format-value-${id}`}
            className="text-sm"
          >
            Format <span className="text-destructive">*</span>
          </Label>
          <Input
            id={`date-format-value-${id}`}
            type="text"
            placeholder="e.g., Y-m-d, m/d/Y, d-m-Y H:i:s"
            value={format ?? ""}
            onChange={handleFormatChange}
            required={enabled}
            className="max-w-md font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            PHP date format (e.g., Y-m-d for 2024-12-31, m/d/Y for 12/31/2024)
          </p>
        </div>
      )}
    </div>
  );
}

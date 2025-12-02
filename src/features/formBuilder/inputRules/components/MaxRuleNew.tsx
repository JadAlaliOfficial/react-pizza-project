// features/formBuilder/inputRules/components/MaxRuleNew.tsx

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { type ChangeEvent } from "react";

import { useRule } from "@/features/formBuilder/inputRules/hooks/useRule";
import type {
  MaxRuleData,
} from "@/features/formBuilder/inputRules/types/numeric-rule-types";

type Props = { id: string };

// UI for the "max" rule
// ----------------------
// Backend name: "max"
// Props: { value?: number } stored under rule.props.value
export function MaxRuleNew({ id }: Props) {
  const { rule, setEnabled, patch } = useRule<MaxRuleData>(id);
  if (!rule) return null;

  const { enabled, props } = rule;
  const { value } = props;

  const handleValueChange = (e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;

    // Allow clearing
    if (raw === "") {
      patch({
        props: {
          ...props,
          value: undefined,
        },
      } as Partial<MaxRuleData>);
      return;
    }

    const numericValue = Number(raw);
    if (Number.isNaN(numericValue)) {
      // Ignore invalid numeric input
      return;
    }

    patch({
      props: {
        ...props,
        value: numericValue,
      },
    } as Partial<MaxRuleData>);
  };

  return (
    <div className="space-y-3 p-3 border rounded-md hover:bg-accent/50 transition-colors">
      <div className="flex items-center space-x-2">
        <Checkbox
          id={`rule-max-${id}`}
          checked={enabled}
          onCheckedChange={(val) => setEnabled(!!val)}
        />
        <div className="flex-1">
          <Label
            htmlFor={`rule-max-${id}`}
            className="text-sm font-medium cursor-pointer"
          >
            Maximum
          </Label>
          <p className="text-xs text-muted-foreground mt-0.5">
            Field value must not exceed this value
          </p>
        </div>
      </div>

      {enabled && (
        <div className="ml-6 space-y-2">
          <Label
            htmlFor={`max-value-${id}`}
            className="text-sm"
          >
            Maximum value <span className="text-destructive">*</span>
          </Label>
          <Input
            id={`max-value-${id}`}
            type="number"
            placeholder="Enter maximum value"
            value={value ?? ""}
            onChange={handleValueChange}
            required={enabled}
            className="max-w-xs"
          />
        </div>
      )}
    </div>
  );
}

// features/formBuilder/inputRules/components/BetweenRuleNew.tsx

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { type ChangeEvent } from "react";

import { useRule } from "@/features/formBuilder/inputRules/hooks/useRule";
import type {
  BetweenRuleData,
} from "@/features/formBuilder/inputRules/types/numeric-rule-types";

type Props = { id: string };

// UI for the "between" rule
// --------------------------
// Backend name: "between"
// Props: { min?: number; max?: number } stored under rule.props
export function BetweenRuleNew({ id }: Props) {
  const { rule, setEnabled, patch } = useRule<BetweenRuleData>(id);
  if (!rule) return null;

  const { enabled, props } = rule;
  const { min, max } = props;

  const handleMinChange = (e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;

    if (raw === "") {
      patch({
        props: {
          ...props,
          min: undefined,
        },
      } as Partial<BetweenRuleData>);
      return;
    }

    const numericValue = Number(raw);
    if (Number.isNaN(numericValue)) return;

    patch({
      props: {
        ...props,
        min: numericValue,
      },
    } as Partial<BetweenRuleData>);
  };

  const handleMaxChange = (e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;

    if (raw === "") {
      patch({
        props: {
          ...props,
          max: undefined,
        },
      } as Partial<BetweenRuleData>);
      return;
    }

    const numericValue = Number(raw);
    if (Number.isNaN(numericValue)) return;

    patch({
      props: {
        ...props,
        max: numericValue,
      },
    } as Partial<BetweenRuleData>);
  };

  return (
    <div className="space-y-3 p-3 border rounded-md hover:bg-accent/50 transition-colors">
      <div className="flex items-center space-x-2">
        <Checkbox
          id={`rule-between-${id}`}
          checked={enabled}
          onCheckedChange={(val) => setEnabled(!!val)}
        />
        <div className="flex-1">
          <Label
            htmlFor={`rule-between-${id}`}
            className="text-sm font-medium cursor-pointer"
          >
            Between
          </Label>
          <p className="text-xs text-muted-foreground mt-0.5">
            Field value must be between minimum and maximum values
          </p>
        </div>
      </div>

      {enabled && (
        <div className="ml-6 space-y-3">
          <div className="space-y-2">
            <Label
              htmlFor={`between-min-${id}`}
              className="text-sm"
            >
              Minimum value <span className="text-destructive">*</span>
            </Label>
            <Input
              id={`between-min-${id}`}
              type="number"
              placeholder="Enter minimum value"
              value={min ?? ""}
              onChange={handleMinChange}
              required={enabled}
              className="max-w-xs"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor={`between-max-${id}`}
              className="text-sm"
            >
              Maximum value <span className="text-destructive">*</span>
            </Label>
            <Input
              id={`between-max-${id}`}
              type="number"
              placeholder="Enter maximum value"
              value={max ?? ""}
              onChange={handleMaxChange}
              required={enabled}
              className="max-w-xs"
            />
          </div>
        </div>
      )}
    </div>
  );
}

// features/formBuilder/inputRules/components/SameRuleNew.tsx

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { type ChangeEvent } from "react";
import { useRule } from "@/features/formBuilder/inputRules/hooks/useRule";
import type {
  SameRuleData,
} from "@/features/formBuilder/inputRules/types/logic-rule-types";

type Props = { id: string };

// UI for the "same" rule
// ----------------------
// Backend name: "same"
// Props: { comparevalue?: string } stored under rule.props.comparevalue
export function SameRule({ id }: Props) {
  const { rule, setEnabled, patch } = useRule<SameRuleData>(id);
  if (!rule) return null;

  const { enabled, props } = rule;
  const { comparevalue } = props;

  const handleFieldChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();

    patch({
      props: {
        ...props,
        comparevalue: value === "" ? undefined : value,
      },
    } as Partial<SameRuleData>);
  };

  return (
    <div className="space-y-3 p-3 border rounded-md hover:bg-accent/50 transition-colors">
      <div className="flex items-center space-x-2">
        <Checkbox
          id={`rule-same-${id}`}
          checked={enabled}
          onCheckedChange={(val) => setEnabled(!!val)}
        />
        <div className="flex-1">
          <Label
            htmlFor={`rule-same-${id}`}
            className="text-sm font-medium cursor-pointer"
          >
            Same
          </Label>
          <p className="text-xs text-muted-foreground mt-0.5">
            Field must match another field
          </p>
        </div>
      </div>

      {enabled && (
        <div className="ml-6 space-y-2">
          <Label
            htmlFor={`same-field-${id}`}
            className="text-sm"
          >
            Field to Match <span className="text-destructive">*</span>
          </Label>
          <Input
            id={`same-field-${id}`}
            type="text"
            placeholder="e.g., password, email"
            value={comparevalue ?? ""}
            onChange={handleFieldChange}
            required={enabled}
          />
          <p className="text-xs text-muted-foreground">
            Enter the name or identifier of the field to compare with
          </p>
        </div>
      )}
    </div>
  );
}

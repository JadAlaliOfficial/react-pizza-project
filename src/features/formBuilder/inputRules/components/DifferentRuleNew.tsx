// features/formBuilder/inputRules/components/DifferentRuleNew.tsx

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { type ChangeEvent } from "react";
import { useRule } from "@/features/formBuilder/inputRules/hooks/useRule";
import type {
  DifferentRuleData,
} from "@/features/formBuilder/inputRules/types/logic-rule-types";

type Props = { id: string };

// UI for the "different" rule
// ---------------------------
// Backend name: "different"
// Props: { comparevalue?: string } stored under rule.props.comparevalue
export function DifferentRule({ id }: Props) {
  const { rule, setEnabled, patch } = useRule<DifferentRuleData>(id);
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
    } as Partial<DifferentRuleData>);
  };

  return (
    <div className="space-y-3 p-3 border rounded-md hover:bg-accent/50 transition-colors">
      <div className="flex items-center space-x-2">
        <Checkbox
          id={`rule-different-${id}`}
          checked={enabled}
          onCheckedChange={(val) => setEnabled(!!val)}
        />
        <div className="flex-1">
          <Label
            htmlFor={`rule-different-${id}`}
            className="text-sm font-medium cursor-pointer"
          >
            Different
          </Label>
          <p className="text-xs text-muted-foreground mt-0.5">
            Field must be different from another field
          </p>
        </div>
      </div>

      {enabled && (
        <div className="ml-6 space-y-2">
          <Label
            htmlFor={`different-field-${id}`}
            className="text-sm"
          >
            Field to Differ From <span className="text-destructive">*</span>
          </Label>
          <Input
            id={`different-field-${id}`}
            type="text"
            placeholder="e.g., username, old_password"
            value={comparevalue ?? ""}
            onChange={handleFieldChange}
            required={enabled}
          />
          <p className="text-xs text-muted-foreground">
            Enter the name or identifier of the field that must be different
          </p>
        </div>
      )}
    </div>
  );
}

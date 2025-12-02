// features/formBuilder/inputRules/components/ConfirmedRuleNew.tsx

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { type ChangeEvent } from "react";
import { useRule } from "@/features/formBuilder/inputRules/hooks/useRule";
import type {
  ConfirmedRuleData,
} from "@/features/formBuilder/inputRules/types/logic-rule-types";

type Props = { id: string };

// UI for the "confirmed" rule
// ---------------------------
// Backend name: "confirmed"
// Props: { confirmationvalue?: string } stored under rule.props.confirmationvalue
export function ConfirmedRule({ id }: Props) {
  const { rule, setEnabled, patch } = useRule<ConfirmedRuleData>(id);
  if (!rule) return null;

  const { enabled, props } = rule;
  const { confirmationvalue } = props;

  const handleConfirmationFieldChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();

    patch({
      props: {
        ...props,
        confirmationvalue: value === "" ? undefined : value,
      },
    } as Partial<ConfirmedRuleData>);
  };

  return (
    <div className="space-y-3 p-3 border rounded-md hover:bg-accent/50 transition-colors">
      <div className="flex items-center space-x-2">
        <Checkbox
          id={`rule-confirmed-${id}`}
          checked={enabled}
          onCheckedChange={(val) => setEnabled(!!val)}
        />
        <div className="flex-1">
          <Label
            htmlFor={`rule-confirmed-${id}`}
            className="text-sm font-medium cursor-pointer"
          >
            Confirmed
          </Label>
          <p className="text-xs text-muted-foreground mt-0.5">
            Field must match a confirmation field (e.g., password confirmation)
          </p>
        </div>
      </div>

      {enabled && (
        <div className="ml-6 space-y-2">
          <Label
            htmlFor={`confirmed-field-${id}`}
            className="text-sm"
          >
            Confirmation Field Key <span className="text-destructive">*</span>
          </Label>
          <Input
            id={`confirmed-field-${id}`}
            type="text"
            placeholder="e.g., password_confirmation"
            value={confirmationvalue ?? ""}
            onChange={handleConfirmationFieldChange}
            required={enabled}
          />
          <p className="text-xs text-muted-foreground">
            Name/key of the field that this value must match.
          </p>
        </div>
      )}
    </div>
  );
}

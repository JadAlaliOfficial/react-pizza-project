// features/formBuilder/inputRules/components/InRuleNew.tsx

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { type ChangeEvent, useState, useEffect, useRef } from "react";
import { useRule } from "@/features/formBuilder/inputRules/hooks/useRule";
import type {
  InRuleData,
} from "@/features/formBuilder/inputRules/types/logic-rule-types";

type Props = { id: string };

// UI for the "in" rule
// --------------------
// Backend name: "in"
// Props: { values?: string[] } stored under rule.props.values
export function InRule({ id }: Props) {
  const { rule, setEnabled, patch } = useRule<InRuleData>(id);
  if (!rule) return null;

  const { enabled, props } = rule;
  const { values } = props;

  // Local text state so typing isn't reset by normalization
  const [text, setText] = useState<string>("");

  // Hydrate text once from existing values (e.g. when editing saved rules)
  const hydratedRef = useRef(false);
  useEffect(() => {
    if (!hydratedRef.current) {
      if (values && values.length > 0) {
        setText(values.join(", "));
      }
      hydratedRef.current = true;
    }
  }, [values]);

  const handleValuesChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setText(value);

    const valuesArray =
      value.trim() === ""
        ? undefined
        : value
            .split(",")
            .map((v) => v.trim())
            .filter((v) => v.length > 0);

    patch({
      props: {
        ...props,
        values: valuesArray,
      },
    } as Partial<InRuleData>);
  };

  return (
    <div className="space-y-3 p-3 border rounded-md hover:bg-accent/50 transition-colors">
      <div className="flex items-center space-x-2">
        <Checkbox
          id={`rule-in-${id}`}
          checked={enabled}
          onCheckedChange={(val) => setEnabled(!!val)}
        />
        <div className="flex-1">
          <Label
            htmlFor={`rule-in-${id}`}
            className="text-sm font-medium cursor-pointer"
          >
            In
          </Label>
          <p className="text-xs text-muted-foreground mt-0.5">
            Field value must be one of the specified values
          </p>
        </div>
      </div>

      {enabled && (
        <div className="ml-6 space-y-2">
          <Label
            htmlFor={`in-values-${id}`}
            className="text-sm"
          >
            Allowed Values <span className="text-destructive">*</span>
          </Label>
          <Input
            id={`in-values-${id}`}
            type="text"
            placeholder="e.g., option1, option2, option3"
            value={text}
            onChange={handleValuesChange}
            required={enabled}
          />
          <p className="text-xs text-muted-foreground">
            Comma-separated list of allowed values
          </p>
        </div>
      )}
    </div>
  );
}

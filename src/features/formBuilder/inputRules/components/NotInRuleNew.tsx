// features/formBuilder/inputRules/components/NotInRuleNew.tsx

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { type ChangeEvent, useState, useEffect, useRef } from "react";
import { useRule } from "@/features/formBuilder/inputRules/hooks/useRule";
import type {
  NotInRuleData,
} from "@/features/formBuilder/inputRules/types/logic-rule-types";

type Props = { id: string };

// UI for the "not_in" rule
// ------------------------
// Backend name: "not_in"
// Props: { values?: string[] } stored under rule.props.values
export function NotInRule({ id }: Props) {
  const { rule, setEnabled, patch } = useRule<NotInRuleData>(id);
  if (!rule) return null;

  const { enabled, props } = rule;
  const { values } = props;

  const [text, setText] = useState<string>("");

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
    } as Partial<NotInRuleData>);
  };

  return (
    <div className="space-y-3 p-3 border rounded-md hover:bg-accent/50 transition-colors">
      <div className="flex items-center space-x-2">
        <Checkbox
          id={`rule-not-in-${id}`}
          checked={enabled}
          onCheckedChange={(val) => setEnabled(!!val)}
        />
        <div className="flex-1">
          <Label
            htmlFor={`rule-not-in-${id}`}
            className="text-sm font-medium cursor-pointer"
          >
            Not In
          </Label>
          <p className="text-xs text-muted-foreground mt-0.5">
            Field value must NOT be one of the specified values
          </p>
        </div>
      </div>

      {enabled && (
        <div className="ml-6 space-y-2">
          <Label
            htmlFor={`not-in-values-${id}`}
            className="text-sm"
          >
            Disallowed Values <span className="text-destructive">*</span>
          </Label>
          <Input
            id={`not-in-values-${id}`}
            type="text"
            placeholder="e.g., banned1, banned2, banned3"
            value={text}
            onChange={handleValuesChange}
            required={enabled}
          />
          <p className="text-xs text-muted-foreground">
            Comma-separated list of values that are NOT allowed
          </p>
        </div>
      )}
    </div>
  );
}

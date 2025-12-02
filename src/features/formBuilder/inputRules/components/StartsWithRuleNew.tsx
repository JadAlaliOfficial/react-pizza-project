// features/formBuilder/inputRules/components/StartsWithRuleNew.tsx

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { type ChangeEvent, useState, useEffect, useRef } from "react";
import { useRule } from "@/features/formBuilder/inputRules/hooks/useRule";
import type {
  StartsWithRuleData,
} from "@/features/formBuilder/inputRules/types/logic-rule-types";

type Props = { id: string };

// UI for the "starts_with" rule
// -----------------------------
// Backend name: "starts_with"
// Props: { values?: string[] } stored under rule.props.values
export function StartsWithRule({ id }: Props) {
  const { rule, setEnabled, patch } = useRule<StartsWithRuleData>(id);
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
    } as Partial<StartsWithRuleData>);
  };

  return (
    <div className="space-y-3 p-3 border rounded-md hover:bg-accent/50 transition-colors">
      <div className="flex items-center space-x-2">
        <Checkbox
          id={`rule-starts-with-${id}`}
          checked={enabled}
          onCheckedChange={(val) => setEnabled(!!val)}
        />
        <div className="flex-1">
          <Label
            htmlFor={`rule-starts-with-${id}`}
            className="text-sm font-medium cursor-pointer"
          >
            Starts With
          </Label>
          <p className="text-xs text-muted-foreground mt-0.5">
            String must start with specified value(s)
          </p>
        </div>
      </div>

      {enabled && (
        <div className="ml-6 space-y-2">
          <Label
            htmlFor={`starts-with-values-${id}`}
            className="text-sm"
          >
            Prefix Values <span className="text-destructive">*</span>
          </Label>
          <Input
            id={`starts-with-values-${id}`}
            type="text"
            placeholder="e.g., http, https (comma-separated)"
            value={text}
            onChange={handleValuesChange}
            required={enabled}
          />
          <p className="text-xs text-muted-foreground">
            Enter one or more values separated by commas
          </p>
        </div>
      )}
    </div>
  );
}

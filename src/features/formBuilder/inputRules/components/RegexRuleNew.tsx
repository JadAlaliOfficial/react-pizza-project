// features/formBuilder/inputRules/components/RegexRuleNew.tsx

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { type ChangeEvent } from "react";
import { useRule } from "@/features/formBuilder/inputRules/hooks/useRule";
import type {
  RegexRuleData,
} from "@/features/formBuilder/inputRules/types/logic-rule-types";

type Props = { id: string };

// UI for the "regex" rule
// -----------------------
// Backend name: "regex"
// Props: { pattern?: string } stored under rule.props.pattern
export function RegexRule({ id }: Props) {
  const { rule, setEnabled, patch } = useRule<RegexRuleData>(id);
  if (!rule) return null;

  const { enabled, props } = rule;
  const { pattern } = props;

  const handlePatternChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();

    patch({
      props: {
        ...props,
        pattern: value === "" ? undefined : value,
      },
    } as Partial<RegexRuleData>);
  };

  return (
    <div className="space-y-3 p-3 border rounded-md hover:bg-accent/50 transition-colors">
      <div className="flex items-center space-x-2">
        <Checkbox
          id={`rule-regex-${id}`}
          checked={enabled}
          onCheckedChange={(val) => setEnabled(!!val)}
        />
        <div className="flex-1">
          <Label
            htmlFor={`rule-regex-${id}`}
            className="text-sm font-medium cursor-pointer"
          >
            Regex
          </Label>
          <p className="text-xs text-muted-foreground mt-0.5">
            Field must match the regular expression pattern
          </p>
        </div>
      </div>

      {enabled && (
        <div className="ml-6 space-y-2">
          <Label
            htmlFor={`regex-pattern-${id}`}
            className="text-sm"
          >
            Pattern <span className="text-destructive">*</span>
          </Label>
          <Input
            id={`regex-pattern-${id}`}
            type="text"
            placeholder="e.g., ^[A-Z0-9]+$"
            value={pattern ?? ""}
            onChange={handlePatternChange}
            required={enabled}
            className="max-w-md font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Enter a valid regular expression pattern
          </p>
        </div>
      )}
    </div>
  );
}

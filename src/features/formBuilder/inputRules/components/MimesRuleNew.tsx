// features/formBuilder/inputRules/components/MimesRuleNew.tsx

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { type ChangeEvent, useEffect, useState } from "react";
import { useRule } from "@/features/formBuilder/inputRules/hooks/useRule";
import type {
  MimesRuleData,
} from "@/features/formBuilder/inputRules/types/file-rule-types";

type Props = { id: string };

// UI for the "mimes" rule
// ------------------------
// Backend name: "mimes"
// Props: { types?: string[] } stored under rule.props.types
export function MimesRuleNew({ id }: Props) {
  const { rule, setEnabled, patch } = useRule<MimesRuleData>(id);
  if (!rule) return null;

  const { enabled, props } = rule;
  const { types } = props;

  // Local input string so we don't lose commas while typing
  const [inputValue, setInputValue] = useState<string>(() =>
    types?.join(", ") ?? ""
  );

  // If the underlying props.types changes from outside, sync our input
  useEffect(() => {
    setInputValue(types?.join(", ") ?? "");
  }, [types]);

  const handleTypesChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    const typesArray =
      value.trim() === ""
        ? undefined
        : value
            .split(",")
            .map((t) => t.trim())
            .filter((t) => t.length > 0);

    patch({
      props: {
        ...props,
        types: typesArray,
      },
    } as Partial<MimesRuleData>);
  };

  return (
    <div className="space-y-3 p-3 border rounded-md hover:bg-accent/50 transition-colors">
      <div className="flex items-center space-x-2">
        <Checkbox
          id={`rule-mimes-${id}`}
          checked={enabled}
          onCheckedChange={(val) => setEnabled(!!val)}
        />
        <div className="flex-1">
          <Label
            htmlFor={`rule-mimes-${id}`}
            className="text-sm font-medium cursor-pointer"
          >
            Mimes
          </Label>
          <p className="text-xs text-muted-foreground mt-0.5">
            File must be of specified MIME types (e.g., jpg, png, pdf)
          </p>
        </div>
      </div>

      {enabled && (
        <div className="ml-6 space-y-2">
          <Label
            htmlFor={`mimes-types-${id}`}
            className="text-sm"
          >
            Allowed Types <span className="text-destructive">*</span>
          </Label>
          <Input
            id={`mimes-types-${id}`}
            type="text"
            placeholder="e.g., jpg, png, pdf, docx"
            value={inputValue}
            onChange={handleTypesChange}
            required={enabled}
          />
          <p className="text-xs text-muted-foreground">
            Comma-separated list of allowed file extensions
          </p>
        </div>
      )}
    </div>
  );
}

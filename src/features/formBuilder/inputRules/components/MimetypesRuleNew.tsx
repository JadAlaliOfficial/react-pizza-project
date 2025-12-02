// features/formBuilder/inputRules/components/MimeTypesRuleNew.tsx

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { type ChangeEvent, useEffect, useState } from "react";
import { useRule } from "@/features/formBuilder/inputRules/hooks/useRule";
import type {
  MimetypesRuleData,
} from "@/features/formBuilder/inputRules/types/file-rule-types";

type Props = { id: string };

// UI for the "mimetypes" rule
// ---------------------------
// Backend name: "mimetypes"
// Props: { types?: string[] } stored under rule.props.types
export function MimeTypesRuleNew({ id }: Props) {
  const { rule, setEnabled, patch } = useRule<MimetypesRuleData>(id);
  if (!rule) return null;

  const { enabled, props } = rule;
  const { types } = props;

  // Local input string so commas don't disappear while typing
  const [inputValue, setInputValue] = useState<string>(() =>
    types?.join(", ") ?? ""
  );

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
    } as Partial<MimetypesRuleData>);
  };

  return (
    <div className="space-y-3 p-3 border rounded-md hover:bg-accent/50 transition-colors">
      <div className="flex items-center space-x-2">
        <Checkbox
          id={`rule-mimetypes-${id}`}
          checked={enabled}
          onCheckedChange={(val) => setEnabled(!!val)}
        />
        <div className="flex-1">
          <Label
            htmlFor={`rule-mimetypes-${id}`}
            className="text-sm font-medium cursor-pointer"
          >
            Mime Types
          </Label>
          <p className="text-xs text-muted-foreground mt-0.5">
            File must match specified MIME type patterns
          </p>
        </div>
      </div>

      {enabled && (
        <div className="ml-6 space-y-2">
          <Label
            htmlFor={`mimetypes-value-${id}`}
            className="text-sm"
          >
            MIME Types <span className="text-destructive">*</span>
          </Label>
          <Input
            id={`mimetypes-value-${id}`}
            type="text"
            placeholder="e.g., image/jpeg, application/pdf, video/*"
            value={inputValue}
            onChange={handleTypesChange}
            required={enabled}
            className="font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Comma-separated MIME type patterns (supports wildcards like image/*, video/*)
          </p>
        </div>
      )}
    </div>
  );
}

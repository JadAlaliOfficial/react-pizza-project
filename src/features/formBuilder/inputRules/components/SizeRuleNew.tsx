// features/formBuilder/inputRules/components/SizeRuleNew.tsx

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { type ChangeEvent } from "react";
import { useRule } from "@/features/formBuilder/inputRules/hooks/useRule";
import type {
  SizeRuleData,
} from "@/features/formBuilder/inputRules/types/file-rule-types";

type Props = { id: string };

// UI for the "size" rule
// ----------------------
// Backend name: "size"
// Props: { size?: number } stored under rule.props.size
export function SizeRuleNew({ id }: Props) {
  const { rule, setEnabled, patch } = useRule<SizeRuleData>(id);
  if (!rule) return null;

  const { enabled, props } = rule;
  const { size } = props;

  const handleSizeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numeric =
      value === "" || Number.isNaN(Number(value))
        ? undefined
        : Number(value);

    patch({
      props: {
        ...props,
        size: numeric,
      },
    } as Partial<SizeRuleData>);
  };

  return (
    <div className="space-y-3 p-3 border rounded-md hover:bg-accent/50 transition-colors">
      <div className="flex items-center space-x-2">
        <Checkbox
          id={`rule-size-${id}`}
          checked={enabled}
          onCheckedChange={(val) => setEnabled(!!val)}
        />
        <div className="flex-1">
          <Label
            htmlFor={`rule-size-${id}`}
            className="text-sm font-medium cursor-pointer"
          >
            Size
          </Label>
          <p className="text-xs text-muted-foreground mt-0.5">
            File size must be equal to specified size in kilobytes
          </p>
        </div>
      </div>

      {enabled && (
        <div className="ml-6 space-y-2">
          <Label
            htmlFor={`size-value-${id}`}
            className="text-sm"
          >
            Size (KB) <span className="text-destructive">*</span>
          </Label>
          <Input
            id={`size-value-${id}`}
            type="number"
            min="0"
            step="1"
            placeholder="e.g., 1024"
            value={size ?? ""}
            onChange={handleSizeChange}
            required={enabled}
            className="max-w-xs"
          />
          <p className="text-xs text-muted-foreground">
            Exact file size in kilobytes (1 MB = 1024 KB)
          </p>
        </div>
      )}
    </div>
  );
}

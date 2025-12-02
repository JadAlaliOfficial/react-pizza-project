// features/formBuilder/inputRules/components/MinFileSizeRuleNew.tsx

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { type ChangeEvent } from "react";
import { useRule } from "@/features/formBuilder/inputRules/hooks/useRule";
import type {
  MinFileSizeRuleData,
} from "@/features/formBuilder/inputRules/types/file-rule-types";

type Props = { id: string };

// UI for the "min_file_size" rule
// --------------------------------
// Backend name: "min_file_size"
// Props: { minsize?: number } stored under rule.props.minsize
export function MinFileSizeRuleNew({ id }: Props) {
  const { rule, setEnabled, patch } = useRule<MinFileSizeRuleData>(id);
  if (!rule) return null;

  const { enabled, props } = rule;
  const { minsize } = props;

  const handleMinSizeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numeric =
      value === "" || Number.isNaN(Number(value))
        ? undefined
        : Number(value);

    patch({
      props: {
        ...props,
        minsize: numeric,
      },
    } as Partial<MinFileSizeRuleData>);
  };

  return (
    <div className="space-y-3 p-3 border rounded-md hover:bg-accent/50 transition-colors">
      <div className="flex items-center space-x-2">
        <Checkbox
          id={`rule-min-file-size-${id}`}
          checked={enabled}
          onCheckedChange={(val) => setEnabled(!!val)}
        />
        <div className="flex-1">
          <Label
            htmlFor={`rule-min-file-size-${id}`}
            className="text-sm font-medium cursor-pointer"
          >
            Min File Size
          </Label>
          <p className="text-xs text-muted-foreground mt-0.5">
            Minimum file size in kilobytes
          </p>
        </div>
      </div>

      {enabled && (
        <div className="ml-6 space-y-2">
          <Label
            htmlFor={`min-file-size-value-${id}`}
            className="text-sm"
          >
            Min Size (KB) <span className="text-destructive">*</span>
          </Label>
          <Input
            id={`min-file-size-value-${id}`}
            type="number"
            min="0"
            step="1"
            placeholder="e.g., 100"
            value={minsize ?? ""}
            onChange={handleMinSizeChange}
            required={enabled}
            className="max-w-xs"
          />
          <p className="text-xs text-muted-foreground">
            Minimum size in kilobytes (1 MB = 1024 KB)
          </p>
        </div>
      )}
    </div>
  );
}

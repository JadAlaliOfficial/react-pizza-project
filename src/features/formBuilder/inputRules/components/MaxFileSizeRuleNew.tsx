// features/formBuilder/inputRules/components/MaxFileSizeRuleNew.tsx

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { type ChangeEvent } from "react";
import { useRule } from "@/features/formBuilder/inputRules/hooks/useRule";
import type {
  MaxFileSizeRuleData,
} from "@/features/formBuilder/inputRules/types/file-rule-types";

type Props = { id: string };

// UI for the "max_file_size" rule
// --------------------------------
// Backend name: "max_file_size"
// Props: { maxsize?: number } stored under rule.props.maxsize
export function MaxFileSizeRuleNew({ id }: Props) {
  const { rule, setEnabled, patch } = useRule<MaxFileSizeRuleData>(id);
  if (!rule) return null;

  const { enabled, props } = rule;
  const { maxsize } = props;

  const handleMaxSizeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numeric =
      value === "" || Number.isNaN(Number(value))
        ? undefined
        : Number(value);

    patch({
      props: {
        ...props,
        maxsize: numeric,
      },
    } as Partial<MaxFileSizeRuleData>);
  };

  return (
    <div className="space-y-3 p-3 border rounded-md hover:bg-accent/50 transition-colors">
      <div className="flex items-center space-x-2">
        <Checkbox
          id={`rule-max-file-size-${id}`}
          checked={enabled}
          onCheckedChange={(val) => setEnabled(!!val)}
        />
        <div className="flex-1">
          <Label
            htmlFor={`rule-max-file-size-${id}`}
            className="text-sm font-medium cursor-pointer"
          >
            Max File Size
          </Label>
          <p className="text-xs text-muted-foreground mt-0.5">
            Maximum file size in kilobytes (e.g., 30MB = 30720)
          </p>
        </div>
      </div>

      {enabled && (
        <div className="ml-6 space-y-2">
          <Label
            htmlFor={`max-file-size-value-${id}`}
            className="text-sm"
          >
            Max Size (KB) <span className="text-destructive">*</span>
          </Label>
          <Input
            id={`max-file-size-value-${id}`}
            type="number"
            min="0"
            step="1"
            placeholder="e.g., 30720 (30MB)"
            value={maxsize ?? ""}
            onChange={handleMaxSizeChange}
            required={enabled}
            className="max-w-xs"
          />
          <p className="text-xs text-muted-foreground">
            Maximum size in kilobytes (1 MB = 1024 KB, 10 MB = 10240 KB)
          </p>
        </div>
      )}
    </div>
  );
}

// src/features/formVersion/components/preview/DropdownSelectPreview.tsx

/**
 * Dropdown Select Preview Component
 *
 * Displays a preview of how the Dropdown Select field will appear in the form
 * Shows dropdown menu with all options
 */

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ChevronDown } from "lucide-react";
import type { Field } from "@/features/formBuilder/formVersions/types";

type DropdownSelectPreviewProps = {
  field: Field;
};

export function DropdownSelectPreview({ field }: DropdownSelectPreviewProps) {
  // Parse options from placeholder
  const getOptions = (): string[] => {
    try {
      if (!field.placeholder) return ["Option 1", "Option 2", "Option 3"];
      const parsed = JSON.parse(field.placeholder);
      return Array.isArray(parsed) && parsed.length > 0
        ? parsed
        : ["Option 1", "Option 2", "Option 3"];
    } catch {
      return ["Option 1", "Option 2", "Option 3"];
    }
  };

  const options = getOptions();

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <ChevronDown className="h-3 w-3 text-sky-500" />
        <Label className="text-sm font-medium">
          {field.label}
          {/* You can add a required indicator based on field rules */}
        </Label>
        <Badge variant="secondary" className="text-[10px]">
          Dropdown
        </Badge>
      </div>

      <Select defaultValue={field.default_value ?? undefined} disabled>
        <SelectTrigger className="bg-muted/30">
          <SelectValue placeholder="Select an option..." />
        </SelectTrigger>
        <SelectContent>
          {options.map((option, index) => (
            <SelectItem key={index} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {field.helper_text && (
        <p className="text-xs text-muted-foreground">{field.helper_text}</p>
      )}

      <p className="text-[10px] text-sky-600 italic">
        ✓ Single selection dropdown. Options: {options.length}. Space-efficient
        for long lists.
      </p>
    </div>
  );
}
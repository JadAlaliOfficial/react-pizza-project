// src/features/formVersion/components/fields/UrlInputFieldConfig.tsx

/**
 * URL Input Field Configuration Component
 *
 * Provides UI for configuring a URL Input field:
 * - Label (main question)
 * - Placeholder (e.g., https://example.com)
 * - Default value
 * - Helper text
 * - Visibility conditions
 */

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Trash2, Link, Info } from "lucide-react";
import type { Field } from "@/features/formBuilder/formVersions/types";

type UrlInputFieldConfigProps = {
  field: Field;
  fieldIndex: number;
  onFieldChange: (updatedField: Partial<Field>) => void;
  onDelete: () => void;
};

export function UrlInputFieldConfig({
  field,
  fieldIndex,
  onFieldChange,
  onDelete,
}: UrlInputFieldConfigProps) {
  return (
    <Card className="p-4 border-l-4 border-l-cyan-500">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <Link className="h-4 w-4 text-cyan-500" />
            <Badge variant="outline" className="text-xs">
              URL Input
            </Badge>
            <span className="text-xs text-muted-foreground">
              Field {fieldIndex + 1}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            type="button"
            onClick={onDelete}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Label */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Label <span className="text-destructive">*</span>
          </label>
          <Input
            value={field.label}
            onChange={(e) => onFieldChange({ label: e.target.value })}
            placeholder="e.g., Website URL"
            className="h-9"
            maxLength={255}
          />
        </div>

        {/* Placeholder */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Placeholder
          </label>
          <Input
            value={field.placeholder ?? ""}
            onChange={(e) =>
              onFieldChange({ placeholder: e.target.value || null })
            }
            placeholder="e.g., https://example.com"
            className="h-9"
            maxLength={255}
          />
        </div>

        {/* Default Value */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Default Value
          </label>
          <Input
            value={field.default_value ?? ""}
            onChange={(e) =>
              onFieldChange({ default_value: e.target.value || null })
            }
            placeholder="e.g., https://yourcompany.com"
            className="h-9"
          />
        </div>

        {/* Helper Text */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Helper Text
          </label>
          <Textarea
            value={field.helper_text ?? ""}
            onChange={(e) =>
              onFieldChange({ helper_text: e.target.value || null })
            }
            placeholder="Additional information (e.g., 'Please enter your portfolio website URL')"
            className="min-h-[60px] text-xs"
          />
        </div>

        {/* Visibility Conditions */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Visibility Conditions (JSON)
          </label>
          <Textarea
            value={
              field.visibility_conditions ?? field.visibility_condition ?? ""
            }
            onChange={(e) =>
              onFieldChange({
                visibility_conditions: e.target.value || null,
              })
            }
            placeholder='e.g., {"field_id": 5, "operator": "equals", "value": "yes"}'
            className="min-h-[60px] text-xs font-mono"
          />
        </div>

        {/* Available Validation Rules Info */}
        <div className="pt-2 border-t">
          <p className="text-[10px] font-medium text-muted-foreground mb-1">
            📋 Available Validation Rules:
          </p>
          <div className="grid grid-cols-2 gap-1">
            <span className="text-[10px] text-muted-foreground">
              • required
            </span>
            <span className="text-[10px] text-muted-foreground">• url</span>
            <span className="text-[10px] text-muted-foreground">
              • min (length)
            </span>
            <span className="text-[10px] text-muted-foreground">
              • max (length)
            </span>
            <span className="text-[10px] text-muted-foreground">
              • startswith
            </span>
            <span className="text-[10px] text-muted-foreground">
              • endswith
            </span>
            <span className="text-[10px] text-muted-foreground">• regex</span>
            <span className="text-[10px] text-muted-foreground">• unique</span>
          </div>
          <p className="text-[10px] text-cyan-700 mt-2 font-medium">
            ⚠️ "url" rule validates format. Use "startswith" to require
            https://.
          </p>
        </div>

        {/* Example Validation Configuration */}
        <Alert className="bg-amber-50 border-amber-200">
          <Info className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-xs text-amber-900">
            <strong>Example Validation:</strong> Add "url" rule (no props
            needed) and "startswith" rule with props:{" "}
            <code className="bg-amber-100 px-1 rounded">
              {`{ "values": ["https://"] }`}
            </code>{" "}
            to require secure URLs.
          </AlertDescription>
        </Alert>
      </div>
    </Card>
  );
}

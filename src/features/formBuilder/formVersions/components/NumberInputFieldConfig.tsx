// src/features/formVersion/components/fields/NumberInputFieldConfig.tsx

/**
 * Number Input Field Configuration Component
 *
 * Provides UI for configuring a Number Input field:
 * - Label, placeholder, helper text
 * - Default value (numeric)
 * - Min/Max value hints (actual validation rules added later)
 * - Integer vs Decimal toggle hint
 * - Step value for decimals
 * - Visibility conditions
 */

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Trash2, Hash, Info } from "lucide-react";
import type { Field } from "@/features/formBuilder/formVersions/types";

type NumberInputFieldConfigProps = {
  field: Field;
  fieldIndex: number;
  onFieldChange: (updatedField: Partial<Field>) => void;
  onDelete: () => void;
};

export function NumberInputFieldConfig({
  field,
  fieldIndex,
  onFieldChange,
  onDelete,
}: NumberInputFieldConfigProps) {
  // Local state for min/max hints (these would be validation rules, not field properties)
  const [minHint, setMinHint] = useState<string>("");
  const [maxHint, setMaxHint] = useState<string>("");

  // Helper function to validate numeric format for default value
  const isValidNumber = (value: string): boolean => {
    if (!value) return true; // Empty is okay
    return !isNaN(Number(value)) && value.trim() !== "";
  };

  const defaultValueValid = isValidNumber(field.default_value || "");

  return (
    <Card className="p-4 border-l-4 border-l-green-500">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <Hash className="h-4 w-4 text-green-500" />
            <Badge variant="outline" className="text-xs">
              Number Input
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

        {/* Info Alert */}
        <Alert className="bg-green-50 border-green-200">
          <Info className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-xs text-green-900">
            Supports both integers and decimals. Non-numeric characters are
            automatically removed. Min/Max validation operates on VALUE, not length.
          </AlertDescription>
        </Alert>

        {/* Label */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Label <span className="text-destructive">*</span>
          </label>
          <Input
            value={field.label}
            onChange={(e) => onFieldChange({ label: e.target.value })}
            placeholder="Enter field label"
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
            placeholder="e.g., 0, 100, 3.14"
            className="h-9"
            maxLength={255}
          />
          <p className="text-[10px] text-muted-foreground">
            💡 Suggested: "0", "Enter amount", or "0.00"
          </p>
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
            placeholder="Additional information (e.g., 'Enter a value between 1 and 100')"
            className="min-h-[60px] text-xs"
          />
        </div>

        {/* Default Value */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Default Value (Number)
          </label>
          <Input
            type="number"
            step="any"
            value={field.default_value ?? ""}
            onChange={(e) =>
              onFieldChange({ default_value: e.target.value || null })
            }
            placeholder="0"
            className={`h-9 ${!defaultValueValid ? "border-destructive" : ""}`}
          />
          {!defaultValueValid && (
            <p className="text-[10px] text-destructive">
              ⚠️ Please enter a valid number
            </p>
          )}
          <p className="text-[10px] text-muted-foreground">
            💡 Supports decimals (e.g., 3.14, 99.99)
          </p>
        </div>

        {/* Min/Max Hints (informational only - actual rules added later) */}
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Min Value (Hint)
            </label>
            <Input
              type="number"
              step="any"
              value={minHint}
              onChange={(e) => setMinHint(e.target.value)}
              placeholder="e.g., 0"
              className="h-9 text-xs"
            />
            <p className="text-[10px] text-muted-foreground italic">
              For display only. Add validation rule later.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Max Value (Hint)
            </label>
            <Input
              type="number"
              step="any"
              value={maxHint}
              onChange={(e) => setMaxHint(e.target.value)}
              placeholder="e.g., 100"
              className="h-9 text-xs"
            />
            <p className="text-[10px] text-muted-foreground italic">
              For display only. Add validation rule later.
            </p>
          </div>
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
            <span className="text-[10px] text-muted-foreground">• required</span>
            <span className="text-[10px] text-muted-foreground">• numeric</span>
            <span className="text-[10px] text-muted-foreground">
              • min (value)
            </span>
            <span className="text-[10px] text-muted-foreground">
              • max (value)
            </span>
            <span className="text-[10px] text-muted-foreground">• integer</span>
            <span className="text-[10px] text-muted-foreground">• between</span>
            <span className="text-[10px] text-muted-foreground">• unique</span>
            <span className="text-[10px] text-muted-foreground">
              • same/different
            </span>
          </div>
          <p className="text-[10px] text-green-700 mt-2 font-medium">
            ⚠️ Note: min/max rules validate the NUMERIC VALUE, not string length
          </p>
          <p className="text-[10px] text-muted-foreground mt-1">
            💡 Validation rules can be added after saving this field configuration.
          </p>
        </div>
      </div>
    </Card>
  );
}

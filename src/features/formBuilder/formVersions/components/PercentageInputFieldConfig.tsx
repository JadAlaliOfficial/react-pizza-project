// src/features/formVersion/components/fields/PercentageInputFieldConfig.tsx

/**
 * Percentage Input Field Configuration Component
 *
 * Provides UI for configuring a Percentage Input field:
 * - Label (main question)
 * - Min/max percentage range
 * - Default value
 * - Decimal places
 * - Helper text
 * - Visibility conditions
 */

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Trash2, Percent, Info } from "lucide-react";
import type { Field } from "@/features/formBuilder/formVersions/types";

type PercentageInputFieldConfigProps = {
  field: Field;
  fieldIndex: number;
  onFieldChange: (updatedField: Partial<Field>) => void;
  onDelete: () => void;
};

export function PercentageInputFieldConfig({
  field,
  fieldIndex,
  onFieldChange,
  onDelete,
}: PercentageInputFieldConfigProps) {
  const [defaultValue, setDefaultValue] = useState(field.default_value || "50");

  const getProgressColor = (value: number) => {
    if (value <= 33) return "bg-red-500";
    if (value <= 66) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <Card className="p-4 border-l-4 border-l-violet-500">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <Percent className="h-4 w-4 text-violet-500" />
            <Badge variant="outline" className="text-xs">
              Percentage Input
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
        <Alert className="bg-violet-50 border-violet-200">
          <Info className="h-4 w-4 text-violet-600" />
          <AlertDescription className="text-xs text-violet-900">
            Percentage input with % symbol suffix. Stored as numeric string
            without symbol (e.g., "50"). Supports decimals (45.5%).
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
            placeholder="e.g., What is your completion rate?"
            className="h-9"
            maxLength={255}
          />
        </div>

        {/* Default Value with Visual Progress */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Default Value
          </label>
          <div className="space-y-3">
            <div className="relative">
              <Input
                type="number"
                value={defaultValue}
                onChange={(e) => {
                  const value = e.target.value;
                  setDefaultValue(value);
                  onFieldChange({ default_value: value || null });
                }}
                placeholder="50"
                className="h-9 pr-10"
                min="0"
                max="100"
                step="0.1"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">
                %
              </span>
            </div>

            {/* Visual Progress Bar */}
            <div className="p-3 border rounded-md bg-muted/30">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Preview:</span>
                  <span className="font-bold text-violet-600">
                    {defaultValue}%
                  </span>
                </div>
                <Progress
                  value={parseFloat(defaultValue) || 0}
                  className={`h-3 ${getProgressColor(
                    parseFloat(defaultValue) || 0
                  )}`}
                />
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Placeholder */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Placeholder Text
          </label>
          <Input
            value={field.placeholder ?? ""}
            onChange={(e) =>
              onFieldChange({ placeholder: e.target.value || null })
            }
            placeholder="e.g., 0"
            className="h-9"
            maxLength={255}
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
            placeholder="Additional information (e.g., 'Enter a value between 0 and 100')"
            className="min-h-[60px] text-xs"
          />
        </div>

        {/* Percentage Input Details */}
        <div className="p-3 border rounded-md bg-muted/30">
          <p className="text-[10px] font-medium text-muted-foreground mb-2">
            📊 Percentage Input Details:
          </p>
          <div className="space-y-1 text-[10px] text-muted-foreground">
            <div>
              • <strong>Storage:</strong> Numeric string without % symbol (50)
            </div>
            <div>
              • <strong>Display:</strong> % symbol added automatically (50%)
            </div>
            <div>
              • <strong>Range:</strong> Typically 0-100, customizable via
              validation
            </div>
            <div>
              • <strong>Decimals:</strong> Supports decimal values (45.5%)
            </div>
          </div>
        </div>

        {/* Color-Coded Ranges */}
        <div className="p-3 border rounded-md bg-muted/30">
          <p className="text-[10px] font-medium text-muted-foreground mb-2">
            🎨 Color-Coded Ranges:
          </p>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-500"></div>
              <span className="text-[10px] text-muted-foreground">
                0-33%: Low/Poor
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-yellow-500"></div>
              <span className="text-[10px] text-muted-foreground">
                34-66%: Medium/Fair
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-500"></div>
              <span className="text-[10px] text-muted-foreground">
                67-100%: High/Excellent
              </span>
            </div>
          </div>
        </div>

        {/* Common Use Cases */}
        <div className="p-3 border rounded-md bg-muted/30">
          <p className="text-[10px] font-medium text-muted-foreground mb-2">
            📊 Common Use Cases:
          </p>
          <div className="space-y-1 text-[10px] text-muted-foreground">
            <div>
              • <strong>Progress:</strong> Completion rates, task progress
            </div>
            <div>
              • <strong>Rates:</strong> Discount rates, conversion rates
            </div>
            <div>
              • <strong>Scores:</strong> Test scores, grades, confidence
            </div>
            <div>
              • <strong>Allocation:</strong> Budget allocation, resource split
            </div>
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
            <span className="text-[10px] text-muted-foreground">
              • required
            </span>
            <span className="text-[10px] text-muted-foreground">
              • min (percentage)
            </span>
            <span className="text-[10px] text-muted-foreground">
              • max (percentage)
            </span>
            <span className="text-[10px] text-muted-foreground">
              • between
            </span>
            <span className="text-[10px] text-muted-foreground">
              • numeric
            </span>
          </div>
          <p className="text-[10px] text-violet-700 mt-2 font-medium">
            💡 Use "min" (0) and "max" (100) rules to enforce 0-100 range. %
            symbol automatically added on display.
          </p>
        </div>

        {/* Example Validation Configuration */}
        <Alert className="bg-amber-50 border-amber-200">
          <Info className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-xs text-amber-900">
            <strong>Example Validation:</strong> Add "min" rule with props:{" "}
            <code className="bg-amber-100 px-1 rounded">{`{ "value": 0 }`}</code>{" "}
            and "max" rule with props:{" "}
            <code className="bg-amber-100 px-1 rounded">
              {`{ "value": 100 }`}
            </code>{" "}
            for standard percentage range.
          </AlertDescription>
        </Alert>
      </div>
    </Card>
  );
}

// src/features/formVersion/components/fields/SliderFieldConfig.tsx

/**
 * Slider Field Configuration Component
 *
 * Provides UI for configuring a Slider field:
 * - Label (main question)
 * - Min value
 * - Max value
 * - Step increment
 * - Default value
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
import { Slider } from "@/components/ui/slider";
import { Trash2, SlidersHorizontal, Info } from "lucide-react";
import type { Field } from "@/features/formBuilder/formVersions/types";

type SliderFieldConfigProps = {
  field: Field;
  fieldIndex: number;
  onFieldChange: (updatedField: Partial<Field>) => void;
  onDelete: () => void;
};

export function SliderFieldConfig({
  field,
  fieldIndex,
  onFieldChange,
  onDelete,
}: SliderFieldConfigProps) {
  const [defaultValue, setDefaultValue] = useState(field.default_value || "50");

  return (
    <Card className="p-4 border-l-4 border-l-indigo-500">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-indigo-500" />
            <Badge variant="outline" className="text-xs">
              Slider
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
            placeholder="e.g., Select your budget range"
            className="h-9"
            maxLength={255}
          />
        </div>

        {/* Default Value with Preview */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Default Value
          </label>
          <div className="space-y-3">
            <Input
              type="number"
              value={defaultValue}
              onChange={(e) => {
                setDefaultValue(e.target.value);
                onFieldChange({ default_value: e.target.value || null });
              }}
              placeholder="50"
              className="h-9"
              min={0}
              max={100}
              step={1}
            />
            {/* Visual Slider Preview */}
            <div className="p-3 border rounded-md bg-muted/30">
              <Slider
                value={[parseInt(defaultValue) || 50]}
                onValueChange={(value) => {
                  setDefaultValue(String(value[0]));
                  onFieldChange({ default_value: String(value[0]) });
                }}
                min={0}
                max={100}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground mt-2">
                <span>0</span>
                <span className="font-medium text-indigo-600">
                  {defaultValue}
                </span>
                <span>100</span>
              </div>
            </div>
          </div>
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
            placeholder="Additional information (e.g., 'Select your preferred price range')"
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
            <span className="text-[10px] text-muted-foreground">
              • min (value)
            </span>
            <span className="text-[10px] text-muted-foreground">
              • max (value)
            </span>
            <span className="text-[10px] text-muted-foreground">
              • between
            </span>
            <span className="text-[10px] text-muted-foreground">
              • numeric
            </span>
            <span className="text-[10px] text-muted-foreground">
              • integer
            </span>
          </div>
          <p className="text-[10px] text-indigo-700 mt-2 font-medium">
            💡 Use "min" and "max" rules to set slider range. Use "integer" to
            prevent decimals.
          </p>
        </div>

        {/* Example Validation Configuration */}
        <Alert className="bg-amber-50 border-amber-200">
          <Info className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-xs text-amber-900">
            <strong>Example Validation:</strong> Add "min" rule with props:{" "}
            <code className="bg-amber-100 px-1 rounded">{`{ "value": 0 }`}</code>
            , "max" rule with props:{" "}
            <code className="bg-amber-100 px-1 rounded">
              {`{ "value": 100 }`}
            </code>
            , and "integer" rule for whole numbers only.
          </AlertDescription>
        </Alert>
      </div>
    </Card>
  );
}

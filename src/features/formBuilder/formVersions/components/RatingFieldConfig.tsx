// src/features/formVersion/components/fields/RatingFieldConfig.tsx

/**
 * Rating Field Configuration Component
 *
 * Provides UI for configuring a Rating field:
 * - Label (main question)
 * - Max stars/rating scale (1-5, 1-10, etc.)
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
import { Trash2, Star, Info } from "lucide-react";
import type { Field } from "@/features/formBuilder/formVersions/types";

type RatingFieldConfigProps = {
  field: Field;
  fieldIndex: number;
  onFieldChange: (updatedField: Partial<Field>) => void;
  onDelete: () => void;
};

export function RatingFieldConfig({
  field,
  fieldIndex,
  onFieldChange,
  onDelete,
}: RatingFieldConfigProps) {
  const [maxStars, setMaxStars] = useState("5");
  const [defaultRating, setDefaultRating] = useState(field.default_value || "0");

  return (
    <Card className="p-4 border-l-4 border-l-amber-500">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
            <Badge variant="outline" className="text-xs">
              Rating
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
        <Alert className="bg-amber-50 border-amber-200">
          <Info className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-xs text-amber-900">
            Star rating field for feedback and reviews. Values stored as
            integers (0-5). Includes hover preview and clickable star selection.
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
            placeholder="e.g., How would you rate our service?"
            className="h-9"
            maxLength={255}
          />
        </div>

        {/* Max Stars Configuration */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Maximum Stars
          </label>
          <Input
            type="number"
            value={maxStars}
            onChange={(e) => setMaxStars(e.target.value)}
            placeholder="5"
            className="h-9"
            min="1"
            max="10"
          />
          <p className="text-[10px] text-muted-foreground">
            💡 Default: 5 stars (1-5 scale). Use "max" validation rule to
            configure.
          </p>
        </div>

        {/* Default Rating Value */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Default Rating
          </label>
          <div className="space-y-2">
            <Input
              type="number"
              value={defaultRating}
              onChange={(e) => {
                setDefaultRating(e.target.value);
                onFieldChange({ default_value: e.target.value || null });
              }}
              placeholder="0"
              className="h-9"
              min="0"
              max={maxStars}
            />
            {/* Star Preview */}
            <div className="flex gap-1">
              {Array.from({ length: parseInt(maxStars) || 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${
                    i < parseInt(defaultRating)
                      ? "text-amber-500 fill-amber-500"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground">
            💡 Pre-selected rating (0 = no rating selected)
          </p>
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
            placeholder="e.g., Click to rate"
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
            placeholder="Additional information (e.g., '1 = Poor, 5 = Excellent')"
            className="min-h-[60px] text-xs"
          />
        </div>

        {/* Rating Details */}
        <div className="p-3 border rounded-md bg-muted/30">
          <p className="text-[10px] font-medium text-muted-foreground mb-2">
            ⭐ Rating Details:
          </p>
          <div className="space-y-1 text-[10px] text-muted-foreground">
            <div>
              • <strong>Storage:</strong> Integer value (0-5 by default)
            </div>
            <div>
              • <strong>Scale:</strong> Configurable (1-5, 1-10, etc.)
            </div>
            <div>
              • <strong>Constraints:</strong> Value clamped to 0-max
            </div>
            <div>
              • <strong>Display:</strong> Visual star icons with hover effect
            </div>
          </div>
        </div>

        {/* Rating Labels Guide */}
        <div className="p-3 border rounded-md bg-muted/30">
          <p className="text-[10px] font-medium text-muted-foreground mb-2">
            📊 Common Rating Labels:
          </p>
          <div className="space-y-1 text-[10px] text-muted-foreground">
            <div>
              • <strong>5-Star:</strong> 1=Poor, 2=Fair, 3=Good, 4=Very Good,
              5=Excellent
            </div>
            <div>
              • <strong>NPS:</strong> 0-10 (0=Not likely, 10=Extremely likely)
            </div>
            <div>
              • <strong>Satisfaction:</strong> 1=Very Dissatisfied, 5=Very
              Satisfied
            </div>
          </div>
        </div>

        {/* Common Use Cases */}
        <div className="p-3 border rounded-md bg-muted/30">
          <p className="text-[10px] font-medium text-muted-foreground mb-2">
            ⭐ Common Use Cases:
          </p>
          <div className="space-y-1 text-[10px] text-muted-foreground">
            <div>
              • <strong>Product Reviews:</strong> Customer product ratings
            </div>
            <div>
              • <strong>Service Quality:</strong> Service satisfaction ratings
            </div>
            <div>
              • <strong>Feedback Surveys:</strong> Experience assessment
            </div>
            <div>
              • <strong>Performance:</strong> Skill or performance evaluation
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
              • min (rating)
            </span>
            <span className="text-[10px] text-muted-foreground">
              • max (rating)
            </span>
            <span className="text-[10px] text-muted-foreground">
              • between
            </span>
            <span className="text-[10px] text-muted-foreground">
              • in (specific values)
            </span>
          </div>
          <p className="text-[10px] text-amber-700 mt-2 font-medium">
            💡 Use "min" to require minimum rating. Use "max" to set rating
            scale (e.g., 5 for 1-5 stars).
          </p>
        </div>

        {/* Example Validation Configuration */}
        <Alert className="bg-amber-50 border-amber-200">
          <Info className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-xs text-amber-900">
            <strong>Example Validation:</strong> Add "min" rule with props:{" "}
            <code className="bg-amber-100 px-1 rounded">{`{ "value": 3 }`}</code>{" "}
            to require at least 3 stars. Add "max" rule with props:{" "}
            <code className="bg-amber-100 px-1 rounded">{`{ "value": 5 }`}</code>{" "}
            for 5-star scale.
          </AlertDescription>
        </Alert>
      </div>
    </Card>
  );
}

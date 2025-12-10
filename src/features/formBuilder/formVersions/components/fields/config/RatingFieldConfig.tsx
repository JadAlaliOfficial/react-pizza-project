// src/features/formVersion/components/fields/config/RatingFieldConfig.tsx

/**
 * Rating Field Configuration Component
 *
 * Provides UI for configuring a Rating field:
 * - Label (main question)
 * - Default value (0-5)
 * - Helper text
 * - Visibility conditions
 *
 * NOTE: Backend currently hardcodes max to 5 stars.
 * Max stars configuration is not functional until backend is updated.
 */

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Trash2 } from 'lucide-react';
import type { FieldConfigComponentProps } from '../fieldComponentRegistry';

// ============================================================================
// Component
// ============================================================================

/**
 * RatingFieldConfig Component
 *
 * Configuration UI for Rating field type
 * Features:
 * - Label, helper text
 * - Default rating (0–5) with live star preview
 * - Visibility conditions (JSON)
 * - Notes about backend limits and rules
 */
export const RatingFieldConfig: React.FC<FieldConfigComponentProps> = ({
  field,
  fieldIndex,
  onFieldChange,
  onDelete,
}) => {
  console.debug('[RatingFieldConfig] Rendering for field:', field.id);

  const [defaultRating, setDefaultRating] = useState(field.default_value || '0');
  const maxStars = 5; // Hardcoded in backend

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
                const value = e.target.value;
                const numValue = parseInt(value, 10) || 0;
                const clampedValue = Math.max(0, Math.min(5, numValue)).toString();
                setDefaultRating(clampedValue);
                onFieldChange({ default_value: clampedValue || null });
              }}
              placeholder="0"
              className="h-9"
              min={0}
              max={5}
            />
            {/* Star Preview */}
            <div className="flex gap-1">
              {Array.from({ length: maxStars }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${
                    i < parseInt(defaultRating || '0', 10)
                      ? 'text-amber-500 fill-amber-500'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground">
              💡 Default rating is between 0 and 5 stars (inclusive).
            </p>
          </div>
        </div>

        {/* Helper Text */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Helper Text
          </label>
          <Textarea
            value={field.helper_text ?? ''}
            onChange={(e) =>
              onFieldChange({ helper_text: e.target.value || null })
            }
            placeholder="Additional information (e.g., '1 = Poor, 5 = Excellent')"
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
              field.visibility_conditions ?? field.visibility_condition ?? ''
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
            📋 Suggested Validation Rules:
          </p>
          <div className="grid grid-cols-2 gap-1 text-[10px] text-muted-foreground">
            <span>• required</span>
          </div>
          <p className="text-[10px] text-amber-700 mt-2 font-medium">
            ⚠️ Note: Rating field is not configured for min, max, between, numeric, or integer rules in the backend; only the "required" rule is supported.
          </p>
        </div>
      </div>
    </Card>
  );
};

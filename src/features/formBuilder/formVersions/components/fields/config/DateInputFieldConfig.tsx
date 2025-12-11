// src/features/formVersion/components/fields/config/DateInputFieldConfig.tsx

/**
 * Date Input Field Configuration Component
 *
 * Provides UI for configuring a Date Input field:
 * - Label, placeholder, helper text
 * - Default value (date format)
 * - Min/Max date hints (for validation rules)
 * - Date format (Y-m-d standard)
 * - Visibility conditions
 */

import React from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Calendar } from 'lucide-react';
import type { FieldConfigComponentProps } from '../fieldComponentRegistry';

// ============================================================================
// Component
// ============================================================================

/**
 * DateInputFieldConfig Component
 *
 * Configuration UI for Date Input field type
 * Features:
 * - Native date picker with "Today" quick button
 * - Min/Max date hints
 * - Date validation rule guidance
 * - Automatic YYYY-MM-DD normalization
 */
export const DateInputFieldConfig: React.FC<FieldConfigComponentProps> = ({
  field,
  fieldIndex,
  onFieldChange,
  onDelete,
}) => {
  console.debug('[DateInputFieldConfig] Rendering for field:', field.id);

  // Helper function to validate date format
  const isValidDate = (dateString: string): boolean => {
    if (!dateString) return true; // Empty is okay
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  };

  const defaultValueValid = isValidDate(field.default_value || '');

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = (): string => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <Card className="p-4 border-l-4 border-l-indigo-500">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-indigo-500" />
            <Badge variant="outline" className="text-xs">
              Date Input
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
            placeholder="Enter field label"
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
            value={field.helper_text ?? ''}
            onChange={(e) =>
              onFieldChange({ helper_text: e.target.value || null })
            }
            placeholder="Additional information (e.g., 'Select your birth date')"
            className="min-h-[60px] text-xs"
          />
        </div>

        {/* Default Value */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Default Value (Date)
          </label>
          <div className="flex gap-2">
            <Input
              type="date"
              value={field.default_value ?? ''}
              onChange={(e) =>
                onFieldChange({ default_value: e.target.value || null })
              }
              className={`h-9 flex-1 ${
                !defaultValueValid ? 'border-destructive' : ''
              }`}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onFieldChange({ default_value: getTodayDate() })}
              className="h-9 text-xs"
            >
              Today
            </Button>
          </div>
          {!defaultValueValid && (
            <p className="text-[10px] text-destructive">
              ⚠️ Please enter a valid date
            </p>
          )}
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
      </div>
    </Card>
  );
};

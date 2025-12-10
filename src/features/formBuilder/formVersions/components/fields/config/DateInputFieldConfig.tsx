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

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Trash2, Calendar, Info } from 'lucide-react';
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

  const [minDateHint, setMinDateHint] = useState<string>('');
  const [maxDateHint, setMaxDateHint] = useState<string>('');

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

        {/* Info Alert */}
        <Alert className="bg-indigo-50 border-indigo-200">
          <Info className="h-4 w-4 text-indigo-600" />
          <AlertDescription className="text-xs text-indigo-900">
            Dates are automatically normalized to Y-m-d format (YYYY-MM-DD). Supports date validation rules like before, after, and date ranges.
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
            value={field.placeholder ?? ''}
            onChange={(e) =>
              onFieldChange({ placeholder: e.target.value || null })
            }
            placeholder="e.g., YYYY-MM-DD, Select date"
            className="h-9"
            maxLength={255}
          />
          <p className="text-[10px] text-muted-foreground">
            💡 Standard format: YYYY-MM-DD (e.g., 2024-12-04)
          </p>
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
          <p className="text-[10px] text-muted-foreground">
            💡 Will be normalized to YYYY-MM-DD format
          </p>
        </div>

        {/* Min/Max Date Hints */}
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Min Date (Hint)
            </label>
            <Input
              type="date"
              value={minDateHint}
              onChange={(e) => setMinDateHint(e.target.value)}
              className="h-9 text-xs"
            />
            <p className="text-[10px] text-muted-foreground italic">
              For display only. Add validation rule later.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Max Date (Hint)
            </label>
            <Input
              type="date"
              value={maxDateHint}
              onChange={(e) => setMaxDateHint(e.target.value)}
              className="h-9 text-xs"
            />
            <p className="text-[10px] text-muted-foreground italic">
              For display only. Add validation rule later.
            </p>
          </div>
        </div>

        {/* Quick Date Options */}
        <div className="p-3 border rounded-md bg-muted/30">
          <p className="text-[10px] font-medium text-muted-foreground mb-2">
            📅 Common Date Restrictions:
          </p>
          <div className="grid grid-cols-2 gap-1 text-[10px] text-muted-foreground">
            <span>• before: "today" - past dates only</span>
            <span>• after: "today" - future dates only</span>
            <span>• before: "2025-12-31" - specific date</span>
            <span>• after: "2024-01-01" - specific date</span>
          </div>
          <p className="text-[10px] text-indigo-700 mt-2">
            💡 Use validation rules (before, after, min, max) to enforce date restrictions
          </p>
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
            <span>• date</span>
            <span>• date_format</span>
            <span>• before</span>
            <span>• after</span>
            <span>• before_or_equal</span>
            <span>• after_or_equal</span>
            <span>• min/max (date)</span>
          </div>
          <p className="text-[10px] text-indigo-700 mt-2 font-medium">
            ⚠️ Date comparisons use YYYY-MM-DD format
          </p>
          <p className="text-[10px] text-muted-foreground mt-1">
            💡 Configure validation rules in the Field Validation Rules section below
          </p>
        </div>
      </div>
    </Card>
  );
};

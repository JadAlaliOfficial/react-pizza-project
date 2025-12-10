// src/features/formVersion/components/fields/config/TimeInputFieldConfig.tsx

/**
 * Time Input Field Configuration Component
 * 
 * Provides UI for configuring a Time Input field:
 * - Label, placeholder, helper text
 * - Default value (time format)
 * - Min/Max time hints (for validation rules)
 * - Time format (H:i:s standard - 24 hour)
 * - Step configuration (seconds, minutes)
 * - Visibility conditions
 */

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Trash2, Clock, Info } from 'lucide-react';
import type { FieldConfigComponentProps } from '../fieldComponentRegistry';

// ============================================================================
// Component
// ============================================================================

/**
 * TimeInputFieldConfig Component
 * 
 * Configuration UI for Time Input field type
 * Features:
 * - Native time picker with configurable step (minutes/seconds)
 * - "Now" quick button
 * - Min/Max time hints
 * - Time validation rule guidance
 */
export const TimeInputFieldConfig: React.FC<FieldConfigComponentProps> = ({
  field,
  fieldIndex,
  onFieldChange,
  onDelete,
}) => {
  console.debug('[TimeInputFieldConfig] Rendering for field:', field.id);

  const [minTimeHint, setMinTimeHint] = useState<string>('');
  const [maxTimeHint, setMaxTimeHint] = useState<string>('');
  const [stepType, setStepType] = useState<"seconds" | "minutes">('minutes');

  // Helper function to validate time format
  const isValidTime = (timeString: string): boolean => {
    if (!timeString) return true; // Empty is okay
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;
    return timeRegex.test(timeString);
  };

  const defaultValueValid = isValidTime(field.default_value || '');

  // Get current time in HH:MM format
  const getCurrentTime = (): string => {
    const now = new Date();
    return now.toTimeString().slice(0, 5); // HH:MM
  };

  return (
    <Card className="p-4 border-l-4 border-l-teal-500">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-teal-500" />
            <Badge variant="outline" className="text-xs">
              Time Input
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
        <Alert className="bg-teal-50 border-teal-200">
          <Info className="h-4 w-4 text-teal-600" />
          <AlertDescription className="text-xs text-teal-900">
            Times are automatically normalized to H:i:s format (HH:MM:SS - 24-hour). Supports time validation rules like before, after, and time ranges.
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

        {/* Time Step Configuration */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Time Step (Precision)
          </label>
          <Select value={stepType} onValueChange={(value: "seconds" | "minutes") => setStepType(value)}>
            <SelectTrigger className="h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="minutes" className="text-xs">
                Minutes only (e.g., 14:30)
              </SelectItem>
              <SelectItem value="seconds" className="text-xs">
                Include seconds (e.g., 14:30:00)
              </SelectItem>
            </SelectContent>
          </Select>
          <p className="text-[10px] text-muted-foreground">
            💡 Minutes: step=60, Seconds: step=1
          </p>
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
            placeholder={stepType === "seconds" ? "e.g., HH:MM:SS" : "e.g., HH:MM"}
            className="h-9"
            maxLength={255}
          />
          <p className="text-[10px] text-muted-foreground">
            💡 Standard format: {stepType === "seconds" ? "HH:MM:SS (e.g., 14:30:00)" : "HH:MM (e.g., 14:30)"}
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
            placeholder="Additional information (e.g., 'Select appointment time')"
            className="min-h-[60px] text-xs"
          />
        </div>

        {/* Default Value */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Default Value (Time)
          </label>
          <div className="flex gap-2">
            <Input
              type="time"
              step={stepType === "seconds" ? "1" : "60"}
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
              onClick={() => onFieldChange({ default_value: getCurrentTime() })}
              className="h-9 text-xs"
            >
              Now
            </Button>
          </div>
          {!defaultValueValid && (
            <p className="text-[10px] text-destructive">
              ⚠️ Please enter a valid time
            </p>
          )}
          <p className="text-[10px] text-muted-foreground">
            💡 Will be normalized to HH:MM:SS format (24-hour)
          </p>
        </div>

        {/* Min/Max Time Hints */}
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Min Time (Hint)
            </label>
            <Input
              type="time"
              step={stepType === "seconds" ? "1" : "60"}
              value={minTimeHint}
              onChange={(e) => setMinTimeHint(e.target.value)}
              className="h-9 text-xs"
            />
            <p className="text-[10px] text-muted-foreground italic">
              For display only. Add validation rule later.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Max Time (Hint)
            </label>
            <Input
              type="time"
              step={stepType === "seconds" ? "1" : "60"}
              value={maxTimeHint}
              onChange={(e) => setMaxTimeHint(e.target.value)}
              className="h-9 text-xs"
            />
            <p className="text-[10px] text-muted-foreground italic">
              For display only. Add validation rule later.
            </p>
          </div>
        </div>

        {/* Common Time Restrictions */}
        <div className="p-3 border rounded-md bg-muted/30">
          <p className="text-[10px] font-medium text-muted-foreground mb-2">
            🕐 Common Time Restrictions:
          </p>
          <div className="grid grid-cols-2 gap-1 text-[10px] text-muted-foreground">
            <span>• Business hours: 09:00-17:00</span>
            <span>• Morning only: before 12:00</span>
            <span>• Afternoon only: after 12:00</span>
            <span>• Evening: after 18:00</span>
          </div>
          <p className="text-[10px] text-teal-700 mt-2">
            💡 Use validation rules (before, after, date_format) to enforce time restrictions
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
            <span>• date_format</span>
            <span>• before</span>
            <span>• after</span>
            <span>• before_or_equal</span>
            <span>• after_or_equal</span>
          </div>
          <p className="text-[10px] text-teal-700 mt-2 font-medium">
            ⚠️ Time comparisons use HH:MM:SS format (24-hour)
          </p>
          <p className="text-[10px] text-muted-foreground mt-1">
            💡 Configure validation rules in the Field Validation Rules section below
          </p>
        </div>
      </div>
    </Card>
  );
};

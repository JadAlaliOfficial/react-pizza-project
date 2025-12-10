// src/features/formVersion/components/fields/DateTimeInputFieldConfig.tsx

/**
 * DateTime Input Field Configuration Component
 *
 * Provides UI for configuring a DateTime Input field:
 * - Label, placeholder, helper text
 * - Default value (datetime format)
 * - Min/Max datetime hints (for validation rules)
 * - DateTime format (Y-m-d H:i:s standard)
 * - Timezone awareness
 * - Visibility conditions
 */

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Trash2, CalendarClock, Info } from "lucide-react";
import type { Field } from "@/features/formBuilder/formVersions/types";

type DateTimeInputFieldConfigProps = {
  field: Field;
  fieldIndex: number;
  onFieldChange: (updatedField: Partial<Field>) => void;
  onDelete: () => void;
};

export function DateTimeInputFieldConfig({
  field,
  fieldIndex,
  onFieldChange,
  onDelete,
}: DateTimeInputFieldConfigProps) {
  const [minDateTimeHint, setMinDateTimeHint] = useState<string>("");
  const [maxDateTimeHint, setMaxDateTimeHint] = useState<string>("");

  // Helper function to validate datetime format
  const isValidDateTime = (datetimeString: string): boolean => {
    if (!datetimeString) return true; // Empty is okay
    const date = new Date(datetimeString);
    return !isNaN(date.getTime());
  };

  const defaultValueValid = isValidDateTime(field.default_value || "");

  // Get current datetime in YYYY-MM-DDTHH:MM format (for datetime-local input)
  const getCurrentDateTime = (): string => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  return (
    <Card className="p-4 border-l-4 border-l-purple-500">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <CalendarClock className="h-4 w-4 text-purple-500" />
            <Badge variant="outline" className="text-xs">
              DateTime Input
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
        <Alert className="bg-purple-50 border-purple-200">
          <Info className="h-4 w-4 text-purple-600" />
          <AlertDescription className="text-xs text-purple-900">
            Combines date and time in a single field. Automatically normalized to
            Y-m-d H:i:s format (YYYY-MM-DD HH:MM:SS). Perfect for appointments,
            events, and timestamps.
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
            placeholder="e.g., YYYY-MM-DD HH:MM, Select date and time"
            className="h-9"
            maxLength={255}
          />
          <p className="text-[10px] text-muted-foreground">
            💡 Standard format: YYYY-MM-DD HH:MM (e.g., 2024-12-04 14:30)
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
            placeholder="Additional information (e.g., 'Select appointment date and time')"
            className="min-h-[60px] text-xs"
          />
        </div>

        {/* Default Value */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Default Value (DateTime)
          </label>
          <div className="flex gap-2">
            <Input
              type="datetime-local"
              value={field.default_value ?? ""}
              onChange={(e) =>
                onFieldChange({ default_value: e.target.value || null })
              }
              className={`h-9 flex-1 ${
                !defaultValueValid ? "border-destructive" : ""
              }`}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                onFieldChange({ default_value: getCurrentDateTime() })
              }
              className="h-9 text-xs"
            >
              Now
            </Button>
          </div>
          {!defaultValueValid && (
            <p className="text-[10px] text-destructive">
              ⚠️ Please enter a valid datetime
            </p>
          )}
          <p className="text-[10px] text-muted-foreground">
            💡 Will be normalized to YYYY-MM-DD HH:MM:SS format
          </p>
        </div>

        {/* Min/Max DateTime Hints */}
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Min DateTime (Hint)
            </label>
            <Input
              type="datetime-local"
              value={minDateTimeHint}
              onChange={(e) => setMinDateTimeHint(e.target.value)}
              className="h-9 text-xs"
            />
            <p className="text-[10px] text-muted-foreground italic">
              For display only. Add validation rule later.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Max DateTime (Hint)
            </label>
            <Input
              type="datetime-local"
              value={maxDateTimeHint}
              onChange={(e) => setMaxDateTimeHint(e.target.value)}
              className="h-9 text-xs"
            />
            <p className="text-[10px] text-muted-foreground italic">
              For display only. Add validation rule later.
            </p>
          </div>
        </div>

        {/* Common DateTime Scenarios */}
        <div className="p-3 border rounded-md bg-muted/30">
          <p className="text-[10px] font-medium text-muted-foreground mb-2">
            🗓️ Common Use Cases:
          </p>
          <div className="space-y-1 text-[10px] text-muted-foreground">
            <div>• <strong>Appointments:</strong> Book meeting date & time</div>
            <div>• <strong>Events:</strong> Conference/webinar scheduling</div>
            <div>• <strong>Deadlines:</strong> Submission with time component</div>
            <div>• <strong>Reservations:</strong> Restaurant/hotel bookings</div>
          </div>
          <p className="text-[10px] text-purple-700 mt-2">
            💡 Use validation rules (before, after, min) to enforce datetime
            restrictions
          </p>
        </div>

        {/* Timezone Notice */}
        <Alert className="bg-amber-50 border-amber-200">
          <Info className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-xs text-amber-900">
            <strong>Timezone:</strong> Values are stored in server timezone.
            Consider adding helper text about timezone if working with
            international users.
          </AlertDescription>
        </Alert>

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
            <span className="text-[10px] text-muted-foreground">• date</span>
            <span className="text-[10px] text-muted-foreground">
              • date_format
            </span>
            <span className="text-[10px] text-muted-foreground">• before</span>
            <span className="text-[10px] text-muted-foreground">• after</span>
            <span className="text-[10px] text-muted-foreground">
              • before_or_equal
            </span>
            <span className="text-[10px] text-muted-foreground">
              • after_or_equal
            </span>
            <span className="text-[10px] text-muted-foreground">• min</span>
          </div>
          <p className="text-[10px] text-purple-700 mt-2 font-medium">
            ⚠️ DateTime comparisons use YYYY-MM-DD HH:MM:SS format
          </p>
        </div>
      </div>
    </Card>
  );
}
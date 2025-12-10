// src/features/formVersion/components/fields/config/PhoneInputFieldConfig.tsx

/**
 * Phone Input Field Configuration Component
 * 
 * Provides UI for configuring a Phone Input field:
 * - Label, placeholder, helper text
 * - Default value (phone format)
 * - Format guidance (no automatic formatting)
 * - Country code hints
 * - Regex pattern suggestions
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
import { Trash2, Phone, Info } from 'lucide-react';
import type { FieldConfigComponentProps } from '../fieldComponentRegistry';

// Common phone format examples
const PHONE_FORMATS = [
  { label: "US Format", value: "+1 (555) 123-4567", pattern: "^\\+1\\s\\(\\d{3}\\)\\s\\d{3}-\\d{4}$" },
  { label: "International", value: "+44 20 1234 5678", pattern: "^\\+\\d{1,3}\\s\\d{2,}\\s\\d{4,}\\s\\d{4}$" },
  { label: "Simple (10 digits)", value: "5551234567", pattern: "^\\d{10}$" },
  { label: "With Dashes", value: "555-123-4567", pattern: "^\\d{3}-\\d{3}-\\d{4}$" },
  { label: "With Dots", value: "555.123.4567", pattern: "^\\d{3}\\.\\d{3}\\.\\d{4}$" },
  { label: "Custom", value: "", pattern: "" },
];

// ============================================================================
// Component
// ============================================================================

/**
 * PhoneInputFieldConfig Component
 * 
 * Configuration UI for Phone Input field type
 * Features:
 * - Phone format presets with regex patterns
 * - Country code reference
 * - type="tel" input
 * - Copy-to-clipboard regex patterns
 */
export const PhoneInputFieldConfig: React.FC<FieldConfigComponentProps> = ({
  field,
  fieldIndex,
  onFieldChange,
  onDelete,
}) => {
  console.debug('[PhoneInputFieldConfig] Rendering for field:', field.id);

  const [formatType, setFormatType] = useState<string>("Custom");
  const [regexPattern, setRegexPattern] = useState<string>("");

  const handleFormatChange = (formatLabel: string) => {
    setFormatType(formatLabel);
    const format = PHONE_FORMATS.find((f) => f.label === formatLabel);
    if (format && format.value) {
      onFieldChange({ placeholder: format.value });
      setRegexPattern(format.pattern);
    }
  };

  return (
    <Card className="p-4 border-l-4 border-l-cyan-500">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-cyan-500" />
            <Badge variant="outline" className="text-xs">
              Phone Input
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
        <Alert className="bg-cyan-50 border-cyan-200">
          <Info className="h-4 w-4 text-cyan-600" />
          <AlertDescription className="text-xs text-cyan-900">
            Phone numbers are stored AS-IS (no auto-formatting). Use regex validation rules to enforce specific formats. Supports country code filtering.
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

        {/* Phone Format Preset */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Phone Format Preset
          </label>
          <Select value={formatType} onValueChange={handleFormatChange}>
            <SelectTrigger className="h-9 text-xs">
              <SelectValue placeholder="Select format..." />
            </SelectTrigger>
            <SelectContent>
              {PHONE_FORMATS.map((format) => (
                <SelectItem
                  key={format.label}
                  value={format.label}
                  className="text-xs"
                >
                  {format.label}
                  {format.value && (
                    <span className="text-muted-foreground ml-2">
                      - {format.value}
                    </span>
                  )}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-[10px] text-muted-foreground">
            💡 Selecting a preset will update placeholder and suggest a regex pattern
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
            placeholder="e.g., +1 (555) 123-4567"
            className="h-9"
            maxLength={255}
          />
          <p className="text-[10px] text-muted-foreground">
            💡 Shows expected format to users
          </p>
        </div>

        {/* Regex Pattern Hint */}
        {regexPattern && (
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Suggested Regex Pattern
            </label>
            <div className="relative">
              <Textarea
                value={regexPattern}
                onChange={(e) => setRegexPattern(e.target.value)}
                className="min-h-[50px] text-xs font-mono bg-muted/50"
                readOnly
              />
              <Button
                size="sm"
                variant="ghost"
                className="absolute top-1 right-1 h-6 text-[10px]"
                onClick={() => {
                  navigator.clipboard.writeText(regexPattern);
                }}
              >
                Copy
              </Button>
            </div>
            <p className="text-[10px] text-cyan-700 italic">
              ℹ️ Add this pattern using "regex" validation rule after saving the field
            </p>
          </div>
        )}

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
            placeholder="Additional information (e.g., 'Please include country code')"
            className="min-h-[60px] text-xs"
          />
        </div>

        {/* Default Value */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Default Value (Phone Number)
          </label>
          <Input
            type="tel"
            value={field.default_value ?? ''}
            onChange={(e) =>
              onFieldChange({ default_value: e.target.value || null })
            }
            placeholder="+1 (555) 123-4567"
            className="h-9"
          />
          <p className="text-[10px] text-muted-foreground">
            💡 Will be stored exactly as entered (no formatting applied)
          </p>
        </div>

        {/* Country Code Hint */}
        <div className="p-3 border rounded-md bg-muted/30">
          <p className="text-[10px] font-medium text-muted-foreground mb-1">
            🌍 Common Country Codes:
          </p>
          <div className="grid grid-cols-2 gap-1 text-[10px] text-muted-foreground">
            <span>• +1 (US/Canada)</span>
            <span>• +44 (UK)</span>
            <span>• +86 (China)</span>
            <span>• +91 (India)</span>
            <span>• +49 (Germany)</span>
            <span>• +33 (France)</span>
            <span>• +81 (Japan)</span>
            <span>• +61 (Australia)</span>
          </div>
          <p className="text-[10px] text-cyan-700 mt-2">
            💡 Use "startswith" rule to enforce specific country codes
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
            <span>• regex (format)</span>
            <span>• min/max (length)</span>
            <span>• unique</span>
            <span>• startswith</span>
            <span>• endswith</span>
            <span>• same</span>
            <span>• different</span>
          </div>
          <p className="text-[10px] text-cyan-700 mt-2 font-medium">
            ⚠️ Use regex rule for format validation, startswith for country codes
          </p>
          <p className="text-[10px] text-muted-foreground mt-1">
            💡 Configure validation rules in the Field Validation Rules section below
          </p>
        </div>
      </div>
    </Card>
  );
};

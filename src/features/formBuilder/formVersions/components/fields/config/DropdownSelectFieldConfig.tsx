// src/features/formVersion/components/fields/config/DropdownSelectFieldConfig.tsx

/**
 * Dropdown Select Field Configuration Component
 *
 * Provides UI for configuring a Dropdown Select field:
 * - Label (main question)
 * - Options (stored in placeholder as JSON array)
 * - Helper text
 * - Default value (one of the options)
 * - Visibility conditions
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Trash2, ChevronDown, Plus, X } from 'lucide-react';
import type { FieldConfigComponentProps } from '../fieldComponentRegistry';
import { useFormVersionBuilder } from '../../../hooks/useFormVersionBuilder';
import type { VisibilityCondition } from '../../shared/VisibilityConditionsBuilder';
import {
  VisibilityConditionsBuilder,
  parseVisibilityConditions,
  serializeVisibilityConditions,
} from '../../shared/VisibilityConditionsBuilder';

// ============================================================================
// Component
// ============================================================================

/**
 * DropdownSelectFieldConfig Component
 *
 * Configuration UI for Dropdown Select field type
 * Features:
 * - Dynamic options management (add/remove/update)
 * - Live dropdown preview for default selection
 * - JSON options storage in placeholder field
 * - Numbered option indicators
 * - Minimum 1 option validation
 */
export const DropdownSelectFieldConfig: React.FC<FieldConfigComponentProps> = ({
  field,
  fieldIndex,
  onFieldChange,
  onDelete,
}) => {
  console.debug('[DropdownSelectFieldConfig] Rendering for field:', field.id);
  const { stages } = useFormVersionBuilder();
  const [visibilityEditorOpen, setVisibilityEditorOpen] = useState(false);
  const [builderValue, setBuilderValue] = useState<VisibilityCondition>(null);

  useEffect(() => {
    const raw =
      field.visibility_conditions ?? field.visibility_condition ?? null;
    setBuilderValue(parseVisibilityConditions(raw));
  }, [field.visibility_conditions, field.visibility_condition]);

  // Parse options from placeholder (stored as JSON array)
  const getOptions = useCallback((): string[] => {
    try {
      if (!field.placeholder) return ['Option 1', 'Option 2', 'Option 3'];
      const parsed = JSON.parse(field.placeholder);
      return Array.isArray(parsed) && parsed.length > 0
        ? parsed
        : ['Option 1', 'Option 2', 'Option 3'];
    } catch {
      return ['Option 1', 'Option 2', 'Option 3'];
    }
  }, [field.placeholder]);

  const [options, setOptions] = useState<string[]>(getOptions());
  const [newOption, setNewOption] = useState('');

  // Sync options with field.placeholder changes
  useEffect(() => {
    setOptions(getOptions());
  }, [getOptions]);

  // Update placeholder field with options as JSON
  const updateOptions = useCallback(
    (newOptions: string[]) => {
      setOptions(newOptions);
      onFieldChange({ placeholder: JSON.stringify(newOptions) });
    },
    [onFieldChange],
  );

  const addOption = () => {
    if (newOption.trim()) {
      updateOptions([...options, newOption.trim()]);
      setNewOption('');
    }
  };

  const removeOption = (index: number) => {
    const newOptions = options.filter((_, i) => i !== index);
    if (newOptions.length > 0) {
      updateOptions(newOptions);
      // Clear default value if it was the removed option
      if (field.default_value === options[index]) {
        onFieldChange({ default_value: null });
      }
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    updateOptions(newOptions);
  };

  return (
    <>
      <Card className="p-4 border-l-4 border-l-sky-500">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <ChevronDown className="h-4 w-4 text-sky-500" />
              <Badge variant="outline" className="text-xs">
                Dropdown Select
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

          {/* Label (Main Question) */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Label (Question) <span className="text-destructive">*</span>
            </label>
            <Input
              value={field.label}
              onChange={(e) => onFieldChange({ label: e.target.value })}
              placeholder="e.g., Select your country"
              className="h-9"
              maxLength={255}
            />
          </div>

          {/* Options Management */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Options <span className="text-destructive">*</span>
            </label>

            {/* Existing Options */}
            <div className="space-y-2">
              {options.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-6 h-6 rounded bg-sky-100 text-sky-700 text-xs font-medium flex-shrink-0">
                    {index + 1}
                  </div>
                  <Input
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    className="h-9 flex-1"
                    placeholder={`Option ${index + 1}`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeOption(index)}
                    className="h-9 w-9 text-destructive"
                    disabled={options.length <= 1}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Add New Option */}
            <div className="flex items-center gap-2">
              <Input
                value={newOption}
                onChange={(e) => setNewOption(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addOption()}
                placeholder="Add new option..."
                className="h-9 flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addOption}
                className="h-9"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
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
              placeholder="Additional information (e.g., 'Choose one from the list')"
              className="min-h-[60px] text-xs"
            />
          </div>

          {/* Default Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Default Selection
            </label>
            <Select
              value={field.default_value ?? ''}
              onValueChange={(value) =>
                onFieldChange({ default_value: value || null })
              }
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="No default selection" />
              </SelectTrigger>
              <SelectContent>
                {/* Use a non-empty placeholder value like "none" instead of "" */}
                <SelectItem value="__none__">No default selection</SelectItem>
                {options.map((option, index) => (
                  <SelectItem key={index} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Visibility Conditions */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Visibility Conditions
            </label>
            <div className="flex items-center justify-between rounded border p-2">
              <div className="text-[11px] text-muted-foreground">
                {field.visibility_conditions
                  ? 'Conditions configured'
                  : 'No conditions'}
              </div>
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => setVisibilityEditorOpen(true)}
              >
                Edit Conditions
              </Button>
            </div>
          </div>
        </div>
      </Card>
      {visibilityEditorOpen && (
        <VisibilityConditionsBuilder
          value={builderValue}
          onChange={(condition) => {
            setBuilderValue(condition);
            const serialized = serializeVisibilityConditions(condition);
            onFieldChange({ visibility_conditions: serialized });
          }}
          stages={stages}
          excludeFieldId={field.id}
          open={visibilityEditorOpen}
          onClose={() => setVisibilityEditorOpen(false)}
        />
      )}
    </>
  );
};

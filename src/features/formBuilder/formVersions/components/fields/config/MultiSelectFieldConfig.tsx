// src/features/formVersion/components/fields/config/MultiSelectFieldConfig.tsx

/**
 * Multi-Select Field Configuration Component
 * 
 * Provides UI for configuring a Multi-Select field:
 * - Label (main question)
 * - Options (stored in placeholder as JSON array)
 * - Helper text
 * - Default values (JSON array of pre-selected options)
 * - Visibility conditions
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Trash2, CheckSquare, Plus, X } from 'lucide-react';
import type { FieldConfigComponentProps } from '../fieldComponentRegistry';

// ============================================================================
// Component
// ============================================================================

/**
 * MultiSelectFieldConfig Component
 * 
 * Configuration UI for Multi-Select field type
 * Features:
 * - Dynamic options management (add/remove/update)
 * - Live multi-checkbox preview for default selections
 * - JSON options storage in placeholder field
 * - JSON default values storage with auto-sync
 * - Numbered option indicators
 */
export const MultiSelectFieldConfig: React.FC<FieldConfigComponentProps> = ({
  field,
  fieldIndex,
  onFieldChange,
  onDelete,
}) => {
  console.debug('[MultiSelectFieldConfig] Rendering for field:', field.id);

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

  // Parse default selected values (stored as JSON array)
  const getDefaultSelected = useCallback((): string[] => {
    try {
      if (!field.default_value) return [];
      const parsed = JSON.parse(field.default_value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, [field.default_value]);

  const [options, setOptions] = useState<string[]>(getOptions());
  const [defaultSelected, setDefaultSelected] = useState<string[]>(getDefaultSelected());
  const [newOption, setNewOption] = useState('');

  // Sync options with field.placeholder changes
  useEffect(() => {
    setOptions(getOptions());
  }, [getOptions]);

  // Sync default selected with field.default_value changes
  useEffect(() => {
    setDefaultSelected(getDefaultSelected());
  }, [getDefaultSelected]);

  // Update placeholder field with options as JSON
  const updateOptions = useCallback((newOptions: string[]) => {
    setOptions(newOptions);
    onFieldChange({ placeholder: JSON.stringify(newOptions) });

    // Remove deleted options from default selected
    const validDefaults = defaultSelected.filter((val) =>
      newOptions.includes(val)
    );
    if (validDefaults.length !== defaultSelected.length) {
      setDefaultSelected(validDefaults);
      onFieldChange({
        default_value: validDefaults.length > 0 ? JSON.stringify(validDefaults) : null,
      });
    }
  }, [onFieldChange, defaultSelected]);

  // Update default selected values
  const updateDefaultSelected = useCallback((newSelected: string[]) => {
    setDefaultSelected(newSelected);
    onFieldChange({
      default_value: newSelected.length > 0 ? JSON.stringify(newSelected) : null,
    });
  }, [onFieldChange]);

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
    }
  };

  const updateOption = (index: number, value: string) => {
    const oldValue = options[index];
    const newOptions = [...options];
    newOptions[index] = value;
    updateOptions(newOptions);

    // Update default selected if the changed option was selected
    if (defaultSelected.includes(oldValue)) {
      const newSelected = defaultSelected.map((val) =>
        val === oldValue ? value : val
      );
      updateDefaultSelected(newSelected);
    }
  };

  const toggleDefaultSelection = (option: string) => {
    const newSelected = defaultSelected.includes(option)
      ? defaultSelected.filter((val) => val !== option)
      : [...defaultSelected, option];
    updateDefaultSelected(newSelected);
  };

  return (
    <Card className="p-4 border-l-4 border-l-indigo-500">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <CheckSquare className="h-4 w-4 text-indigo-500" />
            <Badge variant="outline" className="text-xs">
              Multi-Select
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
            placeholder="e.g., Select all skills that apply"
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
                <div className="flex items-center justify-center w-6 h-6 rounded bg-indigo-100 text-indigo-700 text-xs font-medium flex-shrink-0">
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
            placeholder="Additional information (e.g., 'Select all that apply')"
            className="min-h-[60px] text-xs"
          />
        </div>

        {/* Default Selections (Multiple) */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Default Selections (Multiple Allowed)
          </label>
          <div className="space-y-2 p-3 border rounded-md bg-muted/30 max-h-48 overflow-y-auto">
            {options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Checkbox
                  id={`default-multi-${index}`}
                  checked={defaultSelected.includes(option)}
                  onCheckedChange={() => toggleDefaultSelection(option)}
                />
                <Label
                  htmlFor={`default-multi-${index}`}
                  className="text-xs cursor-pointer flex-1"
                >
                  {option}
                </Label>
              </div>
            ))}
          </div>
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

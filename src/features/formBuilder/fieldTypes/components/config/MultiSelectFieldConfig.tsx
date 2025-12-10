// src/features/formVersion/components/fields/MultiSelectFieldConfig.tsx

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

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Trash2, CheckSquare, Plus, X, Info } from "lucide-react";
import type { Field } from "@/features/formBuilder/formVersions/types";

type MultiSelectFieldConfigProps = {
  field: Field;
  fieldIndex: number;
  onFieldChange: (updatedField: Partial<Field>) => void;
  onDelete: () => void;
};

export function MultiSelectFieldConfig({
  field,
  fieldIndex,
  onFieldChange,
  onDelete,
}: MultiSelectFieldConfigProps) {
  // Parse options from placeholder (stored as JSON array)
  const getOptions = (): string[] => {
    try {
      if (!field.placeholder) return ["Option 1", "Option 2", "Option 3"];
      const parsed = JSON.parse(field.placeholder);
      return Array.isArray(parsed) && parsed.length > 0
        ? parsed
        : ["Option 1", "Option 2", "Option 3"];
    } catch {
      return ["Option 1", "Option 2", "Option 3"];
    }
  };

  // Parse default selected values (stored as JSON array)
  const getDefaultSelected = (): string[] => {
    try {
      if (!field.default_value) return [];
      const parsed = JSON.parse(field.default_value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const [options, setOptions] = useState<string[]>(getOptions());
  const [defaultSelected, setDefaultSelected] = useState<string[]>(
    getDefaultSelected()
  );
  const [newOption, setNewOption] = useState("");

  // Update placeholder field with options as JSON
  const updateOptions = (newOptions: string[]) => {
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
  };

  // Update default selected values
  const updateDefaultSelected = (newSelected: string[]) => {
    setDefaultSelected(newSelected);
    onFieldChange({
      default_value: newSelected.length > 0 ? JSON.stringify(newSelected) : null,
    });
  };

  const addOption = () => {
    if (newOption.trim()) {
      updateOptions([...options, newOption.trim()]);
      setNewOption("");
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

        {/* Info Alert */}
        <Alert className="bg-indigo-50 border-indigo-200">
          <Info className="h-4 w-4 text-indigo-600" />
          <AlertDescription className="text-xs text-indigo-900">
            Multi-choice selection field. Users can select MULTIPLE options from
            predefined choices. Perfect for "select all that apply" scenarios like
            skills, interests, or features.
          </AlertDescription>
        </Alert>

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
              onKeyPress={(e) => e.key === "Enter" && addOption()}
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
          <p className="text-[10px] text-muted-foreground">
            💡 Options stored as JSON array. Minimum 1 option required. Users can
            select multiple.
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
          <p className="text-[10px] text-muted-foreground">
            💡 Pre-select multiple options. Selected: {defaultSelected.length} of{" "}
            {options.length}
          </p>
        </div>

        {/* Common Use Cases */}
        <div className="p-3 border rounded-md bg-muted/30">
          <p className="text-[10px] font-medium text-muted-foreground mb-2">
            ☑️ Common Use Cases:
          </p>
          <div className="space-y-1 text-[10px] text-muted-foreground">
            <div>
              • <strong>Skills:</strong> Programming languages, technical skills
            </div>
            <div>
              • <strong>Interests:</strong> Hobbies, topics of interest
            </div>
            <div>
              • <strong>Features:</strong> Product features, requirements
            </div>
            <div>
              • <strong>Tags/Categories:</strong> Multiple categorization
            </div>
            <div>
              • <strong>Preferences:</strong> Communication preferences, notifications
            </div>
          </div>
          <p className="text-[10px] text-indigo-700 mt-2">
            💡 <strong>Tip:</strong> Use for "Select all that apply" questions
          </p>
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
              • required (at least one)
            </span>
            <span className="text-[10px] text-muted-foreground">• min</span>
            <span className="text-[10px] text-muted-foreground">• max</span>
            <span className="text-[10px] text-muted-foreground">• in</span>
            <span className="text-[10px] text-muted-foreground">• notin</span>
          </div>
          <p className="text-[10px] text-indigo-700 mt-2 font-medium">
            ⚠️ Multiple selections allowed - stored as JSON array
          </p>
        </div>
      </div>
    </Card>
  );
}
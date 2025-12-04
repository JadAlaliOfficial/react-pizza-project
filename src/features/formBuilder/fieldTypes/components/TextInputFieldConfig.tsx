import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Plus } from "lucide-react";

export type ValidationRule = {
  id: string; // unique instance ID (client-side generated)
  inputRuleId: number; // backend InputRule ID
  name: string; // e.g., "required", "min", "max", "regex"
  ruleProps?: Record<string, any>; // e.g., { value: 10 } for min
};

export type AvailableRule = {
  id: number; // InputRule ID from backend
  name: string;
  description: string;
};

export type TextInputFieldConfigProps = {
  label: string;
  placeholder?: string;
  helperText?: string;
  defaultValue?: string;
  validationRules: ValidationRule[];
  availableRules: AvailableRule[];
  onLabelChange: (value: string) => void;
  onPlaceholderChange: (value: string) => void;
  onHelperTextChange: (value: string) => void;
  onDefaultValueChange: (value: string) => void;
  onAddRule: (ruleId: number) => void;
  onRemoveRule: (ruleId: string) => void;
  onUpdateRuleProps: (ruleId: string, props: Record<string, any>) => void;
};

export const TextInputFieldConfig: React.FC<TextInputFieldConfigProps> = ({
  label,
  placeholder,
  helperText,
  defaultValue,
  validationRules,
  availableRules,
  onLabelChange,
  onPlaceholderChange,
  onHelperTextChange,
  onDefaultValueChange,
  onAddRule,
  onRemoveRule,
  onUpdateRuleProps,
}) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Text Input Field Configuration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Properties Section */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Basic Properties
          </h4>

          <div className="space-y-2">
            <Label htmlFor="field-label">
              Label <span className="text-red-500">*</span>
            </Label>
            <Input
              id="field-label"
              value={label}
              onChange={(e) => onLabelChange(e.target.value)}
              placeholder="Enter field label"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="field-placeholder">Placeholder</Label>
            <Input
              id="field-placeholder"
              value={placeholder ?? ""}
              onChange={(e) => onPlaceholderChange(e.target.value)}
              placeholder="Enter placeholder text"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="field-helper">Helper Text</Label>
            <Textarea
              id="field-helper"
              value={helperText ?? ""}
              onChange={(e) => onHelperTextChange(e.target.value)}
              placeholder="Enter helper text to guide users"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="field-default">Default Value</Label>
            <Input
              id="field-default"
              value={defaultValue ?? ""}
              onChange={(e) => onDefaultValueChange(e.target.value)}
              placeholder="Enter default value"
            />
          </div>
        </div>

        {/* Validation Rules Section */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Validation Rules
          </h4>

          <div className="space-y-3">
            {validationRules.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">
                No validation rules added yet
              </p>
            ) : (
              validationRules.map((rule) => (
                <ValidationRuleEditor
                  key={rule.id}
                  rule={rule}
                  onRemove={() => onRemoveRule(rule.id)}
                  onUpdateProps={(props) => onUpdateRuleProps(rule.id, props)}
                />
              ))
            )}
          </div>

          <div className="flex gap-2">
            <select
              className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              onChange={(e) => {
                const ruleId = Number(e.target.value);
                if (ruleId) {
                  onAddRule(ruleId);
                  e.target.value = "";
                }
              }}
              defaultValue=""
            >
              <option value="" disabled>
                Select a validation rule to add...
              </option>
              {availableRules
                .filter(
                  (ar) =>
                    !validationRules.some((vr) => vr.inputRuleId === ar.id)
                )
                .map((ar) => (
                  <option key={ar.id} value={ar.id}>
                    {ar.name} - {ar.description}
                  </option>
                ))}
            </select>
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                const select = document.querySelector(
                  'select[defaultValue=""]'
                ) as HTMLSelectElement;
                if (select?.value) {
                  onAddRule(Number(select.value));
                  select.value = "";
                }
              }}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Validation Rule Editor Sub-Component
type ValidationRuleEditorProps = {
  rule: ValidationRule;
  onRemove: () => void;
  onUpdateProps: (props: Record<string, any>) => void;
};

const ValidationRuleEditor: React.FC<ValidationRuleEditorProps> = ({
  rule,
  onRemove,
  onUpdateProps,
}) => {
  const renderRuleConfig = () => {
    switch (rule.name.toLowerCase()) {
      case "required":
        return (
          <p className="text-sm text-muted-foreground">
            Field is required - users must provide a value
          </p>
        );

      case "min":
        return (
          <div className="flex items-center gap-2">
            <Label htmlFor={`min-${rule.id}`} className="text-sm whitespace-nowrap">
              Min length:
            </Label>
            <Input
              id={`min-${rule.id}`}
              type="number"
              min="0"
              className="w-24"
              value={rule.ruleProps?.value ?? ""}
              onChange={(e) =>
                onUpdateProps({ value: Number(e.target.value) })
              }
              placeholder="0"
            />
            <span className="text-xs text-muted-foreground">characters</span>
          </div>
        );

      case "max":
        return (
          <div className="flex items-center gap-2">
            <Label htmlFor={`max-${rule.id}`} className="text-sm whitespace-nowrap">
              Max length:
            </Label>
            <Input
              id={`max-${rule.id}`}
              type="number"
              min="1"
              className="w-24"
              value={rule.ruleProps?.value ?? ""}
              onChange={(e) =>
                onUpdateProps({ value: Number(e.target.value) })
              }
              placeholder="100"
            />
            <span className="text-xs text-muted-foreground">characters</span>
          </div>
        );

      case "regex":
        return (
          <div className="flex flex-col gap-2">
            <Label htmlFor={`regex-${rule.id}`} className="text-sm">
              Regex pattern:
            </Label>
            <Input
              id={`regex-${rule.id}`}
              value={rule.ruleProps?.pattern ?? ""}
              onChange={(e) => onUpdateProps({ pattern: e.target.value })}
              placeholder="/^[A-Z0-9]+$/i"
              className="font-mono text-xs"
            />
            <p className="text-xs text-muted-foreground">
              Example: /^[A-Z]+$/ for uppercase letters only
            </p>
          </div>
        );

      case "startswith":
        return (
          <div className="flex flex-col gap-2">
            <Label htmlFor={`startswith-${rule.id}`} className="text-sm">
              Allowed prefixes (comma-separated):
            </Label>
            <Input
              id={`startswith-${rule.id}`}
              value={rule.ruleProps?.values?.join(", ") ?? ""}
              onChange={(e) =>
                onUpdateProps({
                  values: e.target.value
                    .split(",")
                    .map((v) => v.trim())
                    .filter(Boolean),
                })
              }
              placeholder="Mr, Dr, Prof"
            />
          </div>
        );

      case "endswith":
        return (
          <div className="flex flex-col gap-2">
            <Label htmlFor={`endswith-${rule.id}`} className="text-sm">
              Allowed suffixes (comma-separated):
            </Label>
            <Input
              id={`endswith-${rule.id}`}
              value={rule.ruleProps?.values?.join(", ") ?? ""}
              onChange={(e) =>
                onUpdateProps({
                  values: e.target.value
                    .split(",")
                    .map((v) => v.trim())
                    .filter(Boolean),
                })
              }
              placeholder=".com, .org, .net"
            />
          </div>
        );

      case "alpha":
        return (
          <p className="text-sm text-muted-foreground">
            Only alphabetic characters (a-z, A-Z) are allowed
          </p>
        );

      case "alphanum":
        return (
          <p className="text-sm text-muted-foreground">
            Only alphanumeric characters (a-z, A-Z, 0-9) are allowed
          </p>
        );

      case "alphadash":
        return (
          <p className="text-sm text-muted-foreground">
            Only letters, numbers, dashes, and underscores are allowed
          </p>
        );

      case "unique":
        return (
          <p className="text-sm text-muted-foreground">
            Value must be unique across all form entries
          </p>
        );

      default:
        return (
          <p className="text-sm text-muted-foreground">
            No additional configuration required
          </p>
        );
    }
  };

  return (
    <div className="flex items-start gap-3 rounded-lg border bg-muted/30 p-3">
      <div className="flex-1">
        <p className="mb-2 text-sm font-medium capitalize">{rule.name}</p>
        {renderRuleConfig()}
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-destructive hover:bg-destructive/10"
        onClick={onRemove}
        title="Remove rule"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};

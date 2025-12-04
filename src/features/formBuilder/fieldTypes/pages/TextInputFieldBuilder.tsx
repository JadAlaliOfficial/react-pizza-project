"use client";

import * as React from "react";
import { useState } from "react";
import { TextInput } from "@/features/formBuilder/fieldTypes/components/TextInput";
import { TextInputFieldConfig, type ValidationRule, type AvailableRule } from "@/features/formBuilder/fieldTypes/components/TextInputFieldConfig";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

// Mock available rules - in production, fetch these from your backend API
const MOCK_AVAILABLE_RULES: AvailableRule[] = [
  { id: 1, name: "required", description: "Field is required" },
  { id: 2, name: "min", description: "Minimum length validation" },
  { id: 3, name: "max", description: "Maximum length validation" },
  { id: 4, name: "alpha", description: "Only alphabetic characters" },
  { id: 5, name: "alphanum", description: "Only alphanumeric characters" },
  { id: 6, name: "alphadash", description: "Letters, numbers, dashes, underscores" },
  { id: 7, name: "regex", description: "Custom regex pattern" },
  { id: 8, name: "startswith", description: "Must start with specific values" },
  { id: 9, name: "endswith", description: "Must end with specific values" },
  { id: 10, name: "unique", description: "Value must be unique" },
];

export const TextInputFieldBuilder: React.FC = () => {
  // Field configuration state
  const [label, setLabel] = useState("Full Name");
  const [placeholder, setPlaceholder] = useState("Enter your full name");
  const [helperText, setHelperText] = useState("Please provide your first and last name");
  const [defaultValue, setDefaultValue] = useState("");
  const [validationRules, setValidationRules] = useState<ValidationRule[]>([
    {
      id: "rule-1",
      inputRuleId: 1,
      name: "required",
    },
  ]);

  // Generate unique ID for new rules
  const generateRuleId = () => `rule-${Date.now()}-${Math.random()}`;

  // Check if field is required
  const isRequired = validationRules.some((rule) => rule.name.toLowerCase() === "required");

  // Handle adding a validation rule
  const handleAddRule = (ruleId: number) => {
    const rule = MOCK_AVAILABLE_RULES.find((r) => r.id === ruleId);
    if (!rule) return;

    const newRule: ValidationRule = {
      id: generateRuleId(),
      inputRuleId: ruleId,
      name: rule.name,
      ruleProps: {},
    };

    setValidationRules([...validationRules, newRule]);
  };

  // Handle removing a validation rule
  const handleRemoveRule = (ruleId: string) => {
    setValidationRules(validationRules.filter((rule) => rule.id !== ruleId));
  };

  // Handle updating rule props
  const handleUpdateRuleProps = (ruleId: string, props: Record<string, any>) => {
    setValidationRules(
      validationRules.map((rule) =>
        rule.id === ruleId ? { ...rule, ruleProps: { ...rule.ruleProps, ...props } } : rule
      )
    );
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Text Input Field Builder</h1>
        <p className="text-muted-foreground mt-2">
          Configure your text input field and see a live preview
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Configuration Panel */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Configuration</h2>
          <TextInputFieldConfig
            label={label}
            placeholder={placeholder}
            helperText={helperText}
            defaultValue={defaultValue}
            validationRules={validationRules}
            availableRules={MOCK_AVAILABLE_RULES}
            onLabelChange={setLabel}
            onPlaceholderChange={setPlaceholder}
            onHelperTextChange={setHelperText}
            onDefaultValueChange={setDefaultValue}
            onAddRule={handleAddRule}
            onRemoveRule={handleRemoveRule}
            onUpdateRuleProps={handleUpdateRuleProps}
          />
        </div>

        {/* Live Preview Panel */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Live Preview</h2>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">How it will look for end users</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/10 p-6">
                <TextInput
                  id="preview-input"
                  label={label || "Field Label"}
                  placeholder={placeholder}
                  helperText={helperText}
                  required={isRequired}
                />
              </div>

              <Separator />

              {/* Current Configuration Display */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold">Current Configuration</h3>
                <div className="rounded-lg bg-muted p-4 space-y-2 text-sm font-mono">
                  <div>
                    <span className="text-muted-foreground">Label:</span>{" "}
                    <span className="font-medium">{label || "(empty)"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Placeholder:</span>{" "}
                    <span className="font-medium">{placeholder || "(empty)"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Helper Text:</span>{" "}
                    <span className="font-medium">{helperText || "(empty)"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Default Value:</span>{" "}
                    <span className="font-medium">{defaultValue || "(empty)"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Required:</span>{" "}
                    <span className="font-medium">{isRequired ? "Yes" : "No"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Validation Rules:</span>{" "}
                    <span className="font-medium">
                      {validationRules.length > 0
                        ? validationRules.map((r) => r.name).join(", ")
                        : "None"}
                    </span>
                  </div>
                </div>
              </div>

              {/* JSON Output for Backend */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold">Backend Payload</h3>
                <pre className="rounded-lg bg-slate-950 text-slate-50 p-4 text-xs overflow-x-auto">
                  {JSON.stringify(
                    {
                      fieldtypeid: 1, // Text Input field type ID from backend
                      label: label,
                      placeholder: placeholder || null,
                      helpertext: helperText || null,
                      defaultvalue: defaultValue || null,
                      rules: validationRules.map((rule) => ({
                        inputruleid: rule.inputRuleId,
                        ruleprops: rule.ruleProps,
                      })),
                    },
                    null,
                    2
                  )}
                </pre>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

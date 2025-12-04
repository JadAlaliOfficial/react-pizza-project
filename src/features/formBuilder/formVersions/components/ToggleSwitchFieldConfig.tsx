// src/features/formVersion/components/fields/ToggleSwitchFieldConfig.tsx

/**
 * Toggle Switch Field Configuration Component
 *
 * Provides UI for configuring a Toggle Switch field:
 * - Label (main question)
 * - Default state (on/off)
 * - Custom labels (On/Off text)
 * - Helper text
 * - Visibility conditions
 */

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Trash2, ToggleLeft, Info } from "lucide-react";
import type { Field } from "@/features/formBuilder/formVersions/types";

type ToggleSwitchFieldConfigProps = {
  field: Field;
  fieldIndex: number;
  onFieldChange: (updatedField: Partial<Field>) => void;
  onDelete: () => void;
};

export function ToggleSwitchFieldConfig({
  field,
  fieldIndex,
  onFieldChange,
  onDelete,
}: ToggleSwitchFieldConfigProps) {
  const [defaultState, setDefaultState] = useState(field.default_value === "1");
  const [onLabel, setOnLabel] = useState("On");
  const [offLabel, setOffLabel] = useState("Off");

  return (
    <Card className="p-4 border-l-4 border-l-teal-500">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <ToggleLeft className="h-4 w-4 text-teal-500" />
            <Badge variant="outline" className="text-xs">
              Toggle Switch
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
            Binary toggle switch for on/off or yes/no choices. Values stored as
            "1" (on) or "0" (off). Visual switch with animated transition.
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
            placeholder="e.g., Enable notifications"
            className="h-9"
            maxLength={255}
          />
        </div>

        {/* Default State */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Default State
          </label>
          <div className="flex items-center gap-3 p-3 border rounded-md bg-muted/30">
            <Switch
              checked={defaultState}
              onCheckedChange={(checked) => {
                setDefaultState(checked);
                onFieldChange({ default_value: checked ? "1" : "0" });
              }}
            />
            <div className="flex-1">
              <p className="text-sm font-medium">
                {defaultState ? "Enabled (On)" : "Disabled (Off)"}
              </p>
              <p className="text-xs text-muted-foreground">
                Default toggle position when form loads
              </p>
            </div>
          </div>
        </div>

        {/* Custom Labels */}
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              "On" Label (Optional)
            </label>
            <Input
              value={onLabel}
              onChange={(e) => setOnLabel(e.target.value)}
              placeholder="On / Yes / Enabled"
              className="h-9"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              "Off" Label (Optional)
            </label>
            <Input
              value={offLabel}
              onChange={(e) => setOffLabel(e.target.value)}
              placeholder="Off / No / Disabled"
              className="h-9"
            />
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground">
          💡 Custom labels to display next to the toggle switch
        </p>

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
            placeholder="Additional information (e.g., 'Enable to receive email notifications')"
            className="min-h-[60px] text-xs"
          />
        </div>

        {/* Toggle Switch Details */}
        <div className="p-3 border rounded-md bg-muted/30">
          <p className="text-[10px] font-medium text-muted-foreground mb-2">
            🔘 Toggle Switch Details:
          </p>
          <div className="space-y-1 text-[10px] text-muted-foreground">
            <div>
              • <strong>Storage:</strong> String "1" (on) or "0" (off)
            </div>
            <div>
              • <strong>Interface:</strong> Visual pill-shaped switch
            </div>
            <div>
              • <strong>Animation:</strong> Smooth transition on toggle
            </div>
            <div>
              • <strong>States:</strong> Green (on), Gray (off)
            </div>
          </div>
        </div>

        {/* Common Use Cases */}
        <div className="p-3 border rounded-md bg-muted/30">
          <p className="text-[10px] font-medium text-muted-foreground mb-2">
            🔘 Common Use Cases:
          </p>
          <div className="space-y-1 text-[10px] text-muted-foreground">
            <div>
              • <strong>Settings:</strong> Enable/disable features
            </div>
            <div>
              • <strong>Preferences:</strong> Notification settings, privacy
            </div>
            <div>
              • <strong>Consent:</strong> Terms acceptance, data usage
            </div>
            <div>
              • <strong>Status:</strong> Active/inactive, public/private
            </div>
            <div>
              • <strong>Options:</strong> Opt-in/opt-out choices
            </div>
          </div>
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
              • required
            </span>
            <span className="text-[10px] text-muted-foreground">
              • accepted
            </span>
            <span className="text-[10px] text-muted-foreground">
              • in (values)
            </span>
            <span className="text-[10px] text-muted-foreground">
              • notin (values)
            </span>
          </div>
          <p className="text-[10px] text-teal-700 mt-2 font-medium">
            💡 Use "accepted" rule for consent fields (must be "on"). Use
            "required" to force selection.
          </p>
        </div>

        {/* Example Validation Configuration */}
        <Alert className="bg-amber-50 border-amber-200">
          <Info className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-xs text-amber-900">
            <strong>Example Validation:</strong> For consent checkboxes, add
            "accepted" rule (no props needed) to require the toggle to be "on".
            Use "required" rule to ensure a choice is made.
          </AlertDescription>
        </Alert>
      </div>
    </Card>
  );
}

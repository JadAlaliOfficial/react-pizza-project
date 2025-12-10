// src/features/formVersion/components/preview/ToggleSwitchPreview.tsx

/**
 * Toggle Switch Preview Component
 *
 * Displays a preview of how the Toggle Switch field will appear in the form
 * Shows interactive toggle switch with on/off states
 */

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ToggleLeft } from "lucide-react";
import type { Field } from "@/features/formBuilder/formVersions/types";

type ToggleSwitchPreviewProps = {
  field: Field;
};

export function ToggleSwitchPreview({ field }: ToggleSwitchPreviewProps) {
  const defaultState = field.default_value === "1";
  const [isOn, setIsOn] = useState(defaultState);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <ToggleLeft className="h-3 w-3 text-teal-500" />
        <Label className="text-sm font-medium">
          {field.label}
          {/* You can add a required indicator based on field rules */}
        </Label>
        <Badge variant="secondary" className="text-[10px]">
          Toggle Switch
        </Badge>
      </div>

      {/* Toggle Switch Component */}
      <div className="flex items-center gap-3 p-4 border rounded-lg bg-muted/30">
        <Switch
          checked={isOn}
          onCheckedChange={setIsOn}
          disabled
          className="data-[state=checked]:bg-teal-500"
        />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              {isOn ? "Enabled" : "Disabled"}
            </span>
            <Badge
              variant={isOn ? "default" : "secondary"}
              className={`text-xs ${
                isOn
                  ? "bg-teal-500 hover:bg-teal-600"
                  : "bg-gray-300 text-gray-700"
              }`}
            >
              {isOn ? "ON" : "OFF"}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {isOn ? "Feature is enabled" : "Feature is disabled"}
          </p>
        </div>
      </div>

      {/* Alternative Layout - Inline */}
      <div className="flex items-center justify-between p-3 border rounded-lg">
        <div>
          <p className="text-sm font-medium">{field.label}</p>
          {field.helper_text && (
            <p className="text-xs text-muted-foreground">{field.helper_text}</p>
          )}
        </div>
        <Switch
          checked={isOn}
          onCheckedChange={setIsOn}
          disabled
          className="data-[state=checked]:bg-teal-500"
        />
      </div>

      <p className="text-[10px] text-teal-600 italic">
        🔘 Toggle switch with smooth animation. Values stored as "1" (on) or
        "0" (off). Filter by enabled or disabled state.
      </p>
    </div>
  );
}
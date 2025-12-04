// src/features/formVersion/components/fields/SignaturePadFieldConfig.tsx

/**
 * Signature Pad Field Configuration Component
 *
 * Provides UI for configuring a Signature Pad field:
 * - Label (main question)
 * - Canvas width/height
 * - Pen color
 * - Background color
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
import { Trash2, PenTool, Info } from "lucide-react";
import type { Field } from "@/features/formBuilder/formVersions/types";

type SignaturePadFieldConfigProps = {
  field: Field;
  fieldIndex: number;
  onFieldChange: (updatedField: Partial<Field>) => void;
  onDelete: () => void;
};

export function SignaturePadFieldConfig({
  field,
  fieldIndex,
  onFieldChange,
  onDelete,
}: SignaturePadFieldConfigProps) {
  const [canvasWidth, setCanvasWidth] = useState("500");
  const [canvasHeight, setCanvasHeight] = useState("200");
  const [penColor, setPenColor] = useState("#000000");

  return (
    <Card className="p-4 border-l-4 border-l-blue-500">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <PenTool className="h-4 w-4 text-blue-500" />
            <Badge variant="outline" className="text-xs">
              Signature Pad
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
        <Alert className="bg-blue-50 border-blue-200">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-xs text-blue-900">
            Canvas-based signature capture. Stored as base64 image or canvas
            data. Touch and mouse-friendly drawing interface with clear/reset
            functionality.
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
            placeholder="e.g., Please sign below"
            className="h-9"
            maxLength={255}
          />
        </div>

        {/* Canvas Dimensions */}
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Canvas Width (px)
            </label>
            <Input
              type="number"
              value={canvasWidth}
              onChange={(e) => setCanvasWidth(e.target.value)}
              placeholder="500"
              className="h-9"
              min="200"
              max="1000"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Canvas Height (px)
            </label>
            <Input
              type="number"
              value={canvasHeight}
              onChange={(e) => setCanvasHeight(e.target.value)}
              placeholder="200"
              className="h-9"
              min="100"
              max="500"
            />
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground">
          💡 Canvas will be responsive and adapt to screen size
        </p>

        {/* Pen Color */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Pen Color
          </label>
          <div className="flex items-center gap-2">
            <Input
              type="color"
              value={penColor}
              onChange={(e) => setPenColor(e.target.value)}
              className="h-9 w-20 cursor-pointer"
            />
            <Input
              type="text"
              value={penColor}
              onChange={(e) => setPenColor(e.target.value)}
              placeholder="#000000"
              className="h-9 flex-1 font-mono text-xs"
            />
          </div>
          <p className="text-[10px] text-muted-foreground">
            💡 Standard signature color is black (#000000)
          </p>
        </div>

        {/* Canvas Preview */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Canvas Preview
          </label>
          <div
            className="border-2 border-dashed border-blue-300 rounded-md bg-white flex items-center justify-center"
            style={{
              width: "100%",
              height: "150px",
            }}
          >
            <div className="text-center text-muted-foreground">
              <PenTool className="h-8 w-8 mx-auto mb-2 text-blue-400" />
              <p className="text-xs">Signature canvas area</p>
              <p className="text-[10px]">
                {canvasWidth}px × {canvasHeight}px
              </p>
            </div>
          </div>
        </div>

        {/* Placeholder */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Placeholder Text
          </label>
          <Input
            value={field.placeholder ?? ""}
            onChange={(e) =>
              onFieldChange({ placeholder: e.target.value || null })
            }
            placeholder="e.g., Sign here"
            className="h-9"
            maxLength={255}
          />
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
            placeholder="Additional information (e.g., 'Draw your signature using your mouse or touchscreen')"
            className="min-h-[60px] text-xs"
          />
        </div>

        {/* Signature Pad Details */}
        <div className="p-3 border rounded-md bg-muted/30">
          <p className="text-[10px] font-medium text-muted-foreground mb-2">
            ✍️ Signature Pad Details:
          </p>
          <div className="space-y-1 text-[10px] text-muted-foreground">
            <div>
              • <strong>Storage:</strong> Base64 encoded image or canvas data
            </div>
            <div>
              • <strong>Interface:</strong> HTML5 Canvas with touch/mouse
              support
            </div>
            <div>
              • <strong>Features:</strong> Clear button, smooth drawing, undo
            </div>
            <div>
              • <strong>Export:</strong> PNG image format for download
            </div>
          </div>
        </div>

        {/* Common Use Cases */}
        <div className="p-3 border rounded-md bg-muted/30">
          <p className="text-[10px] font-medium text-muted-foreground mb-2">
            ✍️ Common Use Cases:
          </p>
          <div className="space-y-1 text-[10px] text-muted-foreground">
            <div>
              • <strong>Legal:</strong> Contracts, agreements, waivers
            </div>
            <div>
              • <strong>Consent:</strong> Forms, authorizations, approvals
            </div>
            <div>
              • <strong>Confirmation:</strong> Receipts, attendance, delivery
            </div>
            <div>
              • <strong>Acknowledgment:</strong> Terms, policies, releases
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
          <div className="grid grid-cols-1 gap-1">
            <span className="text-[10px] text-muted-foreground">
              • required (signature must be provided)
            </span>
          </div>
          <p className="text-[10px] text-blue-700 mt-2 font-medium">
            💡 Use "required" rule to enforce signature capture. Signature data
            stored as base64 or canvas JSON.
          </p>
        </div>

        {/* Example Validation Configuration */}
        <Alert className="bg-amber-50 border-amber-200">
          <Info className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-xs text-amber-900">
            <strong>Example Validation:</strong> Add "required" rule (no props
            needed) to ensure a signature is captured before form submission.
            Signature cleared = no value.
          </AlertDescription>
        </Alert>
      </div>
    </Card>
  );
}

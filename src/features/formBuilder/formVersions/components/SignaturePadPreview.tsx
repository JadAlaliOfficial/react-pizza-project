// src/features/formVersion/components/preview/SignaturePadPreview.tsx

/**
 * Signature Pad Preview Component
 *
 * Displays a preview of how the Signature Pad field will appear in the form
 * Shows canvas area with drawing interface and action buttons
 */

import { useState, useRef, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PenTool, RotateCcw, Download } from "lucide-react";
import type { Field } from "@/features/formBuilder/formVersions/types";

type SignaturePadPreviewProps = {
  field: Field;
};

export function SignaturePadPreview({ field }: SignaturePadPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isSigned, setIsSigned] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Configure drawing style
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, []);

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setIsSigned(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <PenTool className="h-3 w-3 text-blue-500" />
        <Label className="text-sm font-medium">
          {field.label}
          {/* You can add a required indicator based on field rules */}
        </Label>
        <Badge variant="secondary" className="text-[10px]">
          Signature
        </Badge>
      </div>

      {/* Canvas Area */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          className="w-full h-48 border-2 border-blue-200 rounded-lg bg-white cursor-crosshair"
          style={{ touchAction: "none" }}
        />
        {!isSigned && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center text-muted-foreground/50">
              <PenTool className="h-12 w-12 mx-auto mb-2" />
              <p className="text-sm font-medium">
                {field.placeholder || "Sign here"}
              </p>
              <p className="text-xs">Draw your signature using mouse or touch</p>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleClear}
          disabled
          className="flex items-center gap-2"
        >
          <RotateCcw className="h-3 w-3" />
          Clear
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled
          className="flex items-center gap-2"
        >
          <Download className="h-3 w-3" />
          Download
        </Button>
        {isSigned && (
          <Badge variant="default" className="ml-auto bg-green-500">
            Signed ✓
          </Badge>
        )}
      </div>

      {/* Signature Info */}
      <div className="p-3 border border-blue-200 rounded-md bg-blue-50/50">
        <div className="space-y-1 text-xs text-muted-foreground">
          <div className="flex items-center justify-between">
            <span>
              <strong>Status:</strong> {isSigned ? "Signed" : "Unsigned"}
            </span>
            <Badge
              variant="outline"
              className={`text-xs ${
                isSigned
                  ? "bg-green-100 text-green-700 border-green-300"
                  : "bg-gray-100 text-gray-700 border-gray-300"
              }`}
            >
              {isSigned ? "Complete" : "Pending"}
            </Badge>
          </div>
          <div>
            <strong>Format:</strong> Base64 PNG Image
          </div>
          <div>
            <strong>Features:</strong> Touch-friendly, smooth drawing, clear
            button
          </div>
        </div>
      </div>

      {field.helper_text && (
        <p className="text-xs text-muted-foreground">{field.helper_text}</p>
      )}

      <p className="text-[10px] text-blue-600 italic">
        ✍️ Canvas-based signature capture. Stored as base64 image. Filter by
        signed/unsigned status.
      </p>
    </div>
  );
}

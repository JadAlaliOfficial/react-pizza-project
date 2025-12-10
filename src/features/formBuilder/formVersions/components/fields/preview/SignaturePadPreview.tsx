// src/features/formVersion/components/fields/preview/SignaturePadPreview.tsx

/**
 * Signature Pad Preview Component
 *
 * Displays a preview of how the Signature Pad field will appear in the form
 * Shows canvas area with drawing interface and action buttons
 */

import React, { useState, useRef, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PenTool, RotateCcw, Download } from 'lucide-react';
import type { FieldPreviewComponentProps } from '../fieldComponentRegistry';

// ============================================================================
// Component
// ============================================================================

/**
 * SignaturePadPreview Component
 *
 * Preview component for Signature Pad field type
 * Features:
 * - Label with signature badge
 * - Canvas preview with placeholder overlay
 * - Clear/download buttons (disabled in preview)
 * - Status and storage format info
 */
export const SignaturePadPreview: React.FC<FieldPreviewComponentProps> = ({
  field,
}) => {
  console.debug('[SignaturePadPreview] Rendering for field:', field.id);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isSigned, setIsSigned] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setIsSigned(false);
  };

  const hasRules = field.rules && field.rules.length > 0;
  const isRequired = field.rules?.some(
    (rule) => rule.input_rule_id !== null && rule.input_rule_id !== undefined
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <PenTool className="h-3.5 w-3.5 text-blue-500" />
        <Label className="text-sm font-medium flex-1">
          {field.label}
          {isRequired && <span className="text-destructive ml-1">*</span>}
        </Label>
        <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
          Signature
        </Badge>
        {hasRules && (
          <span className="text-[10px] text-muted-foreground font-normal">
            ({field.rules.length} rule{field.rules.length !== 1 ? 's' : ''})
          </span>
        )}
      </div>

      {/* Canvas Area */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          className="w-full h-48 border-2 border-blue-200 rounded-lg bg-white cursor-crosshair"
          style={{ touchAction: 'none' }}
        />
        {!isSigned && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center text-muted-foreground/50">
              <PenTool className="h-12 w-12 mx-auto mb-2" />
              <p className="text-sm font-medium">
                {field.placeholder || 'Sign here'}
              </p>
              <p className="text-xs">
                Draw your signature using mouse or touch
              </p>
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
              <strong>Status:</strong> {isSigned ? 'Signed' : 'Unsigned'}
            </span>
            <Badge
              variant="outline"
              className={`text-xs ${
                isSigned
                  ? 'bg-green-100 text-green-700 border-green-300'
                  : 'bg-gray-100 text-gray-700 border-gray-300'
              }`}
            >
              {isSigned ? 'Complete' : 'Pending'}
            </Badge>
          </div>
          <div>
            <strong>Format:</strong> Base64 PNG image
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
        ✍️ Canvas-based signature capture stored as base64 image; can be used to
        distinguish signed vs unsigned submissions.
      </p>
    </div>
  );
};

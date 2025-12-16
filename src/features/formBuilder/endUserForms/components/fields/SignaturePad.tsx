/**
 * ================================
 * SIGNATURE PAD COMPONENT
 * ================================
 * Production-ready Signature Pad field component with:
 * - Dynamic configuration from API field data
 * - Zod validation based on field rules
 * - Canvas-based drawing with mouse/touch support
 * - Clear and download functionality
 * - Base64 PNG export
 * - ForwardRef support for parent scrolling
 */

import React, { useEffect, useState, useRef, forwardRef } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PenTool, RotateCcw, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SignaturePadProps, Point } from './types/signaturePadField.types';
import {
  isSignatureEmpty,
} from './validation/signaturePadValidation';

/**
 * SignaturePad Component
 * 
 * Renders a signature pad with canvas drawing
 * Integrates with form systems via onChange callback
 * Supports forwardRef for scrolling to errors
 * 
 * @example
 * ```
 * <SignaturePad
 *   ref={signatureRef}
 *   field={fieldData}
 *   value={signatureValue}
 *   onChange={(newValue) => setValue(newValue)}
 *   error={errors.signature?.message}
 * />
 * ```
 */
export const SignaturePad = forwardRef<HTMLDivElement, SignaturePadProps>(
  ({ field, value, onChange, error, disabled = false, className }, ref) => {
    console.debug('[SignaturePad] Rendering for field:', field.field_id);

    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [isDrawing, setIsDrawing] = useState<boolean>(false);
    const [isSigned, setIsSigned] = useState<boolean>(false);
    const [lastPoint, setLastPoint] = useState<Point | null>(null);

    // Check if field is required
    const isRequired = field.rules?.some((rule) => rule.rule_name === 'required') ?? false;

    /**
     * Initialize canvas
     */
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Set canvas size to match display size
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;

      // Set drawing style
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Load existing signature if available
      if (value && !isSignatureEmpty(value)) {
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          setIsSigned(true);
        };
        img.src = value;
      }
    }, []);

    /**
     * Get point coordinates relative to canvas
     */
    const getPoint = (e: MouseEvent | TouchEvent): Point => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };

      const rect = canvas.getBoundingClientRect();
      
      if (e instanceof MouseEvent) {
        return {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        };
      } else {
        const touch = e.touches[0];
        return {
          x: touch.clientX - rect.left,
          y: touch.clientY - rect.top,
        };
      }
    };

    /**
     * Start drawing
     */
    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
      if (disabled) return;

      e.preventDefault();
      setIsDrawing(true);
      
      const point = getPoint(e.nativeEvent as MouseEvent | TouchEvent);
      setLastPoint(point);
    };

    /**
     * Draw on canvas
     */
    const draw = (e: React.MouseEvent | React.TouchEvent) => {
      if (!isDrawing || disabled) return;

      e.preventDefault();

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx || !lastPoint) return;

      const currentPoint = getPoint(e.nativeEvent as MouseEvent | TouchEvent);

      // Draw line from last point to current point
      ctx.beginPath();
      ctx.moveTo(lastPoint.x, lastPoint.y);
      ctx.lineTo(currentPoint.x, currentPoint.y);
      ctx.stroke();

      setLastPoint(currentPoint);
      setIsSigned(true);
    };

    /**
     * Stop drawing and save signature
     */
    const stopDrawing = () => {
      if (!isDrawing) return;

      setIsDrawing(false);
      setLastPoint(null);

      // Save signature as base64 PNG
      const canvas = canvasRef.current;
      if (canvas && isSigned) {
        const dataUrl = canvas.toDataURL('image/png');
        onChange(dataUrl);

        console.debug('[SignaturePad] Signature saved:', {
          fieldId: field.field_id,
          dataLength: dataUrl.length,
        });
      }
    };

    /**
     * Clear signature
     */
    const handleClear = () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setIsSigned(false);
      onChange('');

      console.debug('[SignaturePad] Signature cleared:', {
        fieldId: field.field_id,
      });
    };

    /**
     * Download signature
     */
    const handleDownload = () => {
      const canvas = canvasRef.current;
      if (!canvas || !isSigned) return;

      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `signature-${field.field_id}.png`;
      link.href = dataUrl;
      link.click();
    };

    // Get placeholder
    const placeholder = field.placeholder || 'Sign here';

    return (
      <div ref={ref} className={cn('space-y-3', className)}>
        {/* Field Label with Icon */}
        <div className="flex items-center gap-2">
          <PenTool className="h-4 w-4 text-blue-500" />
          <Label className="text-sm font-medium">
            {field.label}
            {isRequired && <span className="text-destructive ml-1">*</span>}
          </Label>
        </div>

        {/* Canvas Area */}
        <div className="relative">
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className={cn(
              'w-full h-48 border-2 rounded-lg bg-white',
              disabled ? 'cursor-not-allowed' : 'cursor-crosshair',
              error ? 'border-destructive' : 'border-blue-200'
            )}
            style={{ touchAction: 'none' }}
            aria-label={field.label}
            aria-required={isRequired}
            aria-invalid={!!error}
          />
          {!isSigned && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center text-muted-foreground/50">
                <PenTool className="h-12 w-12 mx-auto mb-2" />
                <p className="text-sm font-medium">{placeholder}</p>
                <p className="text-xs">Draw your signature using mouse or touch</p>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClear}
            disabled={disabled || !isSigned}
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-3 w-3" />
            Clear
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDownload}
            disabled={disabled || !isSigned}
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

        {/* Helper Text */}
        {field.helper_text && !error && (
          <p className="text-xs text-muted-foreground">{field.helper_text}</p>
        )}

        {/* Error Message */}
        {error && (
          <p className="text-xs text-destructive font-medium" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

SignaturePad.displayName = 'SignaturePad';

export default SignaturePad;

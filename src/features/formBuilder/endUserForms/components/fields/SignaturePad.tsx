/**
 * ================================
 * SIGNATURE PAD COMPONENT
 * ================================
 *
 * Production-ready Signature Pad field component.
 *
 * Responsibilities:
 * - Render signature pad canvas
 * - Capture signature as image
 * - Emit base64 string via onChange callback
 * - Display validation errors from parent
 * - Apply disabled state
 * - Support accessibility
 *
 * Architecture Decisions:
 * - Dumb component - no validation/visibility/business logic
 * - Props match RuntimeFieldProps contract
 * - No debug logs
 * - No RTL logic (handled by parent)
 * - ForwardRef for error scrolling
 * - Local state for controlled input behavior
 */

import React, { useEffect, useState, useRef, forwardRef } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PenTool, RotateCcw, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SignaturePadProps, Point } from './types/signaturePadField.types';
import { isSignatureEmpty } from './validation/signaturePadValidation';

// ================================
// LOCALIZATION
// ================================

const getLocalizedSignatureConfig = (languageId?: number) => {
  if (languageId === 2) {
    // Arabic
    return {
      placeholder: 'وقّع هنا',
      helperText: 'ارسم توقيعك باستخدام الماوس أو اللمس',
      clearLabel: 'مسح',
      downloadLabel: 'تنزيل',
      signedBadge: 'تم التوقيع ✓',
      ariaSuffix: ' - حقل توقيع',
    };
  }

  if (languageId === 3) {
    // Spanish
    return {
      placeholder: 'Firme aquí',
      helperText: 'Dibuja tu firma usando el mouse o la pantalla táctil',
      clearLabel: 'Borrar',
      downloadLabel: 'Descargar',
      signedBadge: 'Firmado ✓',
      ariaSuffix: ' - campo de firma',
    };
  }

  // English (default)
  return {
    placeholder: 'Sign here',
    helperText: 'Draw your signature using mouse or touch',
    clearLabel: 'Clear',
    downloadLabel: 'Download',
    signedBadge: 'Signed ✓',
    ariaSuffix: ' - signature field',
  };
};

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
  ({ field, value, onChange, onBlur, error, disabled = false, className, languageId }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [isDrawing, setIsDrawing] = useState<boolean>(false);
    const [isSigned, setIsSigned] = useState<boolean>(false);
    const [lastPoint, setLastPoint] = useState<Point | null>(null);

    const isRequired =
      field.rules?.some((rule) => rule.rule_name === 'required') ?? false;

    const {
      placeholder: localizedPlaceholder,
      helperText,
      clearLabel,
      downloadLabel,
      signedBadge,
      ariaSuffix,
    } = getLocalizedSignatureConfig(languageId);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;

      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (value && !isSignatureEmpty(value)) {
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          setIsSigned(true);
        };
        img.src = value;
      }
    }, []);

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

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
      if (disabled) return;

      e.preventDefault();
      setIsDrawing(true);

      const point = getPoint(e.nativeEvent as MouseEvent | TouchEvent);
      setLastPoint(point);
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
      if (!isDrawing || disabled) return;

      e.preventDefault();

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx || !lastPoint) return;

      const currentPoint = getPoint(e.nativeEvent as MouseEvent | TouchEvent);

      ctx.beginPath();
      ctx.moveTo(lastPoint.x, lastPoint.y);
      ctx.lineTo(currentPoint.x, currentPoint.y);
      ctx.stroke();

      setLastPoint(currentPoint);
      setIsSigned(true);
    };

    const stopDrawing = () => {
      if (!isDrawing) return;

      setIsDrawing(false);
      setLastPoint(null);

      const canvas = canvasRef.current;
      if (canvas && isSigned) {
        const dataUrl = canvas.toDataURL('image/png');
        onChange(dataUrl);
        onBlur?.();
      }
    };

    const handleClear = () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setIsSigned(false);
      onChange('');
      onBlur?.();
    };

    const handleDownload = () => {
      const canvas = canvasRef.current;
      if (!canvas || !isSigned) return;

      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `signature-${field.field_id}.png`;
      link.href = dataUrl;
      link.click();
    };

    const placeholder = field.placeholder || localizedPlaceholder;

    return (
      <div
        ref={ref}
        className={cn('space-y-3', className)}
        aria-label={`${field.label}${ariaSuffix}`}
      >
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
              error ? 'border-destructive' : 'border-blue-200',
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
                <p className="text-xs">{helperText}</p>
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
            {clearLabel}
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
            {downloadLabel}
          </Button>
          {isSigned && (
            <Badge variant="default" className="ml-auto bg-green-500">
              {signedBadge}
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
  },
);

SignaturePad.displayName = 'SignaturePad';

export default SignaturePad;

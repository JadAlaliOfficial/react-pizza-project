/**
 * ================================
 * IMAGE UPLOAD COMPONENT
 * ================================
 *
 * Production-ready Image Upload field component.
 *
 * Responsibilities:
 * - Render image upload area with drag-and-drop support
 * - Display image preview with dimensions
 * - Emit File object changes via onChange callback
 * - Display validation errors from parent
 * - Apply file type, size, and dimension constraints from field rules
 * - Apply disabled state
 * - Support accessibility
 *
 * Architecture Decisions:
 * - Dumb component - no validation/visibility/business logic
 * - Props match RuntimeFieldProps contract
 * - No debug logs
 * - No RTL logic (handled by parent)
 * - ForwardRef for error scrolling
 * - Local state for drag/drop UI, preview URL, and dimensions
 * - Automatic cleanup of preview URLs on unmount
 */

import React, { useEffect, useState, useRef, forwardRef } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Image as ImageIcon, Upload, X, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ImageUploadProps } from './types/imageUploadField.types';
import {
  getAcceptedMimeTypes,
  formatFileSize,
  getFileSizeInKB,
  getImageDimensions,
  getReadableDimensions,
} from './validation/imageUploadValidation';

// ================================
// LOCALIZATION
// ================================

const getLocalizedImageUploadConfig = (languageId?: number) => {
  if (languageId === 2) {
    // Arabic
    return {
      mainText: 'اسحب وأفلت الصورة هنا، أو ',
      browseText: 'تصفح',
      maxPrefix: 'الحد الأقصى: ',
      removeButton: 'إزالة الصورة',
      ariaSuffix: ' - حقل رفع الصورة',
    };
  }

  if (languageId === 3) {
    // Spanish
    return {
      mainText: 'Arrastra y suelta la imagen aquí, o ',
      browseText: 'explorar',
      maxPrefix: 'Máx.: ',
      removeButton: 'Eliminar imagen',
      ariaSuffix: ' - campo de carga de imágenes',
    };
  }

  // English (default)
  return {
    mainText: 'Drag and drop image here, or ',
    browseText: 'browse',
    maxPrefix: 'Max: ',
    removeButton: 'Remove Image',
    ariaSuffix: ' - image upload field',
  };
};

// ================================
// COMPONENT
// ================================

/**
 * ImageUpload Component
 *
 * Renders an image upload area with drag-and-drop, preview, and validation.
 * Integrates with form systems via onChange callback.
 * Supports forwardRef for scrolling to errors.
 *
 * @example
 * ```
 * <ImageUpload
 *   ref={imageRef}
 *   field={fieldData}
 *   value={imageValue}
 *   onChange={(newImage) => setValue(newImage)}
 *   error={errors.image?.message}
 * />
 * ```
 */
export const ImageUpload = forwardRef<HTMLDivElement, ImageUploadProps>(
  ({ field, value, onChange, error, disabled = false, className, languageId }, ref) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(
      value || null,
    );
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [imageDimensions, setImageDimensions] = useState<{
      width: number;
      height: number;
    } | null>(null);

    const isRequired =
      field.rules?.some((rule) => rule.rule_name === 'required') ?? false;

    const acceptedTypes = getAcceptedMimeTypes(field.rules || []);

    const maxSizeRule = field.rules?.find(
      (rule) => rule.rule_name === 'max_file_size',
    );
    const maxSize = (maxSizeRule?.rule_props as { maxsize?: number })?.maxsize;

    const dimensionsRule = field.rules?.find(
      (rule) => rule.rule_name === 'dimensions',
    );
    const dimensionReqs = dimensionsRule?.rule_props as any;

    const {
      mainText,
      browseText,
      maxPrefix,
      removeButton,
      ariaSuffix,
    } = getLocalizedImageUploadConfig(languageId);

    useEffect(() => {
      if (value instanceof File) {
        setSelectedFile(value);
        createPreview(value);
      } else if (value === null) {
        setSelectedFile(null);
        setPreviewUrl(null);
        setImageDimensions(null);
      }
    }, [value]);

    const createPreview = async (file: File) => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      const url = URL.createObjectURL(file);
      setPreviewUrl(url);

      try {
        const dims = await getImageDimensions(file);
        setImageDimensions(dims);
      } catch {
        setImageDimensions(null);
      }
    };

    const handleFileSelect = (file: File) => {
      setSelectedFile(file);
      onChange(file);
      createPreview(file);
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFileSelect(file);
      }
    };

    const handleDragEnter = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled) {
        setIsDragging(true);
      }
    };

    const handleDragLeave = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
    };

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (disabled) return;

      const file = e.dataTransfer.files?.[0];
      if (file && file.type.startsWith('image/')) {
        handleFileSelect(file);
      }
    };

    const handleRemoveImage = () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setSelectedFile(null);
      setPreviewUrl(null);
      setImageDimensions(null);
      onChange(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };

    const handleBrowseClick = () => {
      fileInputRef.current?.click();
    };

    useEffect(() => {
      return () => {
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
        }
      };
    }, [previewUrl]);

    const imageUploadId = `image-upload-${field.field_id}`;

    return (
      <div ref={ref} className={cn('space-y-3', className)}>
        <div className="flex items-center gap-2">
          <ImageIcon className="h-4 w-4 text-pink-500" />
          <Label htmlFor={imageUploadId} className="text-sm font-medium">
            {field.label}
            {isRequired && <span className="text-destructive ml-1">*</span>}
          </Label>
        </div>

        <div
          className={cn(
            'border-2 border-dashed rounded-lg transition-colors overflow-hidden',
            isDragging
              ? 'border-pink-500 bg-pink-50'
              : error
                ? 'border-destructive bg-destructive/5'
                : 'border-pink-300 bg-pink-50/30',
            disabled && 'opacity-50 cursor-not-allowed',
          )}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="aspect-video bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center relative">
            {previewUrl ? (
              <>
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-full object-contain"
                />
                {selectedFile && (
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs flex items-center gap-2">
                    <CheckCircle className="h-3 w-3" />
                    {imageDimensions && (
                      <span>
                        {imageDimensions.width} × {imageDimensions.height}
                      </span>
                    )}
                  </div>
                )}
              </>
            ) : (
              <ImageIcon className="h-20 w-20 text-pink-300" />
            )}
          </div>

          <div className="p-4 text-center border-t border-pink-200">
            <div className="flex flex-col items-center gap-2">
              <Upload className="h-6 w-6 text-pink-400" />
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  {mainText}
                  <button
                    type="button"
                    onClick={handleBrowseClick}
                    disabled={disabled}
                    className="text-pink-600 hover:text-pink-700 font-medium underline"
                  >
                    {browseText}
                  </button>
                </p>
                <p className="text-xs text-muted-foreground">
                  {maxSize && `${maxPrefix}${formatFileSize(maxSize)}`}
                  {dimensionReqs &&
                    ` • ${getReadableDimensions(dimensionReqs)}`}
                </p>
              </div>
              {selectedFile && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveImage}
                  disabled={disabled}
                  className="mt-2"
                >
                  <X className="h-4 w-4 mr-1" />
                  {removeButton}
                </Button>
              )}
            </div>
          </div>

          <input
            ref={fileInputRef}
            id={imageUploadId}
            type="file"
            accept={acceptedTypes}
            onChange={handleFileInputChange}
            disabled={disabled}
            className="hidden"
            aria-label={`${field.label}${ariaSuffix}`}
            aria-required={isRequired}
            aria-invalid={!!error}
          />
        </div>

        {selectedFile && (
          <div className="text-xs text-muted-foreground">
            <span className="font-medium">{selectedFile.name}</span> •{' '}
            {formatFileSize(getFileSizeInKB(selectedFile))}
          </div>
        )}

        {field.helper_text && !error && (
          <p className="text-xs text-muted-foreground">{field.helper_text}</p>
        )}

        {error && (
          <p className="text-xs text-destructive font-medium" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  },
);

ImageUpload.displayName = 'ImageUpload';

export default ImageUpload;

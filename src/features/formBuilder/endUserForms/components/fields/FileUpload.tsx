/**
 * ================================
 * FILE UPLOAD COMPONENT
 * ================================
 *
 * Production-ready File Upload field component.
 *
 * Responsibilities:
 * - Render file upload area with drag-and-drop support
 * - Emit File object changes via onChange callback
 * - Display validation errors from parent
 * - Apply file type and size constraints from field rules
 * - Apply disabled state
 * - Support accessibility
 *
 * Architecture Decisions:
 * - Dumb component - no validation/visibility/business logic
 * - Props match RuntimeFieldProps contract
 * - No debug logs
 * - No RTL logic (handled by parent)
 * - ForwardRef for error scrolling
 * - Local state for drag/drop UI and file preview
 */

import React, { useEffect, useState, useRef, forwardRef } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Upload, X, CheckCircle, File as FileIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FileUploadProps } from './types/fileUploadField.types';
import {
  getAcceptedMimeTypes,
  getReadableFileTypes,
  formatFileSize,
  getFileSizeInKB,
} from './validation/fileUploadValidation';

// ================================
// LOCALIZATION
// ================================

const getLocalizedFileUploadConfig = (languageId?: number) => {
  if (languageId === 2) {
    // Arabic
    return {
      mainText: 'اسحب وأفلت الملف هنا، أو ',
      browseText: 'تصفح',
      acceptedPrefix: 'الأنواع المسموح بها: ',
      maxPrefix: 'الحد الأقصى: ',
      ariaSuffix: ' - حقل رفع الملف',
    };
  }

  if (languageId === 3) {
    // Spanish
    return {
      mainText: 'Arrastra y suelta el archivo aquí, o ',
      browseText: 'explorar',
      acceptedPrefix: 'Aceptados: ',
      maxPrefix: 'Máx.: ',
      ariaSuffix: ' - campo de carga de archivos',
    };
  }

  // English (default)
  return {
    mainText: 'Drag and drop file here, or ',
    browseText: 'browse',
    acceptedPrefix: 'Accepted: ',
    maxPrefix: 'Max: ',
    ariaSuffix: ' - file upload field',
  };
};

// ================================
// COMPONENT
// ================================

/**
 * FileUpload Component
 *
 * Renders a file upload area with drag-and-drop and file validation.
 * Integrates with form systems via onChange callback.
 * Supports forwardRef for scrolling to errors.
 *
 * @example
 * ```
 * <FileUpload
 *   ref={fileRef}
 *   field={fieldData}
 *   value={fileValue}
 *   onChange={(newFile) => setValue(newFile)}
 *   error={errors.file?.message}
 * />
 * ```
 */
export const FileUpload = forwardRef<HTMLDivElement, FileUploadProps>(
  ({ field, value, onChange, error, disabled = false, className, languageId, onBlur }, ref) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(
      value || null,
    );

    const isRequired =
      field.rules?.some((rule) => rule.rule_name === 'required') ?? false;

    const acceptedTypes = getAcceptedMimeTypes(field.rules || []);

    const mimeTypesRule = field.rules?.find(
      (rule) => rule.rule_name === 'mimetypes',
    );
    const mimeTypes =
      (mimeTypesRule?.rule_props as { types?: string[] })?.types || [];
    const readableTypes =
      mimeTypes.length > 0 ? getReadableFileTypes(mimeTypes) : 'All files';

    const maxSizeRule = field.rules?.find(
      (rule) => rule.rule_name === 'max_file_size',
    );
    const maxSize = (maxSizeRule?.rule_props as { maxsize?: number })?.maxsize;

    const {
      mainText,
      browseText,
      acceptedPrefix,
      maxPrefix,
      ariaSuffix,
    } = getLocalizedFileUploadConfig(languageId);

    useEffect(() => {
      if (value instanceof File) {
        setSelectedFile(value);
      } else if (value === null) {
        setSelectedFile(null);
      }
    }, [value]);

    const handleFileSelect = (file: File) => {
      setSelectedFile(file);
      onChange(file);
      if (onBlur) {
        onBlur();
      }
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
      if (file) {
        handleFileSelect(file);
      }
    };

    const handleRemoveFile = () => {
      setSelectedFile(null);
      onChange(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      if (onBlur) {
        onBlur();
      }
    };

    const handleBrowseClick = () => {
      fileInputRef.current?.click();
    };

    const fileUploadId = `file-upload-${field.field_id}`;

    return (
      <div ref={ref} className={cn('space-y-3', className)}>
        <div className="flex items-center gap-2">
          <Upload className="h-4 w-4 text-violet-500" />
          <Label htmlFor={fileUploadId} className="text-sm font-medium">
            {field.label}
            {isRequired && <span className="text-destructive ml-1">*</span>}
          </Label>
        </div>

        {!selectedFile ? (
          <div
            className={cn(
              'border-2 border-dashed rounded-lg p-8 transition-colors text-center',
              isDragging
                ? 'border-violet-500 bg-violet-50'
                : error
                  ? 'border-destructive bg-destructive/5'
                  : 'border-violet-300 bg-violet-50/30',
              disabled && 'opacity-50 cursor-not-allowed',
            )}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center justify-center gap-3">
              <Upload className="h-10 w-10 text-violet-400" />
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  {mainText}
                  <button
                    type="button"
                    onClick={handleBrowseClick}
                    disabled={disabled}
                    className="text-violet-600 hover:text-violet-700 font-medium underline"
                  >
                    {browseText}
                  </button>
                </p>
                <p className="text-xs text-muted-foreground">
                  {acceptedPrefix}
                  {readableTypes}
                  {maxSize && ` • ${maxPrefix}${formatFileSize(maxSize)}`}
                </p>
              </div>
            </div>

            <input
              ref={fileInputRef}
              id={fileUploadId}
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
        ) : (
          <div className="border-2 border-green-300 bg-green-50/30 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
              <FileIcon className="h-5 w-5 text-green-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-green-900 truncate">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-green-700">
                  {formatFileSize(getFileSizeInKB(selectedFile))} •{' '}
                  {selectedFile.type || 'Unknown type'}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemoveFile}
                disabled={disabled}
                className="flex-shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
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

FileUpload.displayName = 'FileUpload';

export default FileUpload;

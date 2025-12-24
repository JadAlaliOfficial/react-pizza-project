/**
 * ================================
 * DOCUMENT UPLOAD COMPONENT
 * ================================
 *
 * Production-ready Document Upload field component.
 *
 * Responsibilities:
 * - Render document upload area with drag-and-drop support
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
import {
  FileText,
  Upload,
  File as FileIcon,
  FileSpreadsheet,
  FileImage,
  X,
  CheckCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DocumentUploadProps } from './types/documentUploadField.types';
import {
  getAcceptedMimeTypes,
  getReadableFileTypes,
  formatFileSize,
  getFileSizeInKB,
} from './validation/documentUploadValidation';

// ================================
// LOCALIZATION
// ================================

const getLocalizedDocumentUploadConfig = (languageId?: number) => {
  if (languageId === 2) {
    // Arabic
    return {
      pdfLabel: 'PDF',
      wordLabel: 'وورد',
      excelLabel: 'إكسل',
      pptLabel: 'عرض',
      mainText: 'اسحب وأسقط المستند هنا، أو ',
      browseText: 'تصفح',
      acceptedPrefix: 'الأنواع المسموح بها: ',
      maxPrefix: 'الحد الأقصى: ',
      ariaSuffix: ' - حقل رفع المستند',
    };
  }

  if (languageId === 3) {
    // Spanish
    return {
      pdfLabel: 'PDF',
      wordLabel: 'Word',
      excelLabel: 'Excel',
      pptLabel: 'PPT',
      mainText: 'Arrastra y suelta el documento aquí, o ',
      browseText: 'explorar',
      acceptedPrefix: 'Aceptados: ',
      maxPrefix: 'Máx.: ',
      ariaSuffix: ' - campo de carga de documentos',
    };
  }

  // English (default)
  return {
    pdfLabel: 'PDF',
    wordLabel: 'Word',
    excelLabel: 'Excel',
    pptLabel: 'PPT',
    mainText: 'Drag and drop document here, or ',
    browseText: 'browse',
    acceptedPrefix: 'Accepted: ',
    maxPrefix: 'Max: ',
    ariaSuffix: ' - document upload field',
  };
};

// ================================
// COMPONENT
// ================================

/**
 * DocumentUpload Component
 *
 * Renders a document upload area with drag-and-drop and file validation.
 * Integrates with form systems via onChange callback.
 * Supports forwardRef for scrolling to errors.
 *
 * @example
 * ```
 * <DocumentUpload
 *   ref={docRef}
 *   field={fieldData}
 *   value={fileValue}
 *   onChange={(newFile) => setValue(newFile)}
 *   error={errors.document?.message}
 * />
 * ```
 */
export const DocumentUpload = forwardRef<HTMLDivElement, DocumentUploadProps>(
  (
    { field, value, onChange, error, disabled = false, className, languageId },
    ref,
  ) => {
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
      pdfLabel,
      wordLabel,
      excelLabel,
      pptLabel,
      mainText,
      browseText,
      acceptedPrefix,
      maxPrefix,
      ariaSuffix,
    } = getLocalizedDocumentUploadConfig(languageId);

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
    };

    const handleBrowseClick = () => {
      fileInputRef.current?.click();
    };

    const documentUploadId = `document-upload-${field.field_id}`;

    return (
      <div ref={ref} className={cn('space-y-3', className)}>
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-orange-500" />
          <Label htmlFor={documentUploadId} className="text-sm font-medium">
            {field.label}
            {isRequired && <span className="text-destructive ml-1">*</span>}
          </Label>
        </div>

        {!selectedFile ? (
          <div
            className={cn(
              'border-2 border-dashed rounded-lg transition-colors',
              isDragging
                ? 'border-orange-500 bg-orange-50'
                : error
                  ? 'border-destructive bg-destructive/5'
                  : 'border-orange-300 bg-orange-50/30',
              disabled && 'opacity-50 cursor-not-allowed',
            )}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="p-6 flex items-center justify-center gap-4 border-b border-orange-200">
              <div className="text-center">
                <div className="w-12 h-16 bg-red-100 rounded border-2 border-red-300 flex items-center justify-center mb-1">
                  <FileText className="h-6 w-6 text-red-600" />
                </div>
                <span className="text-[10px] text-muted-foreground font-medium">
                  {pdfLabel}
                </span>
              </div>
              <div className="text-center">
                <div className="w-12 h-16 bg-blue-100 rounded border-2 border-blue-300 flex items-center justify-center mb-1">
                  <FileIcon className="h-6 w-6 text-blue-600" />
                </div>
                <span className="text-[10px] text-muted-foreground font-medium">
                  {wordLabel}
                </span>
              </div>
              <div className="text-center">
                <div className="w-12 h-16 bg-green-100 rounded border-2 border-green-300 flex items-center justify-center mb-1">
                  <FileSpreadsheet className="h-6 w-6 text-green-600" />
                </div>
                <span className="text-[10px] text-muted-foreground font-medium">
                  {excelLabel}
                </span>
              </div>
              <div className="text-center">
                <div className="w-12 h-16 bg-orange-100 rounded border-2 border-orange-300 flex items-center justify-center mb-1">
                  <FileImage className="h-6 w-6 text-orange-600" />
                </div>
                <span className="text-[10px] text-muted-foreground font-medium">
                  {pptLabel}
                </span>
              </div>
            </div>

            <div className="p-6 text-center">
              <div className="flex flex-col items-center gap-3">
                <Upload className="h-8 w-8 text-orange-400" />
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    {mainText}
                    <button
                      type="button"
                      onClick={handleBrowseClick}
                      disabled={disabled}
                      className="text-orange-600 hover:text-orange-700 font-medium underline"
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
            </div>

            <input
              ref={fileInputRef}
              id={documentUploadId}
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
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-green-900 truncate">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-green-700">
                  {formatFileSize(getFileSizeInKB(selectedFile))}
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

DocumentUpload.displayName = 'DocumentUpload';

export default DocumentUpload;

/**
 * ================================
 * FILE UPLOAD COMPONENT
 * ================================
 * Production-ready File Upload field component with:
 * - Dynamic configuration from API field data
 * - Zod validation based on field rules
 * - Drag and drop support
 * - File type validation (MIME types with wildcard support)
 * - File size validation (min/max)
 * - Preview of selected file
 * - ForwardRef support for parent scrolling
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

/**
 * FileUpload Component
 * 
 * Renders a file upload area with drag-and-drop and file validation
 * Integrates with form systems via onChange callback
 * Supports forwardRef for scrolling to errors
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
  ({ field, value, onChange, error, disabled = false, className }, ref) => {
    console.debug('[FileUpload] Rendering for field:', field.field_id);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(value || null);

    // Check if field is required
    const isRequired = field.rules?.some((rule) => rule.rule_name === 'required') ?? false;

    // Get accepted MIME types
    const acceptedTypes = getAcceptedMimeTypes(field.rules || []);
    
    // Get MIME types for display
    const mimeTypesRule = field.rules?.find((rule) => rule.rule_name === 'mimetypes');
    const mimeTypes = (mimeTypesRule?.rule_props as { types?: string[] })?.types || [];
    const readableTypes = mimeTypes.length > 0 ? getReadableFileTypes(mimeTypes) : 'All files';

    // Get file size limits
    const maxSizeRule = field.rules?.find((rule) => rule.rule_name === 'max_file_size');
    const maxSize = (maxSizeRule?.rule_props as { maxsize?: number })?.maxsize;

    // Update local file when external value changes
    useEffect(() => {
      if (value instanceof File) {
        setSelectedFile(value);
      } else if (value === null) {
        setSelectedFile(null);
      }
    }, [value]);

    /**
     * Handle file selection
     */
    const handleFileSelect = (file: File) => {
      setSelectedFile(file);
      onChange(file);

      console.debug('[FileUpload] File selected:', {
        fieldId: field.field_id,
        fileName: file.name,
        fileSize: getFileSizeInKB(file),
        fileType: file.type,
      });
    };

    /**
     * Handle file input change
     */
    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFileSelect(file);
      }
    };

    /**
     * Handle drag events
     */
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

    /**
     * Handle remove file
     */
    const handleRemoveFile = () => {
      setSelectedFile(null);
      onChange(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };

    /**
     * Trigger file input click
     */
    const handleBrowseClick = () => {
      fileInputRef.current?.click();
    };

    // Generate unique ID for accessibility
    const fileUploadId = `file-upload-${field.field_id}`;

    return (
      <div ref={ref} className={cn('space-y-3', className)}>
        {/* Field Label with Icon */}
        <div className="flex items-center gap-2">
          <Upload className="h-4 w-4 text-violet-500" />
          <Label htmlFor={fileUploadId} className="text-sm font-medium">
            {field.label}
            {isRequired && <span className="text-destructive ml-1">*</span>}
          </Label>
        </div>

        {/* Upload Area */}
        {!selectedFile ? (
          <div
            className={cn(
              'border-2 border-dashed rounded-lg p-8 transition-colors text-center',
              isDragging
                ? 'border-violet-500 bg-violet-50'
                : error
                ? 'border-destructive bg-destructive/5'
                : 'border-violet-300 bg-violet-50/30',
              disabled && 'opacity-50 cursor-not-allowed'
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
                  Drag and drop file here, or{' '}
                  <button
                    type="button"
                    onClick={handleBrowseClick}
                    disabled={disabled}
                    className="text-violet-600 hover:text-violet-700 font-medium underline"
                  >
                    browse
                  </button>
                </p>
                <p className="text-xs text-muted-foreground">
                  Accepted: {readableTypes}
                  {maxSize && ` • Max: ${formatFileSize(maxSize)}`}
                </p>
              </div>
            </div>

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              id={fileUploadId}
              type="file"
              accept={acceptedTypes}
              onChange={handleFileInputChange}
              disabled={disabled}
              className="hidden"
              aria-label={field.label}
              aria-required={isRequired}
              aria-invalid={!!error}
            />
          </div>
        ) : (
          /* Selected File Preview */
          <div className="border-2 border-green-300 bg-green-50/30 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
              <FileIcon className="h-5 w-5 text-green-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-green-900 truncate">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-green-700">
                  {formatFileSize(getFileSizeInKB(selectedFile))} • {selectedFile.type || 'Unknown type'}
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

FileUpload.displayName = 'FileUpload';

export default FileUpload;

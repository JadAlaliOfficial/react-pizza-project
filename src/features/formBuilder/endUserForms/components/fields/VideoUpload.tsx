/**
 * ================================
 * VIDEO UPLOAD COMPONENT
 * ================================
 *
 * Production-ready Video Upload field component.
 *
 * Responsibilities:
 * - Render video upload area
 * - Emit file via onChange callback
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
import {
  Video as VideoIcon,
  Upload,
  Play,
  Trash2,
  FileVideo,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type {
  VideoUploadProps,
  VideoMetadata,
} from './types/videoUploadField.types';
import {
  getAcceptedFileTypes,
  getMaxFileSizeDisplay,
  formatFileSize,
} from './validation/videoUploadValidation';

// ================================
// LOCALIZATION
// ================================

const getLocalizedVideoUploadConfig = (languageId?: number) => {
  if (languageId === 2) {
    // Arabic
    return {
      dragPrompt: 'اسحب وأسقط الفيديو هنا، أو انقر للاختيار',
      dropPrompt: 'إسقاط الفيديو هنا',
      removeTitle: 'إزالة الفيديو',
      previewLabel: 'معاينة الفيديو',
      ariaSuffix: ' - حقل رفع الفيديو',
    };
  }

  if (languageId === 3) {
    // Spanish
    return {
      dragPrompt: 'Arrastra y suelta el video aquí o haz clic para buscar',
      dropPrompt: 'Suelta el video aquí',
      removeTitle: 'Eliminar video',
      previewLabel: 'Vista previa del video',
      ariaSuffix: ' - campo de carga de video',
    };
  }

  // English (default)
  return {
    dragPrompt: 'Drag and drop video here, or click to browse',
    dropPrompt: 'Drop video here',
    removeTitle: 'Remove video',
    previewLabel: 'Video Preview',
    ariaSuffix: ' - video upload field',
  };
};

/**
 * VideoUpload Component
 *
 * Renders a video upload field with preview
 * Integrates with form systems via onChange callback
 * Supports forwardRef for scrolling to errors
 *
 * @example
 * ```
 * <VideoUpload
 *   ref={videoRef}
 *   field={fieldData}
 *   value={videoFile}
 *   onChange={(newFile) => setValue(newFile)}
 *   error={errors.video?.message}
 * />
 * ```
 */
export const VideoUpload = forwardRef<HTMLDivElement, VideoUploadProps>(
  (
    { field, value, onChange, error, disabled = false, className, languageId },
    ref,
  ) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    const [videoMetadata, setVideoMetadata] = useState<VideoMetadata | null>(
      null,
    );
    const [isDragging, setIsDragging] = useState<boolean>(false);

    const isRequired =
      field.rules?.some((rule) => rule.rule_name === 'required') ?? false;

    const acceptedTypes = getAcceptedFileTypes(field);
    const maxSizeDisplay = getMaxFileSizeDisplay(field);

    const { dragPrompt, dropPrompt, removeTitle, previewLabel, ariaSuffix } =
      getLocalizedVideoUploadConfig(languageId);

    useEffect(() => {
      if (value && value instanceof File) {
        const videoUrl = URL.createObjectURL(value);

        setVideoMetadata({
          name: value.name,
          size: value.size,
          type: value.type,
          url: videoUrl,
        });

        return () => URL.revokeObjectURL(videoUrl);
      } else {
        setVideoMetadata(null);
      }
    }, [value]);

    const handleFileChange = (file: File | null) => {
      onChange(file);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] || null;
      handleFileChange(file);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled) {
        setIsDragging(true);
      }
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (disabled) return;

      const file = e.dataTransfer.files?.[0];
      if (file && file.type.startsWith('video/')) {
        handleFileChange(file);
      }
    };

    const handleClick = () => {
      if (!disabled) {
        fileInputRef.current?.click();
      }
    };

    const handleRemove = (e: React.MouseEvent) => {
      e.stopPropagation();
      handleFileChange(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };

    const videoUploadId = `video-upload-${field.field_id}`;

    return (
      <div
        ref={ref}
        className={cn('space-y-2', className)}
        aria-label={`${field.label}${ariaSuffix}`}
      >
        {/* Field Label with Icon */}
        <div className="flex items-center justify-between">
          <Label
            htmlFor={videoUploadId}
            className="text-sm font-medium flex items-center gap-2"
          >
            <VideoIcon className="h-4 w-4 text-purple-500" />
            {field.label}
            {isRequired && <span className="text-destructive ml-1">*</span>}
          </Label>

          {/* Max Size Display */}
          {maxSizeDisplay && (
            <span className="text-xs text-muted-foreground">
              Max: {maxSizeDisplay}
            </span>
          )}
        </div>

        {/* Upload Area */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
          className={cn(
            'border-2 border-dashed rounded-md transition-colors cursor-pointer',
            isDragging && 'border-purple-500 bg-purple-50',
            !isDragging &&
              !error &&
              'border-purple-300 bg-purple-50/30 hover:bg-purple-50/50',
            error && 'border-destructive bg-destructive/5',
            disabled && 'opacity-60 cursor-not-allowed',
          )}
        >
          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            id={videoUploadId}
            type="file"
            accept={acceptedTypes}
            onChange={handleInputChange}
            disabled={disabled}
            className="hidden"
            aria-label={field.label}
            aria-required={isRequired}
            aria-invalid={!!error}
            aria-describedby={
              error
                ? `${videoUploadId}-error`
                : field.helper_text
                  ? `${videoUploadId}-description`
                  : undefined
            }
          />

          {/* Video Preview or Upload Prompt */}
          {videoMetadata ? (
            <>
              {/* Video Player */}
              <div className="aspect-video bg-gradient-to-br from-purple-900 to-indigo-900 rounded-t-md relative overflow-hidden">
                <video
                  ref={videoRef}
                  src={videoMetadata.url}
                  className="w-full h-full object-contain"
                  controls
                >
                  Your browser does not support the video tag.
                </video>
              </div>

              {/* Video Info */}
              <div className="p-4 border-t border-purple-200 bg-white rounded-b-md">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <FileVideo className="h-5 w-5 text-purple-500 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {videoMetadata.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(videoMetadata.size)}
                      </p>
                    </div>
                  </div>

                  {!disabled && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleRemove}
                      className="shrink-0 h-8 w-8 p-0"
                      title={removeTitle}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Video Player Placeholder */}
              <div className="aspect-video bg-gradient-to-br from-purple-900 to-indigo-900 rounded-t-md flex items-center justify-center relative">
                <div className="text-center">
                  <Play className="h-16 w-16 text-white/40 mx-auto mb-2" />
                  <p className="text-white/60 text-sm font-medium">
                    {previewLabel}
                  </p>
                </div>
                {/* Fake Video Controls */}
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-2 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <Play className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1 h-1 bg-white/20 rounded-full">
                    <div className="w-0 h-full bg-purple-400 rounded-full" />
                  </div>
                  <span className="text-white text-xs">0:00 / 0:00</span>
                </div>
              </div>

              {/* Upload Prompt */}
              <div className="p-4 text-center border-t border-purple-200">
                <div className="flex flex-col items-center gap-2">
                  <Upload className="h-6 w-6 text-purple-400" />
                  <p className="text-sm text-muted-foreground">
                    {isDragging ? dropPrompt : dragPrompt}
                  </p>
                  {maxSizeDisplay && (
                    <p className="text-xs text-muted-foreground/70">
                      Maximum file size: {maxSizeDisplay}
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Helper Text */}
        {field.helper_text && !error && (
          <p
            id={`${videoUploadId}-description`}
            className="text-xs text-muted-foreground"
          >
            {field.helper_text}
          </p>
        )}

        {/* Error Message */}
        {error && (
          <p
            id={`${videoUploadId}-error`}
            className="text-xs text-destructive font-medium"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    );
  },
);

VideoUpload.displayName = 'VideoUpload';

export default VideoUpload;

// src/features/formVersion/components/fields/preview/UrlInputPreview.tsx

/**
 * URL Input Preview Component
 *
 * Displays a preview of how the URL Input field will appear in the form
 * Shows URL input with link icon and validation indicator
 */

import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Link as LinkIcon, ExternalLink, CheckCircle } from 'lucide-react';
import type { FieldPreviewComponentProps } from '../fieldComponentRegistry';

// ============================================================================
// Component
// ============================================================================

/**
 * UrlInputPreview Component
 *
 * Preview component for URL Input field type
 * Features:
 * - Label with link icon
 * - Disabled URL input with placeholder and default value
 * - Optional required and rules indicator
 * - Open-link button placeholder
 */
export const UrlInputPreview: React.FC<FieldPreviewComponentProps> = ({
  field,
}) => {
  console.debug('[UrlInputPreview] Rendering for field:', field.id);

  const isRequired = field.rules?.some(
    (rule) => rule.input_rule_id !== null && rule.input_rule_id !== undefined
  );

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <LinkIcon className="h-3.5 w-3.5 text-cyan-500" />
        <Label className="text-sm font-medium flex-1">
          {field.label}
          {isRequired && <span className="text-destructive ml-1">*</span>}
        </Label>
      </div>

      {/* URL Input with Link Icon */}
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2">
          <LinkIcon className="h-4 w-4 text-cyan-500" />
        </div>
        <Input
          type="url"
          placeholder={field.placeholder || 'https://example.com'}
          defaultValue={field.default_value || ''}
          disabled
          className="pl-9 pr-20 h-10 bg-white"
        />
        {/* Validation Check Icon (visual only) */}
        <div className="absolute right-12 top-1/2 -translate-y-1/2">
          <CheckCircle className="h-4 w-4 text-green-500 opacity-50" />
        </div>
        {/* Open Link Button (disabled placeholder) */}
        <Button
          size="sm"
          variant="ghost"
          className="absolute right-1 top-1/2 -translate-y-1/2 h-8 px-2"
          disabled
        >
          <ExternalLink className="h-3 w-3" />
        </Button>
      </div>

      {field.helper_text && (
        <p className="text-xs text-muted-foreground">{field.helper_text}</p>
      )}
    </div>
  );
};

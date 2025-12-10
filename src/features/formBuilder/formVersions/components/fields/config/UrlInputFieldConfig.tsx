// src/features/formVersion/components/fields/config/UrlInputFieldConfig.tsx

/**
 * URL Input Field Configuration Component
 *
 * Provides UI for configuring a URL Input field:
 * - Label (main question)
 * - Placeholder (e.g., https://example.com)
 * - Default value
 * - Helper text
 * - Visibility conditions
 */

import React from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Trash2, Link as LinkIcon, Info } from 'lucide-react';
import type { FieldConfigComponentProps } from '../fieldComponentRegistry';

// ============================================================================
// Component
// ============================================================================

/**
 * UrlInputFieldConfig Component
 *
 * Configuration UI for URL Input field type
 * Features:
 * - Label, placeholder, helper text
 * - Default URL value
 * - Visibility conditions (JSON)
 * - URL-specific validation hints
 */
export const UrlInputFieldConfig: React.FC<FieldConfigComponentProps> = ({
  field,
  fieldIndex,
  onFieldChange,
  onDelete,
}) => {
  console.debug('[UrlInputFieldConfig] Rendering for field:', field.id);

  return (
    <Card className="p-4 border-l-4 border-l-cyan-500">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <LinkIcon className="h-4 w-4 text-cyan-500" />
            <Badge variant="outline" className="text-xs">
              URL Input
            </Badge>
            <span className="text-xs text-muted-foreground">
              Field {fieldIndex + 1}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            type="button"
            onClick={onDelete}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Info Alert */}
        <Alert className="bg-cyan-50 border-cyan-200">
          <Info className="h-4 w-4 text-cyan-600" />
          <AlertDescription className="text-xs text-cyan-900">
            URL input field for links such as websites, portfolios, or resources. Supports URL format validation and optional HTTPS enforcement.
          </AlertDescription>
        </Alert>

        {/* Label */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Label <span className="text-destructive">*</span>
          </label>
          <Input
            value={field.label}
            onChange={(e) => onFieldChange({ label: e.target.value })}
            placeholder="e.g., Website URL"
            className="h-9"
            maxLength={255}
          />
        </div>

        {/* Placeholder */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Placeholder
          </label>
          <Input
            value={field.placeholder ?? ''}
            onChange={(e) =>
              onFieldChange({ placeholder: e.target.value || null })
            }
            placeholder="e.g., https://example.com"
            className="h-9"
            maxLength={255}
          />
        </div>

        {/* Default Value */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Default Value
          </label>
          <Input
            value={field.default_value ?? ''}
            onChange={(e) =>
              onFieldChange({ default_value: e.target.value || null })
            }
            placeholder="e.g., https://yourcompany.com"
            className="h-9"
          />
        </div>

        {/* Helper Text */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Helper Text
          </label>
          <Textarea
            value={field.helper_text ?? ''}
            onChange={(e) =>
              onFieldChange({ helper_text: e.target.value || null })
            }
            placeholder="Additional information (e.g., 'Please enter your portfolio website URL')"
            className="min-h-[60px] text-xs"
          />
        </div>

        {/* Visibility Conditions */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Visibility Conditions (JSON)
          </label>
          <Textarea
            value={
              field.visibility_conditions ?? field.visibility_condition ?? ''
            }
            onChange={(e) =>
              onFieldChange({
                visibility_conditions: e.target.value || null,
              })
            }
            placeholder='e.g., {"field_id": 5, "operator": "equals", "value": "yes"}'
            className="min-h-[60px] text-xs font-mono"
          />
        </div>

        {/* Available Validation Rules Info */}
        <div className="pt-2 border-t">
          <p className="text-[10px] font-medium text-muted-foreground mb-1">
            📋 Suggested Validation Rules:
          </p>
          <div className="grid grid-cols-2 gap-1 text-[10px] text-muted-foreground">
            <span>• required</span>
            <span>• url</span>
            <span>• min (length)</span>
            <span>• max (length)</span>
            <span>• startswith</span>
            <span>• endswith</span>
            <span>• regex</span>
            <span>• unique</span>
          </div>
          <p className="text-[10px] text-cyan-700 mt-2 font-medium">
            ⚠️ The "url" rule validates URL format. Use "startswith" to require https://.
          </p>
        </div>

        {/* Example Validation Configuration */}
        <Alert className="bg-amber-50 border-amber-200">
          <Info className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-xs text-amber-900">
            <strong>Example Validation:</strong> Add "url" rule (no props) and "startswith" rule with props:{' '}
            <code className="bg-amber-100 px-1 rounded">
              {'{ "values": ["https://"] }'}
            </code>{' '}
            to require secure URLs.
          </AlertDescription>
        </Alert>
      </div>
    </Card>
  );
};

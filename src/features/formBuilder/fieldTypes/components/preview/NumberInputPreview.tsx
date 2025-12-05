// src/features/formVersion/components/preview/NumberInputPreview.tsx

/**
 * Number Input Preview Component
 *
 * Displays a preview of how the Number Input field will appear in the form
 * Shows number-specific features like type="number" and step attribute
 */

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Hash } from 'lucide-react';
import type { Field } from '@/features/formBuilder/formVersions/types';

type NumberInputPreviewProps = {
  field: Field;
};

export function NumberInputPreview({ field }: NumberInputPreviewProps) {
  // Parse default value as number if present
  const defaultValue = field.default_value
    ? Number(field.default_value)
    : undefined;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Hash className="h-3 w-3 text-green-500" />
        <Label className="text-sm font-medium">
          {field.label}
          {/* You can add a required indicator based on field rules */}
        </Label>
      </div>

      <Input
        type="number"
        step="any"
        placeholder={field.placeholder ?? '0'}
        defaultValue={defaultValue}
        disabled
        className="bg-muted/30"
      />

      {field.helper_text && (
        <p className="text-xs text-muted-foreground">{field.helper_text}</p>
      )}
    </div>
  );
}

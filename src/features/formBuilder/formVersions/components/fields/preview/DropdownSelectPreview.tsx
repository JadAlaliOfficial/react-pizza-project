// src/features/formVersion/components/fields/preview/DropdownSelectPreview.tsx

/**
 * Dropdown Select Preview Component
 * 
 * Displays preview of how the Dropdown Select field will appear in the form
 * Shows dropdown menu with all options
 */

import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ChevronDown } from 'lucide-react';
import type { FieldPreviewComponentProps } from '../fieldComponentRegistry';

// ============================================================================
// Component
// ============================================================================

/**
 * DropdownSelectPreview Component
 * 
 * Preview component for Dropdown Select field type
 * Features:
 * - Shows all options from JSON placeholder
 * - Default selection preview
 * - Authentic disabled dropdown appearance
 * - Rules indicator
 * - Dynamic option count display
 */
export const DropdownSelectPreview: React.FC<FieldPreviewComponentProps> = ({
  field,
}) => {
  console.debug('[DropdownSelectPreview] Rendering for field:', field.id);

  // Parse options from placeholder
  const getOptions = (): string[] => {
    try {
      if (!field.placeholder) return ['Option 1', 'Option 2', 'Option 3'];
      const parsed = JSON.parse(field.placeholder);
      return Array.isArray(parsed) && parsed.length > 0
        ? parsed
        : ['Option 1', 'Option 2', 'Option 3'];
    } catch {
      return ['Option 1', 'Option 2', 'Option 3'];
    }
  };

  const options = getOptions();

  // Determine if field has validation rules
  const hasRules = field.rules && field.rules.length > 0;
  const isRequired = field.rules?.some(
    (rule) => rule.input_rule_id !== null && rule.input_rule_id !== undefined
  );

  return (
    <div className="space-y-2">
      {/* Header with icon, label, and rules */}
      <div className="flex items-center gap-2">
        <ChevronDown className="h-3.5 w-3.5 text-sky-500" />
        <Label className="text-sm font-medium flex-1">
          {field.label}
          {isRequired && <span className="text-destructive ml-1">*</span>}
        </Label>
        <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
          Dropdown
        </Badge>
        {hasRules && (
          <span className="text-[10px] text-muted-foreground font-normal">
            ({field.rules.length} rule{field.rules.length !== 1 ? 's' : ''})
          </span>
        )}
      </div>

      {/* Dropdown preview */}
      <Select defaultValue={field.default_value ?? undefined} disabled>
        <SelectTrigger className="bg-muted/30">
          <SelectValue placeholder="Select an option..." />
        </SelectTrigger>
        <SelectContent>
          {options.map((option, index) => (
            <SelectItem key={index} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Helper text */}
      {field.helper_text && (
        <p className="text-xs text-muted-foreground">{field.helper_text}</p>
      )}

      {/* Dropdown-specific hint */}
      <p className="text-[10px] text-sky-600 italic">
        ✓ Single selection dropdown. Options: {options.length}. Space-efficient for long lists.
      </p>
    </div>
  );
};

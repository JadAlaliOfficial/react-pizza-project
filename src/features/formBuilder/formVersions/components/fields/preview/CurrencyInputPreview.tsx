// src/features/formVersion/components/fields/preview/CurrencyInputPreview.tsx

/**
 * Currency Input Preview Component
 *
 * Displays a preview of how the Currency Input field will appear in the form
 * Shows formatted currency input with symbol and decimal places
 */

import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { DollarSign } from 'lucide-react';
import type { FieldPreviewComponentProps } from '../fieldComponentRegistry';

// ============================================================================
// Component
// ============================================================================

/**
 * CurrencyInputPreview Component
 *
 * Preview component for Currency Input field type
 * Features:
 * - Label with currency icon
 * - Disabled input with symbol and right-aligned value
 * - Formatted amount preview with thousand separators
 * - Rule/required hints
 */
export const CurrencyInputPreview: React.FC<FieldPreviewComponentProps> = ({
  field,
}) => {
  console.debug('[CurrencyInputPreview] Rendering for field:', field.id);

  const currencySymbol = '$';
  const [value, setValue] = useState('');

  // Update value when field.default_value changes
  useEffect(() => {
    if (field.default_value) {
      setValue(field.default_value);
    } else {
      setValue('');
    }
  }, [field.default_value]);

  /**
   * Format number with thousand separators and 2 decimal places
   * Example: "1234.56" => "1,234.56"
   */
  const formatWithCommas = (val: string): string => {
    if (!val) return '';

    // Remove all non-numeric characters except dot
    const cleaned = val.replace(/[^0-9.]/g, '');

    // Split into integer and decimal parts
    const parts = cleaned.split('.');

    // Add thousand separators to integer part
    const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    // Limit decimal to 2 places
    const decimalPart = parts[1] ? parts[1].substring(0, 2) : '';

    // Combine parts
    return decimalPart ? `${integerPart}.${decimalPart}` : integerPart;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;

    // Remove all non-numeric characters except dot
    const cleaned = input.replace(/[^0-9.]/g, '');

    // Prevent multiple dots
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      return;
    }

    // Store raw value (without commas)
    setValue(cleaned);
  };

  const isRequired = field.rules?.some(
    (rule) => rule.input_rule_id !== null && rule.input_rule_id !== undefined,
  );

  // Determine what to display in the input
  const getDisplayValue = (): string => {
    if (value) {
      return formatWithCommas(value);
    }
    return '';
  };

  // Get placeholder (use field placeholder or default)
  const getPlaceholder = (): string => {
    return field.placeholder || '0.00';
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <DollarSign className="h-3.5 w-3.5 text-emerald-500" />
        <Label className="text-sm font-medium flex-1">
          {field.label}
          {isRequired && <span className="text-destructive ml-1">*</span>}
        </Label>
      </div>

      {/* Currency Input */}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600 font-bold text-lg">
          {currencySymbol}
        </span>
        <Input
          type="text"
          value={getDisplayValue()}
          onChange={handleChange}
          placeholder={getPlaceholder()}
          disabled
          className="h-11 pl-10 pr-4 text-right text-lg font-semibold border-emerald-200 focus:border-emerald-500"
        />
      </div>

      {field.helper_text && (
        <p className="text-xs text-muted-foreground">{field.helper_text}</p>
      )}
    </div>
  );
};

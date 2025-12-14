// src/features/formVersion/components/fields/preview/AddressInputPreview.tsx

/**
 * Address Input Preview Component
 *
 * Displays a preview of how the Address Input field will appear in the form
 * Shows all 5 address components with default values if configured
 */

import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Home, MapPin } from 'lucide-react';
import type { FieldPreviewComponentProps } from '../fieldComponentRegistry';

// ============================================================================
// Types
// ============================================================================

interface AddressDefaults {
  street?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
}

// ============================================================================
// Component
// ============================================================================

/**
 * AddressInputPreview Component
 *
 * Preview component for Address Input field type
 * Shows all 5 address fields with any configured default values
 */
export const AddressInputPreview: React.FC<FieldPreviewComponentProps> = ({
  field,
}) => {
  console.debug('[AddressInputPreview] Rendering for field:', field.id);

  // Parse default value if it exists
  let defaultAddress: AddressDefaults = {
    street: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
  };

  if (field.default_value) {
    try {
      const parsed = JSON.parse(field.default_value);
      defaultAddress = {
        street: parsed.street || '',
        city: parsed.city || '',
        state: parsed.state || '',
        postal_code: parsed.postal_code || '',
        country: parsed.country || '',
      };
    } catch (e) {
      console.warn('Invalid default_value JSON for address field:', e);
    }
  }

  const isRequired = field.rules?.some(
    (rule) => rule.input_rule_id !== null && rule.input_rule_id !== undefined,
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Home className="h-3.5 w-3.5 text-orange-500" />
        <Label className="text-sm font-medium flex-1">
          {field.label}
          {isRequired && <span className="text-destructive ml-1">*</span>}
        </Label>
      </div>

      {/* Address Input Fields */}
      <div className="space-y-2">
        {/* Street Address */}
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">
            Street Address
          </Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
            <Input
              value={defaultAddress.street}
              placeholder={field.placeholder || '123 Main Street, Apt 4B...'}
              disabled
              className={`pl-9 h-10 ${
                defaultAddress.street
                  ? 'border-blue-300 bg-blue-50/50'
                  : 'border-orange-200'
              }`}
            />
          </div>
        </div>

        {/* City and State */}
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">City</Label>
            <Input
              value={defaultAddress.city}
              placeholder="New York"
              disabled
              className={`h-10 ${
                defaultAddress.city
                  ? 'border-blue-300 bg-blue-50/50'
                  : 'border-orange-200'
              }`}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">
              State/Province
            </Label>
            <Input
              value={defaultAddress.state}
              placeholder="TX"
              disabled
              className={`h-10 ${
                defaultAddress.state
                  ? 'border-blue-300 bg-blue-50/50'
                  : 'border-orange-200'
              }`}
            />
          </div>
        </div>

        {/* Postal Code and Country */}
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">
              Postal/ZIP Code
            </Label>
            <Input
              value={defaultAddress.postal_code}
              placeholder="10001"
              disabled
              className={`h-10 ${
                defaultAddress.postal_code
                  ? 'border-blue-300 bg-blue-50/50'
                  : 'border-orange-200'
              }`}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Country</Label>
            <Input
              value={defaultAddress.country}
              placeholder="United States"
              disabled
              className={`h-10 ${
                defaultAddress.country
                  ? 'border-blue-300 bg-blue-50/50'
                  : 'border-orange-200'
              }`}
            />
          </div>
        </div>
      </div>

      {field.helper_text && (
        <p className="text-xs text-muted-foreground">{field.helper_text}</p>
      )}
    </div>
  );
};

// src/features/formVersion/components/fields/config/AddressInputFieldConfig.tsx

/**
 * Address Input Field Configuration Component
 *
 * Provides UI for configuring an Address Input field with dynamic default values
 * - Label (main question)
 * - Placeholder
 * - Helper text
 * - Default value builder for address components (set any combination)
 * - Visibility conditions
 */

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2, Home, X } from 'lucide-react';
import type { FieldConfigComponentProps } from '../fieldComponentRegistry';

// ============================================================================
// Types
// ============================================================================

interface AddressDefaults {
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

// ============================================================================
// Component
// ============================================================================

/**
 * AddressInputFieldConfig Component
 *
 * Configuration UI for Address Input field type with dynamic default value builder
 */
export const AddressInputFieldConfig: React.FC<FieldConfigComponentProps> = ({
  field,
  fieldIndex,
  onFieldChange,
  onDelete,
}) => {
  console.debug('[AddressInputFieldConfig] Rendering for field:', field.id);

  // Parse existing default_value or initialize empty
  const [addressDefaults, setAddressDefaults] = useState<AddressDefaults>({
    street: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
  });

  const [enabledFields, setEnabledFields] = useState({
    street: false,
    city: false,
    state: false,
    postal_code: false,
    country: false,
  });

  // Initialize from field.default_value on mount and when it changes
  useEffect(() => {
    if (field.default_value) {
      try {
        const parsed = JSON.parse(field.default_value);
        const newDefaults: AddressDefaults = {
          street: parsed.street || '',
          city: parsed.city || '',
          state: parsed.state || '',
          postal_code: parsed.postal_code || '',
          country: parsed.country || '',
        };
        setAddressDefaults(newDefaults);

        // Set which fields are enabled based on non-empty values
        setEnabledFields({
          street: !!parsed.street,
          city: !!parsed.city,
          state: !!parsed.state,
          postal_code: !!parsed.postal_code,
          country: !!parsed.country,
        });
      } catch (e) {
        console.warn('Invalid default_value JSON for address field:', e);
      }
    }
  }, [field.default_value]);

  // Update field.default_value whenever addressDefaults changes
  const updateDefaultValue = (
    newDefaults: AddressDefaults,
    newEnabled: typeof enabledFields,
  ) => {
    // Only include fields that are enabled
    const filtered: Partial<AddressDefaults> = {};

    if (newEnabled.street && newDefaults.street) {
      filtered.street = newDefaults.street;
    }
    if (newEnabled.city && newDefaults.city) {
      filtered.city = newDefaults.city;
    }
    if (newEnabled.state && newDefaults.state) {
      filtered.state = newDefaults.state;
    }
    if (newEnabled.postal_code && newDefaults.postal_code) {
      filtered.postal_code = newDefaults.postal_code;
    }
    if (newEnabled.country && newDefaults.country) {
      filtered.country = newDefaults.country;
    }

    // Convert to JSON string or null if no defaults
    const jsonValue =
      Object.keys(filtered).length > 0 ? JSON.stringify(filtered) : null;

    onFieldChange({ default_value: jsonValue });
  };

  const handleFieldValueChange = (
    fieldName: keyof AddressDefaults,
    value: string,
  ) => {
    const newDefaults = { ...addressDefaults, [fieldName]: value };
    setAddressDefaults(newDefaults);
    updateDefaultValue(newDefaults, enabledFields);
  };

  const handleFieldToggle = (
    fieldName: keyof typeof enabledFields,
    checked: boolean,
  ) => {
    const newEnabled = { ...enabledFields, [fieldName]: checked };
    setEnabledFields(newEnabled);

    // If disabling, clear the value
    if (!checked) {
      const newDefaults = { ...addressDefaults, [fieldName]: '' };
      setAddressDefaults(newDefaults);
      updateDefaultValue(newDefaults, newEnabled);
    } else {
      updateDefaultValue(addressDefaults, newEnabled);
    }
  };

  const clearAllDefaults = () => {
    setAddressDefaults({
      street: '',
      city: '',
      state: '',
      postal_code: '',
      country: '',
    });
    setEnabledFields({
      street: false,
      city: false,
      state: false,
      postal_code: false,
      country: false,
    });
    onFieldChange({ default_value: null });
  };

  const hasAnyDefaults = Object.values(enabledFields).some((v) => v);

  return (
    <Card className="p-4 border-l-4 border-l-orange-500">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <Home className="h-4 w-4 text-orange-500" />
            <Badge variant="outline" className="text-xs">
              Address Input
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

        {/* Label */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Label <span className="text-destructive">*</span>
          </label>
          <Input
            value={field.label}
            onChange={(e) => onFieldChange({ label: e.target.value })}
            placeholder="e.g., Enter your address"
            className="h-9"
            maxLength={255}
          />
        </div>

        {/* Placeholder */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Placeholder Text (for street address field)
          </label>
          <Input
            value={field.placeholder ?? ''}
            onChange={(e) =>
              onFieldChange({ placeholder: e.target.value || null })
            }
            placeholder="e.g., 123 Main Street..."
            className="h-9"
            maxLength={255}
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
            placeholder="Additional information (e.g., 'Provide your complete mailing address')"
            className="min-h-[60px] text-xs"
          />
        </div>

        {/* Default Value Builder */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-muted-foreground">
              Default Values (Pre-fill Address Components)
            </label>
            {hasAnyDefaults && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clearAllDefaults}
                className="h-6 text-xs text-destructive hover:text-destructive"
              >
                <X className="h-3 w-3 mr-1" />
                Clear All
              </Button>
            )}
          </div>

          <div className="p-3 border rounded-md bg-muted/20 space-y-2">
            <p className="text-[10px] text-muted-foreground mb-2">
              Enable and set default values for any combination of address
              fields:
            </p>

            {/* Street Address */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="enable-street"
                  checked={enabledFields.street}
                  onCheckedChange={(checked) =>
                    handleFieldToggle('street', checked as boolean)
                  }
                />
                <label
                  htmlFor="enable-street"
                  className="text-xs font-medium cursor-pointer"
                >
                  📍 Street Address
                </label>
              </div>
              {enabledFields.street && (
                <Input
                  value={addressDefaults.street}
                  onChange={(e) =>
                    handleFieldValueChange('street', e.target.value)
                  }
                  placeholder="e.g., 123 Main Street, Apt 4B"
                  className="h-8 text-xs"
                  maxLength={255}
                />
              )}
            </div>

            {/* City */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="enable-city"
                  checked={enabledFields.city}
                  onCheckedChange={(checked) =>
                    handleFieldToggle('city', checked as boolean)
                  }
                />
                <label
                  htmlFor="enable-city"
                  className="text-xs font-medium cursor-pointer"
                >
                  🏙️ City
                </label>
              </div>
              {enabledFields.city && (
                <Input
                  value={addressDefaults.city}
                  onChange={(e) =>
                    handleFieldValueChange('city', e.target.value)
                  }
                  placeholder="e.g., New York"
                  className="h-8 text-xs"
                  maxLength={255}
                />
              )}
            </div>

            {/* State/Province */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="enable-state"
                  checked={enabledFields.state}
                  onCheckedChange={(checked) =>
                    handleFieldToggle('state', checked as boolean)
                  }
                />
                <label
                  htmlFor="enable-state"
                  className="text-xs font-medium cursor-pointer"
                >
                  🗺️ State/Province
                </label>
              </div>
              {enabledFields.state && (
                <Input
                  value={addressDefaults.state}
                  onChange={(e) =>
                    handleFieldValueChange('state', e.target.value)
                  }
                  placeholder="e.g., NY or New York"
                  className="h-8 text-xs"
                  maxLength={100}
                />
              )}
            </div>

            {/* Postal Code */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="enable-postal"
                  checked={enabledFields.postal_code}
                  onCheckedChange={(checked) =>
                    handleFieldToggle('postal_code', checked as boolean)
                  }
                />
                <label
                  htmlFor="enable-postal"
                  className="text-xs font-medium cursor-pointer"
                >
                  📮 Postal/ZIP Code
                </label>
              </div>
              {enabledFields.postal_code && (
                <Input
                  value={addressDefaults.postal_code}
                  onChange={(e) =>
                    handleFieldValueChange('postal_code', e.target.value)
                  }
                  placeholder="e.g., 10001"
                  className="h-8 text-xs"
                  maxLength={20}
                />
              )}
            </div>

            {/* Country */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="enable-country"
                  checked={enabledFields.country}
                  onCheckedChange={(checked) =>
                    handleFieldToggle('country', checked as boolean)
                  }
                />
                <label
                  htmlFor="enable-country"
                  className="text-xs font-medium cursor-pointer"
                >
                  🌍 Country
                </label>
              </div>
              {enabledFields.country && (
                <Input
                  value={addressDefaults.country}
                  onChange={(e) =>
                    handleFieldValueChange('country', e.target.value)
                  }
                  placeholder="e.g., United States"
                  className="h-8 text-xs"
                  maxLength={100}
                />
              )}
            </div>

            {!hasAnyDefaults && (
              <div className="text-center py-2">
                <p className="text-[10px] text-muted-foreground italic">
                  No default values set. Check boxes above to pre-fill address
                  fields.
                </p>
              </div>
            )}
          </div>

          {/* Current JSON Preview */}
          {hasAnyDefaults && (
            <div className="p-2 bg-muted/50 rounded border">
              <p className="text-[9px] font-medium text-muted-foreground mb-1">
                Stored as JSON:
              </p>
              <pre className="text-[9px] font-mono text-muted-foreground overflow-x-auto">
                {field.default_value || '{}'}
              </pre>
            </div>
          )}
        </div>

        {/* Visibility Conditions */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Visibility Conditions (JSON)
          </label>
          <Textarea
            value={field.visibility_condition ?? ''}
            onChange={(e) =>
              onFieldChange({
                visibility_condition: e.target.value || null,
              })
            }
            placeholder='e.g., {"field_id": 5, "operator": "equals", "value": "yes"}'
            className="min-h-[60px] text-xs font-mono"
          />
          <p className="text-[10px] text-muted-foreground">
            Control when this field appears based on other field values
          </p>
        </div>
      </div>
    </Card>
  );
};

/**
 * ================================
 * ADDRESS INPUT COMPONENT
 * ================================
 * Production-ready Address Input field component with:
 * - Dynamic configuration from API field data
 * - Zod validation based on field rules
 * - Proper styling matching preview component
 * - Real-time validation feedback
 * - Accessibility support
 * - ForwardRef support for parent scrolling
 */

import { useEffect, useState, forwardRef } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Home, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AddressInputProps, AddressSubField, AddressValue } from './types/addressField.types';
import { getDefaultAddressValue } from './validation/addressValidation';

/**
 * Address subfield configuration
 * Defines the structure and layout of address input fields
 */
const ADDRESS_SUBFIELDS: AddressSubField[] = [
  {
    key: 'street',
    label: 'Street Address',
    placeholder: '123 Main Street, Apt 4B...',
    gridColumn: 'full',
  },
  {
    key: 'city',
    label: 'City',
    placeholder: 'New York',
    gridColumn: 'half',
  },
  {
    key: 'state',
    label: 'State/Province',
    placeholder: 'TX',
    gridColumn: 'half',
  },
  {
    key: 'postal_code',
    label: 'Postal/ZIP Code',
    placeholder: '10001',
    gridColumn: 'half',
  },
  {
    key: 'country',
    label: 'Country',
    placeholder: 'United States',
    gridColumn: 'half',
  },
];

/**
 * AddressInput Component
 * 
 * Renders a multi-field address input with validation and default values
 * Integrates with form systems via onChange callback
 * Supports forwardRef for scrolling to errors
 * 
 * @example
 * ```
 * <AddressInput
 *   ref={addressRef}
 *   field={fieldData}
 *   value={addressValue}
 *   onChange={(newAddress) => setValue(newAddress)}
 *   error={errors.address?.message}
 * />
 * ```
 */
export const AddressInput = forwardRef<HTMLDivElement, AddressInputProps>(
  ({ field, value, onChange, error, disabled = false, className }, ref) => {
    console.debug('[AddressInput] Rendering for field:', field.field_id);

    // Initialize with default value or current value
    const [localValue, setLocalValue] = useState<AddressValue>(() => {
      if (value) return value;
      if (field.current_value && typeof field.current_value === 'object') {
        return field.current_value as AddressValue;
      }
      return getDefaultAddressValue(field);
    });

    // Check if field is required
    const isRequired = field.rules?.some((rule) => rule.rule_name === 'required') ?? false;

    // Update local value when external value changes
    useEffect(() => {
      if (value) {
        setLocalValue(value);
      }
    }, [value]);

    /**
     * Handle change for individual address subfield
     */
    const handleSubFieldChange = (key: keyof AddressValue, newValue: string) => {
      const updatedAddress: AddressValue = {
        ...localValue,
        [key]: newValue,
      };
      setLocalValue(updatedAddress);
      onChange(updatedAddress);

      console.debug('[AddressInput] Subfield changed:', {
        field: key,
        value: newValue,
      });
    };

    /**
     * Check if a subfield has a value (default or current)
     */
    const hasValue = (key: keyof AddressValue): boolean => {
      return localValue[key]?.length > 0;
    };

    /**
     * Get placeholder for subfield (use field placeholder if available, otherwise default)
     */
    const getPlaceholder = (subfield: AddressSubField): string => {
      if (subfield.key === 'street' && field.placeholder) {
        return field.placeholder;
      }
      return subfield.placeholder;
    };

    return (
      <div ref={ref} className={cn('space-y-3', className)}>
        {/* Field Label with Icon */}
        <div className="flex items-center gap-2">
          <Home className="h-4 w-4 text-muted-foreground" />
          <Label className="text-sm font-medium">
            {field.label}
            {isRequired && <span className="text-destructive ml-1">*</span>}
          </Label>
        </div>

        {/* Address Input Fields */}
        <div className="space-y-3">
          {/* Street Address - Full Width */}
          <div className="space-y-1.5">
            <Label htmlFor={`address-street-${field.field_id}`} className="text-xs text-muted-foreground">
              {ADDRESS_SUBFIELDS[0].label}
            </Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                id={`address-street-${field.field_id}`}
                type="text"
                value={localValue.street}
                onChange={(e) => handleSubFieldChange('street', e.target.value)}
                placeholder={getPlaceholder(ADDRESS_SUBFIELDS[0])}
                disabled={disabled}
                className={cn(
                  'pl-9 h-10 transition-colors',
                  hasValue('street')
                    ? 'border-blue-300 bg-blue-50/50'
                    : 'border-orange-200',
                  error && 'border-destructive focus-visible:ring-destructive'
                )}
                aria-label={`${field.label} - Street Address`}
                aria-required={isRequired}
                aria-invalid={!!error}
              />
            </div>
          </div>

          {/* City and State - Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor={`address-city-${field.field_id}`} className="text-xs text-muted-foreground">
                {ADDRESS_SUBFIELDS[1].label}
              </Label>
              <Input
                id={`address-city-${field.field_id}`}
                type="text"
                value={localValue.city}
                onChange={(e) => handleSubFieldChange('city', e.target.value)}
                placeholder={getPlaceholder(ADDRESS_SUBFIELDS[1])}
                disabled={disabled}
                className={cn(
                  'h-10 transition-colors',
                  hasValue('city')
                    ? 'border-blue-300 bg-blue-50/50'
                    : 'border-orange-200',
                  error && 'border-destructive focus-visible:ring-destructive'
                )}
                aria-label={`${field.label} - City`}
                aria-required={isRequired}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor={`address-state-${field.field_id}`} className="text-xs text-muted-foreground">
                {ADDRESS_SUBFIELDS[2].label}
              </Label>
              <Input
                id={`address-state-${field.field_id}`}
                type="text"
                value={localValue.state}
                onChange={(e) => handleSubFieldChange('state', e.target.value)}
                placeholder={getPlaceholder(ADDRESS_SUBFIELDS[2])}
                disabled={disabled}
                className={cn(
                  'h-10 transition-colors',
                  hasValue('state')
                    ? 'border-blue-300 bg-blue-50/50'
                    : 'border-orange-200',
                  error && 'border-destructive focus-visible:ring-destructive'
                )}
                aria-label={`${field.label} - State/Province`}
                aria-required={isRequired}
              />
            </div>
          </div>

          {/* Postal Code and Country - Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor={`address-postal-${field.field_id}`} className="text-xs text-muted-foreground">
                {ADDRESS_SUBFIELDS[3].label}
              </Label>
              <Input
                id={`address-postal-${field.field_id}`}
                type="text"
                value={localValue.postal_code}
                onChange={(e) => handleSubFieldChange('postal_code', e.target.value)}
                placeholder={getPlaceholder(ADDRESS_SUBFIELDS[3])}
                disabled={disabled}
                className={cn(
                  'h-10 transition-colors',
                  hasValue('postal_code')
                    ? 'border-blue-300 bg-blue-50/50'
                    : 'border-orange-200',
                  error && 'border-destructive focus-visible:ring-destructive'
                )}
                aria-label={`${field.label} - Postal/ZIP Code`}
                aria-required={isRequired}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor={`address-country-${field.field_id}`} className="text-xs text-muted-foreground">
                {ADDRESS_SUBFIELDS[4].label}
              </Label>
              <Input
                id={`address-country-${field.field_id}`}
                type="text"
                value={localValue.country}
                onChange={(e) => handleSubFieldChange('country', e.target.value)}
                placeholder={getPlaceholder(ADDRESS_SUBFIELDS[4])}
                disabled={disabled}
                className={cn(
                  'h-10 transition-colors',
                  hasValue('country')
                    ? 'border-blue-300 bg-blue-50/50'
                    : 'border-orange-200',
                  error && 'border-destructive focus-visible:ring-destructive'
                )}
                aria-label={`${field.label} - Country`}
                aria-required={isRequired}
              />
            </div>
          </div>
        </div>

        {/* Helper Text */}
        {field.helper_text && !error && (
          <p className="text-xs text-muted-foreground">
            {field.helper_text}
          </p>
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

AddressInput.displayName = 'AddressInput';

export default AddressInput;

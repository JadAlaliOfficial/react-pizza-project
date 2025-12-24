/**
 * ================================
 * ADDRESS INPUT COMPONENT
 * ================================
 *
 * Production-ready Address Input field component.
 *
 * Responsibilities:
 * - Render multi-field address input (street, city, state, postal, country)
 * - Emit changes via onChange callback
 * - Display validation errors from parent
 * - Apply disabled state
 * - Support accessibility and RTL
 *
 * Architecture Decisions:
 * - Dumb component - no validation/visibility/business logic
 * - Props match RuntimeFieldProps contract
 * - No debug logs
 * - No RTL logic (handled by parent)
 * - ForwardRef for error scrolling
 * - Local state for controlled input behavior
 */

import { useEffect, useState, forwardRef } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Home, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import type {
  AddressInputProps,
  AddressSubField,
  AddressValue,
} from './types/addressField.types';
import { getDefaultAddressValue } from './validation/addressValidation';

// ================================
// LOCALIZATION
// ================================

const getLocalizedAddressConfig = (languageId?: number) => {
  if (languageId === 2) {
    // Arabic
    return {
      subfields: [
        {
          key: 'street',
          label: 'عنوان الشارع',
          placeholder: '١٢٣ شارع رئيسي، شقة ٤ب...',
          gridColumn: 'full' as const,
        },
        {
          key: 'city',
          label: 'المدينة',
          placeholder: 'نيويورك',
          gridColumn: 'half' as const,
        },
        {
          key: 'state',
          label: 'الولاية / المقاطعة',
          placeholder: 'تكساس',
          gridColumn: 'half' as const,
        },
        {
          key: 'postal_code',
          label: 'الرمز البريدي',
          placeholder: '١٠٠٠١',
          gridColumn: 'half' as const,
        },
        {
          key: 'country',
          label: 'الدولة',
          placeholder: 'الولايات المتحدة',
          gridColumn: 'half' as const,
        },
      ] as AddressSubField[],
      ariaFragments: {
        street: ' - عنوان الشارع',
        city: ' - المدينة',
        state: ' - الولاية / المقاطعة',
        postal: ' - الرمز البريدي',
        country: ' - الدولة',
      },
    };
  }

  if (languageId === 3) {
    // Spanish
    return {
      subfields: [
        {
          key: 'street',
          label: 'Dirección',
          placeholder: 'Calle Principal 123, Apt 4B...',
          gridColumn: 'full' as const,
        },
        {
          key: 'city',
          label: 'Ciudad',
          placeholder: 'Nueva York',
          gridColumn: 'half' as const,
        },
        {
          key: 'state',
          label: 'Estado/Provincia',
          placeholder: 'Texas',
          gridColumn: 'half' as const,
        },
        {
          key: 'postal_code',
          label: 'Código postal',
          placeholder: '10001',
          gridColumn: 'half' as const,
        },
        {
          key: 'country',
          label: 'País',
          placeholder: 'Estados Unidos',
          gridColumn: 'half' as const,
        },
      ] as AddressSubField[],
      ariaFragments: {
        street: ' - Dirección',
        city: ' - Ciudad',
        state: ' - Estado/Provincia',
        postal: ' - Código postal',
        country: ' - País',
      },
    };
  }

  // English (default)
  return {
    subfields: [
      {
        key: 'street',
        label: 'Street Address',
        placeholder: '123 Main Street, Apt 4B...',
        gridColumn: 'full' as const,
      },
      {
        key: 'city',
        label: 'City',
        placeholder: 'New York',
        gridColumn: 'half' as const,
      },
      {
        key: 'state',
        label: 'State/Province',
        placeholder: 'TX',
        gridColumn: 'half' as const,
      },
      {
        key: 'postal_code',
        label: 'Postal/ZIP Code',
        placeholder: '10001',
        gridColumn: 'half' as const,
      },
      {
        key: 'country',
        label: 'Country',
        placeholder: 'United States',
        gridColumn: 'half' as const,
      },
    ] as AddressSubField[],
    ariaFragments: {
      street: ' - Street Address',
      city: ' - City',
      state: ' - State/Province',
      postal: ' - Postal/ZIP Code',
      country: ' - Country',
    },
  };
};

// ================================
// COMPONENT
// ================================

/**
 * AddressInput Component
 *
 * Renders a multi-field address input with validation and default values.
 * Integrates with form systems via onChange callback.
 * Supports forwardRef for scrolling to errors.
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
  ({ field, value, onChange, error, disabled = false, className, languageId, onBlur }, ref) => {
    const [localValue, setLocalValue] = useState<AddressValue>(() => {
      if (value) return value;
      if (field.current_value && typeof field.current_value === 'object') {
        return field.current_value as AddressValue;
      }
      return getDefaultAddressValue(field);
    });

    const { subfields, ariaFragments } = getLocalizedAddressConfig(languageId);

    const streetSubfield = subfields[0];
    const citySubfield = subfields[1];
    const stateSubfield = subfields[2];
    const postalSubfield = subfields[3];
    const countrySubfield = subfields[4];

    const isRequired =
      field.rules?.some((rule) => rule.rule_name === 'required') ?? false;

    useEffect(() => {
      if (value) {
        setLocalValue(value);
      }
    }, [value]);

    const handleSubFieldChange = (
      key: keyof AddressValue,
      newValue: string,
    ) => {
      const updatedAddress: AddressValue = {
        ...localValue,
        [key]: newValue,
      };
      setLocalValue(updatedAddress);
      onChange(updatedAddress);
    };

    const handleSubFieldBlur = () => {
      if (onBlur) {
        onBlur();
      }
    };

    const hasValue = (key: keyof AddressValue): boolean => {
      return localValue[key]?.length > 0;
    };

    const getPlaceholder = (subfield: AddressSubField): string => {
      if (subfield.key === 'street' && field.placeholder) {
        return field.placeholder;
      }
      return subfield.placeholder;
    };

    return (
      <div ref={ref} className={cn('space-y-3', className)}>
        <div className="flex items-center gap-2">
          <Home className="h-4 w-4 text-muted-foreground" />
          <Label className="text-sm font-medium">
            {field.label}
            {isRequired && <span className="text-destructive ml-1">*</span>}
          </Label>
        </div>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label
              htmlFor={`address-street-${field.field_id}`}
              className="text-xs text-muted-foreground"
            >
              {streetSubfield.label}
            </Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                id={`address-street-${field.field_id}`}
                type="text"
                value={localValue.street}
                onChange={(e) => handleSubFieldChange('street', e.target.value)}
                onBlur={handleSubFieldBlur}
                placeholder={getPlaceholder(streetSubfield)}
                disabled={disabled}
                className={cn(
                  'pl-9 h-10 transition-colors',
                  hasValue('street')
                    ? 'border-blue-300 bg-blue-50/50'
                    : 'border-orange-200',
                  error && 'border-destructive focus-visible:ring-destructive',
                )}
                aria-label={`${field.label}${ariaFragments.street}`}
                aria-required={isRequired}
                aria-invalid={!!error}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label
                htmlFor={`address-city-${field.field_id}`}
                className="text-xs text-muted-foreground"
              >
                {citySubfield.label}
              </Label>
              <Input
                id={`address-city-${field.field_id}`}
                type="text"
                value={localValue.city}
                onChange={(e) => handleSubFieldChange('city', e.target.value)}
                onBlur={handleSubFieldBlur}
                placeholder={getPlaceholder(citySubfield)}
                disabled={disabled}
                className={cn(
                  'h-10 transition-colors',
                  hasValue('city')
                    ? 'border-blue-300 bg-blue-50/50'
                    : 'border-orange-200',
                  error && 'border-destructive focus-visible:ring-destructive',
                )}
                aria-label={`${field.label}${ariaFragments.city}`}
                aria-required={isRequired}
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor={`address-state-${field.field_id}`}
                className="text-xs text-muted-foreground"
              >
                {stateSubfield.label}
              </Label>
              <Input
                id={`address-state-${field.field_id}`}
                type="text"
                value={localValue.state}
                onChange={(e) => handleSubFieldChange('state', e.target.value)}
                onBlur={handleSubFieldBlur}
                placeholder={getPlaceholder(stateSubfield)}
                disabled={disabled}
                className={cn(
                  'h-10 transition-colors',
                  hasValue('state')
                    ? 'border-blue-300 bg-blue-50/50'
                    : 'border-orange-200',
                  error && 'border-destructive focus-visible:ring-destructive',
                )}
                aria-label={`${field.label}${ariaFragments.state}`}
                aria-required={isRequired}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label
                htmlFor={`address-postal-${field.field_id}`}
                className="text-xs text-muted-foreground"
              >
                {postalSubfield.label}
              </Label>
              <Input
                id={`address-postal-${field.field_id}`}
                type="text"
                value={localValue.postal_code}
                onChange={(e) =>
                  handleSubFieldChange('postal_code', e.target.value)
                }
                onBlur={handleSubFieldBlur}
                placeholder={getPlaceholder(postalSubfield)}
                disabled={disabled}
                className={cn(
                  'h-10 transition-colors',
                  hasValue('postal_code')
                    ? 'border-blue-300 bg-blue-50/50'
                    : 'border-orange-200',
                  error && 'border-destructive focus-visible:ring-destructive',
                )}
                aria-label={`${field.label}${ariaFragments.postal}`}
                aria-required={isRequired}
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor={`address-country-${field.field_id}`}
                className="text-xs text-muted-foreground"
              >
                {countrySubfield.label}
              </Label>
              <Input
                id={`address-country-${field.field_id}`}
                type="text"
                value={localValue.country}
                onChange={(e) =>
                  handleSubFieldChange('country', e.target.value)
                }
                onBlur={handleSubFieldBlur}
                placeholder={getPlaceholder(countrySubfield)}
                disabled={disabled}
                className={cn(
                  'h-10 transition-colors',
                  hasValue('country')
                    ? 'border-blue-300 bg-blue-50/50'
                    : 'border-orange-200',
                  error && 'border-destructive focus-visible:ring-destructive',
                )}
                aria-label={`${field.label}${ariaFragments.country}`}
                aria-required={isRequired}
              />
            </div>
          </div>
        </div>

        {field.helper_text && !error && (
          <p className="text-xs text-muted-foreground">{field.helper_text}</p>
        )}

        {error && (
          <p className="text-xs text-destructive font-medium" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  },
);

AddressInput.displayName = 'AddressInput';

export default AddressInput;

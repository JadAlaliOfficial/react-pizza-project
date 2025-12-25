// components/filters/AddressFilter.tsx
import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AddressFilterProps {
  fieldId: number;
  fieldLabel: string;
  onFilterChange: (fieldId: number, filterData: AddressFilterData | null) => void;
  initialFilter?: AddressFilterData;
}

export interface AddressFilterData {
  field: 'any' | 'city' | 'state' | 'country' | 'postalcode';
  value: string;
}

const AddressFilter: React.FC<AddressFilterProps> = ({
  fieldId,
  fieldLabel,
  onFilterChange,
  initialFilter,
}) => {
  const [searchField, setSearchField] = useState<AddressFilterData['field']>(
    initialFilter?.field || 'any'
  );
  const [searchValue, setSearchValue] = useState<string>(
    initialFilter?.value || ''
  );

  // Build filter data based on current state
  const buildFilterData = (): AddressFilterData | null => {
    const trimmedValue = searchValue.trim();
    
    if (!trimmedValue) {
      return null;
    }

    return {
      field: searchField,
      value: trimmedValue,
    };
  };

  // Update filter when values change
  useEffect(() => {
    const filterData = buildFilterData();
    onFilterChange(fieldId, filterData);
  }, [searchField, searchValue, fieldId]);

  const handleClear = () => {
    setSearchField('any');
    setSearchValue('');
    onFilterChange(fieldId, null);
  };

  const hasValue = searchValue.trim() !== '';

  // Get placeholder text based on search field
  const getPlaceholder = (): string => {
    switch (searchField) {
      case 'city':
        return 'Enter city name...';
      case 'state':
        return 'Enter state/province...';
      case 'country':
        return 'Enter country...';
      case 'postalcode':
        return 'Enter postal/zip code...';
      default:
        return 'Search address...';
    }
  };

  // Get helper text based on search field
  const getHelperText = (): string => {
    switch (searchField) {
      case 'city':
        return 'Filter by city name';
      case 'state':
        return 'Filter by state or province';
      case 'country':
        return 'Filter by country';
      case 'postalcode':
        return 'Filter by postal or zip code';
      default:
        return 'Search across all address fields';
    }
  };

  return (
    <div className="space-y-3 p-4 border border-gray-200 rounded-lg bg-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-gray-500" />
          <Label className="text-sm font-medium text-gray-700">
            {fieldLabel}
          </Label>
        </div>
        {hasValue && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Address Field Selector */}
      <div className="space-y-1.5">
        <Label htmlFor={`address-field-${fieldId}`} className="text-xs text-gray-600">
          Search Field
        </Label>
        <Select 
          value={searchField} 
          onValueChange={(val) => setSearchField(val as AddressFilterData['field'])}
        >
          <SelectTrigger id={`address-field-${fieldId}`} className="w-full">
            <SelectValue placeholder="Select field" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">All Fields</SelectItem>
            <SelectItem value="city">City</SelectItem>
            <SelectItem value="state">State/Province</SelectItem>
            <SelectItem value="country">Country</SelectItem>
            <SelectItem value="postalcode">Postal/Zip Code</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Address Search Input */}
      <div className="space-y-1.5">
        <Label htmlFor={`address-value-${fieldId}`} className="text-xs text-gray-600">
          Search Value
        </Label>
        <Input
          id={`address-value-${fieldId}`}
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder={getPlaceholder()}
          className="w-full"
        />
        <p className="text-xs text-gray-500 italic">
          {getHelperText()}
        </p>
      </div>

      {/* Field Type Indicator */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <p className="text-xs text-gray-400 italic">Address Input</p>
        {hasValue && (
          <span className="text-xs px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded">
            {searchField !== 'any' ? searchField.toUpperCase() : 'ALL'}
          </span>
        )}
      </div>
    </div>
  );
};

export default AddressFilter;

// components/filters/PhoneFilter.tsx
import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { X, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PhoneFilterProps {
  fieldId: number;
  fieldLabel: string;
  onFilterChange: (fieldId: number, filterData: PhoneFilterData | null) => void;
  initialFilter?: PhoneFilterData;
}

export interface PhoneFilterData {
  type: 'contains';
  value: string;
}

const PhoneFilter: React.FC<PhoneFilterProps> = ({
  fieldId,
  fieldLabel,
  onFilterChange,
  initialFilter,
}) => {
  const [searchValue, setSearchValue] = useState<string>(
    initialFilter?.value || ''
  );

  // Build filter data based on current state
  const buildFilterData = (): PhoneFilterData | null => {
    const trimmedValue = searchValue.trim();
    
    if (!trimmedValue) {
      return null;
    }

    return {
      type: 'contains',
      value: trimmedValue,
    };
  };

  // Update filter when value changes
  useEffect(() => {
    const filterData = buildFilterData();
    onFilterChange(fieldId, filterData);
  }, [searchValue, fieldId]);

  const handleClear = () => {
    setSearchValue('');
    onFilterChange(fieldId, null);
  };

  const hasValue = searchValue.trim() !== '';

  return (
    <div className="space-y-3 p-4 border border-gray-200 rounded-lg bg-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-gray-500" />
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

      {/* Phone Search Input */}
      <div className="space-y-1.5">
        <Label htmlFor={`phone-${fieldId}`} className="text-xs text-gray-600">
          Search Phone Number
        </Label>
        <Input
          id={`phone-${fieldId}`}
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder="Search phone number..."
          className="w-full"
        />
        <p className="text-xs text-gray-500 italic">
          Find phone numbers containing this value
        </p>
      </div>

      {/* Field Type Indicator */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <p className="text-xs text-gray-400 italic">Phone Input</p>
        {hasValue && (
          <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded font-mono">
            {searchValue}
          </span>
        )}
      </div>
    </div>
  );
};

export default PhoneFilter;

// components/filters/RadioDropdownFilter.tsx
import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X, ListChecks, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface RadioDropdownFilterProps {
  fieldId: number;
  fieldLabel: string;
  fieldTypeName: 'Radio Button' | 'Dropdown Select';
  options: string[]; // Available options for this field
  onFilterChange: (fieldId: number, filterData: RadioDropdownFilterData | null) => void;
  initialFilter?: RadioDropdownFilterData;
}

export interface RadioDropdownFilterData {
  options: string[];
}

const RadioDropdownFilter: React.FC<RadioDropdownFilterProps> = ({
  fieldId,
  fieldLabel,
  fieldTypeName,
  options,
  onFilterChange,
  initialFilter,
}) => {
  const [selectedOption, setSelectedOption] = useState<string>(
    initialFilter?.options?.[0] || ''
  );

  const isRadio = fieldTypeName === 'Radio Button';
  const FieldIcon = isRadio ? Circle : ListChecks;

  // Build filter data based on current state
  const buildFilterData = (): RadioDropdownFilterData | null => {
    if (!selectedOption) {
      return null;
    }

    return {
      options: [selectedOption],
    };
  };

  // Update filter when selection changes
  useEffect(() => {
    const filterData = buildFilterData();
    onFilterChange(fieldId, filterData);
  }, [selectedOption, fieldId]);

  const handleClear = () => {
    setSelectedOption('');
    onFilterChange(fieldId, null);
  };

  const hasValue = selectedOption !== '';

  return (
    <div className={cn(
      "space-y-3 p-4 rounded-lg border bg-white transition-all duration-200",
      hasValue ? "border-blue-200" : "border-gray-200"
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={cn(
            "p-1.5 rounded",
            hasValue ? "bg-blue-50" : "bg-gray-100"
          )}>
            <FieldIcon className={cn(
              "h-4 w-4",
              hasValue ? "text-blue-600" : "text-gray-500"
            )} />
          </div>
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

      {/* Option Selector */}
      <div className="space-y-1.5">
        <Label htmlFor={`option-${fieldId}`} className="text-xs text-gray-600">
          Select Option
        </Label>
        <Select 
          value={selectedOption} 
          onValueChange={setSelectedOption}
        >
          <SelectTrigger id={`option-${fieldId}`} className="w-full">
            <SelectValue placeholder="Select an option..." />
          </SelectTrigger>
          <SelectContent>
            {options.map((option, index) => (
              <SelectItem key={index} value={option}>
                {option}
              </SelectItem>
            ))}
            {options.length === 0 && (
              <SelectItem value="_no_options" disabled>
                No options available
              </SelectItem>
            )}
          </SelectContent>
        </Select>
        <p className="text-xs text-gray-500 italic">
          Filter entries with this selected value
        </p>
      </div>

      {/* Field Type Badge */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <p className="text-xs text-gray-400 italic">{fieldTypeName}</p>
        {hasValue && (
          <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded font-medium">
            {selectedOption}
          </span>
        )}
      </div>
    </div>
  );
};

export default RadioDropdownFilter;

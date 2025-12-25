// components/filters/MultiSelectFilter.tsx
import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { X, ListFilter, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface MultiSelectFilterProps {
  fieldId: number;
  fieldLabel: string;
  options: string[]; // Available options for this field
  onFilterChange: (fieldId: number, filterData: MultiSelectFilterData | null) => void;
  initialFilter?: MultiSelectFilterData;
}

export interface MultiSelectFilterData {
  options: string[];
}

const MultiSelectFilter: React.FC<MultiSelectFilterProps> = ({
  fieldId,
  fieldLabel,
  options,
  onFilterChange,
  initialFilter,
}) => {
  const [selectedOptions, setSelectedOptions] = useState<string[]>(
    initialFilter?.options || []
  );
  const [isOpen, setIsOpen] = useState(false);

  // Build filter data based on current state
  const buildFilterData = (): MultiSelectFilterData | null => {
    if (selectedOptions.length === 0) {
      return null;
    }

    return {
      options: selectedOptions,
    };
  };

  // Update filter when selection changes
  useEffect(() => {
    const filterData = buildFilterData();
    onFilterChange(fieldId, filterData);
  }, [selectedOptions, fieldId]);

  const handleToggleOption = (option: string) => {
    setSelectedOptions((prev) =>
      prev.includes(option)
        ? prev.filter((o) => o !== option)
        : [...prev, option]
    );
  };

  const handleClear = () => {
    setSelectedOptions([]);
    onFilterChange(fieldId, null);
  };

  const handleSelectAll = () => {
    if (selectedOptions.length === options.length) {
      setSelectedOptions([]);
    } else {
      setSelectedOptions([...options]);
    }
  };

  const hasValue = selectedOptions.length > 0;

  return (
    <div className={cn(
      "space-y-3 p-4 rounded-lg border bg-white transition-all duration-200",
      hasValue ? "border-purple-200" : "border-gray-200"
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={cn(
            "p-1.5 rounded",
            hasValue ? "bg-purple-50" : "bg-gray-100"
          )}>
            <ListFilter className={cn(
              "h-4 w-4",
              hasValue ? "text-purple-600" : "text-gray-500"
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

      {/* Multi-Select Popover */}
      <div className="space-y-1.5">
        <Label className="text-xs text-gray-600">
          Select Options
        </Label>
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={isOpen}
              className="w-full justify-between"
            >
              <span className="truncate">
                {selectedOptions.length === 0
                  ? 'Select options...'
                  : `${selectedOptions.length} selected`}
              </span>
              <ListFilter className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0" align="start">
            <div className="max-h-64 overflow-y-auto">
              {/* Select All Option */}
              <div className="flex items-center px-3 py-2 border-b hover:bg-gray-50">
                <Checkbox
                  id={`select-all-${fieldId}`}
                  checked={selectedOptions.length === options.length && options.length > 0}
                  onCheckedChange={handleSelectAll}
                  className="mr-2"
                />
                <label
                  htmlFor={`select-all-${fieldId}`}
                  className="text-sm font-medium cursor-pointer flex-1"
                >
                  Select All
                </label>
              </div>

              {/* Individual Options */}
              {options.map((option, index) => (
                <div
                  key={index}
                  className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleToggleOption(option)}
                >
                  <Checkbox
                    id={`option-${fieldId}-${index}`}
                    checked={selectedOptions.includes(option)}
                    onCheckedChange={() => handleToggleOption(option)}
                    className="mr-2"
                  />
                  <label
                    htmlFor={`option-${fieldId}-${index}`}
                    className="text-sm cursor-pointer flex-1"
                  >
                    {option}
                  </label>
                  {selectedOptions.includes(option) && (
                    <Check className="h-4 w-4 text-purple-600" />
                  )}
                </div>
              ))}

              {options.length === 0 && (
                <div className="px-3 py-6 text-center text-sm text-gray-500">
                  No options available
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>
        <p className="text-xs text-gray-500 italic">
          Filter entries containing any of the selected options
        </p>
      </div>

      {/* Selected Options Display */}
      {hasValue && (
        <div className="space-y-1.5">
          <Label className="text-xs text-gray-600">Selected:</Label>
          <div className="flex flex-wrap gap-1.5">
            {selectedOptions.map((option, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="bg-purple-50 text-purple-700 hover:bg-purple-100"
              >
                {option}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleOption(option);
                  }}
                  className="ml-1 hover:text-purple-900"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Field Type Indicator */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <p className="text-xs text-gray-400 italic">Multi-Select</p>
        {hasValue && (
          <span className="text-xs px-2 py-0.5 bg-purple-50 text-purple-700 rounded font-medium">
            {selectedOptions.length} option{selectedOptions.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>
    </div>
  );
};

export default MultiSelectFilter;

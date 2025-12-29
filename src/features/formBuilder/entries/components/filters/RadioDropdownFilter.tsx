// components/filters/RadioDropdownFilter.tsx
import React, { useEffect, useState } from 'react';
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

// ✅ Use the shared type from the registry (so it satisfies BaseFilterData)
import type { RadioDropdownFilterData } from '@/features/formBuilder/entries/utils/filterRegistry';

export type { RadioDropdownFilterData };

interface RadioDropdownFilterProps {
  fieldId: number;
  fieldLabel: string;

  // ✅ Make these optional so the component can still be registered cleanly
  fieldTypeName?: 'Radio Button' | 'Dropdown Select';
  options?: string[];

  onFilterChange: (fieldId: number, filterData: RadioDropdownFilterData | null) => void;
  initialFilter?: RadioDropdownFilterData;
}

const RadioDropdownFilter: React.FC<RadioDropdownFilterProps> = ({
  fieldId,
  fieldLabel,
  fieldTypeName = 'Dropdown Select',
  options = [],
  onFilterChange,
  initialFilter,
}) => {
  const [selectedOption, setSelectedOption] = useState<string>('');

  // ✅ Sync when parent loads/switches/clears filters
  useEffect(() => {
    const next = initialFilter?.options?.[0] ?? '';
    setSelectedOption(next);
  }, [initialFilter?.options?.[0]]);

  // ✅ If the available options change and current selection becomes invalid → clear it
  useEffect(() => {
    if (!selectedOption) return;
    if (options.length > 0 && !options.includes(selectedOption)) {
      setSelectedOption('');
      onFilterChange(fieldId, null);
    }
  }, [options, selectedOption, fieldId, onFilterChange]);

  const isRadio = fieldTypeName === 'Radio Button';
  const FieldIcon = isRadio ? Circle : ListChecks;

  const emit = (value: string) => {
    const v = value.trim();

    // ignore placeholder / disabled item
    if (!v || v === '_no_options') {
      onFilterChange(fieldId, null);
      return;
    }

    onFilterChange(fieldId, { options: [v] });
  };

  const handleClear = () => {
    setSelectedOption('');
    onFilterChange(fieldId, null);
  };

  const hasValue = selectedOption !== '';

  return (
    <div
      className={cn(
        'space-y-3 p-4 rounded-lg border bg-white transition-all duration-200',
        hasValue ? 'border-blue-200' : 'border-gray-200'
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={cn('p-1.5 rounded', hasValue ? 'bg-blue-50' : 'bg-gray-100')}>
            <FieldIcon className={cn('h-4 w-4', hasValue ? 'text-blue-600' : 'text-gray-500')} />
          </div>
          <Label className="text-sm font-medium text-gray-700">{fieldLabel}</Label>
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

      <div className="space-y-1.5">
        <Label htmlFor={`option-${fieldId}`} className="text-xs text-gray-600">
          Select Option
        </Label>

        <Select
          value={selectedOption}
          onValueChange={(val) => {
            setSelectedOption(val);
            emit(val); // ✅ emit directly (no useEffect loop)
          }}
        >
          <SelectTrigger id={`option-${fieldId}`} className="w-full">
            <SelectValue placeholder="Select an option..." />
          </SelectTrigger>

          <SelectContent>
            {options.length > 0 ? (
              options.map((option, index) => (
                <SelectItem key={index} value={option}>
                  {option}
                </SelectItem>
              ))
            ) : (
              <SelectItem value="_no_options" disabled>
                No options available
              </SelectItem>
            )}
          </SelectContent>
        </Select>

        <p className="text-xs text-gray-500 italic">Filter entries with this selected value</p>
      </div>

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

// components/filters/TextFilter.tsx

import React, { useEffect, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X, Type } from 'lucide-react';
import { Button } from '@/components/ui/button';

import type {
  FilterComponentProps,
  TextFilterData,
} from '../../utils/filterRegistry';

export type { TextFilterData };

const DEFAULT_TYPE: TextFilterData['type'] = 'contains';

const TextFilter: React.FC<FilterComponentProps<TextFilterData>> = ({
  fieldId,
  fieldLabel,
  onFilterChange,
  initialFilter,
}) => {
  const [searchType, setSearchType] = useState<TextFilterData['type']>(
    initialFilter?.type ?? DEFAULT_TYPE,
  );
  const [searchValue, setSearchValue] = useState<string>(
    initialFilter?.value ?? '',
  );

  const emit = (nextType: TextFilterData['type'], nextValue: string) => {
    const trimmed = nextValue.trim();

    if (!trimmed) {
      onFilterChange(fieldId, null);
      return;
    }

    onFilterChange(fieldId, {
      type: nextType,
      value: trimmed,
    });
  };

  const hasValue = searchValue.trim() !== '';

  // Keep the UI in sync when the parent resets/loads filters.
  // (e.g., Clear All, Discard changes, restoring saved filters)
  useEffect(() => {
    const nextType = initialFilter?.type ?? DEFAULT_TYPE;
    const nextValue = initialFilter?.value ?? '';

    setSearchType(nextType);
    setSearchValue(nextValue);
  }, [fieldId, initialFilter?.type, initialFilter?.value]);

  const handleClear = () => {
    setSearchType(DEFAULT_TYPE);
    setSearchValue('');
    onFilterChange(fieldId, null);
  };

  const getPlaceholder = (): string => {
    switch (searchType) {
      case 'equals':
        return 'Enter exact text...';
      case 'startswith':
        return 'Enter starting text...';
      case 'endswith':
        return 'Enter ending text...';
      case 'notcontains':
        return 'Enter excluded text...';
      default:
        return 'Search text...';
    }
  };

  const getHelperText = (): string => {
    switch (searchType) {
      case 'equals':
        return 'Find exact matches only';
      case 'startswith':
        return 'Find text that starts with this value';
      case 'endswith':
        return 'Find text that ends with this value';
      case 'notcontains':
        return 'Exclude entries containing this text';
      default:
        return 'Find text containing this value';
    }
  };

  return (
    <div className="space-y-3 p-4 border border-gray-200 rounded-lg bg-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Type className="h-4 w-4 text-gray-500" />
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

      <div className="space-y-1.5">
        <Label
          htmlFor={`search-type-${fieldId}`}
          className="text-xs text-gray-600"
        >
          Search Type
        </Label>
        <Select
          value={searchType}
          onValueChange={(val) => {
            const nextType = val as TextFilterData['type'];
            setSearchType(nextType);
            emit(nextType, searchValue);
          }}
        >
          <SelectTrigger id={`search-type-${fieldId}`} className="w-full">
            <SelectValue placeholder="Select search type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="contains">Contains</SelectItem>
            <SelectItem value="equals">Equals</SelectItem>
            <SelectItem value="startswith">Starts With</SelectItem>
            <SelectItem value="endswith">Ends With</SelectItem>
            <SelectItem value="notcontains">Does Not Contain</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label
          htmlFor={`search-value-${fieldId}`}
          className="text-xs text-gray-600"
        >
          Search Value
        </Label>
        <Input
          id={`search-value-${fieldId}`}
          type="text"
          value={searchValue}
          onChange={(e) => {
            const nextValue = e.target.value;
            setSearchValue(nextValue);
            emit(searchType, nextValue);
          }}
          placeholder={getPlaceholder()}
          className="w-full"
        />

        <p className="text-xs text-gray-500 italic">{getHelperText()}</p>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <p className="text-xs text-gray-400 italic">Text Input</p>
        {hasValue && (
          <span className="text-xs px-2 py-0.5 bg-slate-50 text-slate-700 rounded">
            {searchType.toUpperCase()}
          </span>
        )}
      </div>
    </div>
  );
};

export default TextFilter;

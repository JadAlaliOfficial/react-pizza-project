/**
 * /src/features/entries/components/MainFilters.tsx
 *
 * Component for main/global filters that apply to all entries.
 * Includes date range, date type, and is_considered boolean filter.
 * Uses local state and only reports changes to parent via callback.
 */

import React, { useEffect, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Calendar, Filter } from 'lucide-react';

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Main filters data structure.
 * These are the global filters that apply to all entries (not field-specific).
 */
export interface MainFiltersData {
  dateFrom: string; // Format: YYYY-MM-DD
  dateTo: string; // Format: YYYY-MM-DD
  dateType: string; // e.g., "submission", "updated", "created"
  isConsidered: boolean | undefined; // undefined means "all", true/false filters specifically
}

/**
 * Props for MainFilters component
 */
interface MainFiltersProps {
  /**
   * Callback fired whenever filter values change.
   * Parent receives the complete current state.
   */
  onChange: (filters: MainFiltersData) => void;

  /**
   * Controlled value.
   * If provided, this component will render from it and will NOT keep local state.
   */
  value?: MainFiltersData;

  /**
   * Initial filter values.
   * Used for loading saved filters or setting defaults.
   */
  initialFilters?: Partial<MainFiltersData>;

  /**
   * Whether to show the card wrapper.
   * Set to false if you're embedding this in another card.
   * @default true
   */
  showCard?: boolean;
}

// ============================================================================
// Default Values
// ============================================================================

const DEFAULT_FILTERS: MainFiltersData = {
  dateFrom: '',
  dateTo: '',
  dateType: 'submission',
  isConsidered: undefined,
};

// ============================================================================
// Component
// ============================================================================

const MainFilters: React.FC<MainFiltersProps> = ({
  onChange,
  value,
  initialFilters,
  showCard = true,
}) => {
  const isControlled = value !== undefined;

  // Uncontrolled fallback (kept for backwards compatibility)
  const [uncontrolledFilters, setUncontrolledFilters] =
    useState<MainFiltersData>({
      ...DEFAULT_FILTERS,
      ...initialFilters,
    });

  // If parent changes initialFilters (e.g., reset), keep local state in sync.
  useEffect(() => {
    if (isControlled) return;
    setUncontrolledFilters({
      ...DEFAULT_FILTERS,
      ...initialFilters,
    });
  }, [initialFilters, isControlled]);

  const filters: MainFiltersData = isControlled
    ? (value as MainFiltersData)
    : uncontrolledFilters;

  // Unified setter that works for both controlled and uncontrolled usage.
  const setFilters = (updater: (prev: MainFiltersData) => MainFiltersData) => {
    const next = updater(filters);
    if (!isControlled) {
      setUncontrolledFilters(next);
    }
    onChange(next);
  };

  // ========== Event Handlers ==========

  const handleDateFromChange = (value: string) => {
    setFilters((prev) => ({ ...prev, dateFrom: value }));
  };

  const handleDateToChange = (value: string) => {
    setFilters((prev) => ({ ...prev, dateTo: value }));
  };

  const handleDateTypeChange = (value: string) => {
    setFilters((prev) => ({ ...prev, dateType: value }));
  };

  const handleIsConsideredChange = (checked: boolean) => {
    setFilters((prev) => ({
      ...prev,
      // Toggle: checked -> true, unchecked -> undefined (show all)
      isConsidered: checked ? true : undefined,
    }));
  };

  /**
   * Validates date range (dateFrom should not be after dateTo).
   * Returns true if valid or if dates are empty.
   */
  const isDateRangeValid = (): boolean => {
    if (!filters.dateFrom || !filters.dateTo) {
      return true;
    }
    return new Date(filters.dateFrom) <= new Date(filters.dateTo);
  };

  // ========== Render Helpers ==========

  const renderDateFromField = () => (
    <div className="space-y-2">
      <Label htmlFor="date-from" className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-muted-foreground" />
        Date From
      </Label>
      <Input
        id="date-from"
        type="date"
        value={filters.dateFrom}
        onChange={(e) => handleDateFromChange(e.target.value)}
        max={filters.dateTo || undefined} // Prevent selecting date after dateTo
        className={!isDateRangeValid() ? 'border-red-500' : ''}
      />
      {filters.dateFrom && (
        <p className="text-xs text-muted-foreground">
          From: {new Date(filters.dateFrom).toLocaleDateString()}
        </p>
      )}
    </div>
  );

  const renderDateToField = () => (
    <div className="space-y-2">
      <Label htmlFor="date-to" className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-muted-foreground" />
        Date To
      </Label>
      <Input
        id="date-to"
        type="date"
        value={filters.dateTo}
        onChange={(e) => handleDateToChange(e.target.value)}
        min={filters.dateFrom || undefined} // Prevent selecting date before dateFrom
        className={!isDateRangeValid() ? 'border-red-500' : ''}
      />
      {filters.dateTo && (
        <p className="text-xs text-muted-foreground">
          To: {new Date(filters.dateTo).toLocaleDateString()}
        </p>
      )}
      {!isDateRangeValid() && (
        <p className="text-xs text-red-500">
          "Date To" must be after "Date From"
        </p>
      )}
    </div>
  );

  const renderDateTypeField = () => (
    <div className="space-y-2">
      <Label htmlFor="date-type">Date Type</Label>
      <Select value={filters.dateType} onValueChange={handleDateTypeChange}>
        <SelectTrigger id="date-type">
          <SelectValue placeholder="Select date type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="submission">Submission Date</SelectItem>
          <SelectItem value="created">Created Date</SelectItem>
          <SelectItem value="updated">Updated Date</SelectItem>
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground italic">
        Filter entries by this date field
      </p>
    </div>
  );

  const renderIsConsideredField = () => (
    <div className="space-y-2">
      <div className="flex items-center space-x-2 h-10">
        <Checkbox
          id="is-considered"
          checked={filters.isConsidered === true}
          onCheckedChange={handleIsConsideredChange}
        />
        <Label
          htmlFor="is-considered"
          className="cursor-pointer font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Show only considered entries
        </Label>
      </div>
      <p className="text-xs text-muted-foreground italic">
        {filters.isConsidered === true
          ? 'Showing only entries marked as considered'
          : 'Showing all entries (considered and not considered)'}
      </p>
    </div>
  );

  const renderContent = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {renderDateFromField()}
      {renderDateToField()}
      {renderDateTypeField()}
      {renderIsConsideredField()}
    </div>
  );

  // ========== Main Render ==========

  if (!showCard) {
    return renderContent();
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-muted-foreground" />
          <div>
            <CardTitle>Main Filters</CardTitle>
            <CardDescription>
              Filter entries by date range and consideration status
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>{renderContent()}</CardContent>
    </Card>
  );
};

export default MainFilters;

// ============================================================================
// Helper Function for External Use
// ============================================================================

/**
 * Creates default main filters data.
 * Useful for initializing state or resetting filters.
 *
 * @returns Default MainFiltersData object
 */
export function createDefaultMainFilters(): MainFiltersData {
  return { ...DEFAULT_FILTERS };
}

/**
 * Checks if any main filters are active (non-default).
 * Useful for showing "active filters" indicator.
 *
 * @param filters - Main filters to check
 * @returns True if any filter has a non-default value
 */
export function hasActiveMainFilters(filters: MainFiltersData): boolean {
  return (
    filters.dateFrom !== '' ||
    filters.dateTo !== '' ||
    filters.dateType !== 'submission' ||
    filters.isConsidered === true
  );
}

/**
 * Counts the number of active main filters.
 * Useful for badge display ("2 active filters").
 *
 * @param filters - Main filters to count
 * @returns Number of active filters
 */
export function countActiveMainFilters(filters: MainFiltersData): number {
  let count = 0;

  if (filters.dateFrom) count++;
  if (filters.dateTo) count++;
  if (filters.dateType !== 'submission') count++;
  if (filters.isConsidered === true) count++;

  return count;
}

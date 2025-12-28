import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useCurrentStore } from '@/components/layouts/mainLayout/CurrentStoreContext';
import { useDsprApi } from '../../../../DSPR/hooks/useDsprApi';
import { SingleDatePicker } from '@/components/ui/singleDatePicker';

interface StoreDatesFilterProps {
  className?: string;
  onFilterChange?: (filters: { date: string }) => void;
  onError?: (error: string | null) => void;
}

export const StoreDatesFilter: React.FC<StoreDatesFilterProps> = ({
  className = '',
  onFilterChange,
  onError,
}) => {
  const { currentStore } = useCurrentStore();

  const { fetchData: fetchDsprData, clearError } = useDsprApi();

  // Error state management
  const [, setError] = useState<string | null>(null);

  // Stable error handler to prevent useEffect loops
  const handleError = useCallback(
    (error: string | null) => {
      setError(error);
      if (onError) {
        onError(error);
      }
    },
    [onError],
  );

  const isValidDate = (dateString: string): boolean => {
    if (!dateString) return false;

    // Parse components and build a LOCAL date at midnight
    const [y, m, d] = dateString.split('-').map(Number);
    const selected = new Date(y, m - 1, d); // local midnight (no timezone shift)

    // Today at local midnight
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return selected < today; // strictly before today
  };

  const formatLocalYmd = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const getTwoDaysAgoLocal = () => {
    const now = new Date();
    const twoDaysAgo = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - 2,
    );
    return formatLocalYmd(twoDaysAgo);
  };

  // For your max (yesterday):
  const now = new Date();
  const yesterday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - 1,
  );

  const [selectedDate, setSelectedDate] =
    useState<Date | undefined>(new Date(getTwoDaysAgoLocal()));

  // Helper function to send data to DSPR API
  const sendToDsprApi = useCallback(
    async (
      storeId: string,
      date: Date,
      context: string = 'filter-update',
    ) => {
      try {
        if (storeId && date) {
          const dateString = formatLocalYmd(date);
          await fetchDsprData(
            { store: storeId, date: dateString }
          );
          console.log(`[${context}] DSPR API call initiated:`, {
            store: storeId,
            date: dateString,
          });
          handleError(null);
          clearError();
        }
      } catch (error) {
        const errorMessage = 'Date Error: No data available for the selected date at this store. Please select another date.';
        console.error(`[${context}] DSPR API call failed:`, error);
        handleError(errorMessage);
      }
    },
    [fetchDsprData, handleError, clearError],
  );

  // Keep latest function without re-render loops
  const sendToDsprApiRef = useRef(sendToDsprApi);
  sendToDsprApiRef.current = sendToDsprApi;

  

  // Handle store context errors
  useEffect(() => {
    if (!currentStore) {
      handleError('No store selected. Please select a store to continue.');
    } else {
      handleError(null); // Clear error when store is available
    }
  }, [currentStore, handleError]);

  const handleDateChange = (date: Date | undefined) => {
    if (!date) return;
    const ymd = formatLocalYmd(date);
    if (!isValidDate(ymd)) {
      const errorMessage = 'Invalid date selected. Please select a date before today.';
      handleError(errorMessage);
      return;
    }
    handleError(null);
    setSelectedDate(date);
    if (onFilterChange) {
      onFilterChange({
        date: ymd,
      });
    }
  };

  

  // Centralized DSPR call ONLY when applied filters change
  useEffect(() => {
    if (currentStore?.id && selectedDate) {
      // Additional validation before making API call
      if (isValidDate(formatLocalYmd(selectedDate))) {
        sendToDsprApiRef.current(
          currentStore.id,
          selectedDate,
          'filters-changed',
        );
      } else {
        // Handle invalid date for API call
        const errorMessage = 'Cannot make API call with invalid date.';
        handleError(errorMessage);
      }
    }
  }, [currentStore?.id, selectedDate, handleError]);

  if (!currentStore) {
    return (
      <Card className={`bg-yellow-50 border-yellow-200 ${className}`}>
        <CardContent className="p-4">
          <p className="text-yellow-800">
            Please select a store to view filters.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-card border-border shadow-sm ${className}`}>
      <CardHeader className="px-4 py-2">
        <div className="flex items-center justify-between w-full">
          <CardTitle className="text-sm sm:text-base md:text-lg text-card-foreground">
            {currentStore.name}
          </CardTitle>
          <SingleDatePicker
            value={selectedDate}
            onChange={handleDateChange}
            maxDate={yesterday}
            placeholder="Select date"
            className="w-40 bg-background border-border text-foreground focus:ring-ring focus:border-ring text-sm"
          />
        </div>
      </CardHeader>
    </Card>
  );
};

export default StoreDatesFilter;

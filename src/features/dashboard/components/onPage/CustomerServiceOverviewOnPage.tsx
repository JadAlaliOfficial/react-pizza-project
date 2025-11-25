import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { PerformanceGrid } from '@/features/dashboard/components/performance/PerformanceGridFour';
import type { PerformanceItemProps } from '@/features/dashboard/types/performance';
import { useDailyDspr } from '@/features/DSPR/hooks/useDailyDspr';
import { useWeeklyDspr } from '@/features/DSPR/hooks/useWeeklyDspr';
import { useDsprApi } from '@/features/DSPR/hooks/useDsprApi';
import { useIsMobile } from '@/hooks/use-mobile';

import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface CustomerServiceOverviewProps {
  title?: string;
  subtitle?: string;
  className?: string;
}

export const CustomerServiceOverview: React.FC<
  CustomerServiceOverviewProps
> = ({ title = 'Customer Services Overview', subtitle, className }) => {
  const isMobile = useIsMobile();

  // Use DSPR hooks to get dynamic data
  const { raw: dailyRawData } = useDailyDspr();
  const { raw: weeklyRawData } = useWeeklyDspr();
  const { isLoading, error } = useDsprApi();

  // Helper function to format percentage values
  const formatPercentage = (value: number | null | undefined): string => {
    if (value === null || value === undefined) return '0%';
    return `${(value * 100).toFixed(1)}%`;
  };

  // Helper function to format number values
  const formatNumber = (value: number | null | undefined): string => {
    if (value === null || value === undefined) return '0';
    return value.toString();
  };

  // Transform DSPR data into performance metrics format
  const transformedData = useMemo((): PerformanceItemProps[] => {
    // First row of metrics - using dynamic data
    const firstRowData: PerformanceItemProps[] = [
      {
        title: 'Customer Count',
        bgColor: 'bg-performance-bg-1',
        icon: 'users',
        daily: formatNumber(dailyRawData?.Customer_count),
        weekly: formatNumber(weeklyRawData?.Customercount),
      },
      {
        title: 'Customer Count %',
        bgColor: 'bg-performance-bg-2',
        icon: 'trending',
        daily: formatPercentage(dailyRawData?.Customer_count_percent),
        weekly: formatPercentage(weeklyRawData?.Customercountpercent),
      },
      {
        title: 'Upselling %',
        bgColor: 'bg-performance-bg-3',
        icon: 'arrowUp',
        daily: formatPercentage(dailyRawData?.Upselling),
        weekly: formatPercentage(weeklyRawData?.Upselling),
      },
      {
        title: 'Digital Sales %',
        bgColor: 'bg-performance-bg-4',
        icon: 'computer',
        daily: formatPercentage(dailyRawData?.Digital_Sales_Percent),
        weekly: formatPercentage(weeklyRawData?.DigitalSalesPercent),
      },
    ];

    // Second row of metrics - using dynamic data
    const secondRowData: PerformanceItemProps[] = [
      {
        title: 'Customer Service %',
        bgColor: 'bg-performance-bg-5',
        icon: 'microphone',
        daily: formatPercentage(dailyRawData?.Customer_Service),
        weekly: formatPercentage(weeklyRawData?.CustomerService),
      },
      {
        title: 'Put Into Portal %',
        bgColor: 'bg-performance-bg-6',
        icon: 'arrowUp',
        daily: formatPercentage(dailyRawData?.Put_into_Portal_Percent),
        weekly: formatPercentage(weeklyRawData?.PutintoPortalPercent),
      },
      {
        title: 'In Portal On Time %',
        bgColor: 'bg-performance-bg-7',
        icon: 'clock',
        daily: formatPercentage(dailyRawData?.In_Portal_on_Time_Percent),
        weekly: formatPercentage(weeklyRawData?.InPortalonTimePercent),
      },
      {
        title: 'Portal Eligible Transactions',
        bgColor: 'bg-performance-bg-8',
        icon: 'document',
        daily: formatNumber(dailyRawData?.Total_Portal_Eligible_Transactions),
        weekly: formatNumber(weeklyRawData?.TotalPortalEligibleTransactions),
      },
    ];

    return [...firstRowData, ...secondRowData];
  }, [dailyRawData, weeklyRawData]);

  const hasData = !!(dailyRawData || weeklyRawData);

  // Error state component
  const ErrorState = () => (
    <div
      className={cn(
        'w-full bg-card rounded-lg border border-destructive/20 p-6 shadow-realistic',
        'flex flex-col items-center justify-center text-center space-y-4',
        isMobile ? 'min-h-48' : 'min-h-64',
      )}
    >
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-destructive/10">
        <ExclamationTriangleIcon className="w-6 h-6 text-destructive" />
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-card-foreground">
          Unable to Load Data
        </h3>
        <p className="text-sm text-muted-foreground max-w-md">
          We're experiencing difficulties loading your customer service metrics.
          This could be due to a temporary connection issue or data processing
          error.
        </p>
        <p className="font-bold mt-1">Try changing the Date filter.</p>
      </div>
    </div>
  );

  // No data state component
  const NoDataState = () => (
    <div
      className={cn(
        'w-full bg-card rounded-lg border border-border p-6 shadow-realistic',
        'flex flex-col items-center justify-center text-center space-y-4',
        isMobile ? 'min-h-48' : 'min-h-64',
      )}
    >
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-muted">
        <ExclamationTriangleIcon className="w-6 h-6 text-muted-foreground" />
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-card-foreground">
          No Data Available
        </h3>
        <p className="text-sm text-muted-foreground max-w-md">
          There's currently no customer service data available to display.
          Please check back later or contact support if this issue persists.
        </p>
        <p className="font-bold mt-1">Try changing the Date filter.</p>
      </div>
    </div>
  );

  return (
    <section
      className={cn(
        'w-full p-2 space-y-2',
        // Responsive padding and spacing
        isMobile ? ' space-y-2' : ' space-y-6',
        className,
      )}
    >
      <SectionHeader title={title} subtitle={subtitle} />

      {/* Handle error states */}
      {error ? (
        <ErrorState />
      ) : !hasData || !transformedData || transformedData.length === 0 ? (
        <NoDataState />
      ) : (
        <div className="space-y-6">
          <PerformanceGrid
            data={transformedData.slice(0, 4)}
            isLoading={isLoading}
          />
          <PerformanceGrid
            data={transformedData.slice(4, 8)}
            isLoading={isLoading}
          />
        </div>
      )}
    </section>
  );
};

import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { PerformanceGridFive } from '@/features/dashboard/components/performance/PerformanceGridFive';
import { useDailyDspr } from '@/features/DSPR/hooks/useDailyDspr';
import { useWeeklyDspr } from '@/features/DSPR/hooks/useWeeklyDspr';
import { useDsprApi } from '@/features/DSPR/hooks/useDsprApi';
import { useIsMobile } from '@/hooks/use-mobile';
import type { PerformanceItemProps } from '@/features/dashboard/types/performance';

import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface InfoSectionProps {
  title?: string;
  subtitle?: string;
  data?: PerformanceItemProps[];
  className?: string;
  showRefresh?: boolean;
}

export const InfoSection: React.FC<InfoSectionProps> = ({
  title = 'Sales Performance Overview',
  subtitle,
  data: externalData,
  className,
}) => {
  const { raw: dailyRawData } = useDailyDspr();
  const { raw: weeklyRawData } = useWeeklyDspr();
  const { isLoading, error } = useDsprApi();
  const isMobile = useIsMobile();

  // Transform DSPR data into performance metrics format
  const transformedData = useMemo((): PerformanceItemProps[] => {
    // Helper function to format currency values
    const formatCurrency = (value: number | null | undefined): string => {
      if (value === null || value === undefined || isNaN(value)) {
        return '$0';
      }

      // Handle negative values for over/short
      const absValue = Math.abs(value);
      const sign = value < 0 ? '-' : '';

      if (absValue >= 1000) {
        return `${sign}$${(absValue / 1000).toFixed(2)}k`;
      }

      return `${sign}$${absValue.toFixed(2)}`;
    };

    // Helper function to format quantity values
    const formatQuantity = (value: number | null | undefined): string => {
      if (value === null || value === undefined || isNaN(value)) {
        return '0';
      }

      return Math.round(value).toString();
    };

    // Extract daily values with fallbacks
    const dailyWasteAlta = dailyRawData?.Waste_Alta ?? 0;
    const dailyWasteGateway = dailyRawData?.waste_gateway ?? 0;
    const dailyOverShort = dailyRawData?.over_short ?? 0;
    const dailyModifiedOrders = dailyRawData?.Modified_Order_Qty ?? 0;
    const dailyCashVsDeposite =
      dailyRawData?.Cash_Sales_Vs_Deposite_Difference ?? 0;

    // Extract weekly values with fallbacks
    const weeklyWasteAlta = weeklyRawData?.WasteAlta ?? 0;
    const weeklyWasteGateway = weeklyRawData?.wastegateway ?? 0;
    const weeklyOverShort = weeklyRawData?.overshort ?? 0;
    const weeklyModifiedOrders = weeklyRawData?.ModifiedOrderQty ?? 0;
    const weeklyCashVsDeposite =
      weeklyRawData?.CashSalesVsDepositeDifference ?? 0;

    return [
      {
        title: 'Waste Altmetrics',
        bgColor: 'bg-blue-500',
        icon: 'FlowbiteChartLineDownOutline',
        daily: formatCurrency(dailyWasteAlta),
        weekly: formatCurrency(weeklyWasteAlta),
      },
      {
        title: 'Waste Gateway',
        bgColor: 'bg-blue-400',
        icon: 'IconParkOutlineRecycling',
        daily: formatCurrency(dailyWasteGateway),
        weekly: formatCurrency(weeklyWasteGateway),
      },
      {
        title: 'Over / Short',
        bgColor: 'bg-blue-300',
        icon: 'TablerPlusMinus',
        daily: formatCurrency(dailyOverShort),
        weekly: formatCurrency(weeklyOverShort),
      },
      {
        title: 'Modified Orders',
        bgColor: 'bg-green-200',
        icon: 'Fa6SolidPencil',
        daily: formatQuantity(dailyModifiedOrders),
        weekly: formatQuantity(weeklyModifiedOrders),
      },
      {
        title: 'Cash vs Deposite',
        bgColor: 'bg-green-200',
        icon: 'Fa6SolidPencil',
        daily: formatCurrency(dailyCashVsDeposite),
        weekly: formatCurrency(weeklyCashVsDeposite),
      },
    ];
  }, [dailyRawData, weeklyRawData]);

  const data = externalData || transformedData;
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
          We're experiencing difficulties loading your performance metrics. This
          could be due to a temporary connection issue or data processing error.
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
          There's currently no performance data available to display. Please
          check back later or contact support if this issue persists.
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
      ) : !hasData || !data || data.length === 0 ? (
        <NoDataState />
      ) : (
        <PerformanceGridFive data={data} isLoading={isLoading} />
      )}
    </section>
  );
};

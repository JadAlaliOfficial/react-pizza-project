import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { PerformanceGridFive } from '@/features/dashboard/components/performance/PerformanceGridFive';
import { useDailyDspr } from '@/features/DSPR/hooks/useDailyDspr';
import { useWeeklyDspr } from '@/features/DSPR/hooks/useWeeklyDspr';
import { useDsprApi } from '@/features/DSPR/hooks/useDsprApi';
import { useIsMobile } from '@/hooks/use-mobile';
import type { CardDataProps } from '@/features/dashboard/types/infoCards';
import type { PerformanceItemProps } from '@/features/dashboard/types/performance';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
// } from 'recharts';

interface InfoCardsProps {
  title?: string;
  subtitle?: string;
  data?: CardDataProps[];
  className?: string;
  showRefresh?: boolean;
}

export const InfoCards: React.FC<InfoCardsProps> = ({
  title = 'Business Overview',
  subtitle,
  data: externalData,
  className,
}) => {
  const { raw: dailyRawData } = useDailyDspr();
  const { raw: weeklyRawData } = useWeeklyDspr();
  const { isLoading, error } = useDsprApi();
  const isMobile = useIsMobile();
  const hasData = !!(dailyRawData || weeklyRawData);

  // Transform DSPR data to CardDataProps format
  const data = useMemo((): CardDataProps[] => {
    if (externalData) return externalData;
    if (!hasData || !dailyRawData) {
      return [];
    }

    // Format currency values
    const formatCurrency = (value: number) =>
      new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(value);

    // Format percentage values
    const formatPercentage = (value: number) => `${(value * 100).toFixed(1)}%`;

    return [
      {
        title: 'Total Sales',
        bgColor: 'bg-blue-500',
        daily: formatCurrency(dailyRawData.Total_Sales || 0),
        weekly: formatCurrency(weeklyRawData?.TotalSales || 0),
        icon: 'currency',
        id: 'sales-1',
      },
      {
        title: 'Total Tips',
        bgColor: 'bg-blue-400',
        daily: formatCurrency(dailyRawData.Total_TIPS || 0),
        weekly: formatCurrency(weeklyRawData?.TotalTIPS || 0),
        icon: 'currency',
        id: 'tips-1',
      },
      {
        title: 'Labor Cost',
        bgColor: 'bg-blue-300',
        daily: formatPercentage(dailyRawData.labor || 0),
        weekly: formatPercentage(weeklyRawData?.labor || 0),
        icon: 'users',
        id: 'labor-1',
      },
      {
        title: 'Refunded Order Qty',
        bgColor: 'bg-green-200',
        daily: formatCurrency(dailyRawData.Refunded_order_Qty || 0),
        weekly: formatCurrency(weeklyRawData?.RefundedorderQty || 0),
        icon: 'trending',
        id: 'refunded-1',
      },
      {
        title: 'Average Ticket',
        bgColor: 'bg-green-200',
        daily: formatCurrency(dailyRawData.Avrage_ticket || 0),
        weekly: formatCurrency(weeklyRawData?.Avrageticket || 0),
        icon: 'trending',
        id: 'avrage-ticket-1',
      },
    ];
  }, [externalData, dailyRawData, weeklyRawData, hasData]);

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
          We're experiencing difficulties loading your business metrics. This
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
          There's currently no business data available to display. Please check
          back later or contact support if this issue persists.
        </p>
        <p className="font-bold mt-1">Try changing the Date filter.</p>
      </div>
    </div>
  );

  // Transform CardDataProps to PerformanceItemProps
  const transformedData: PerformanceItemProps[] = data.map((card) => {
    // Map card icons to performance iconMap keys
    let performanceIcon: keyof typeof import('@/features/dashboard/types/performance').iconMap;

    switch (card.icon) {
      case 'chart':
        performanceIcon = 'FlowbiteChartLineDownOutline';
        break;
      case 'currency':
        performanceIcon = 'currency';
        break;
      case 'trophy':
        performanceIcon = 'trophy';
        break;
      case 'trending':
        performanceIcon = 'trending';
        break;
      default:
        // Map based on card title for better semantic matching
        if (card.title.toLowerCase().includes('sales')) {
          performanceIcon = 'FlowbiteChartLineDownOutline';
        } else if (card.title.toLowerCase().includes('tips')) {
          performanceIcon = 'currency';
        } else if (card.title.toLowerCase().includes('labor')) {
          performanceIcon = 'users';
        } else if (card.title.toLowerCase().includes('refunded')) {
          performanceIcon = 'IconParkOutlineRecycling';
        } else if (
          card.title.toLowerCase().includes('average') ||
          card.title.toLowerCase().includes('ticket')
        ) {
          performanceIcon = 'trending';
        } else {
          performanceIcon = 'FlowbiteChartLineDownOutline';
        }
    }

    return {
      title: card.title,
      daily: card.daily,
      weekly: card.weekly,
      bgColor: card.bgColor || '#f3f4f6',
      icon: performanceIcon,
    };
  });

  // Random data for the bar chart
  // const chartData = [
  //   { name: 'Page A', uv: 4000, pv: 2400, amt: 2400 },
  //   { name: 'Page B', uv: 3000, pv: 1398, amt: 2210 },
  //   { name: 'Page C', uv: 2000, pv: 9800, amt: 2290 },
  //   { name: 'Page D', uv: 2780, pv: 3908, amt: 2000 },
  //   { name: 'Page E', uv: 1890, pv: 4800, amt: 2181 },
  //   { name: 'Page F', uv: 2390, pv: 3800, amt: 2500 },
  //   { name: 'Page G', uv: 3490, pv: 4300, amt: 2100 },
  // ];

  return (
    <section
      className={cn(
        'w-full',
        // Responsive padding and spacing
        isMobile ? 'p-2 space-y-2' : 'p-2 space-y-6',
        className,
      )}
    >
      <SectionHeader title={title} subtitle={subtitle} />

      {/* Main content area with cards on top and chart below */}
      <div className="flex flex-col gap-6">
        {/* Handle error states */}
        {error ? (
          <ErrorState />
        ) : !hasData || data.length === 0 ? (
          <NoDataState />
        ) : (
          <>
            {/* Top - Cards */}
            <div className="w-full">
              <PerformanceGridFive
                data={transformedData}
                isLoading={isLoading}
              />
            </div>

            {/* Bottom - Bar Chart */}
            {/* <div
              className={cn(
                'w-full bg-card rounded-lg border border-border p-4 shadow-realistic overflow-hidden',
                isMobile ? 'h-48' : 'h-72',
              )}
            >
              <h3 className="text-lg font-semibold mb-4 text-card-foreground truncate">
                Performance Chart
              </h3>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" stroke="var(--muted-foreground)" />
                  <YAxis stroke="var(--muted-foreground)" />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'var(--popover)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius)',
                      color: 'var(--popover-foreground)'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="pv" fill="var(--chart-1)" />
                  <Bar dataKey="uv" fill="var(--chart-2)" />
                </BarChart>
              </ResponsiveContainer>
            </div> */}
          </>
        )}
      </div>
    </section>
  );
};

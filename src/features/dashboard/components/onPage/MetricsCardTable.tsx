import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { useDSPRMetrics } from '@/features/DSPR/hooks/useDSPRDailyWeekly';
import { useIsMobile } from '@/hooks/use-mobile';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

export interface MetricRowData {
  label: string;
  weekly: string | number;
  daily: string | number;
  prev: string | number;
  color?: 'dashboard-green' | 'dashboard-blue' | 'dashboard-ocean' | 'dashboard-yellow' | 'dashboard-purble';
}

export interface MetricsCardTableProps {
  title?: string;
  description?: string;
  rows?: MetricRowData[];
  className?: string;
}

// Static mapping so Tailwind can see and compile all these classes
const badgeColorClasses: Record<NonNullable<MetricRowData['color']>, string> = {
  'dashboard-green':
    'bg-[var(--dashboard-green-100)] dark:bg-[var(--dashboard-green-900)] text-[var(--dashboard-green)]',
  'dashboard-blue':
    'bg-[var(--dashboard-blue-100)] dark:bg-[var(--dashboard-blue-900)] text-[var(--dashboard-blue)]',
  'dashboard-ocean':
    'bg-[var(--dashboard-ocean-100)] dark:bg-[var(--dashboard-ocean-900)] text-[var(--dashboard-ocean)]',
  'dashboard-yellow':
    'bg-[var(--dashboard-yellow-100)] dark:bg-[var(--dashboard-yellow-900)] text-[var(--dashboard-yellow)]',
  'dashboard-purble':
    'bg-[var(--dashboard-purble-100)] dark:bg-[var(--dashboard-purble-900)] text-[var(--dashboard-purble)]',
};

const MetricsCardTable: React.FC<MetricsCardTableProps> = ({
  title = 'Metrics',
  description,
  rows,
  className,
}) => {
  const { dailyRawData, weeklyRawData, getAvailableDailyDates, buildMetricSeriesFromDailyMap, isLoading, error } = useDSPRMetrics();
  const isMobile = useIsMobile();
  const hasData = !!(dailyRawData || weeklyRawData);

  const latestDate = useMemo(() => {
    const dates = getAvailableDailyDates();
    if (!dates || dates.length === 0) return null;
    const sorted = [...dates].sort();
    return sorted[sorted.length - 1] || null;
  }, [getAvailableDailyDates]);

  const autoRows: MetricRowData[] = useMemo(() => {
    const resolveMetric = (key: string): number => {
      if (!dailyRawData) return 0;
      const k = key as keyof typeof dailyRawData;
      const fallbackAvg = (dailyRawData as any).Avrage_ticket ?? (dailyRawData as any).Average_ticket ?? 0;
      if (key === 'Average_ticket') return fallbackAvg || 0;
      return (dailyRawData as any)[k] ?? 0;
    };

    const resolveWeekly = (key: string): number => {
      if (!weeklyRawData) return 0;
      const k = key as keyof typeof weeklyRawData;
      const fallbackAvg = (weeklyRawData as any).Avrage_ticket ?? (weeklyRawData as any).Average_ticket ?? 0;
      if (key === 'Average_ticket') return fallbackAvg || 0;
      return (weeklyRawData as any)[k] ?? 0;
    };

    const resolvePrev = (key: string): number => {
      if (!latestDate) return 0;
      const series = buildMetricSeriesFromDailyMap(key as any);
      const point = series.find((p) => p.date === latestDate);
      return (point?.prevWeekValue as number) ?? 0;
    };

    const items: MetricRowData[] = [
      {
        label: 'Total_TIPS',
        weekly: resolveWeekly('Total_TIPS'),
        daily: resolveMetric('Total_TIPS'),
        prev: resolvePrev('Total_TIPS'),
        color: 'dashboard-green',
      },
      {
        label: 'Average_ticket',
        weekly: resolveWeekly('Average_ticket'),
        daily: resolveMetric('Average_ticket'),
        prev: resolvePrev('Average_ticket'),
        color: 'dashboard-blue',
      },
      {
        label: 'Total_Cash_Sales',
        weekly: resolveWeekly('Total_Cash_Sales'),
        daily: resolveMetric('Total_Cash_Sales'),
        prev: resolvePrev('Total_Cash_Sales'),
        color: 'dashboard-ocean',
      },
    ];
    return items;
  }, [dailyRawData, weeklyRawData, latestDate, buildMetricSeriesFromDailyMap]);

  const displayRows = rows && rows.length > 0 ? rows : autoRows;
  const titleId = React.useId();
  const descId = React.useId();

  const ErrorState = () => (
    <div
      className={cn(
        'w-full bg-card rounded-lg border border-destructive/20 p-6 shadow-realistic',
        'flex flex-col items-center justify-center text-center space-y-4',
        isMobile ? 'min-h-48' : 'min-h-64'
      )}
    >
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-destructive/10">
        <ExclamationTriangleIcon className="w-6 h-6 text-destructive" />
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-card-foreground">Unable to Load Data</h3>
        <p className="text-sm text-muted-foreground max-w-md">
          We're experiencing difficulties loading your customer service metrics. This could be due to a temporary connection issue or data processing error.
          <p className="font-bold mt-1">Try changing the Date filter.</p>
        </p>
      </div>
    </div>
  );

  const NoDataState = () => (
    <div
      className={cn(
        'w-full bg-card rounded-lg border border-border p-6 shadow-realistic',
        'flex flex-col items-center justify-center text-center space-y-4',
        isMobile ? 'min-h-48' : 'min-h-64'
      )}
    >
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-muted">
        <ExclamationTriangleIcon className="w-6 h-6 text-muted-foreground" />
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-card-foreground">No Data Available</h3>
        <p className="text-sm text-muted-foreground max-w-md">
          There's currently no customer service data available to display. Please check back later or contact support if this issue persists.
          <p className="font-bold mt-1">Try changing the Date filter.</p>
        </p>
      </div>
    </div>
  );

  const LoadingState = () => (
    <Table
      aria-label={title ?? 'Metrics'}
      aria-labelledby={title ? titleId : undefined}
      aria-describedby={description ? descId : undefined}
      className="text-xs sm:text-sm"
    >
      <TableHeader>
        <TableRow>
          <TableHead>
            <span className="sr-only">Metric</span>
          </TableHead>
          <TableHead>Weekly</TableHead>
          <TableHead className="text-lg font-semibold text-foreground">Daily</TableHead>
          <TableHead>Prev</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {[0, 1, 2].map((i) => (
          <TableRow key={i}>
            <TableCell className="font-medium">
              <Skeleton className="h-4 w-24" />
            </TableCell>
            <TableCell className="text-muted-foreground">
              <Skeleton className="h-4 w-16" />
            </TableCell>
            <TableCell className="text-lg font-semibold">
              <Skeleton className="h-5 w-24" />
            </TableCell>
            <TableCell className="text-muted-foreground">
              <Skeleton className="h-4 w-16" />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <Card className={cn('bg-card border-border shadow-sm w-1/3', className)}>
      <CardHeader className="pb-4">
        {title ? (
          <CardTitle id={titleId} className="text-base sm:text-lg">
            {title}
          </CardTitle>
        ) : null}
        {description ? <CardDescription id={descId}>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent aria-busy={isLoading ? true : undefined}>
        {error ? (
          <ErrorState />
        ) : isLoading ? (
          <LoadingState />
        ) : !hasData || !displayRows || displayRows.length === 0 ? (
          <NoDataState />
        ) : (
          <Table
            aria-label={title ?? 'Metrics'}
            aria-labelledby={title ? titleId : undefined}
            aria-describedby={description ? descId : undefined}
            className="text-xs sm:text-sm"
          >
            <TableHeader>
              <TableRow>
                <TableHead>
                  <span className="sr-only">Metric</span>
                </TableHead>
                <TableHead>Weekly</TableHead>
                <TableHead className="text-lg font-semibold text-foreground">Daily</TableHead>
                <TableHead>Prev</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayRows.map((r) => {
                const colorVar = r.color ? `var(--${r.color})` : undefined;
                const badgeClass = r.color ? badgeColorClasses[r.color] : '';

                return (
                  <TableRow key={r.label} className="hover:bg-muted/50 transition-colors">
                    <TableCell
                      className="font-medium"
                      style={colorVar ? { color: colorVar } : undefined}
                    >
                      {r.label}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{r.weekly}</TableCell>
                    <TableCell
                      className="text-lg font-semibold"
                      style={colorVar ? { color: colorVar } : undefined}
                    >
                      {r.daily}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      <Badge variant="outline" className={cn(badgeClass)}>
                        {r.prev}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default MetricsCardTable;

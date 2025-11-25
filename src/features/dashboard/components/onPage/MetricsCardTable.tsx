import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { useWeeklyDspr } from '@/features/DSPR/hooks/useWeeklyDspr';
import { useDailyDsprByDate } from '@/features/DSPR/hooks/useDailyDsprByDate';
import { useDsprApi } from '@/features/DSPR/hooks/useDsprApi';
import { useIsMobile } from '@/hooks/use-mobile';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
// import { Skeleton } from '@/components/ui/skeleton';
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
  const roundDisplay = (value: string | number): string => {
    const n = typeof value === 'number' ? value : Number(value);
    if (!Number.isFinite(n)) return typeof value === 'string' ? value : String(value);
    return n.toFixed(0);
  };
  const { raw: weeklyRawData } = useWeeklyDspr();
  const { allDates, filter, getEntryForDate } = useDailyDsprByDate();
  const { currentDate } = useDsprApi();
  const isMobile = useIsMobile();
  
  const latestDate = useMemo(() => {
    const dates = allDates;
    if (!dates || dates.length === 0) return null;
    const sorted = [...dates].sort();
    return sorted[sorted.length - 1] || null;
  }, [allDates]);

  const selectedDate = useMemo(() => {
    return (currentDate ?? filter?.startDate ?? filter?.endDate ?? latestDate) || null;
  }, [currentDate, filter?.startDate, filter?.endDate, latestDate]);

  const entryForSelectedDate = useMemo(() => {
    if (!selectedDate) return null;
    return getEntryForDate(selectedDate);
  }, [selectedDate, getEntryForDate]);

  const hasData = !!(entryForSelectedDate || weeklyRawData);

  const autoRows: MetricRowData[] = useMemo(() => {
    const resolveMetric = (key: string): number => {
      const current = entryForSelectedDate?.current;
      if (!current) return 0;
      switch (key) {
        case 'Total_TIPS':
          return current.TotalTIPS ?? 0;
        case 'Average_ticket':
          return current.Avrageticket ?? 0;
        case 'Total_Cash_Sales':
          return current.TotalCashSales ?? 0;
        default:
          return 0;
      }
    };

    const resolveWeekly = (key: string): number => {
      if (!weeklyRawData) return 0;
      switch (key) {
        case 'Total_TIPS':
          return (weeklyRawData as any).TotalTIPS ?? 0;
        case 'Average_ticket':
          return (weeklyRawData as any).Avrageticket ?? 0;
        case 'Total_Cash_Sales':
          return (weeklyRawData as any).TotalCashSales ?? 0;
        default:
          return 0;
      }
    };

    const resolvePrev = (key: string): number => {
      const prev = entryForSelectedDate?.prevWeek;
      if (!prev) return 0;
      switch (key) {
        case 'Total_TIPS':
          return prev.TotalTIPS ?? 0;
        case 'Average_ticket':
          return prev.Avrageticket ?? 0;
        case 'Total_Cash_Sales':
          return prev.TotalCashSales ?? 0;
        default:
          return 0;
      }
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
  }, [entryForSelectedDate, weeklyRawData]);

  const displayRows = rows && rows.length > 0 ? rows : autoRows;
  const titleId = React.useId();
  const descId = React.useId();

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
        </p>
        <p className="font-bold mt-1">Try changing the Date filter.</p>
      </div>
    </div>
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
      <CardContent>
        {!hasData || !displayRows || displayRows.length === 0 ? (
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
                    <TableCell className="text-muted-foreground">{roundDisplay(r.weekly)}</TableCell>
                    <TableCell
                      className="text-lg font-semibold"
                      style={colorVar ? { color: colorVar } : undefined}
                    >
                      {roundDisplay(r.daily)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      <Badge variant="outline" className={cn(badgeClass)}>
                        {roundDisplay(r.prev)}
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

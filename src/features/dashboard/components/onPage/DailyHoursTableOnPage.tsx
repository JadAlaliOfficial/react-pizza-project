import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useIsMobile } from '@/hooks/use-mobile';
import { useSimpleHourlySales } from '@/features/DSPR/hooks/useHourlySales';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface DailyHoursTableOnPageProps {
  title?: string;
  subtitle?: string;
  className?: string;
}

const formatCurrency = (value: number | undefined) => {
  const v = value ?? 0;
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v);
};

const formatPercentage = (value: number | undefined) => {
  const v = value ?? 0;
  return `${v.toFixed(1)}%`;
};

const formatHour = (hour: number) => {
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${displayHour}:00 ${period}`;
};

export const DailyHoursTableOnPage: React.FC<DailyHoursTableOnPageProps> = ({
  title = 'Daily Hours',
  subtitle,
  className,
}) => {
  const { data, error, hasData, isLoading } = useSimpleHourlySales();
  const isMobile = useIsMobile();

  const rows = useMemo(() => {
    const ordered = [...(data || [])].sort((a, b) => {
      const ao = a.hour <= 3 ? a.hour + 24 : a.hour;
      const bo = b.hour <= 3 ? b.hour + 24 : b.hour;
      return ao - bo;
    });
    return ordered.map(h => ({
      hourLabel: formatHour(h.hour),
      totalSales: formatCurrency(h.Total_Sales),
      orders: h.Order_Count ?? 0,
      website: formatCurrency(h.Website),
      mobile: formatCurrency(h.Mobile),
      phone: formatCurrency(h.Phone_Sales),
      driveThru: formatCurrency(h.Drive_Thru),
      aov: formatCurrency(h.averageOrderValue),
      digitalPct: formatPercentage(h.digitalSalesPercentage),
      hasActivity: h.hasActivity,
    }));
  }, [data]);

  const NoDataState = () => (
    <div className={cn(
      'w-full bg-card rounded-lg border border-border p-6 shadow-realistic',
      'flex flex-col items-center justify-center text-center space-y-2',
      isMobile ? 'min-h-40' : 'min-h-56'
    )}>
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted">
        <ExclamationTriangleIcon className="w-5 h-5 text-muted-foreground" />
      </div>
      <div className="text-sm text-muted-foreground">No hourly sales data available</div>
    </div>
  );

  const ErrorState = () => (
    <div className={cn(
      'w-full bg-card rounded-lg border border-destructive/20 p-6 shadow-realistic',
      'flex flex-col items-center justify-center text-center space-y-2',
      isMobile ? 'min-h-40' : 'min-h-56'
    )}>
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-destructive/10">
        <ExclamationTriangleIcon className="w-5 h-5 text-destructive" />
      </div>
      <div className="text-sm text-destructive">Failed to load hourly sales data</div>
    </div>
  );

  return (
    <section className={cn(isMobile ? 'p-2 space-y-2' : 'p-2 space-y-6', className)}>
      <SectionHeader title={title} subtitle={subtitle} />

      {error ? (
        <ErrorState />
      ) : !hasData || !data || data.length === 0 ? (
        <NoDataState />
      ) : (
        <Card className={cn('shadow-realistic transition-opacity', isLoading && 'opacity-50 pointer-events-none')}>
          <CardHeader className="py-3">
            <CardTitle className="text-base text-center">
              Hourly Sales
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            <div className="w-full overflow-x-auto">
              <Table className="min-w-[800px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="whitespace-nowrap">Hour</TableHead>
                    <TableHead className="whitespace-nowrap">Total Sales</TableHead>
                    <TableHead className="whitespace-nowrap">Orders</TableHead>
                    <TableHead className="whitespace-nowrap">Website</TableHead>
                    <TableHead className="whitespace-nowrap">Mobile</TableHead>
                    <TableHead className="whitespace-nowrap">Phone</TableHead>
                    <TableHead className="whitespace-nowrap">Drive Thru</TableHead>
                    <TableHead className="whitespace-nowrap">Avg Order</TableHead>
                    <TableHead className="whitespace-nowrap">Digital %</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r, idx) => (
                    <TableRow key={idx} className={cn(!r.hasActivity && 'opacity-60')}>
                      <TableCell>{r.hourLabel}</TableCell>
                      <TableCell>{r.totalSales}</TableCell>
                      <TableCell>{r.orders}</TableCell>
                      <TableCell>{r.website}</TableCell>
                      <TableCell>{r.mobile}</TableCell>
                      <TableCell>{r.phone}</TableCell>
                      <TableCell>{r.driveThru}</TableCell>
                      <TableCell>{r.aov}</TableCell>
                      <TableCell>{r.digitalPct}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </section>
  );
};

export default DailyHoursTableOnPage;
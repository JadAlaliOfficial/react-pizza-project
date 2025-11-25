import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useIsMobile } from '@/hooks/use-mobile';
import { useHourlySales } from '@/features/DSPR/hooks/useHourlySales';
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
  const { financial, operational, salesChannels, hasData, hours } = useHourlySales();
  const isMobile = useIsMobile();

  const rows = useMemo(() => {
    const hrs = Array.isArray(hours) ? hours : [];
    const hourRows = hrs.map((h, idx) => {
      const total = Number(h.Total_Sales || 0);
      const orders = Number(h.Order_Count || 0);
      const website = Number(h.Website || 0);
      const mobile = Number(h.Mobile || 0);
      const phone = Number(h.Phone_Sales || 0);
      const driveThru = Number(h.Drive_Thru || 0);
      const aov = orders > 0 ? total / orders : 0;
      const digital = total > 0 ? ((website + mobile) / total) * 100 : 0;
      const hasActivity = total > 0 || orders > 0;
      return {
        hourLabel: formatHour(idx),
        totalSales: formatCurrency(total),
        orders,
        website: formatCurrency(website),
        mobile: formatCurrency(mobile),
        phone: formatCurrency(phone),
        driveThru: formatCurrency(driveThru),
        aov: formatCurrency(aov),
        digitalPct: formatPercentage(digital),
        hasActivity,
      };
    });

    if (financial && operational && salesChannels) {
      const digitalPctTotal = (salesChannels.digitalPercent ?? 0) * 100;
      const hasActivityTotal = (financial.totalSales ?? 0) > 0;
      const totalRow = {
        hourLabel: 'Total',
        totalSales: formatCurrency(financial.totalSales),
        orders: operational.customerCount ?? 0,
        website: formatCurrency(salesChannels.websiteSales),
        mobile: formatCurrency(salesChannels.mobileSales),
        phone: formatCurrency(salesChannels.phoneSales),
        driveThru: formatCurrency(salesChannels.driveThruSales),
        aov: formatCurrency(operational.averageTicket),
        digitalPct: formatPercentage(digitalPctTotal),
        hasActivity: hasActivityTotal,
      };
      return [...hourRows, totalRow];
    }

    return hourRows;
  }, [hours, financial, operational, salesChannels]);

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

  // const ErrorState = () => (
  //   <div className={cn(
  //     'w-full bg-card rounded-lg border border-destructive/20 p-6 shadow-realistic',
  //     'flex flex-col items-center justify-center text-center space-y-2',
  //     isMobile ? 'min-h-40' : 'min-h-56'
  //   )}>
  //     <div className="flex items-center justify-center w-10 h-10 rounded-full bg-destructive/10">
  //       <ExclamationTriangleIcon className="w-5 h-5 text-destructive" />
  //     </div>
  //     <div className="text-sm text-destructive">Failed to load hourly sales data</div>
  //   </div>
  // );

  return (
    <section className={cn(isMobile ? 'p-2 space-y-2' : 'p-2 space-y-6', className)}>
      <SectionHeader title={title} subtitle={subtitle} />

      {!hasData || rows.length === 0 ? (
        <NoDataState />
      ) : (
        <Card className={cn('shadow-realistic')}>
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

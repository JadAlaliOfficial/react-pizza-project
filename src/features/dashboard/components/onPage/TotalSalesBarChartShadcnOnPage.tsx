import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDailyDsprByDate } from '@/features/DSPR/hooks/useDailyDsprByDate';
import { useDsprApi } from '@/features/DSPR/hooks/useDsprApi';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { format, parseISO } from 'date-fns';

interface TotalSalesBarChartShadcnOnPageProps {
  title?: string;
  className?: string;
}

const currencyFormatter = (value: number) => {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
  } catch {
    return value.toLocaleString();
  }
};

const TotalSalesBarChartShadcnOnPage: React.FC<TotalSalesBarChartShadcnOnPageProps> = ({ title = 'Total Sales by Date', className }) => {
  const { timeline } = useDailyDsprByDate();
  const { isLoading, error, filteringValues, currentDate } = useDsprApi();
  const isMobile = useIsMobile();

  const data = useMemo(() => {
    if (!timeline) return [];
    const dates = timeline.dates || [];
    const sales = timeline.sales || [];
    const prev = timeline.prevWeekSales || [];
    return dates.map((date, idx) => ({
      name: date,
      current: Number(sales[idx] || 0),
      prev: Number(prev[idx] || 0),
    }));
  }, [timeline]);

  const hasPrev = useMemo(() => data.some(d => d.prev !== 0), [data]);
  const empty = useMemo(() => data.length === 0 || (data.every(d => d.current === 0) && !hasPrev), [data, hasPrev]);

  const parseDateString = (value: string) => {
    try {
      const d = parseISO(value);
      if (!isNaN(d.getTime())) return d;
    } catch {}
    const parts = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (parts) {
      const [, y, m, d] = parts;
      return new Date(Number(y), Number(m) - 1, Number(d));
    }
    const fallback = new Date(value);
    return isNaN(fallback.getTime()) ? new Date() : fallback;
  };

  const renderXAxisTick = (props: any) => {
    const { x, y, payload } = props;
    const d = parseDateString(String(payload.value));
    const top = format(d, 'EEE');
    const bottom = format(d, 'd MMM');
    return (
      <text x={x} y={y} dy={16} textAnchor="middle" fill="var(--muted-foreground)">
        <tspan fontSize={isMobile ? 10 : 12}>{top}</tspan>
        <tspan x={x} dy={16} fontSize={isMobile ? 10 : 12}>{bottom}</tspan>
      </text>
    );
  };

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base sm:text-lg">{title}</CardTitle>
        {(filteringValues?.date || currentDate) && (
          <span className="text-xs sm:text-sm text-muted-foreground">
            {filteringValues?.date || currentDate}
          </span>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center text-red-700">{error?.message}</div>
        ) : empty ? (
          <div className="text-muted-foreground text-sm p-4">No sales data available.</div>
        ) : (
          <div className="w-full" style={{ height: isMobile ? 260 : 360 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 20, right: 20, bottom: 40, left: 50 }}>
                <defs>
                  <linearGradient id="barGradientCurrent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={1} />
                    <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.2} />
                  </linearGradient>
                  <linearGradient id="barGradientPrev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-4)" stopOpacity={1} />
                    <stop offset="100%" stopColor="var(--chart-4)" stopOpacity={0.2} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" stroke="var(--muted-foreground)" tick={renderXAxisTick} tickMargin={12} />
                <YAxis stroke="var(--muted-foreground)" tick={{ fontSize: isMobile ? 10 : 12 }} tickFormatter={v => currencyFormatter(Number(v))} width={60} />
                <Tooltip
                  formatter={(value: number, name) => [currencyFormatter(value), name]}
                  contentStyle={{
                    backgroundColor: 'var(--popover)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    color: 'var(--popover-foreground)'
                  }}
                />
                <Legend wrapperStyle={{ color: 'var(--muted-foreground)' }} />
                <Bar  dataKey="current" name="Current" fill="url(#barGradientCurrent)" radius={[10, 10, 0, 0]} />
                {hasPrev && <Bar dataKey="prev" name="Prev Week" fill="url(#barGradientPrev)" radius={[10, 10, 0, 0]} />}
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TotalSalesBarChartShadcnOnPage;

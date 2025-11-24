import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDSPRMetrics } from '@/features/DSPR/hooks/useDSPRDailyWeekly';
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
  const { isLoading, error, buildMetricSeriesFromDailyMap } = useDSPRMetrics();
  const isMobile = useIsMobile();

  const data = useMemo(() => {
    const points = buildMetricSeriesFromDailyMap('Total_Sales');
    const sorted = [...points].sort((a, b) => a.date.localeCompare(b.date));
    return sorted.map(p => ({
      name: p.date,
      current: p.value == null ? 0 : Number(p.value),
      prev: p.prevWeekValue == null ? 0 : Number(p.prevWeekValue)
    }));
  }, [buildMetricSeriesFromDailyMap]);

  const hasPrev = useMemo(() => data.some(d => d.prev !== 0), [data]);
  const empty = useMemo(() => data.length === 0 || (data.every(d => d.current === 0) && !hasPrev), [data, hasPrev]);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base sm:text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center text-red-700">{error}</div>
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
                <XAxis dataKey="name" stroke="var(--muted-foreground)" tick={{ fontSize: isMobile ? 10 : 12 }} tickMargin={8} />
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
                <Bar dataKey="current" name="Current" fill="url(#barGradientCurrent)" radius={[10, 10, 0, 0]} />
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
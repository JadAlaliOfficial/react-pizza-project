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

interface TotalSalesBarChartRechartsOnPageProps {
  title?: string;
  className?: string;
}

const TotalSalesBarChartRechartsOnPage: React.FC<TotalSalesBarChartRechartsOnPageProps> = ({ title = 'Total Sales by Date', className }) => {
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
  const empty = useMemo(() => data.length === 0 || data.every(d => d.current === 0) && !hasPrev, [data, hasPrev]);

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
                <Bar dataKey="current" name="Current" fill="var(--chart-1)" />
                {hasPrev && <Bar dataKey="prev" name="Prev Week" fill="var(--chart-2)" />}
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TotalSalesBarChartRechartsOnPage;
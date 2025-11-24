import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDSPRMetrics } from '@/features/DSPR/hooks/useDSPRDailyWeekly';
import { BarChart } from '@mui/x-charts/BarChart';
import { useIsMobile } from '@/hooks/use-mobile';

interface LaborPercentBarChartOnPageProps {
  title?: string;
  className?: string;
}

const LaborPercentBarChartOnPage: React.FC<LaborPercentBarChartOnPageProps> = ({ title = 'Labor % by Date', className }) => {
  const { isLoading, error, buildMetricSeriesFromDailyMap } = useDSPRMetrics();
  const isMobile = useIsMobile();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState<number>(800);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver((entries: ResizeObserverEntry[]) => {
      const w = entries[0]?.contentRect?.width || 800;
      setWidth(Math.max(320, Math.floor(w)));
    });
    obs.observe(el);
    return () => {
      obs.disconnect();
    };
  }, []);

  const seriesData = useMemo(() => {
    const points = buildMetricSeriesFromDailyMap('labor');
    const sorted = [...points].sort((a, b) => a.date.localeCompare(b.date));
    const labels = sorted.map(p => p.date);
    const currentValues = sorted.map(p => (p.value == null ? null : Number(p.value) * 100));
    const prevValues = sorted.map(p => (p.prevWeekValue == null ? null : Number(p.prevWeekValue) * 100));
    const currentValuesNum = currentValues.map(v => v ?? 0);
    const prevValuesNum = prevValues.map(v => v ?? 0);
    const hasPrev = prevValues.some(v => v !== null);
    return { labels, currentValuesNum, prevValuesNum, hasPrev, hasCurrent: currentValues.some(v => v !== null) };
  }, [buildMetricSeriesFromDailyMap]);

  const empty = useMemo(() => !seriesData.hasCurrent && !seriesData.hasPrev, [seriesData]);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base sm:text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div ref={containerRef} className="w-full">
          {isLoading ? (
            <div className="flex items-center justify-center h-48">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center text-red-700">
              {error}
            </div>
          ) : empty ? (
            <div className="text-muted-foreground text-sm p-4">No labor data available.</div>
          ) : (
            <BarChart
              width={width}
              height={isMobile ? 260 : 360}
              xAxis={[{ data: seriesData.labels, scaleType: 'band' }]}
              series={[
                { data: seriesData.currentValuesNum, label: 'Current', color: 'var(--chart-1)' },
                ...(seriesData.hasPrev ? [{ data: seriesData.prevValuesNum, label: 'Prev Week', color: 'var(--chart-2)' }] : [])
              ]}
              margin={{ top: 20, right: 20, bottom: 40, left: 50 }}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LaborPercentBarChartOnPage;
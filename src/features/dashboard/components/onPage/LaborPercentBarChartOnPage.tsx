import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDailyDsprByDate } from '@/features/DSPR/hooks/useDailyDsprByDate';
import { useDsprApi } from '@/features/DSPR/hooks/useDsprApi';
import { BarChart } from '@mui/x-charts/BarChart';
import { useIsMobile } from '@/hooks/use-mobile';
import { format, parseISO } from 'date-fns';

interface LaborPercentBarChartOnPageProps {
  title?: string;
  className?: string;
}

const LaborPercentBarChartOnPage: React.FC<LaborPercentBarChartOnPageProps> = ({ title = 'Labor % by Date', className }) => {
  const { entries } = useDailyDsprByDate();
  const { isLoading, error, filteringValues, currentDate } = useDsprApi();
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
    const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
    const labels = sorted.map(e => e.date);
    const currentValuesNum = sorted.map(e => Number(((e.current.labor ?? 0) * 100)));
    const prevValuesNum = sorted.map(e => Number(((e.prevWeek?.labor ?? 0) * 100)));
    const hasPrev = prevValuesNum.some(v => v !== 0);
    const hasCurrent = currentValuesNum.some(v => v !== 0);
    return { labels, currentValuesNum, prevValuesNum, hasPrev, hasCurrent };
  }, [entries]);

  const empty = useMemo(() => !seriesData.hasCurrent && !seriesData.hasPrev, [seriesData]);

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

  const formatTickLabel = (value: string) => {
    const d = parseDateString(value);
    const top = format(d, 'EEE');
    const bottom = format(d, 'd MMM');
    return `${top}\n${bottom}`;
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
        <div ref={containerRef} className="w-full">
          {isLoading ? (
            <div className="flex items-center justify-center h-48">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center text-red-700">
              {error?.message}
            </div>
          ) : empty ? (
            <div className="text-muted-foreground text-sm p-4">No labor data available.</div>
          ) : (
            <BarChart
              width={width}
              height={isMobile ? 260 : 360}
              xAxis={[{ data: seriesData.labels, scaleType: 'band', valueFormatter: (v: string) => formatTickLabel(v) }]}
              series={[
                { data: seriesData.currentValuesNum, label: 'Current', color: 'var(--chart-1)' },
                ...(seriesData.hasPrev ? [{ data: seriesData.prevValuesNum, label: 'Prev Week', color: 'var(--chart-2)' }] : [])
              ]}
              margin={{ top: 20, right: 20, bottom: 50, left: 50 }}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LaborPercentBarChartOnPage;

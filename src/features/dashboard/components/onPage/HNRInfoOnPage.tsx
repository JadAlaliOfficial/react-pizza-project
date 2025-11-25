import React from 'react';
import { useDailyDspr } from '@/features/DSPR/hooks/useDailyDspr';
import { useDsprApi } from '@/features/DSPR/hooks/useDsprApi';

const HNRInfoOnPage: React.FC = () => {
  const { raw: dailyRawData } = useDailyDspr();
  const { isLoading, error } = useDsprApi();

  const totalTransactions = dailyRawData?.HNR_Transactions ?? null;
  const promiseMetTransactions = dailyRawData?.HNR_Promise_Met_Transactions ?? null;
  const promiseMetPercent = dailyRawData?.HNR_Promise_Met_Percent ?? null;

  if (isLoading) {
    return (
      <div className="rounded-lg border bg-card p-4">
        <div className="text-sm text-muted-foreground">Loading HNR data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border bg-card p-4">
        <div className="text-sm text-destructive">{error?.message}</div>
      </div>
    );
  }

  if (!dailyRawData) {
    return (
      <div className="rounded-lg border bg-card p-4">
        <div className="text-sm text-muted-foreground">No HNR data available.</div>
      </div>
    );
  }

  const formattedPercent =
    promiseMetPercent !== null && promiseMetPercent !== undefined
      ? `${promiseMetPercent.toFixed(2)}%`
      : 'N/A';

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="mb-2 text-base font-semibold">HNR Overview</div>
      <ul className="space-y-1 text-sm">
        <li className="flex items-center justify-between">
          <span className="text-muted-foreground">Total transactions</span>
          <span className="font-medium">{totalTransactions ?? 'N/A'}</span>
        </li>
        <li className="flex items-center justify-between">
          <span className="text-muted-foreground">Promise met transactions</span>
          <span className="font-medium">{promiseMetTransactions ?? 'N/A'}</span>
        </li>
        <li className="flex items-center justify-between">
          <span className="text-muted-foreground">Promise met transactions %</span>
          <span className="font-medium">{formattedPercent}</span>
        </li>
      </ul>
    </div>
  );
};

export default HNRInfoOnPage;

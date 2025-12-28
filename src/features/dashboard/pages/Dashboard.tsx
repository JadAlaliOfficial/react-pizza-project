import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useCurrentStore } from '@/components/layouts/mainLayout/CurrentStoreContext';
import { useDailyDspr } from '@/features/DSPR/hooks/useDailyDspr';
import { useWeeklyDspr } from '@/features/DSPR/hooks/useWeeklyDspr';
import { InfoSection } from '@/features/dashboard/components/onPage/InfoSectionOnPage';
import { CustomerServiceOverview } from '@/features/dashboard/components/onPage/CustomerServiceOverviewOnPage';
import { InfoCards } from '@/features/dashboard/components/onPage/InfoCardsOnPage';
import { ChannelSalesDashboard } from '@/features/dashboard/components/onPage/ChannelSalesDashboardOnPage';
import { DailyHoursTableOnPage } from '@/features/dashboard/components/onPage/DailyHoursTableOnPage';
import { DSQRDashboard } from '@/components/DSQRDashboard';
import { StoreDatesFilter } from '@/features/dashboard/components/storeItems/components/StoreDatesFilter';
import HNRInfoOnPage from '@/features/dashboard/components/onPage/HNRInfoOnPage';
import CelebrationBanner from '@/features/dashboard/components/CelebrationBanner';
import TotalSalesBarChartOnPage from '@/features/dashboard/components/onPage/TotalSalesBarChartOnPage';
import TotalSalesBarChartRechartsOnPage from '@/features/dashboard/components/onPage/TotalSalesBarChartRechartsOnPage';
import TotalSalesBarChartShadcnOnPage from '@/features/dashboard/components/onPage/TotalSalesBarChartShadcnOnPage';
import LaborPercentBarChartOnPage from '@/features/dashboard/components/onPage/LaborPercentBarChartOnPage';
import { SalesDataCardOnPage } from '@/features/dashboard/components/onPage/SalesDataCardOnPage';
import { LaborPercentCardOnPage } from '@/features/dashboard/components/onPage/LaborPercentCardOnPage';
import LaborPercentProgressCardOnPage from '@/features/dashboard/components/onPage/LaborPercentProgressCardOnPage';
import MetricsCardTable from '@/features/dashboard/components/onPage/MetricsCardTable';

const Dashboard: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const { currentStore } = useCurrentStore();
  const { raw: dailyRaw, hasData: hasDaily } = useDailyDspr();
  const { hasData: hasWeekly } = useWeeklyDspr();
  const hnrMetrics = useMemo(() => {
    if (!dailyRaw) return null;
    return {
      promiseMetPercent: (dailyRaw as any).HNR_Promise_Met_Percent ?? null,
      promiseMetTransactions: (dailyRaw as any).HNR_Promise_Met_Transactions ?? null,
      totalTransactions: (dailyRaw as any).HNR_Transactions ?? null,
    } as const;
  }, [dailyRaw]);
  const metricsLoading = !hasDaily && !hasWeekly;
  const metricsError: string | null = null;
  const [storeDateFilterError, setStoreDateFilterError] = useState<
    string | null
  >(null);

  

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      navigate('/login');
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handleStoreDateFilterError = useCallback((error: string | null) => {
    setStoreDateFilterError(error);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="container mx-auto space-y-4 md:space-y-6 p-2 md:p-4 max-w-7xl">
      <StoreDatesFilter className="mb-6" onError={handleStoreDateFilterError} />

      {storeDateFilterError ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-red-600 font-semibold text-lg mb-2">
            Store Date Filter Error
          </div>
          <div className="text-red-700 mb-4">{storeDateFilterError}</div>
          <div className="text-red-600 text-sm">
            Dashboard components are unavailable due to filter processing
            failure.
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-2">
            <CelebrationBanner
              storeName={currentStore?.name}
              percent={hnrMetrics?.promiseMetPercent ?? null}
              loading={metricsLoading}
              error={metricsError || null}
              className="mt-2"
            />
            <SalesDataCardOnPage className="mt-2" />
            <LaborPercentCardOnPage className="mt-2" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <LaborPercentProgressCardOnPage className="mt-2" />
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <TotalSalesBarChartOnPage className="mt-2" />
            <LaborPercentBarChartOnPage className="mt-2" />
          </div>
          <MetricsCardTable className="mt-2" title="Key Metrics" />
          
          <InfoCards></InfoCards>
          <InfoSection></InfoSection>
          
          <TotalSalesBarChartOnPage className="mt-2" />
          <TotalSalesBarChartRechartsOnPage className="mt-2" />
          <TotalSalesBarChartShadcnOnPage className="mt-2" />
          <LaborPercentBarChartOnPage className="mt-2" />
          <CustomerServiceOverview></CustomerServiceOverview>
          <ChannelSalesDashboard></ChannelSalesDashboard>
          <DailyHoursTableOnPage></DailyHoursTableOnPage>
          <HNRInfoOnPage></HNRInfoOnPage>
        </>
      )}
      <DSQRDashboard></DSQRDashboard>
    </div>
  );
};

export default Dashboard;

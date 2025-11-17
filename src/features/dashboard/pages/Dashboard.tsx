import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { InfoSection } from '@/features/dashboard/components/onPage/InfoSectionOnPage';
import { CustomerServiceOverview } from '@/features/dashboard/components/onPage/CustomerServiceOverviewOnPage';
import { InfoCards } from '@/features/dashboard/components/onPage/InfoCardsOnPage';
import { ChannelSalesDashboard } from '@/features/dashboard/components/onPage/ChannelSalesDashboardOnPage';
import { DailyHoursTableOnPage } from '@/features/dashboard/components/onPage/DailyHoursTableOnPage';
// import { DSQRDashboard } from '../components/DSQRDashboard';
import { StoreDatesFilter } from '@/features/storeItems/components/StoreDatesFilter';

const Dashboard: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [storeDateFilterError, setStoreDateFilterError] = useState<string | null>(null);

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
          <div className="text-red-700 mb-4">
            {storeDateFilterError}
          </div>
          <div className="text-red-600 text-sm">
            Dashboard components are unavailable due to filter processing failure.
          </div>
        </div>
      ) : (
        <>
          <InfoCards></InfoCards>
          <InfoSection></InfoSection>
          <CustomerServiceOverview></CustomerServiceOverview>
          <ChannelSalesDashboard></ChannelSalesDashboard>
          <DailyHoursTableOnPage></DailyHoursTableOnPage>
        </>
      )}
      {/* <DSQRDashboard></DSQRDashboard> */}
    </div>
  );
};

export default Dashboard;

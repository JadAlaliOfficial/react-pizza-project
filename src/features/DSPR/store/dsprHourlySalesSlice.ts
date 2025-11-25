/**
 * ============================================================================
 * DSPR HOURLY SALES SLICE
 * ============================================================================
 * Domain: Hourly Sales (Daily Sales by Hour)
 * 
 * Responsibility:
 * - Derives hourly sales data from central DSPR API response
 * - Treats DailyDSPRData as representing hourly breakdown
 * - Processes raw data into hourly summaries
 * - Calculates daily aggregates from hourly data
 * - Manages filtering configuration
 * - Provides selectors for accessing hourly metrics
 * 
 * Data Flow:
 * 1. Central dsprApiSlice fetches full DsprApiResponse
 * 2. This slice listens to fetchDsprData.fulfilled
 * 3. Extracts reports.daily.dailyHourlySales (assumes it's DailyDSPRData)
 * 4. Processes into hourly summaries
 * 5. Components consume via useHourlySales hook
 * 
 * Related Files:
 * - Source: state/dsprApiSlice.ts (central API state)
 * - Types: types/dspr.hourlySales.ts (using DailyDSPRData structure)
 * - Hook: hooks/useHourlySales.ts (React hook)
 * 
 * State Shape:
 * - raw: DailyDSPRData | null (from API)
 * - processed: ProcessedDailyDSPR | null (enriched data)
 * - config: DailyDSPRConfig (filter/sort settings)
 * - lastProcessed: string | null (timestamp)
 */

import { createSlice, createSelector, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '@/store';
import { fetchDsprData } from './dsprApiSlice';
import type { StoreId, ApiDate } from '../types/dspr.common';
import {
  type DailyDSPRData,
  type ProcessedDailyDSPR,
  type FinancialSummary,
  type OperationalSummary,
  type QualitySummary,
  type CostControlMetrics,
  type SalesChannelBreakdown,
  PerformanceGrade,
  type DailyAlert,
  type DailyDSPRConfig,
  type DailyDSPRFilter,
  type DailyPerformanceThresholds,
  type GradeThresholds,
  defaultDailyDSPRConfig,
  calculateTotalWaste,
  calculateWastePercent,
  calculateDigitalSales,
  calculateDeliverySales,
  calculateDeliveryPercent,
  calculateLaborCost,
  calculateNetRevenue,
  calculatePerformanceScore,
  calculatePerformanceGrade,
  identifyDailyAlerts,
} from '../types/dspr.hourlySales';

// ============================================================================
// STATE TYPES
// ============================================================================

/**
 * Hourly sales slice state
 */
interface HourlySalesState {
  raw: DailyDSPRData | null;
  processed: ProcessedDailyDSPR | null;
  config: DailyDSPRConfig;
  lastProcessed: string | null;
  hours: HourRecord[];
}

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState: HourlySalesState = {
  raw: null,
  processed: null,
  config: defaultDailyDSPRConfig,
  lastProcessed: null,
  hours: [],
};

// ============================================================================
// PROCESSING FUNCTIONS
// ============================================================================

/**
 * Processes raw hourly sales data into enriched format
 */
function processHourlySales(
  raw: DailyDSPRData,
  store: StoreId,
  date: ApiDate,
  config: DailyDSPRConfig
): ProcessedDailyDSPR {
  // Financial summary
  const totalWaste = calculateTotalWaste(raw);
  const wastePercent = calculateWastePercent(raw);
  const netRevenue = calculateNetRevenue(raw);
  
  const financial: FinancialSummary = {
    totalSales: raw.TotalSales,
    totalCashSales: raw.TotalCashSales,
    totalTips: raw.TotalTIPS,
    totalWaste,
    wastePercent,
    overshort: raw.overshort,
    cashDepositDifference: raw.CashSalesVsDepositeDifference,
    netRevenue,
  };
  
  // Operational summary
  const laborCost = calculateLaborCost(raw);
  
  const operational: OperationalSummary = {
    laborCost,
    laborPercent: raw.labor,
    customerCount: raw.Customercount,
    customerCountPercent: raw.Customercountpercent,
    averageTicket: raw.Avrageticket,
    portalEligibleTransactions: raw.TotalPortalEligibleTransactions,
    portalUsageRate: raw.PutintoPortalPercent,
    portalOnTimeRate: raw.InPortalonTimePercent,
  };
  
  // Quality summary
  const quality: QualitySummary = {
    customerService: raw.CustomerService,
    upselling: raw.Upselling,
    hnrPromiseMetPercent: raw.HNRPromiseMetPercent || 0,
    hnrPromiseBrokenPercent: raw.HNRPromiseBrokenPercent || 0,
    hnrTransactions: raw.HNRTransactions || 0,
    hnrPromisesMet: raw.HNRPromiseMetTransactions || 0,
    portalOnTimePercent: raw.InPortalonTimePercent,
  };
  
  // Cost control metrics
  const costControl: CostControlMetrics = {
    totalWaste,
    wastePercent,
    refundedOrderCount: raw.RefundedorderQty,
    modifiedOrderCount: raw.ModifiedOrderQty,
    laborPercent: raw.labor,
    overshort: raw.overshort,
  };
  
  // Sales channel breakdown
  const digitalSales = calculateDigitalSales(raw);
  const totalDeliverySales = calculateDeliverySales(raw);
  const deliveryPercent = calculateDeliveryPercent(raw);
  
  const salesChannels: SalesChannelBreakdown = {
    digitalSales,
    digitalPercent: raw.DigitalSalesPercent,
    phoneSales: raw.Phone,
    websiteSales: raw.Website,
    mobileSales: raw.Mobile,
    callCenterSales: raw.CallCenterAgent,
    driveThruSales: raw.DriveThruSales,
    doorDashSales: raw.DoorDashSales,
    uberEatsSales: raw.UberEatsSales,
    grubHubSales: raw.GrubHubSales,
    totalDeliverySales,
    deliveryPercent,
  };
  
  // Calculate performance score and grade
  const performanceScore = calculatePerformanceScore(raw, config.thresholds);
  const grade = calculatePerformanceGrade(performanceScore, config.gradeThresholds);
  
  // Identify alerts (if enabled)
  const alerts = config.enableAlerts ? identifyDailyAlerts(raw, config.thresholds) : [];
  
  return {
    store,
    date,
    raw,
    financial,
    operational,
    quality,
    costControl,
    salesChannels,
    grade,
    alerts,
    processedAt: new Date().toISOString(),
  };
}

export interface HNRMetricsHourly {
  Transactions?: number;
  Transactions_with_CC?: number;
  Promise_Broken_Percent?: number;
  Promise_Met_Percent?: number;
  Promise_Met_Transactions?: number;
}

export interface HourRecord {
  Total_Sales?: number;
  Phone_Sales?: number;
  Call_Center_Agent?: number;
  Drive_Thru?: number;
  Website?: number;
  Mobile?: number;
  Order_Count?: number;
  HNR?: HNRMetricsHourly;
}

interface HourlySalesPayload {
  franchise_store?: string;
  business_date?: string;
  hours?: HourRecord[];
}

function aggregateHourlyToDaily(hourly: HourlySalesPayload): DailyDSPRData {
  const hours: HourRecord[] = Array.isArray(hourly?.hours) ? hourly.hours as HourRecord[] : [];
  const sum = (key: keyof HourRecord) =>
    hours.reduce((acc, h) => acc + (Number((h[key] as number) || 0)), 0);
  const totalSales = sum('Total_Sales');
  const customerCount = sum('Order_Count');
  const phoneSales = sum('Phone_Sales');
  const callCenterSales = sum('Call_Center_Agent');
  const websiteSales = sum('Website');
  const mobileSales = sum('Mobile');
  const driveThruSales = sum('Drive_Thru');
  const hnrTransactions = hours.reduce((acc, h) => acc + (Number(h.HNR?.Transactions || 0)), 0);
  const hnrMet = hours.reduce((acc, h) => acc + (Number(h.HNR?.Promise_Met_Transactions || 0)), 0);
  const hnrMetPercent = hnrTransactions > 0 ? (hnrMet / hnrTransactions) * 100 : 0;
  const hnrBrokenPercent = hnrTransactions > 0 ? ((hnrTransactions - hnrMet) / hnrTransactions) * 100 : 0;
  const averageTicket = customerCount > 0 ? totalSales / customerCount : 0;
  const digitalPercent = totalSales > 0 ? (websiteSales + mobileSales) / totalSales : 0;

  return {
    labor: 0,
    wastegateway: 0,
    overshort: 0,
    RefundedorderQty: 0,
    TotalCashSales: 0,
    TotalSales: totalSales,
    WasteAlta: 0,
    ModifiedOrderQty: 0,
    TotalTIPS: 0,
    Customercount: customerCount,
    DoorDashSales: 0,
    UberEatsSales: 0,
    GrubHubSales: 0,
    Phone: phoneSales,
    CallCenterAgent: callCenterSales,
    Website: websiteSales,
    Mobile: mobileSales,
    DigitalSalesPercent: digitalPercent,
    TotalPortalEligibleTransactions: 0,
    PutintoPortalPercent: 0,
    InPortalonTimePercent: 0,
    DriveThruSales: driveThruSales,
    Upselling: 0,
    CashSalesVsDepositeDifference: 0,
    Avrageticket: averageTicket,
    Customercountpercent: 0,
    CustomerService: 0,
    HNRTransactions: hnrTransactions,
    HNRTransactionswithCC: 0,
    HNRPromiseBrokenPercent: hnrBrokenPercent,
    HNRPromiseMetPercent: hnrMetPercent,
    HNRPromiseMetTransactions: hnrMet,
  };
}

// ============================================================================
// SLICE
// ============================================================================

const dsprHourlySalesSlice = createSlice({
  name: 'dsprHourlySales',
  initialState,
  reducers: {
    /**
     * Updates filter configuration
     */
    setFilter(_state, action: PayloadAction<Partial<DailyDSPRFilter>>) {
      // Note: DailyDSPRConfig doesn't have a filter property in the types provided
      // This is a placeholder - adjust based on actual config structure
      if (process.env.NODE_ENV === 'development') {
        console.log('[Hourly Sales] Filter update requested:', action.payload);
      }
    },
    
    /**
     * Updates performance thresholds
     */
    setThresholds(state, action: PayloadAction<Partial<DailyPerformanceThresholds>>) {
      state.config.thresholds = {
        ...state.config.thresholds,
        ...action.payload,
      };
      
      // Re-process data with new thresholds if data exists
      if (state.raw && state.processed) {
        state.processed = processHourlySales(
          state.raw,
          state.processed.store,
          state.processed.date,
          state.config
        );
        state.lastProcessed = new Date().toISOString();
      }
    },
    
    /**
     * Updates grade thresholds
     */
    setGradeThresholds(state, action: PayloadAction<Partial<GradeThresholds>>) {
      state.config.gradeThresholds = {
        ...state.config.gradeThresholds,
        ...action.payload,
      };
      
      // Re-process data with new thresholds if data exists
      if (state.raw && state.processed) {
        state.processed = processHourlySales(
          state.raw,
          state.processed.store,
          state.processed.date,
          state.config
        );
        state.lastProcessed = new Date().toISOString();
      }
    },
    
    /**
     * Toggles alerts on/off
     */
    toggleAlerts(state, action: PayloadAction<boolean>) {
      state.config.enableAlerts = action.payload;
      
      // Re-process to update alerts
      if (state.raw && state.processed) {
        state.processed = processHourlySales(
          state.raw,
          state.processed.store,
          state.processed.date,
          state.config
        );
        state.lastProcessed = new Date().toISOString();
      }
    },
    
    /**
     * Resets configuration to default
     */
    resetConfig(state) {
      state.config = defaultDailyDSPRConfig;
      
      // Re-process if data exists
      if (state.raw && state.processed) {
        state.processed = processHourlySales(
          state.raw,
          state.processed.store,
          state.processed.date,
          state.config
        );
        state.lastProcessed = new Date().toISOString();
      }
    },
    
    /**
     * Clears all hourly sales data
     */
    clearHourlySalesData(state) {
      state.raw = null;
      state.processed = null;
      state.lastProcessed = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ========================================================================
      // LISTEN TO CENTRAL API FETCH
      // ========================================================================
      .addCase(fetchDsprData.fulfilled, (state, action) => {
        const hourlySalesData = (action.payload as unknown as { reports?: { daily?: { dailyHourlySales?: HourlySalesPayload } } })?.reports?.daily?.dailyHourlySales;
        const store = (action.payload as any)?.FilteringValues?.store ?? action.meta.arg.store;
        const date = (action.payload as any)?.FilteringValues?.date ?? action.meta.arg.date;
        
        if (!hourlySalesData) {
          if (process.env.NODE_ENV === 'development') {
            console.warn('[Hourly Sales] No hourly sales data in API response');
          }
          return;
        }
        
        try {
          const aggregated = aggregateHourlyToDaily(hourlySalesData);
          state.hours = Array.isArray(hourlySalesData.hours) ? hourlySalesData.hours : [];
          state.raw = aggregated;
          state.processed = processHourlySales(aggregated, store, date, state.config);
          
          // Update timestamp
          state.lastProcessed = new Date().toISOString();
          
          if (process.env.NODE_ENV === 'development') {
            console.log('[Hourly Sales] Data processed:', {
              store,
              date,
              totalSales: aggregated.TotalSales,
              grade: state.processed.grade,
              alertCount: state.processed.alerts.length,
            });
          }
        } catch (error) {
          console.error('[Hourly Sales] Processing error:', error);
        }
      })
      
      // Clear data when central API is cleared
      .addCase(fetchDsprData.rejected, (_state) => {
        // Keep stale data on error
        if (process.env.NODE_ENV === 'development') {
          console.log('[Hourly Sales] Keeping stale data after API error');
        }
      });
  },
});

// ============================================================================
// ACTIONS
// ============================================================================

export const {
  setFilter,
  setThresholds,
  setGradeThresholds,
  toggleAlerts,
  resetConfig,
  clearHourlySalesData,
} = dsprHourlySalesSlice.actions;

// ============================================================================
// SELECTORS
// ============================================================================
const EMPTY_ALERTS: DailyAlert[] = [];

/**
 * Selects the entire hourly sales state
 */
export const selectHourlySalesState = (state: RootState): HourlySalesState => 
  state.dsprHourlySales;

/**
 * Selects raw hourly sales data
 */
export const selectRawHourlySales = (state: RootState): DailyDSPRData | null => 
  state.dsprHourlySales.raw;

/**
 * Selects processed hourly sales data
 */
export const selectProcessedHourlySales = (state: RootState): ProcessedDailyDSPR | null => 
  state.dsprHourlySales.processed;

/**
 * Selects financial summary
 */
export const selectFinancialSummary = (state: RootState): FinancialSummary | null => 
  state.dsprHourlySales.processed?.financial || null;

/**
 * Selects operational summary
 */
export const selectOperationalSummary = (state: RootState): OperationalSummary | null => 
  state.dsprHourlySales.processed?.operational || null;

/**
 * Selects quality summary
 */
export const selectQualitySummary = (state: RootState): QualitySummary | null => 
  state.dsprHourlySales.processed?.quality || null;

/**
 * Selects cost control metrics
 */
export const selectCostControlMetrics = (state: RootState): CostControlMetrics | null => 
  state.dsprHourlySales.processed?.costControl || null;

/**
 * Selects sales channel breakdown
 */
export const selectSalesChannelBreakdown = (state: RootState): SalesChannelBreakdown | null => 
  state.dsprHourlySales.processed?.salesChannels || null;

/**
 * Selects performance grade
 */
export const selectPerformanceGrade = (state: RootState): PerformanceGrade | null => 
  state.dsprHourlySales.processed?.grade || null;

/**
 * Selects alerts
 */
export const selectAlerts = (state: RootState): DailyAlert[] => 
  state.dsprHourlySales.processed?.alerts ?? EMPTY_ALERTS;

/**
 * Selects critical alerts only
 */
export const selectCriticalAlerts = createSelector(
  (state: RootState) => state.dsprHourlySales.processed?.alerts ?? EMPTY_ALERTS,
  (alerts) => alerts.filter(a => a.severity === 'critical')
);

/**
 * Selects current configuration
 */
export const selectHourlySalesConfig = (state: RootState): DailyDSPRConfig => 
  state.dsprHourlySales.config;

/**
 * Selects last processed timestamp
 */
export const selectLastProcessedTime = (state: RootState): string | null => 
  state.dsprHourlySales.lastProcessed;

/**
 * Selects store ID
 */
export const selectHourlySalesStore = (state: RootState): StoreId | null => 
  state.dsprHourlySales.processed?.store || null;

/**
 * Selects business date
 */
export const selectHourlySalesDate = (state: RootState): ApiDate | null => 
  state.dsprHourlySales.processed?.date || null;

/**
 * Selects whether hourly sales data exists
 */
export const selectHasHourlySalesData = (state: RootState): boolean => 
  state.dsprHourlySales.raw !== null;

/**
 * Selects total daily sales
 */
export const selectTotalDailySales = (state: RootState): number => 
  state.dsprHourlySales.processed?.financial.totalSales || 0;

/**
 * Selects total daily orders (customer count as proxy)
 */
export const selectTotalDailyOrders = (state: RootState): number => 
  state.dsprHourlySales.processed?.operational.customerCount || 0;

/**
 * Selects average ticket
 */
export const selectAverageTicket = (state: RootState): number => 
  state.dsprHourlySales.processed?.operational.averageTicket || 0;

/**
 * Selects digital sales percentage
 */
export const selectDigitalSalesPercent = (state: RootState): number => 
  state.dsprHourlySales.processed?.salesChannels.digitalPercent || 0;

/**
 * Selects labor percentage
 */
export const selectLaborPercent = (state: RootState): number => 
  state.dsprHourlySales.processed?.operational.laborPercent || 0;

/**
 * Selects waste percentage
 */
export const selectWastePercent = (state: RootState): number => 
  state.dsprHourlySales.processed?.costControl.wastePercent || 0;

/**
 * Selects customer service score
 */
export const selectCustomerService = (state: RootState): number => 
  state.dsprHourlySales.processed?.quality.customerService || 0;

/**
 * Selects HNR promise met percentage
 */
export const selectPromiseMetPercent = (state: RootState): number => 
  state.dsprHourlySales.processed?.quality.hnrPromiseMetPercent || 0;

/**
 * Selects whether alerts are enabled
 */
export const selectAlertsEnabled = (state: RootState): boolean => 
  state.dsprHourlySales.config.enableAlerts;

/**
 * Selects alert count
 */
export const selectAlertCount = (state: RootState): number => 
  state.dsprHourlySales.processed?.alerts.length || 0;

/**
 * Selects whether there are critical alerts
 */
export const selectHasCriticalAlerts = (state: RootState): boolean => 
  (state.dsprHourlySales.processed?.alerts.some(a => a.severity === 'critical')) || false;

export const selectHourlyHours = (state: RootState): HourRecord[] =>
  state.dsprHourlySales.hours;

// ============================================================================
// REDUCER EXPORT
// ============================================================================

export default dsprHourlySalesSlice.reducer;

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type { HourlySalesState };

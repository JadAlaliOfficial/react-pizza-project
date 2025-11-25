/**
 * ============================================================================
 * DSPR WEEKLY PREVIOUS SLICE
 * ============================================================================
 * Domain: Weekly DSPR (Previous Week Aggregate)
 * 
 * Responsibility:
 * - Derives previous week DSPR data from central DSPR API response
 * - Processes raw previous week aggregate into comprehensive summaries
 * - Provides baseline for week-over-week comparisons
 * - Calculates financial, operational, quality, cost control summaries
 * - Creates structured comparisons with current week
 * - Performs multi-metric trend analysis
 * - Manages configuration for comparison thresholds
 * 
 * Data Flow:
 * 1. Central dsprApiSlice fetches full DsprApiResponse
 * 2. This slice listens to fetchDsprData.fulfilled
 * 3. Extracts reports.weekly.PrevWeekDSPRData
 * 4. Also extracts reports.weekly.DSPRData (current week for comparison)
 * 5. Processes into ProcessedPrevWeekDSPR with summaries
 * 6. Creates WeekOverWeekComparison and MultiMetricTrendAnalysis
 * 7. Components consume via useWeeklyPrevDspr hook
 * 
 * Related Files:
 * - Source: state/dsprApiSlice.ts (central API state)
 * - Types: types/dspr.weeklyPrev.ts (weekly previous types)
 * - Hook: hooks/useWeeklyPrevDspr.ts (React hook)
 * - Compare with: state/dsprWeeklySlice.ts (current week)
 * 
 * State Shape:
 * - raw: PrevWeekDSPRData | null (previous week from API)
 * - rawCurrent: PrevWeekDSPRData | null (current week for comparison)
 * - processed: ProcessedPrevWeekDSPR | null (enriched data)
 * - comparison: WeekOverWeekComparison | null (structured comparison)
 * - trendAnalysis: MultiMetricTrendAnalysis | null (trend insights)
 * - config: PrevWeekDSPRConfig (thresholds and settings)
 * - lastProcessed: string | null (timestamp)
 */

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '@/store';
import { fetchDsprData } from './dsprApiSlice';
import type { StoreId, ApiDate, WeekNumber } from '../types/dspr.common';
import {
  type PrevWeekDSPRData,
  type ProcessedPrevWeekDSPR,
  type PrevWeekFinancialSummary,
  type PrevWeekOperationalSummary,
  type PrevWeekQualitySummary,
  type PrevWeekSalesChannelSummary,
  type PrevWeekCostControlSummary,
  type WeekOverWeekComparison,
  type MultiMetricTrendAnalysis,
  ComparisonDirection,
  PerformanceGrade,
  type PrevWeekDSPRConfig,
  type ComparisonThresholds,
  defaultPrevWeekDSPRConfig,
  calculateTotalWaste,
  calculateWastePercent,
  calculateDigitalSales,
  calculateDeliverySales,
  calculateDeliveryPercent,
  calculateLaborCost,
  calculateNetRevenue,
  calculateDailyAverageSales,
  calculateDailyAverageCustomers,
  calculatePerformanceGrade,
  createWeekOverWeekComparison,
  createMultiMetricTrendAnalysis,
} from '../types/dspr.weeklyPrev';

// ============================================================================
// STATE TYPES
// ============================================================================

/**
 * Weekly previous DSPR slice state
 */
interface WeeklyPrevDSPRState {
  /** Raw previous week DSPR data from API */
  raw: PrevWeekDSPRData | null;
  
  /** Raw current week DSPR data (for comparison) */
  rawCurrent: PrevWeekDSPRData | null;
  
  /** Processed previous week DSPR with summaries */
  processed: ProcessedPrevWeekDSPR | null;
  
  /** Week-over-week comparison (if current week available) */
  comparison: WeekOverWeekComparison | null;
  
  /** Multi-metric trend analysis */
  trendAnalysis: MultiMetricTrendAnalysis | null;
  
  /** Configuration */
  config: PrevWeekDSPRConfig;
  
  /** Timestamp when data was last processed */
  lastProcessed: string | null;
}

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState: WeeklyPrevDSPRState = {
  raw: null,
  rawCurrent: null,
  processed: null,
  comparison: null,
  trendAnalysis: null,
  config: defaultPrevWeekDSPRConfig,
  lastProcessed: null,
};

// ============================================================================
// PROCESSING FUNCTIONS
// ============================================================================

/**
 * Processes previous week financial summary
 */
function processPrevWeekFinancial(
  data: PrevWeekDSPRData,
  operatingDays: number
): PrevWeekFinancialSummary {
  const totalWaste = calculateTotalWaste(data);
  const wastePercent = calculateWastePercent(data);
  const netRevenue = calculateNetRevenue(data);
  const dailyAverageSales = calculateDailyAverageSales(data, operatingDays);
  
  return {
    totalSales: data.TotalSales,
    totalCashSales: data.TotalCashSales,
    totalTips: data.TotalTIPS,
    totalWaste,
    wastePercent,
    overshort: data.overshort,
    cashDepositDifference: data.CashSalesVsDepositeDifference,
    netRevenue,
    dailyAverageSales,
  };
}

/**
 * Processes previous week operational summary
 */
function processPrevWeekOperational(
  data: PrevWeekDSPRData,
  operatingDays: number
): PrevWeekOperationalSummary {
  const laborCost = calculateLaborCost(data);
  const dailyAverageCustomers = calculateDailyAverageCustomers(data, operatingDays);
  
  return {
    laborCost,
    laborPercent: data.labor,
    customerCount: data.Customercount,
    customerCountPercent: data.Customercountpercent,
    averageTicket: data.Avrageticket,
    portalEligibleTransactions: data.TotalPortalEligibleTransactions,
    portalUsageRate: data.PutintoPortalPercent,
    portalOnTimeRate: data.InPortalonTimePercent,
    dailyAverageCustomers,
  };
}

/**
 * Processes previous week quality summary
 */
function processPrevWeekQuality(data: PrevWeekDSPRData): PrevWeekQualitySummary {
  const refundRate = data.Customercount > 0 ? (data.RefundedorderQty / data.Customercount) * 100 : 0;
  
  return {
    customerService: data.CustomerService,
    upselling: data.Upselling,
    portalOnTimePercent: data.InPortalonTimePercent,
    portalUsagePercent: data.PutintoPortalPercent,
    refundedOrderCount: data.RefundedorderQty,
    modifiedOrderCount: data.ModifiedOrderQty,
    refundRate,
  };
}

/**
 * Processes previous week sales channels summary
 */
function processPrevWeekSalesChannels(data: PrevWeekDSPRData): PrevWeekSalesChannelSummary {
  const digitalSales = calculateDigitalSales(data);
  const totalDeliverySales = calculateDeliverySales(data);
  const deliveryPercent = calculateDeliveryPercent(data);
  
  return {
    digitalSales,
    digitalPercent: data.DigitalSalesPercent,
    phoneSales: data.Phone,
    websiteSales: data.Website,
    mobileSales: data.Mobile,
    callCenterSales: data.CallCenterAgent,
    driveThruSales: data.DriveThruSales,
    doorDashSales: data.DoorDashSales,
    uberEatsSales: data.UberEatsSales,
    grubHubSales: data.GrubHubSales,
    totalDeliverySales,
    deliveryPercent,
  };
}

/**
 * Processes previous week cost control summary
 */
function processPrevWeekCostControl(data: PrevWeekDSPRData): PrevWeekCostControlSummary {
  const totalWaste = calculateTotalWaste(data);
  const wastePercent = calculateWastePercent(data);
  
  return {
    totalWaste,
    wastePercent,
    laborPercent: data.labor,
    overshort: data.overshort,
    refundedOrderCount: data.RefundedorderQty,
    modifiedOrderCount: data.ModifiedOrderQty,
  };
}

/**
 * Calculates performance score (0-100)
 */
function calculatePerformanceScore(data: PrevWeekDSPRData): number {
  let score = 100;
  
  // Labor penalty
  if (data.labor > 0.25) {
    score -= 15;
  }
  
  // Waste penalty
  const wastePercent = calculateWastePercent(data);
  if (wastePercent > 0.08) {
    score -= 15;
  }
  
  // Customer service penalty
  if (data.CustomerService < 0.90) {
    score -= 20;
  }
  
  // Portal metrics penalty
  if (data.PutintoPortalPercent < 0.95) {
    score -= 10;
  }
  
  if (data.InPortalonTimePercent < 0.95) {
    score -= 10;
  }
  
  // Digital sales penalty
  if (data.DigitalSalesPercent < 0.40) {
    score -= 10;
  }
  
  // Customer count penalty
  if (data.Customercountpercent < 0.80) {
    score -= 10;
  }
  
  // Average ticket penalty
  if (data.Avrageticket < 12) {
    score -= 10;
  }
  
  return Math.max(0, score);
}

/**
 * Processes raw previous week DSPR data into enriched format
 */
function processPrevWeekDSPR(
  raw: PrevWeekDSPRData,
  store: StoreId,
  week: WeekNumber,
  weekStartDate: ApiDate,
  weekEndDate: ApiDate,
  config: PrevWeekDSPRConfig
): ProcessedPrevWeekDSPR {
  // Process each category
  const financial = processPrevWeekFinancial(raw, config.operatingDaysPerWeek);
  const operational = processPrevWeekOperational(raw, config.operatingDaysPerWeek);
  const quality = processPrevWeekQuality(raw);
  const salesChannels = processPrevWeekSalesChannels(raw);
  const costControl = processPrevWeekCostControl(raw);
  
  // Calculate performance grade
  const performanceScore = calculatePerformanceScore(raw);
  const grade = calculatePerformanceGrade(performanceScore);
  
  return {
    store,
    week,
    weekStartDate,
    weekEndDate,
    raw,
    financial,
    operational,
    quality,
    salesChannels,
    costControl,
    grade,
    processedAt: new Date().toISOString(),
  };
}

// ============================================================================
// SLICE
// ============================================================================

const dsprWeeklyPrevSlice = createSlice({
  name: 'dsprWeeklyPrev',
  initialState,
  reducers: {
    /**
     * Updates comparison thresholds
     */
    setComparisonThresholds(state, action: PayloadAction<Partial<ComparisonThresholds>>) {
      state.config.comparisonThresholds = {
        ...state.config.comparisonThresholds,
        ...action.payload,
      };
      
      // Re-process comparison with new thresholds
      if (state.comparison && state.trendAnalysis) {
        state.trendAnalysis = createMultiMetricTrendAnalysis(
          state.comparison,
          state.config.comparisonThresholds
        );
        state.lastProcessed = new Date().toISOString();
      }
    },
    
    /**
     * Updates operating days per week
     */
    setOperatingDays(state, action: PayloadAction<number>) {
      state.config.operatingDaysPerWeek = action.payload;
      
      // Re-process data with new operating days
      if (state.raw && state.processed) {
        state.processed = processPrevWeekDSPR(
          state.raw,
          state.processed.store,
          state.processed.week,
          state.processed.weekStartDate,
          state.processed.weekEndDate,
          state.config
        );
        state.lastProcessed = new Date().toISOString();
      }
    },
    
    /**
     * Resets configuration to defaults
     */
    resetConfig(state) {
      state.config = defaultPrevWeekDSPRConfig;
      
      // Re-process if data exists
      if (state.raw && state.processed) {
        state.processed = processPrevWeekDSPR(
          state.raw,
          state.processed.store,
          state.processed.week,
          state.processed.weekStartDate,
          state.processed.weekEndDate,
          state.config
        );
        
        if (state.comparison) {
          state.trendAnalysis = createMultiMetricTrendAnalysis(
            state.comparison,
            state.config.comparisonThresholds
          );
        }
        
        state.lastProcessed = new Date().toISOString();
      }
    },
    
    /**
     * Clears all weekly previous DSPR data
     */
    clearWeeklyPrevData(state) {
      state.raw = null;
      state.rawCurrent = null;
      state.processed = null;
      state.comparison = null;
      state.trendAnalysis = null;
      state.lastProcessed = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ========================================================================
      // LISTEN TO CENTRAL API FETCH
      // ========================================================================
      .addCase(fetchDsprData.fulfilled, (state, action) => {
        const prevWeekRaw = action.payload.reports?.weekly?.PrevWeekDSPRData as any;
        const currentWeekRaw = action.payload.reports?.weekly?.DSPRData as any;
        const prevWeekData = prevWeekRaw ? normalizePrevWeekApi(prevWeekRaw) : null;
        const currentWeekData = currentWeekRaw ? normalizePrevWeekApi(currentWeekRaw) : null;
        const fv = (action.payload as any).FilteringValues ?? (action.payload as any)['Filtering Values'];
        const store = fv?.store ?? action.meta.arg.store;
        
        if (!prevWeekData) {
          if (process.env.NODE_ENV === 'development') {
            console.warn('[Weekly Prev DSPR] No previous week data in API response');
          }
          return;
        }
        
        try {
          // Store raw data
          state.raw = prevWeekData;
          state.rawCurrent = currentWeekData || null;
          
          // Calculate previous week number (current week - 1)
          const prevWeek = ((fv?.week ?? 0) - 1) as WeekNumber;
          
          // Calculate previous week dates (7 days before current week)
          const baseStart = fv?.weekStartDate ?? action.meta.arg.date;
          const currentStartDate = new Date(baseStart);
          const prevStartDate = new Date(currentStartDate);
          prevStartDate.setDate(prevStartDate.getDate() - 7);
          
          const baseEnd = fv?.weekEndDate ?? action.meta.arg.date;
          const currentEndDate = new Date(baseEnd);
          const prevEndDate = new Date(currentEndDate);
          prevEndDate.setDate(prevEndDate.getDate() - 7);
          
          const prevWeekStartDate = prevStartDate.toISOString().split('T')[0] as ApiDate;
          const prevWeekEndDate = prevEndDate.toISOString().split('T')[0] as ApiDate;
          
          // Process previous week data
          state.processed = processPrevWeekDSPR(
            prevWeekData,
            store,
            prevWeek,
            prevWeekStartDate,
            prevWeekEndDate,
            state.config
          );
          
          // Create week-over-week comparison if current week available
          if (currentWeekData) {
            state.comparison = createWeekOverWeekComparison(currentWeekData, prevWeekData);
            state.trendAnalysis = createMultiMetricTrendAnalysis(
              state.comparison,
              state.config.comparisonThresholds
            );
          } else {
            state.comparison = null;
            state.trendAnalysis = null;
          }
          
          // Update timestamp
          state.lastProcessed = new Date().toISOString();
          
          if (process.env.NODE_ENV === 'development') {
            console.log('[Weekly Prev DSPR] Data processed:', {
              store,
              prevWeek,
              totalSales: prevWeekData.TotalSales,
              grade: state.processed.grade,
              hasComparison: !!currentWeekData,
            });
          }
        } catch (error) {
          console.error('[Weekly Prev DSPR] Processing error:', error);
        }
      })
      
      // Keep stale data on error
      .addCase(fetchDsprData.rejected, (_state) => {
        if (process.env.NODE_ENV === 'development') {
          console.log('[Weekly Prev DSPR] Keeping stale data after API error');
        }
      });
  },
});

// ============================================================================
// ACTIONS
// ============================================================================

export const {
  setComparisonThresholds,
  setOperatingDays,
  resetConfig,
  clearWeeklyPrevData,
} = dsprWeeklyPrevSlice.actions;

// ============================================================================
// SELECTORS
// ============================================================================

/**
 * Selects the entire weekly previous DSPR state
 */
export const selectWeeklyPrevDsprState = (state: RootState): WeeklyPrevDSPRState => 
  state.dsprWeeklyPrev;

/**
 * Selects raw previous week DSPR data
 */
export const selectRawPrevWeekDspr = (state: RootState): PrevWeekDSPRData | null => 
  state.dsprWeeklyPrev.raw;

/**
 * Selects raw current week DSPR data (for comparison)
 */
export const selectRawCurrentWeekDspr = (state: RootState): PrevWeekDSPRData | null => 
  state.dsprWeeklyPrev.rawCurrent;

/**
 * Selects processed previous week DSPR data
 */
export const selectProcessedPrevWeekDspr = (state: RootState): ProcessedPrevWeekDSPR | null => 
  state.dsprWeeklyPrev.processed;

/**
 * Selects week-over-week comparison
 */
export const selectWeekOverWeekComparison = (state: RootState): WeekOverWeekComparison | null => 
  state.dsprWeeklyPrev.comparison;

/**
 * Selects multi-metric trend analysis
 */
export const selectTrendAnalysis = (state: RootState): MultiMetricTrendAnalysis | null => 
  state.dsprWeeklyPrev.trendAnalysis;

/**
 * Selects previous week financial summary
 */
export const selectPrevWeekFinancial = (state: RootState): PrevWeekFinancialSummary | null => 
  state.dsprWeeklyPrev.processed?.financial || null;

/**
 * Selects previous week operational summary
 */
export const selectPrevWeekOperational = (state: RootState): PrevWeekOperationalSummary | null => 
  state.dsprWeeklyPrev.processed?.operational || null;

/**
 * Selects previous week quality summary
 */
export const selectPrevWeekQuality = (state: RootState): PrevWeekQualitySummary | null => 
  state.dsprWeeklyPrev.processed?.quality || null;

/**
 * Selects previous week sales channels summary
 */
export const selectPrevWeekSalesChannels = (state: RootState): PrevWeekSalesChannelSummary | null => 
  state.dsprWeeklyPrev.processed?.salesChannels || null;

/**
 * Selects previous week cost control summary
 */
export const selectPrevWeekCostControl = (state: RootState): PrevWeekCostControlSummary | null => 
  state.dsprWeeklyPrev.processed?.costControl || null;

/**
 * Selects previous week performance grade
 */
export const selectPrevWeekGrade = (state: RootState): PerformanceGrade | null => 
  state.dsprWeeklyPrev.processed?.grade || null;

/**
 * Selects current configuration
 */
export const selectPrevWeekConfig = (state: RootState): PrevWeekDSPRConfig => 
  state.dsprWeeklyPrev.config;

/**
 * Selects last processed timestamp
 */
export const selectLastProcessedTime = (state: RootState): string | null => 
  state.dsprWeeklyPrev.lastProcessed;

/**
 * Selects store ID
 */
export const selectPrevWeekStore = (state: RootState): StoreId | null => 
  state.dsprWeeklyPrev.processed?.store || null;

/**
 * Selects previous week number
 */
export const selectPrevWeekNumber = (state: RootState): WeekNumber | null => 
  state.dsprWeeklyPrev.processed?.week || null;

/**
 * Selects previous week start date
 */
export const selectPrevWeekStartDate = (state: RootState): ApiDate | null => 
  state.dsprWeeklyPrev.processed?.weekStartDate || null;

/**
 * Selects previous week end date
 */
export const selectPrevWeekEndDate = (state: RootState): ApiDate | null => 
  state.dsprWeeklyPrev.processed?.weekEndDate || null;

/**
 * Selects whether previous week DSPR data exists
 */
export const selectHasPrevWeekDspr = (state: RootState): boolean => 
  state.dsprWeeklyPrev.raw !== null;

/**
 * Selects whether comparison data exists
 */
export const selectHasComparison = (state: RootState): boolean => 
  state.dsprWeeklyPrev.comparison !== null;

/**
 * Selects previous week total sales
 */
export const selectPrevWeekTotalSales = (state: RootState): number => 
  state.dsprWeeklyPrev.processed?.financial.totalSales || 0;

/**
 * Selects previous week labor percentage
 */
export const selectPrevWeekLaborPercent = (state: RootState): number => 
  state.dsprWeeklyPrev.processed?.operational.laborPercent || 0;

/**
 * Selects previous week waste percentage
 */
export const selectPrevWeekWastePercent = (state: RootState): number => 
  state.dsprWeeklyPrev.processed?.financial.wastePercent || 0;

/**
 * Selects previous week digital percentage
 */
export const selectPrevWeekDigitalPercent = (state: RootState): number => 
  state.dsprWeeklyPrev.processed?.salesChannels.digitalPercent || 0;

/**
 * Selects previous week customer service score
 */
export const selectPrevWeekCustomerService = (state: RootState): number => 
  state.dsprWeeklyPrev.processed?.quality.customerService || 0;

/**
 * Selects overall trend direction
 */
export const selectOverallTrend = (state: RootState): ComparisonDirection | null => 
  state.dsprWeeklyPrev.comparison?.overallTrend || null;

/**
 * Selects improved metrics count
 */
export const selectImprovedCount = (state: RootState): number => 
  state.dsprWeeklyPrev.comparison?.improvedCount || 0;

/**
 * Selects declined metrics count
 */
export const selectDeclinedCount = (state: RootState): number => 
  state.dsprWeeklyPrev.comparison?.declinedCount || 0;

/**
 * Selects whether action is recommended based on trends
 */
export const selectIsActionRecommended = (state: RootState): boolean => 
  state.dsprWeeklyPrev.trendAnalysis?.overallHealth.actionRecommended || false;

// ============================================================================
// REDUCER EXPORT
// ============================================================================

export default dsprWeeklyPrevSlice.reducer;

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type { WeeklyPrevDSPRState };
/**
 * Normalizes weekly API payload (snake_case) to internal camelCase structure for prev week
 */
function normalizePrevWeekApi(raw: any): PrevWeekDSPRData {
  return {
    labor: raw?.labor ?? 0,
    wastegateway: raw?.waste_gateway ?? raw?.wastegateway ?? 0,
    overshort: raw?.over_short ?? raw?.overshort ?? 0,
    RefundedorderQty: raw?.Refunded_order_Qty ?? raw?.RefundedorderQty ?? 0,
    TotalCashSales: raw?.Total_Cash_Sales ?? raw?.TotalCashSales ?? 0,
    TotalSales: raw?.Total_Sales ?? raw?.TotalSales ?? 0,
    WasteAlta: raw?.Waste_Alta ?? raw?.WasteAlta ?? 0,
    ModifiedOrderQty: raw?.Modified_Order_Qty ?? raw?.ModifiedOrderQty ?? 0,
    TotalTIPS: raw?.Total_TIPS ?? raw?.TotalTIPS ?? 0,
    Customercount: raw?.Customer_count ?? raw?.Customercount ?? 0,
    DoorDashSales: raw?.DoorDash_Sales ?? raw?.DoorDashSales ?? 0,
    UberEatsSales: raw?.UberEats_Sales ?? raw?.UberEatsSales ?? 0,
    GrubHubSales: raw?.GrubHub_Sales ?? raw?.GrubHubSales ?? 0,
    Phone: raw?.Phone ?? 0,
    CallCenterAgent: raw?.Call_Center_Agent ?? raw?.CallCenterAgent ?? 0,
    Website: raw?.Website ?? 0,
    Mobile: raw?.Mobile ?? 0,
    DigitalSalesPercent: raw?.Digital_Sales_Percent ?? raw?.DigitalSalesPercent ?? 0,
    TotalPortalEligibleTransactions: raw?.Total_Portal_Eligible_Transactions ?? raw?.TotalPortalEligibleTransactions ?? 0,
    PutintoPortalPercent: raw?.Put_into_Portal_Percent ?? raw?.PutintoPortalPercent ?? 0,
    InPortalonTimePercent: raw?.In_Portal_on_Time_Percent ?? raw?.InPortalonTimePercent ?? 0,
    DriveThruSales: raw?.Drive_Thru_Sales ?? raw?.DriveThruSales ?? 0,
    Upselling: raw?.Upselling ?? 0,
    CashSalesVsDepositeDifference: raw?.Cash_Sales_Vs_Deposite_Difference ?? raw?.CashSalesVsDepositeDifference ?? 0,
    Avrageticket: raw?.Avrage_ticket ?? raw?.Avrageticket ?? 0,
    Customercountpercent: raw?.Customer_count_percent ?? raw?.Customercountpercent ?? 0,
    CustomerService: raw?.Customer_Service ?? raw?.CustomerService ?? 0,
  };
}

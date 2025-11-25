/**
 * ============================================================================
 * DSPR WEEKLY SLICE
 * ============================================================================
 * Domain: Weekly DSPR (Current Week Aggregate)
 * 
 * Responsibility:
 * - Derives weekly DSPR data from central DSPR API response
 * - Processes raw weekly aggregate into comprehensive summaries
 * - Calculates financial, operational, quality, cost control summaries
 * - Analyzes weekly trends and projections
 * - Compares with previous week for week-over-week analysis
 * - Manages configuration and filtering
 * - Provides selectors for accessing processed weekly metrics
 * 
 * Data Flow:
 * 1. Central dsprApiSlice fetches full DsprApiResponse
 * 2. This slice listens to fetchDsprData.fulfilled
 * 3. Extracts reports.weekly.DSPRData (current week)
 * 4. Optionally extracts reports.weekly.PrevWeekDSPRData for comparison
 * 5. Processes into ProcessedWeeklyDSPR with summaries
 * 6. Components consume via useWeeklyDspr hook
 * 
 * Related Files:
 * - Source: state/dsprApiSlice.ts (central API state)
 * - Types: types/dspr.weeklyCurrent.ts (weekly current types)
 * - Hook: hooks/useWeeklyDspr.ts (React hook)
 * 
 * State Shape:
 * - raw: WeeklyDSPRData | null (current week from API)
 * - rawPrevious: WeeklyDSPRData | null (previous week from API)
 * - processed: ProcessedWeeklyDSPR | null (enriched data)
 * - comparison: WeeklyComparison | null (week-over-week)
 * - config: WeeklyDSPRConfig (thresholds and settings)
 * - lastProcessed: string | null (timestamp)
 */

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '@/store';
import { fetchDsprData } from './dsprApiSlice';
import type { StoreId, ApiDate, WeekNumber } from '../types/dspr.common';
import {
  type WeeklyDSPRData,
  type ProcessedWeeklyDSPR,
  type WeeklyFinancialSummary,
  type WeeklyOperationalSummary,
  type WeeklyQualitySummary,
  type WeeklySalesChannelSummary,
  type WeeklyCostControlSummary,
  type WeeklyTrends,
  type WeeklyComparison,
  type WeekOverWeekChange,
  PerformanceGrade,
  GrowthIndicator,
  type WeeklyDSPRConfig,
  type WeeklyPerformanceThresholds,
  type WeeklyDSPRFilter,
  defaultWeeklyDSPRConfig,
  calculateTotalWaste,
  calculateWastePercent,
  calculateDigitalSales,
  calculateDeliverySales,
  calculateDeliveryPercent,
  calculateLaborCost,
  calculateNetRevenue,
  calculateDailyAverageSales,
  calculateDailyAverageCustomers,
  calculateAnnualRunRate,
  calculateCostEfficiencyScore,
  calculatePerformanceScore,
  calculatePerformanceGrade,
  calculateGrowthIndicator,
  calculateWeekOverWeekChange,
  calculateWeekProgress,
  projectWeekTotal,
} from '../types/dspr.weeklyCurrent';

// ============================================================================
// STATE TYPES
// ============================================================================

/**
 * Weekly DSPR slice state
 */
interface WeeklyDSPRState {
  /** Raw current week DSPR data from API */
  raw: WeeklyDSPRData | null;
  
  /** Raw previous week DSPR data from API (for comparison) */
  rawPrevious: WeeklyDSPRData | null;
  
  /** Processed current week DSPR with summaries */
  processed: ProcessedWeeklyDSPR | null;
  
  /** Week-over-week comparison (if previous week available) */
  comparison: WeeklyComparison | null;
  
  /** Configuration */
  config: WeeklyDSPRConfig;
  
  /** Timestamp when data was last processed */
  lastProcessed: string | null;
}

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState: WeeklyDSPRState = {
  raw: null,
  rawPrevious: null,
  processed: null,
  comparison: null,
  config: defaultWeeklyDSPRConfig,
  lastProcessed: null,
};

// ============================================================================
// PROCESSING FUNCTIONS
// ============================================================================

/**
 * Processes weekly financial summary
 */
function processWeeklyFinancial(
  data: WeeklyDSPRData,
  operatingDays: number
): WeeklyFinancialSummary {
  const totalWaste = calculateTotalWaste(data);
  const wastePercent = calculateWastePercent(data);
  const netRevenue = calculateNetRevenue(data);
  const dailyAverageSales = calculateDailyAverageSales(data, operatingDays);
  const dailyAverageTips = data.TotalTIPS / operatingDays;
  
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
    dailyAverageTips,
  };
}

/**
 * Processes weekly operational summary
 */
function processWeeklyOperational(
  data: WeeklyDSPRData,
  operatingDays: number
): WeeklyOperationalSummary {
  const laborCost = calculateLaborCost(data);
  const dailyAverageCustomers = calculateDailyAverageCustomers(data, operatingDays);
  const customersPerDay = data.Customercount / operatingDays;
  
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
    customersPerDay,
  };
}

/**
 * Processes weekly quality summary
 */
function processWeeklyQuality(data: WeeklyDSPRData): WeeklyQualitySummary {
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
 * Processes weekly sales channel summary
 */
function processWeeklySalesChannels(data: WeeklyDSPRData): WeeklySalesChannelSummary {
  const digitalSales = calculateDigitalSales(data);
  const totalDeliverySales = calculateDeliverySales(data);
  const deliveryPercent = calculateDeliveryPercent(data);
  
  // Digital growth indicator (would need historical data for accurate calculation)
  const digitalGrowthIndicator = data.DigitalSalesPercent >= 0.5 
    ? GrowthIndicator.STRONG 
    : data.DigitalSalesPercent >= 0.4 
    ? GrowthIndicator.MODERATE 
    : GrowthIndicator.FLAT;
  
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
    digitalGrowthIndicator,
  };
}

/**
 * Processes weekly cost control summary
 */
function processWeeklyCostControl(
  data: WeeklyDSPRData,
  thresholds: WeeklyPerformanceThresholds
): WeeklyCostControlSummary {
  const totalWaste = calculateTotalWaste(data);
  const wastePercent = calculateWastePercent(data);
  const costEfficiencyScore = calculateCostEfficiencyScore(data, thresholds);
  
  return {
    totalWaste,
    wastePercent,
    laborPercent: data.labor,
    overshort: data.overshort,
    refundedOrderCount: data.RefundedorderQty,
    modifiedOrderCount: data.ModifiedOrderQty,
    costEfficiencyScore,
  };
}

/**
 * Processes weekly trends
 */
function processWeeklyTrends(
  data: WeeklyDSPRData,
  operatingDays: number,
  weekProgress: number
): WeeklyTrends {
  const dailyAverageSales = calculateDailyAverageSales(data, operatingDays);
  const dailyAverageCustomers = calculateDailyAverageCustomers(data, operatingDays);
  const dailyAverageTicket = data.Avrageticket;
  const salesPerCustomer = data.Customercount > 0 ? data.TotalSales / data.Customercount : 0;
  const annualRunRate = calculateAnnualRunRate(data);
  
  const projectedWeekTotal = weekProgress < 1 
    ? projectWeekTotal(data.TotalSales, weekProgress) 
    : undefined;
  
  return {
    dailyAverageSales,
    dailyAverageCustomers,
    dailyAverageTicket,
    salesPerCustomer,
    operatingDays,
    projectedWeekTotal,
    annualRunRate,
  };
}

/**
 * Creates week-over-week comparison
 */
function createWeeklyComparison(
  current: WeeklyDSPRData,
  previous: WeeklyDSPRData
): WeeklyComparison {
  const sales = calculateWeekOverWeekChange('sales', current.TotalSales, previous.TotalSales);
  const customers = calculateWeekOverWeekChange('customers', current.Customercount, previous.Customercount);
  const averageTicket = calculateWeekOverWeekChange('averageTicket', current.Avrageticket, previous.Avrageticket);
  const laborPercent = calculateWeekOverWeekChange('laborPercent', current.labor, previous.labor);
  
  const currentWaste = calculateWastePercent(current);
  const previousWaste = calculateWastePercent(previous);
  const wastePercent = calculateWeekOverWeekChange('wastePercent', currentWaste, previousWaste);
  
  const digitalPercent = calculateWeekOverWeekChange('digitalPercent', current.DigitalSalesPercent, previous.DigitalSalesPercent);
  const customerService = calculateWeekOverWeekChange('customerService', current.CustomerService, previous.CustomerService);
  
  // Determine overall trend based on key metrics
  const avgChangePercent = (sales.changePercent + customers.changePercent + averageTicket.changePercent) / 3;
  const overallTrend = calculateGrowthIndicator(avgChangePercent);
  
  return {
    sales,
    customers,
    averageTicket,
    laborPercent,
    wastePercent,
    digitalPercent,
    customerService,
    overallTrend,
  };
}

/**
 * Processes raw weekly DSPR data into enriched format
 */
function processWeeklyDSPR(
  raw: WeeklyDSPRData,
  store: StoreId,
  week: WeekNumber,
  weekStartDate: ApiDate,
  weekEndDate: ApiDate,
  config: WeeklyDSPRConfig
): ProcessedWeeklyDSPR {
  const weekProgress = calculateWeekProgress(weekStartDate, weekEndDate);
  
  // Process each category
  const financial = processWeeklyFinancial(raw, config.operatingDaysPerWeek);
  const operational = processWeeklyOperational(raw, config.operatingDaysPerWeek);
  const quality = processWeeklyQuality(raw);
  const salesChannels = processWeeklySalesChannels(raw);
  const costControl = processWeeklyCostControl(raw, config.thresholds);
  const trends = processWeeklyTrends(raw, config.operatingDaysPerWeek, weekProgress);
  
  // Calculate performance grade
  const performanceScore = calculatePerformanceScore(raw, config.thresholds);
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
    trends,
    grade,
    weekProgress,
    processedAt: new Date().toISOString(),
  };
}

// ============================================================================
// SLICE
// ============================================================================

const dsprWeeklySlice = createSlice({
  name: 'dsprWeekly',
  initialState,
  reducers: {
    /**
     * Updates performance thresholds
     */
    setPerformanceThresholds(state, action: PayloadAction<Partial<WeeklyPerformanceThresholds>>) {
      state.config.thresholds = {
        ...state.config.thresholds,
        ...action.payload,
      };
      
      // Re-process data with new thresholds
      if (state.raw && state.processed) {
        state.processed = processWeeklyDSPR(
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
     * Updates filter settings
     */
    setFilter(state, action: PayloadAction<Partial<WeeklyDSPRFilter>>) {
      state.config.filter = {
        ...state.config.filter,
        ...action.payload,
      };
    },
    
    /**
     * Clears filter
     */
    clearFilter(state) {
      state.config.filter = {};
    },
    
    /**
     * Updates operating days per week
     */
    setOperatingDays(state, action: PayloadAction<number>) {
      state.config.operatingDaysPerWeek = action.payload;
      
      // Re-process data with new operating days
      if (state.raw && state.processed) {
        state.processed = processWeeklyDSPR(
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
      state.config = defaultWeeklyDSPRConfig;
      
      // Re-process if data exists
      if (state.raw && state.processed) {
        state.processed = processWeeklyDSPR(
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
     * Clears all weekly DSPR data
     */
    clearWeeklyData(state) {
      state.raw = null;
      state.rawPrevious = null;
      state.processed = null;
      state.comparison = null;
      state.lastProcessed = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ========================================================================
      // LISTEN TO CENTRAL API FETCH
      // ========================================================================
      .addCase(fetchDsprData.fulfilled, (state, action) => {
        const weeklyRaw = action.payload.reports?.weekly?.DSPRData as any;
        const prevWeekRaw = action.payload.reports?.weekly?.PrevWeekDSPRData as any | undefined;
        const weeklyData = weeklyRaw ? normalizeWeeklyApi(weeklyRaw) : null;
        const prevWeekData = prevWeekRaw ? normalizeWeeklyApi(prevWeekRaw) : undefined;
        const fv = (action.payload as any).FilteringValues ?? (action.payload as any)['Filtering Values'];
        const store = fv?.store ?? action.meta.arg.store;
        const week = fv?.week ?? (() => {
          const d = new Date(action.meta.arg.date);
          if (isNaN(d.getTime())) return 0 as any;
          const oneJan = new Date(d.getFullYear(), 0, 1);
          const dayMs = 86400000;
          return Math.ceil((((d.getTime() - oneJan.getTime()) / dayMs) + oneJan.getDay() + 1) / 7) as any;
        })();
        const weekStartDate = (fv?.weekStartDate ?? new Date(action.meta.arg.date).toISOString().split('T')[0]) as any;
        const weekEndDate = (fv?.weekEndDate ?? new Date(action.meta.arg.date).toISOString().split('T')[0]) as any;
        
        if (!weeklyData) {
          if (process.env.NODE_ENV === 'development') {
            console.warn('[Weekly DSPR] No weekly data in API response');
          }
          return;
        }
        
        try {
          // Store raw data
          state.raw = weeklyData;
          state.rawPrevious = prevWeekData || null;
          
          // Process weekly data
          state.processed = processWeeklyDSPR(
            weeklyData,
            store,
            week,
            weekStartDate,
            weekEndDate,
            state.config
          );
          
          // Create week-over-week comparison if previous week available
          if (prevWeekData) {
            state.comparison = createWeeklyComparison(weeklyData, prevWeekData);
          } else {
            state.comparison = null;
          }
          
          // Update timestamp
          state.lastProcessed = new Date().toISOString();
          
          if (process.env.NODE_ENV === 'development') {
            console.log('[Weekly DSPR] Data processed:', {
              store,
              week,
              totalSales: weeklyData.TotalSales,
              grade: state.processed.grade,
              hasPreviousWeek: !!prevWeekData,
            });
          }
        } catch (error) {
          console.error('[Weekly DSPR] Processing error:', error);
        }
      })
      
      // Keep stale data on error
      .addCase(fetchDsprData.rejected, (_state) => {
        if (process.env.NODE_ENV === 'development') {
          console.log('[Weekly DSPR] Keeping stale data after API error');
        }
      });
  },
});

// ============================================================================
// ACTIONS
// ============================================================================

export const {
  setPerformanceThresholds,
  setFilter,
  clearFilter,
  setOperatingDays,
  resetConfig,
  clearWeeklyData,
} = dsprWeeklySlice.actions;

// ============================================================================
// SELECTORS
// ============================================================================

/**
 * Selects the entire weekly DSPR state
 */
export const selectWeeklyDsprState = (state: RootState): WeeklyDSPRState => 
  state.dsprWeekly;

/**
 * Selects raw current week DSPR data
 */
export const selectRawWeeklyDspr = (state: RootState): WeeklyDSPRData | null => 
  state.dsprWeekly.raw;

/**
 * Selects raw previous week DSPR data
 */
export const selectRawPreviousWeekDspr = (state: RootState): WeeklyDSPRData | null => 
  state.dsprWeekly.rawPrevious;

/**
 * Selects processed weekly DSPR data
 */
export const selectProcessedWeeklyDspr = (state: RootState): ProcessedWeeklyDSPR | null => 
  state.dsprWeekly.processed;

/**
 * Selects week-over-week comparison
 */
export const selectWeeklyComparison = (state: RootState): WeeklyComparison | null => 
  state.dsprWeekly.comparison;

/**
 * Selects weekly financial summary
 */
export const selectWeeklyFinancial = (state: RootState): WeeklyFinancialSummary | null => 
  state.dsprWeekly.processed?.financial || null;

/**
 * Selects weekly operational summary
 */
export const selectWeeklyOperational = (state: RootState): WeeklyOperationalSummary | null => 
  state.dsprWeekly.processed?.operational || null;

/**
 * Selects weekly quality summary
 */
export const selectWeeklyQuality = (state: RootState): WeeklyQualitySummary | null => 
  state.dsprWeekly.processed?.quality || null;

/**
 * Selects weekly sales channel summary
 */
export const selectWeeklySalesChannels = (state: RootState): WeeklySalesChannelSummary | null => 
  state.dsprWeekly.processed?.salesChannels || null;

/**
 * Selects weekly cost control summary
 */
export const selectWeeklyCostControl = (state: RootState): WeeklyCostControlSummary | null => 
  state.dsprWeekly.processed?.costControl || null;

/**
 * Selects weekly trends
 */
export const selectWeeklyTrends = (state: RootState): WeeklyTrends | null => 
  state.dsprWeekly.processed?.trends || null;

/**
 * Selects weekly performance grade
 */
export const selectWeeklyGrade = (state: RootState): PerformanceGrade | null => 
  state.dsprWeekly.processed?.grade || null;

/**
 * Selects week progress (0-1)
 */
export const selectWeekProgress = (state: RootState): number => 
  state.dsprWeekly.processed?.weekProgress || 0;

/**
 * Selects current configuration
 */
export const selectWeeklyConfig = (state: RootState): WeeklyDSPRConfig => 
  state.dsprWeekly.config;

/**
 * Selects current filter
 */
export const selectWeeklyFilter = (state: RootState): WeeklyDSPRFilter => 
  state.dsprWeekly.config.filter;

/**
 * Selects last processed timestamp
 */
export const selectLastProcessedTime = (state: RootState): string | null => 
  state.dsprWeekly.lastProcessed;

/**
 * Selects store ID
 */
export const selectWeeklyStore = (state: RootState): StoreId | null => 
  state.dsprWeekly.processed?.store || null;

/**
 * Selects week number
 */
export const selectWeekNumber = (state: RootState): WeekNumber | null => 
  state.dsprWeekly.processed?.week || null;

/**
 * Selects week start date
 */
export const selectWeekStartDate = (state: RootState): ApiDate | null => 
  state.dsprWeekly.processed?.weekStartDate || null;

/**
 * Selects week end date
 */
export const selectWeekEndDate = (state: RootState): ApiDate | null => 
  state.dsprWeekly.processed?.weekEndDate || null;

/**
 * Selects whether weekly DSPR data exists
 */
export const selectHasWeeklyDspr = (state: RootState): boolean => 
  state.dsprWeekly.raw !== null;

/**
 * Selects whether previous week data exists
 */
export const selectHasPreviousWeek = (state: RootState): boolean => 
  state.dsprWeekly.rawPrevious !== null;

/**
 * Selects total weekly sales
 */
export const selectWeeklyTotalSales = (state: RootState): number => 
  state.dsprWeekly.processed?.financial.totalSales || 0;

/**
 * Selects daily average sales
 */
export const selectDailyAverageSales = (state: RootState): number => 
  state.dsprWeekly.processed?.trends.dailyAverageSales || 0;

/**
 * Selects weekly labor percentage
 */
export const selectWeeklyLaborPercent = (state: RootState): number => 
  state.dsprWeekly.processed?.operational.laborPercent || 0;

/**
 * Selects weekly waste percentage
 */
export const selectWeeklyWastePercent = (state: RootState): number => 
  state.dsprWeekly.processed?.financial.wastePercent || 0;

/**
 * Selects weekly digital adoption rate
 */
export const selectWeeklyDigitalPercent = (state: RootState): number => 
  state.dsprWeekly.processed?.salesChannels.digitalPercent || 0;

/**
 * Selects weekly customer service score
 */
export const selectWeeklyCustomerService = (state: RootState): number => 
  state.dsprWeekly.processed?.quality.customerService || 0;

/**
 * Selects projected week total
 */
export const selectProjectedWeekTotal = (state: RootState): number | undefined => 
  state.dsprWeekly.processed?.trends.projectedWeekTotal;

/**
 * Selects annual run rate
 */
export const selectAnnualRunRate = (state: RootState): number => 
  state.dsprWeekly.processed?.trends.annualRunRate || 0;

/**
 * Selects overall weekly trend
 */
export const selectOverallTrend = (state: RootState): GrowthIndicator | null => 
  state.dsprWeekly.comparison?.overallTrend || null;

/**
 * Selects sales week-over-week change
 */
export const selectSalesWoWChange = (state: RootState): WeekOverWeekChange | null => 
  state.dsprWeekly.comparison?.sales || null;

/**
 * Selects customer count week-over-week change
 */
export const selectCustomersWoWChange = (state: RootState): WeekOverWeekChange | null => 
  state.dsprWeekly.comparison?.customers || null;

/**
 * Selects cost efficiency score
 */
export const selectCostEfficiencyScore = (state: RootState): number => 
  state.dsprWeekly.processed?.costControl.costEfficiencyScore || 0;

// ============================================================================
// REDUCER EXPORT
// ============================================================================

export default dsprWeeklySlice.reducer;

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type { WeeklyDSPRState };
/**
 * Normalizes weekly API payload (snake_case) to internal camelCase structure
 */
function normalizeWeeklyApi(raw: any): WeeklyDSPRData {
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

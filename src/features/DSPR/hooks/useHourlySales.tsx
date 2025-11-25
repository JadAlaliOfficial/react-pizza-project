/**
 * ============================================================================
 * USE HOURLY SALES HOOK
 * ============================================================================
 * Domain: Hourly Sales (Daily Sales by Hour)
 * 
 * Responsibility:
 * - React hook for consuming hourly sales Redux state
 * - Provides simple interface for accessing hourly data and summaries
 * - Exposes configuration methods for filtering and thresholds
 * - Handles automatic data derivation from central DSPR API
 * - Provides convenience methods for updating settings
 * 
 * Related Files:
 * - State: state/dsprHourlySalesSlice.ts (Redux slice)
 * - Types: types/dspr.hourlySales.ts (using DailyDSPRData structure)
 * - Central API: state/dsprApiSlice.ts (data source)
 * 
 * Usage:
 * ```
 * function HourlySalesComponent() {
 *   const {
 *     raw,
 *     processed,
 *     financial,
 *     operational,
 *     quality,
 *     salesChannels,
 *     grade,
 *     alerts,
 *     hasData,
 *     setThresholds,
 *     toggleAlerts,
 *   } = useHourlySales();
 * 
 *   if (!hasData) return <Empty />;
 * 
 *   return (
 *     <div>
 *       <SalesSummary data={financial} />
 *       <QualityMetrics data={quality} />
 *       <AlertList alerts={alerts} />
 *     </div>
 *   );
 * }
 * ```
 */

import { useCallback, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  selectRawHourlySales,
  selectProcessedHourlySales,
  selectFinancialSummary,
  selectOperationalSummary,
  selectQualitySummary,
  selectCostControlMetrics,
  selectSalesChannelBreakdown,
  selectPerformanceGrade,
  selectAlerts,
  selectCriticalAlerts,
  selectHourlySalesConfig,
  selectLastProcessedTime,
  selectHourlySalesStore,
  selectHourlySalesDate,
  selectHasHourlySalesData,
  selectTotalDailySales,
  selectTotalDailyOrders,
  selectAverageTicket,
  selectDigitalSalesPercent,
  selectLaborPercent,
  selectWastePercent,
  selectCustomerService,
  selectPromiseMetPercent,
  selectAlertsEnabled,
  selectAlertCount,
  selectHasCriticalAlerts,
  selectHourlyHours,
  setThresholds as setThresholdsAction,
  setGradeThresholds as setGradeThresholdsAction,
  toggleAlerts as toggleAlertsAction,
  resetConfig as resetConfigAction,
  clearHourlySalesData as clearDataAction,
} from '../store/dsprHourlySalesSlice';
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
  type DailyPerformanceThresholds,
  type GradeThresholds,
} from '../types/dspr.hourlySales';
import type { StoreId, ApiDate } from '../types/dspr.common';
import type { HourRecord } from '../store/dsprHourlySalesSlice';

// ============================================================================
// HOOK RETURN TYPE
// ============================================================================

/**
 * Return type for useHourlySales hook
 */
export interface UseHourlySalesReturn {
  // ========================================================================
  // DATA
  // ========================================================================
  
  /** Raw hourly sales data from API */
  raw: DailyDSPRData | null;
  
  /** Processed hourly sales with categorized summaries */
  processed: ProcessedDailyDSPR | null;
  
  /** Financial summary */
  financial: FinancialSummary | null;
  
  /** Operational summary */
  operational: OperationalSummary | null;
  
  /** Quality summary */
  quality: QualitySummary | null;
  
  /** Cost control metrics */
  costControl: CostControlMetrics | null;
  
  /** Sales channel breakdown */
  salesChannels: SalesChannelBreakdown | null;
  /** Hourly raw records */
  hours: HourRecord[];
  
  /** Performance grade */
  grade: PerformanceGrade | null;
  
  /** All alerts */
  alerts: DailyAlert[];
  
  /** Critical alerts only */
  criticalAlerts: DailyAlert[];
  
  // ========================================================================
  // METRICS
  // ========================================================================
  
  /** Total daily sales ($) */
  totalSales: number;
  
  /** Total daily orders (customer count) */
  totalOrders: number;
  
  /** Average ticket ($) */
  averageTicket: number;
  
  /** Digital sales percentage (0-1) */
  digitalPercent: number;
  
  /** Labor percentage (0-1) */
  laborPercent: number;
  
  /** Waste percentage (0-1) */
  wastePercent: number;
  
  /** Customer service score (0-1) */
  customerService: number;
  
  /** HNR promise met percentage (0-100) */
  promiseMetPercent: number;
  
  // ========================================================================
  // STATE
  // ========================================================================
  
  /** Whether hourly sales data exists */
  hasData: boolean;
  
  /** Store ID */
  store: StoreId | null;
  
  /** Business date */
  date: ApiDate | null;
  
  /** Last processed timestamp */
  lastProcessed: string | null;
  
  /** Whether alerts are enabled */
  alertsEnabled: boolean;
  
  /** Total alert count */
  alertCount: number;
  
  /** Whether there are critical alerts */
  hasCriticalAlerts: boolean;
  
  // ========================================================================
  // CONFIGURATION
  // ========================================================================
  
  /** Current configuration */
  config: DailyDSPRConfig;
  
  // ========================================================================
  // ACTIONS
  // ========================================================================
  
  /**
   * Updates performance thresholds
   * @param thresholds - Partial thresholds to update
   */
  setThresholds: (thresholds: Partial<DailyPerformanceThresholds>) => void;
  
  /**
   * Updates grade thresholds
   * @param thresholds - Partial grade thresholds to update
   */
  setGradeThresholds: (thresholds: Partial<GradeThresholds>) => void;
  
  /**
   * Toggles alerts on/off
   * @param enabled - Whether to enable alerts
   */
  toggleAlerts: (enabled: boolean) => void;
  
  /**
   * Resets configuration to defaults
   */
  resetConfig: () => void;
  
  /**
   * Clears all hourly sales data
   */
  clearData: () => void;
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Custom hook for accessing and managing hourly sales data
 * 
 * Provides a simple interface for consuming hourly sales metrics,
 * summaries, alerts, and configuration. Data is automatically derived
 * from the central DSPR API response.
 * 
 * @returns Object with data, metrics, state, and action methods
 * 
 * @example
 * ```
 * function Dashboard() {
 *   const {
 *     financial,
 *     quality,
 *     grade,
 *     alerts,
 *     hasData,
 *     setThresholds,
 *   } = useHourlySales();
 * 
 *   if (!hasData) return <NoData />;
 * 
 *   return (
 *     <div>
 *       <PerformanceBadge grade={grade} />
 *       <FinancialSummary data={financial} />
 *       <QualityMetrics data={quality} />
 *       <AlertPanel alerts={alerts} />
 *     </div>
 *   );
 * }
 * ```
 */
export function useHourlySales(): UseHourlySalesReturn {
  const dispatch = useAppDispatch();
  
  // ========================================================================
  // SELECTORS
  // ========================================================================
  
  const raw = useAppSelector(selectRawHourlySales);
  const processed = useAppSelector(selectProcessedHourlySales);
  const financial = useAppSelector(selectFinancialSummary);
  const operational = useAppSelector(selectOperationalSummary);
  const quality = useAppSelector(selectQualitySummary);
  const costControl = useAppSelector(selectCostControlMetrics);
  const salesChannels = useAppSelector(selectSalesChannelBreakdown);
  const grade = useAppSelector(selectPerformanceGrade);
  const alerts = useAppSelector(selectAlerts);
  const criticalAlerts = useAppSelector(selectCriticalAlerts);
  const config = useAppSelector(selectHourlySalesConfig);
  const lastProcessed = useAppSelector(selectLastProcessedTime);
  const store = useAppSelector(selectHourlySalesStore);
  const date = useAppSelector(selectHourlySalesDate);
  const hasData = useAppSelector(selectHasHourlySalesData);
  const totalSales = useAppSelector(selectTotalDailySales);
  const totalOrders = useAppSelector(selectTotalDailyOrders);
  const averageTicket = useAppSelector(selectAverageTicket);
  const digitalPercent = useAppSelector(selectDigitalSalesPercent);
  const laborPercent = useAppSelector(selectLaborPercent);
  const wastePercent = useAppSelector(selectWastePercent);
  const customerService = useAppSelector(selectCustomerService);
  const promiseMetPercent = useAppSelector(selectPromiseMetPercent);
  const alertsEnabled = useAppSelector(selectAlertsEnabled);
  const alertCount = useAppSelector(selectAlertCount);
  const hasCriticalAlerts = useAppSelector(selectHasCriticalAlerts);
  const hours = useAppSelector(selectHourlyHours);
  
  // ========================================================================
  // ACTIONS
  // ========================================================================
  
  /**
   * Updates performance thresholds
   */
  const setThresholds = useCallback(
    (thresholds: Partial<DailyPerformanceThresholds>) => {
      dispatch(setThresholdsAction(thresholds));
      
      if (process.env.NODE_ENV === 'development') {
        console.log('[useHourlySales] Thresholds updated:', thresholds);
      }
    },
    [dispatch]
  );
  
  /**
   * Updates grade thresholds
   */
  const setGradeThresholds = useCallback(
    (thresholds: Partial<GradeThresholds>) => {
      dispatch(setGradeThresholdsAction(thresholds));
      
      if (process.env.NODE_ENV === 'development') {
        console.log('[useHourlySales] Grade thresholds updated:', thresholds);
      }
    },
    [dispatch]
  );
  
  /**
   * Toggles alerts on/off
   */
  const toggleAlerts = useCallback(
    (enabled: boolean) => {
      dispatch(toggleAlertsAction(enabled));
      
      if (process.env.NODE_ENV === 'development') {
        console.log('[useHourlySales] Alerts toggled:', enabled);
      }
    },
    [dispatch]
  );
  
  /**
   * Resets configuration to defaults
   */
  const resetConfig = useCallback(() => {
    dispatch(resetConfigAction());
    
    if (process.env.NODE_ENV === 'development') {
      console.log('[useHourlySales] Configuration reset to defaults');
    }
  }, [dispatch]);
  
  /**
   * Clears all hourly sales data
   */
  const clearData = useCallback(() => {
    dispatch(clearDataAction());
    
    if (process.env.NODE_ENV === 'development') {
      console.log('[useHourlySales] Data cleared');
    }
  }, [dispatch]);
  
  // ========================================================================
  // RETURN
  // ========================================================================
  
  return {
    // Data
    raw,
    processed,
    financial,
    operational,
    quality,
    costControl,
    salesChannels,
    hours,
    grade,
    alerts,
    criticalAlerts,
    
    // Metrics
    totalSales,
    totalOrders,
    averageTicket,
    digitalPercent,
    laborPercent,
    wastePercent,
    customerService,
    promiseMetPercent,
    
    // State
    hasData,
    store,
    date,
    lastProcessed,
    alertsEnabled,
    alertCount,
    hasCriticalAlerts,
    
    // Configuration
    config,
    
    // Actions
    setThresholds,
    setGradeThresholds,
    toggleAlerts,
    resetConfig,
    clearData,
  };
}

// ============================================================================
// CONVENIENCE HOOKS
// ============================================================================

/**
 * Hook for checking if hourly sales data is available
 * 
 * @returns Boolean indicating if data exists
 * 
 * @example
 * ```
 * const hasData = useHasHourlySales();
 * if (!hasData) return <LoadingState />;
 * ```
 */
export function useHasHourlySales(): boolean {
  return useAppSelector(selectHasHourlySalesData);
}

/**
 * Hook for accessing only financial metrics
 * 
 * @returns Financial summary or null
 * 
 * @example
 * ```
 * const financial = useHourlySalesFinancial();
 * return <FinancialDashboard data={financial} />;
 * ```
 */
export function useHourlySalesFinancial(): FinancialSummary | null {
  return useAppSelector(selectFinancialSummary);
}

/**
 * Hook for accessing only quality metrics
 * 
 * @returns Quality summary or null
 * 
 * @example
 * ```
 * const quality = useHourlySalesQuality();
 * return <QualityDashboard data={quality} />;
 * ```
 */
export function useHourlySalesQuality(): QualitySummary | null {
  return useAppSelector(selectQualitySummary);
}

/**
 * Hook for accessing only alerts
 * 
 * @returns Array of alerts
 * 
 * @example
 * ```
 * const alerts = useHourlySalesAlerts();
 * return <AlertPanel alerts={alerts} />;
 * ```
 */
export function useHourlySalesAlerts(): DailyAlert[] {
  return useAppSelector(selectAlerts);
}

/**
 * Hook for accessing critical alerts only
 * 
 * @returns Array of critical alerts
 * 
 * @example
 * ```
 * const criticalAlerts = useHourlySalesCriticalAlerts();
 * if (criticalAlerts.length > 0) return <UrgentBanner alerts={criticalAlerts} />;
 * ```
 */
export function useHourlySalesCriticalAlerts(): DailyAlert[] {
  return useAppSelector(selectCriticalAlerts);
}

/**
 * Hook for checking if there are critical alerts
 * 
 * @returns Boolean indicating if critical alerts exist
 * 
 * @example
 * ```
 * const hasCritical = useHasCriticalHourlySalesAlerts();
 * return <StatusIndicator critical={hasCritical} />;
 * ```
 */
export function useHasCriticalHourlySalesAlerts(): boolean {
  return useAppSelector(selectHasCriticalAlerts);
}

/**
 * Hook for accessing performance grade
 * 
 * @returns Performance grade or null
 * 
 * @example
 * ```
 * const grade = useHourlySalesGrade();
 * return <GradeBadge grade={grade} />;
 * ```
 */
export function useHourlySalesGrade(): PerformanceGrade | null {
  return useAppSelector(selectPerformanceGrade);
}

/**
 * Hook for accessing key metrics only
 * 
 * @returns Object with key metrics
 * 
 * @example
 * ```
 * const metrics = useHourlySalesMetrics();
 * return <MetricsDashboard {...metrics} />;
 * ```
 */
export function useHourlySalesMetrics() {
  const totalSales = useAppSelector(selectTotalDailySales);
  const totalOrders = useAppSelector(selectTotalDailyOrders);
  const averageTicket = useAppSelector(selectAverageTicket);
  const digitalPercent = useAppSelector(selectDigitalSalesPercent);
  const laborPercent = useAppSelector(selectLaborPercent);
  const wastePercent = useAppSelector(selectWastePercent);
  const customerService = useAppSelector(selectCustomerService);
  const promiseMetPercent = useAppSelector(selectPromiseMetPercent);
  
  return useMemo(
    () => ({
      totalSales,
      totalOrders,
      averageTicket,
      digitalPercent,
      laborPercent,
      wastePercent,
      customerService,
      promiseMetPercent,
    }),
    [
      totalSales,
      totalOrders,
      averageTicket,
      digitalPercent,
      laborPercent,
      wastePercent,
      customerService,
      promiseMetPercent,
    ]
  );
}


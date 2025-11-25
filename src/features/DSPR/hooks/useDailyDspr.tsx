/**
 * ============================================================================
 * USE DAILY DSPR HOOK
 * ============================================================================
 * Domain: Daily DSPR (Daily Store Performance Report)
 * 
 * Responsibility:
 * - React hook for consuming daily DSPR Redux state
 * - Provides simple interface for accessing operational metrics and alerts
 * - Exposes configuration methods for targets and thresholds
 * - Handles automatic data derivation from central DSPR API
 * - Provides convenience methods for category-specific data
 * 
 * Related Files:
 * - State: state/dsprDailySlice.ts (Redux slice)
 * - Types: types/dspr.daily.ts (all daily DSPR types)
 * - Central API: state/dsprApiSlice.ts (data source)
 * 
 * Usage:
 * ```
 * function DailyDashboard() {
 *   const {
 *     daily,
 *     financial,
 *     operational,
 *     quality,
 *     salesChannels,
 *     costControl,
 *     alerts,
 *     overallGrade,
 *     hasData,
 *     setPerformanceTargets,
 *   } = useDailyDspr();
 * 
 *   if (!hasData) return <NoData />;
 * 
 *   return (
 *     <div>
 *       <GradeBadge grade={overallGrade} />
 *       <FinancialSummary data={financial} />
 *       <OperationalMetrics data={operational} />
 *       <AlertPanel alerts={alerts} />
 *     </div>
 *   );
 * }
 * ```
 */

import { useCallback, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  selectRawDailyDspr,
  selectProcessedDailyDspr,
  selectDailyMetrics,
  selectFinancialMetrics,
  selectOperationalMetrics,
  selectSalesChannelMetrics,
  selectQualityMetrics,
  selectCostControlMetrics,
  selectDailyAlerts,
  selectCriticalDailyAlerts,
  selectUrgentDailyAlerts,
  selectOverallGrade,
  selectDailyDsprConfig,
  selectLastProcessedTime,
  selectDailyDsprStore,
  selectDailyDsprDate,
  selectHasDailyDspr,
  selectTotalSales,
  selectLaborCostPercentage,
  selectDigitalAdoptionRate,
  selectCustomerServiceScore,
  selectWastePercentage,
  selectAlertsEnabled,
  selectAlertCount,
  selectHasCriticalAlerts,
  selectHasUrgentAlerts,
  selectTopChannel,
  setPerformanceTargets as setPerformanceTargetsAction,
  setAlertSettings as setAlertSettingsAction,
  setCostThresholds as setCostThresholdsAction,
  toggleAlerts as toggleAlertsAction,
  resetConfig as resetConfigAction,
  clearDailyData as clearDataAction,
} from '../store/dsprDailySlice';
import {
  type DailyDSPRData,
  type ProcessedDSPRData,
  type ProcessedDailyMetrics,
  type FinancialMetrics,
  type OperationalMetrics,
  type SalesChannelMetrics,
  type QualityMetrics,
  type CostControlMetrics,
  type OperationalAlert,
  OperationalGrade,
  SalesChannelType,
  type DSPRAnalysisConfig,
  type PerformanceTargets,
  type AlertSettings,
  type CostThresholds,
} from '../types/dspr.daily';
import type { StoreId, ApiDate } from '../types/dspr.common';

// ============================================================================
// HOOK RETURN TYPE
// ============================================================================

/**
 * Return type for useDailyDspr hook
 */
export interface UseDailyDsprReturn {
  // ========================================================================
  // DATA
  // ========================================================================
  
  /** Raw daily DSPR data from API */
  raw: DailyDSPRData | null;
  
  /** Processed daily DSPR with metrics */
  processed: ProcessedDSPRData | null;
  
  /** All daily metrics */
  daily: ProcessedDailyMetrics | null;
  
  /** Financial metrics */
  financial: FinancialMetrics | null;
  
  /** Operational metrics */
  operational: OperationalMetrics | null;
  
  /** Sales channel metrics */
  salesChannels: SalesChannelMetrics | null;
  
  /** Quality metrics */
  quality: QualityMetrics | null;
  
  /** Cost control metrics */
  costControl: CostControlMetrics | null;
  
  /** All operational alerts */
  alerts: OperationalAlert[];
  
  /** Critical alerts only */
  criticalAlerts: OperationalAlert[];
  
  /** Urgent alerts only */
  urgentAlerts: OperationalAlert[];
  
  // ========================================================================
  // METRICS
  // ========================================================================
  
  /** Overall operational grade */
  overallGrade: OperationalGrade | null;
  
  /** Total sales ($) */
  totalSales: number;
  
  /** Labor cost percentage (0-1) */
  laborCostPercentage: number;
  
  /** Digital adoption rate (0-1) */
  digitalAdoptionRate: number;
  
  /** Customer service score (0-1) */
  customerServiceScore: number;
  
  /** Waste percentage (0-100) */
  wastePercentage: number;
  
  /** Top performing sales channel */
  topChannel: SalesChannelType | null;
  
  // ========================================================================
  // STATE
  // ========================================================================
  
  /** Whether daily DSPR data exists */
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
  
  /** Whether there are urgent alerts */
  hasUrgentAlerts: boolean;
  
  // ========================================================================
  // CONFIGURATION
  // ========================================================================
  
  /** Current configuration */
  config: DSPRAnalysisConfig;
  
  // ========================================================================
  // ACTIONS
  // ========================================================================
  
  /**
   * Updates performance targets
   * @param targets - Partial targets to update
   */
  setPerformanceTargets: (targets: Partial<PerformanceTargets>) => void;
  
  /**
   * Updates alert settings
   * @param settings - Partial alert settings to update
   */
  setAlertSettings: (settings: Partial<AlertSettings>) => void;
  
  /**
   * Updates cost thresholds
   * @param thresholds - Partial cost thresholds to update
   */
  setCostThresholds: (thresholds: Partial<CostThresholds>) => void;
  
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
   * Clears all daily DSPR data
   */
  clearData: () => void;
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Custom hook for accessing and managing daily DSPR data
 * 
 * Provides a simple interface for consuming daily store performance
 * report metrics, alerts, and configuration. Data is automatically
 * derived from the central DSPR API response.
 * 
 * @returns Object with data, metrics, state, and action methods
 * 
 * @example
 * ```
 * function Dashboard() {
 *   const {
 *     daily,
 *     alerts,
 *     overallGrade,
 *     hasData,
 *     setPerformanceTargets,
 *   } = useDailyDspr();
 * 
 *   if (!hasData) return <NoData />;
 * 
 *   return (
 *     <div>
 *       <PerformanceOverview daily={daily} grade={overallGrade} />
 *       <MetricsGrid metrics={daily} />
 *       <AlertList alerts={alerts} />
 *     </div>
 *   );
 * }
 * ```
 */
export function useDailyDspr(): UseDailyDsprReturn {
  const dispatch = useAppDispatch();
  
  // ========================================================================
  // SELECTORS
  // ========================================================================
  
  const raw = useAppSelector(selectRawDailyDspr);
  const processed = useAppSelector(selectProcessedDailyDspr);
  const daily = useAppSelector(selectDailyMetrics);
  const financial = useAppSelector(selectFinancialMetrics);
  const operational = useAppSelector(selectOperationalMetrics);
  const salesChannels = useAppSelector(selectSalesChannelMetrics);
  const quality = useAppSelector(selectQualityMetrics);
  const costControl = useAppSelector(selectCostControlMetrics);
  const alerts = useAppSelector(selectDailyAlerts);
  const criticalAlerts = useAppSelector(selectCriticalDailyAlerts);
  const urgentAlerts = useAppSelector(selectUrgentDailyAlerts);
  const overallGrade = useAppSelector(selectOverallGrade);
  const config = useAppSelector(selectDailyDsprConfig);
  const lastProcessed = useAppSelector(selectLastProcessedTime);
  const store = useAppSelector(selectDailyDsprStore);
  const date = useAppSelector(selectDailyDsprDate);
  const hasData = useAppSelector(selectHasDailyDspr);
  const totalSales = useAppSelector(selectTotalSales);
  const laborCostPercentage = useAppSelector(selectLaborCostPercentage);
  const digitalAdoptionRate = useAppSelector(selectDigitalAdoptionRate);
  const customerServiceScore = useAppSelector(selectCustomerServiceScore);
  const wastePercentage = useAppSelector(selectWastePercentage);
  const alertsEnabled = useAppSelector(selectAlertsEnabled);
  const alertCount = useAppSelector(selectAlertCount);
  const hasCriticalAlerts = useAppSelector(selectHasCriticalAlerts);
  const hasUrgentAlerts = useAppSelector(selectHasUrgentAlerts);
  const topChannel = useAppSelector(selectTopChannel);
  
  // ========================================================================
  // ACTIONS
  // ========================================================================
  
  /**
   * Updates performance targets
   */
  const setPerformanceTargets = useCallback(
    (targets: Partial<PerformanceTargets>) => {
      dispatch(setPerformanceTargetsAction(targets));
      
      if (process.env.NODE_ENV === 'development') {
        console.log('[useDailyDspr] Performance targets updated:', targets);
      }
    },
    [dispatch]
  );
  
  /**
   * Updates alert settings
   */
  const setAlertSettings = useCallback(
    (settings: Partial<AlertSettings>) => {
      dispatch(setAlertSettingsAction(settings));
      
      if (process.env.NODE_ENV === 'development') {
        console.log('[useDailyDspr] Alert settings updated:', settings);
      }
    },
    [dispatch]
  );
  
  /**
   * Updates cost thresholds
   */
  const setCostThresholds = useCallback(
    (thresholds: Partial<CostThresholds>) => {
      dispatch(setCostThresholdsAction(thresholds));
      
      if (process.env.NODE_ENV === 'development') {
        console.log('[useDailyDspr] Cost thresholds updated:', thresholds);
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
        console.log('[useDailyDspr] Alerts toggled:', enabled);
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
      console.log('[useDailyDspr] Configuration reset to defaults');
    }
  }, [dispatch]);
  
  /**
   * Clears all daily DSPR data
   */
  const clearData = useCallback(() => {
    dispatch(clearDataAction());
    
    if (process.env.NODE_ENV === 'development') {
      console.log('[useDailyDspr] Data cleared');
    }
  }, [dispatch]);
  
  // ========================================================================
  // RETURN
  // ========================================================================
  
  return {
    // Data
    raw,
    processed,
    daily,
    financial,
    operational,
    salesChannels,
    quality,
    costControl,
    alerts,
    criticalAlerts,
    urgentAlerts,
    
    // Metrics
    overallGrade,
    totalSales,
    laborCostPercentage,
    digitalAdoptionRate,
    customerServiceScore,
    wastePercentage,
    topChannel,
    
    // State
    hasData,
    store,
    date,
    lastProcessed,
    alertsEnabled,
    alertCount,
    hasCriticalAlerts,
    hasUrgentAlerts,
    
    // Configuration
    config,
    
    // Actions
    setPerformanceTargets,
    setAlertSettings,
    setCostThresholds,
    toggleAlerts,
    resetConfig,
    clearData,
  };
}

// ============================================================================
// CONVENIENCE HOOKS
// ============================================================================

/**
 * Hook for checking if daily DSPR data is available
 * 
 * @returns Boolean indicating if data exists
 * 
 * @example
 * ```
 * const hasData = useHasDailyDspr();
 * if (!hasData) return <LoadingState />;
 * ```
 */
export function useHasDailyDspr(): boolean {
  return useAppSelector(selectHasDailyDspr);
}

/**
 * Hook for accessing only financial metrics
 * 
 * @returns Financial metrics or null
 * 
 * @example
 * ```
 * const financial = useDailyFinancial();
 * return <FinancialDashboard data={financial} />;
 * ```
 */
export function useDailyFinancial(): FinancialMetrics | null {
  return useAppSelector(selectFinancialMetrics);
}

/**
 * Hook for accessing only operational metrics
 * 
 * @returns Operational metrics or null
 * 
 * @example
 * ```
 * const operational = useDailyOperational();
 * return <OperationalDashboard data={operational} />;
 * ```
 */
export function useDailyOperational(): OperationalMetrics | null {
  return useAppSelector(selectOperationalMetrics);
}

/**
 * Hook for accessing only quality metrics
 * 
 * @returns Quality metrics or null
 * 
 * @example
 * ```
 * const quality = useDailyQuality();
 * return <QualityDashboard data={quality} />;
 * ```
 */
export function useDailyQuality(): QualityMetrics | null {
  return useAppSelector(selectQualityMetrics);
}

/**
 * Hook for accessing only sales channel metrics
 * 
 * @returns Sales channel metrics or null
 * 
 * @example
 * ```
 * const channels = useDailySalesChannels();
 * return <ChannelBreakdown data={channels} />;
 * ```
 */
export function useDailySalesChannels(): SalesChannelMetrics | null {
  return useAppSelector(selectSalesChannelMetrics);
}

/**
 * Hook for accessing only cost control metrics
 * 
 * @returns Cost control metrics or null
 * 
 * @example
 * ```
 * const costControl = useDailyCostControl();
 * return <CostControlDashboard data={costControl} />;
 * ```
 */
export function useDailyCostControl(): CostControlMetrics | null {
  return useAppSelector(selectCostControlMetrics);
}

/**
 * Hook for accessing only daily alerts
 * 
 * @returns Array of operational alerts
 * 
 * @example
 * ```
 * const alerts = useDailyAlerts();
 * return <AlertPanel alerts={alerts} />;
 * ```
 */
export function useDailyAlerts(): OperationalAlert[] {
  return useAppSelector(selectDailyAlerts);
}

/**
 * Hook for accessing critical alerts only
 * 
 * @returns Array of critical alerts
 * 
 * @example
 * ```
 * const criticalAlerts = useCriticalDailyAlerts();
 * if (criticalAlerts.length > 0) return <UrgentBanner alerts={criticalAlerts} />;
 * ```
 */
export function useCriticalDailyAlerts(): OperationalAlert[] {
  return useAppSelector(selectCriticalDailyAlerts);
}

/**
 * Hook for accessing urgent alerts only
 * 
 * @returns Array of urgent alerts
 * 
 * @example
 * ```
 * const urgentAlerts = useUrgentDailyAlerts();
 * return <UrgentNotifications alerts={urgentAlerts} />;
 * ```
 */
export function useUrgentDailyAlerts(): OperationalAlert[] {
  return useAppSelector(selectUrgentDailyAlerts);
}

/**
 * Hook for checking if there are critical alerts
 * 
 * @returns Boolean indicating if critical alerts exist
 * 
 * @example
 * ```
 * const hasCritical = useHasCriticalDailyAlerts();
 * return <StatusIndicator critical={hasCritical} />;
 * ```
 */
export function useHasCriticalDailyAlerts(): boolean {
  return useAppSelector(selectHasCriticalAlerts);
}

/**
 * Hook for checking if there are urgent alerts
 * 
 * @returns Boolean indicating if urgent alerts exist
 * 
 * @example
 * ```
 * const hasUrgent = useHasUrgentDailyAlerts();
 * return <UrgentBadge show={hasUrgent} />;
 * ```
 */
export function useHasUrgentDailyAlerts(): boolean {
  return useAppSelector(selectHasUrgentAlerts);
}

/**
 * Hook for accessing overall operational grade
 * 
 * @returns Operational grade or null
 * 
 * @example
 * ```
 * const grade = useDailyGrade();
 * return <GradeBadge grade={grade} />;
 * ```
 */
export function useDailyGrade(): OperationalGrade | null {
  return useAppSelector(selectOverallGrade);
}

/**
 * Hook for accessing key daily metrics only
 * 
 * @returns Object with key metrics
 * 
 * @example
 * ```
 * const metrics = useDailyKeyMetrics();
 * return <MetricsDashboard {...metrics} />;
 * ```
 */
export function useDailyKeyMetrics() {
  const totalSales = useAppSelector(selectTotalSales);
  const laborCostPercentage = useAppSelector(selectLaborCostPercentage);
  const digitalAdoptionRate = useAppSelector(selectDigitalAdoptionRate);
  const customerServiceScore = useAppSelector(selectCustomerServiceScore);
  const wastePercentage = useAppSelector(selectWastePercentage);
  const topChannel = useAppSelector(selectTopChannel);
  const overallGrade = useAppSelector(selectOverallGrade);
  
  return useMemo(
    () => ({
      totalSales,
      laborCostPercentage,
      digitalAdoptionRate,
      customerServiceScore,
      wastePercentage,
      topChannel,
      overallGrade,
    }),
    [
      totalSales,
      laborCostPercentage,
      digitalAdoptionRate,
      customerServiceScore,
      wastePercentage,
      topChannel,
      overallGrade,
    ]
  );
}

/**
 * Hook for getting alerts by category
 * 
 * @param category - Alert category to filter by
 * @returns Filtered alerts
 * 
 * @example
 * ```
 * const financialAlerts = useDailyAlertsByCategory('financial');
 * return <AlertList alerts={financialAlerts} />;
 * ```
 */
export function useDailyAlertsByCategory(category: string): OperationalAlert[] {
  const alerts = useAppSelector(selectDailyAlerts);
  
  return useMemo(() => {
    return alerts.filter(alert => alert.category === category);
  }, [alerts, category]);
}

/**
 * Hook for getting alerts by severity
 * 
 * @param severity - Alert severity to filter by
 * @returns Filtered alerts
 * 
 * @example
 * ```
 * const warningAlerts = useDailyAlertsBySeverity('warning');
 * return <AlertList alerts={warningAlerts} />;
 * ```
 */
export function useDailyAlertsBySeverity(severity: string): OperationalAlert[] {
  const alerts = useAppSelector(selectDailyAlerts);
  
  return useMemo(() => {
    return alerts.filter(alert => alert.severity === severity);
  }, [alerts, severity]);
}

/**
 * Hook for checking if a specific metric is on target
 * 
 * @param metric - Metric name to check
 * @returns Object with target status information
 * 
 * @example
 * ```
 * const laborStatus = useMetricTargetStatus('labor');
 * return <MetricCard status={laborStatus} />;
 * ```
 */
export function useMetricTargetStatus(metric: string) {
  const raw = useAppSelector(selectRawDailyDspr);
  const config = useAppSelector(selectDailyDsprConfig);
  
  return useMemo(() => {
    if (!raw) return null;
    
    let currentValue = 0;
    let targetValue = 0;
    let isOnTarget = false;
    
    switch (metric) {
      case 'labor':
        currentValue = raw.labor;
        targetValue = config.targets.laborCostTarget;
        isOnTarget = currentValue <= targetValue;
        break;
      case 'waste':
        currentValue = (raw.waste_gateway + raw.Waste_Alta) / raw.Total_Sales;
        targetValue = config.targets.wastePercentageTarget;
        isOnTarget = currentValue <= targetValue;
        break;
      case 'customerService':
        currentValue = raw.Customer_Service;
        targetValue = config.targets.customerServiceTarget;
        isOnTarget = currentValue >= targetValue;
        break;
      case 'digitalSales':
        currentValue = raw.Digital_Sales_Percent;
        targetValue = config.targets.digitalSalesTarget;
        isOnTarget = currentValue >= targetValue;
        break;
      default:
        return null;
    }
    
    const variance = ((currentValue - targetValue) / targetValue) * 100;
    
    return {
      metric,
      currentValue,
      targetValue,
      variance,
      isOnTarget,
    };
  }, [raw, config, metric]);
}

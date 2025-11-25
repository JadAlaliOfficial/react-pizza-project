/**
 * ============================================================================
 * USE DSQR HOOK
 * ============================================================================
 * Domain: DSQR (Delivery Service Quality Rating)
 * 
 * Responsibility:
 * - React hook for consuming DSQR Redux state
 * - Provides simple interface for accessing platform metrics and alerts
 * - Exposes configuration methods for thresholds and filters
 * - Handles automatic data derivation from central DSPR API
 * - Provides convenience methods for platform-specific data
 * 
 * Related Files:
 * - State: state/dsprDsqrSlice.ts (Redux slice)
 * - Types: types/dspr.dsqr.ts (all DSQR types)
 * - Central API: state/dsprApiSlice.ts (data source)
 * 
 * Usage:
 * ```
 * function DsqrDashboard() {
 *   const {
 *     platforms,
 *     summary,
 *     alerts,
 *     doorDash,
 *     uberEats,
 *     grubHub,
 *     overallPerformance,
 *     grade,
 *     hasData,
 *     toggleAlerts,
 *   } = useDsqr();
 * 
 *   if (!hasData) return <NoData />;
 * 
 *   return (
 *     <div>
 *       <PerformanceBadge grade={grade} />
 *       <PlatformMetrics platforms={platforms} />
 *       <AlertPanel alerts={alerts} />
 *     </div>
 *   );
 * }
 * ```
 */

import { useCallback, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  selectRawDsqr,
  selectProcessedDsqr,
  selectPlatformData,
  selectDoorDashMetrics,
  selectUberEatsMetrics,
  selectGrubHubMetrics,
  selectDsqrSummary,
  selectDsqrAlerts,
  selectCriticalDsqrAlerts,
  selectUrgentDsqrAlerts,
  selectDsqrConfig,
  selectDsqrFilter,
  selectLastProcessedTime,
  selectDsqrStore,
  selectDsqrDate,
  selectHasDsqrData,
  selectOverallPerformance,
  selectPerformanceGrade,
  selectAverageRating,
  selectBestPlatform,
  selectAttentionRequiredPlatform,
  selectAlertsEnabled,
  selectAlertCount,
  selectHasCriticalAlerts,
  selectHasUrgentAlerts,
  selectTotalOnTrack,
  selectTotalApplicable,
  setFilter as setFilterAction,
  clearFilter as clearFilterAction,
  setPerformanceThresholds as setPerformanceThresholdsAction,
  setAlertConfig as setAlertConfigAction,
  toggleAlerts as toggleAlertsAction,
  resetConfig as resetConfigAction,
  clearDsqrData as clearDataAction,
} from '../store/dsprDsqrSlice';
import {
  type DailyDSQRData,
  type ProcessedDSQRData,
  type PlatformData,
  type PlatformMetrics,
  type DSQRSummary,
  type PerformanceAlert,
  DeliveryPlatform,
  PerformanceGrade,
  type DSQRFilter,
  type DSQRAnalysisConfig,
  type PerformanceThresholds,
  type AlertConfiguration,
} from '../types/dspr.dsqr';
import type { StoreId, ApiDate } from '../types/dspr.common';

// ============================================================================
// HOOK RETURN TYPE
// ============================================================================

/**
 * Return type for useDsqr hook
 */
export interface UseDsqrReturn {
  // ========================================================================
  // DATA
  // ========================================================================
  
  /** Raw DSQR data from API */
  raw: DailyDSQRData | null;
  
  /** Processed DSQR with platform metrics */
  processed: ProcessedDSQRData | null;
  
  /** All platform data */
  platforms: PlatformData | null;
  
  /** DoorDash metrics */
  doorDash: PlatformMetrics | null;
  
  /** UberEats metrics */
  uberEats: PlatformMetrics | null;
  
  /** GrubHub metrics */
  grubHub: PlatformMetrics | null;
  
  /** Overall DSQR summary */
  summary: DSQRSummary | null;
  
  /** All performance alerts */
  alerts: PerformanceAlert[];
  
  /** Critical alerts only */
  criticalAlerts: PerformanceAlert[];
  
  /** Urgent alerts only */
  urgentAlerts: PerformanceAlert[];
  
  // ========================================================================
  // METRICS
  // ========================================================================
  
  /** Overall performance percentage (0-100) */
  overallPerformance: number;
  
  /** Performance grade */
  grade: PerformanceGrade | null;
  
  /** Average rating across all platforms */
  averageRating: number;
  
  /** Best performing platform */
  bestPlatform: DeliveryPlatform | null;
  
  /** Platform requiring attention */
  attentionRequired: DeliveryPlatform | null;
  
  /** Total metrics on track */
  totalOnTrack: number;
  
  /** Total applicable metrics */
  totalApplicable: number;
  
  // ========================================================================
  // STATE
  // ========================================================================
  
  /** Whether DSQR data exists */
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
  config: DSQRAnalysisConfig;
  
  /** Current filter */
  filter: DSQRFilter;
  
  // ========================================================================
  // ACTIONS
  // ========================================================================
  
  /**
   * Sets filter options
   * @param filter - Partial filter to apply
   */
  setFilter: (filter: Partial<DSQRFilter>) => void;
  
  /**
   * Clears all filters
   */
  clearFilter: () => void;
  
  /**
   * Updates performance thresholds
   * @param thresholds - Partial thresholds to update
   */
  setPerformanceThresholds: (thresholds: Partial<PerformanceThresholds>) => void;
  
  /**
   * Updates alert configuration
   * @param config - Partial alert config to update
   */
  setAlertConfig: (config: Partial<AlertConfiguration>) => void;
  
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
   * Clears all DSQR data
   */
  clearData: () => void;
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Custom hook for accessing and managing DSQR data
 * 
 * Provides a simple interface for consuming delivery service quality
 * ratings, platform metrics, alerts, and configuration. Data is automatically
 * derived from the central DSPR API response.
 * 
 * @returns Object with data, metrics, state, and action methods
 * 
 * @example
 * ```
 * function Dashboard() {
 *   const {
 *     platforms,
 *     summary,
 *     alerts,
 *     grade,
 *     hasData,
 *     setFilter,
 *   } = useDsqr();
 * 
 *   if (!hasData) return <NoData />;
 * 
 *   return (
 *     <div>
 *       <PerformanceOverview summary={summary} grade={grade} />
 *       <PlatformComparison platforms={platforms} />
 *       <AlertList alerts={alerts} />
 *     </div>
 *   );
 * }
 * ```
 */
export function useDsqr(): UseDsqrReturn {
  const dispatch = useAppDispatch();
  
  // ========================================================================
  // SELECTORS
  // ========================================================================
  
  const raw = useAppSelector(selectRawDsqr);
  const processed = useAppSelector(selectProcessedDsqr);
  const platforms = useAppSelector(selectPlatformData);
  const doorDash = useAppSelector(selectDoorDashMetrics);
  const uberEats = useAppSelector(selectUberEatsMetrics);
  const grubHub = useAppSelector(selectGrubHubMetrics);
  const summary = useAppSelector(selectDsqrSummary);
  const alerts = useAppSelector(selectDsqrAlerts);
  const criticalAlerts = useAppSelector(selectCriticalDsqrAlerts);
  const urgentAlerts = useAppSelector(selectUrgentDsqrAlerts);
  const config = useAppSelector(selectDsqrConfig);
  const filter = useAppSelector(selectDsqrFilter);
  const lastProcessed = useAppSelector(selectLastProcessedTime);
  const store = useAppSelector(selectDsqrStore);
  const date = useAppSelector(selectDsqrDate);
  const hasData = useAppSelector(selectHasDsqrData);
  const overallPerformance = useAppSelector(selectOverallPerformance);
  const grade = useAppSelector(selectPerformanceGrade);
  const averageRating = useAppSelector(selectAverageRating);
  const bestPlatform = useAppSelector(selectBestPlatform);
  const attentionRequired = useAppSelector(selectAttentionRequiredPlatform);
  const alertsEnabled = useAppSelector(selectAlertsEnabled);
  const alertCount = useAppSelector(selectAlertCount);
  const hasCriticalAlerts = useAppSelector(selectHasCriticalAlerts);
  const hasUrgentAlerts = useAppSelector(selectHasUrgentAlerts);
  const totalOnTrack = useAppSelector(selectTotalOnTrack);
  const totalApplicable = useAppSelector(selectTotalApplicable);
  
  // ========================================================================
  // ACTIONS
  // ========================================================================
  
  /**
   * Sets filter options
   */
  const setFilter = useCallback(
    (filter: Partial<DSQRFilter>) => {
      dispatch(setFilterAction(filter));
      
      if (process.env.NODE_ENV === 'development') {
        console.log('[useDsqr] Filter updated:', filter);
      }
    },
    [dispatch]
  );
  
  /**
   * Clears all filters
   */
  const clearFilter = useCallback(() => {
    dispatch(clearFilterAction());
    
    if (process.env.NODE_ENV === 'development') {
      console.log('[useDsqr] Filter cleared');
    }
  }, [dispatch]);
  
  /**
   * Updates performance thresholds
   */
  const setPerformanceThresholds = useCallback(
    (thresholds: Partial<PerformanceThresholds>) => {
      dispatch(setPerformanceThresholdsAction(thresholds));
      
      if (process.env.NODE_ENV === 'development') {
        console.log('[useDsqr] Performance thresholds updated:', thresholds);
      }
    },
    [dispatch]
  );
  
  /**
   * Updates alert configuration
   */
  const setAlertConfig = useCallback(
    (config: Partial<AlertConfiguration>) => {
      dispatch(setAlertConfigAction(config));
      
      if (process.env.NODE_ENV === 'development') {
        console.log('[useDsqr] Alert config updated:', config);
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
        console.log('[useDsqr] Alerts toggled:', enabled);
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
      console.log('[useDsqr] Configuration reset to defaults');
    }
  }, [dispatch]);
  
  /**
   * Clears all DSQR data
   */
  const clearData = useCallback(() => {
    dispatch(clearDataAction());
    
    if (process.env.NODE_ENV === 'development') {
      console.log('[useDsqr] Data cleared');
    }
  }, [dispatch]);
  
  // ========================================================================
  // RETURN
  // ========================================================================
  
  return {
    // Data
    raw,
    processed,
    platforms,
    doorDash,
    uberEats,
    grubHub,
    summary,
    alerts,
    criticalAlerts,
    urgentAlerts,
    
    // Metrics
    overallPerformance,
    grade,
    averageRating,
    bestPlatform,
    attentionRequired,
    totalOnTrack,
    totalApplicable,
    
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
    filter,
    
    // Actions
    setFilter,
    clearFilter,
    setPerformanceThresholds,
    setAlertConfig,
    toggleAlerts,
    resetConfig,
    clearData,
  };
}

// ============================================================================
// CONVENIENCE HOOKS
// ============================================================================

/**
 * Hook for checking if DSQR data is available
 * 
 * @returns Boolean indicating if data exists
 * 
 * @example
 * ```
 * const hasData = useHasDsqr();
 * if (!hasData) return <LoadingState />;
 * ```
 */
export function useHasDsqr(): boolean {
  return useAppSelector(selectHasDsqrData);
}

/**
 * Hook for accessing only DoorDash metrics
 * 
 * @returns DoorDash platform metrics or null
 * 
 * @example
 * ```
 * const doorDash = useDoorDashMetrics();
 * return <PlatformDashboard platform={doorDash} />;
 * ```
 */
export function useDoorDashMetrics(): PlatformMetrics | null {
  return useAppSelector(selectDoorDashMetrics);
}

/**
 * Hook for accessing only UberEats metrics
 * 
 * @returns UberEats platform metrics or null
 * 
 * @example
 * ```
 * const uberEats = useUberEatsMetrics();
 * return <PlatformDashboard platform={uberEats} />;
 * ```
 */
export function useUberEatsMetrics(): PlatformMetrics | null {
  return useAppSelector(selectUberEatsMetrics);
}

/**
 * Hook for accessing only GrubHub metrics
 * 
 * @returns GrubHub platform metrics or null
 * 
 * @example
 * ```
 * const grubHub = useGrubHubMetrics();
 * return <PlatformDashboard platform={grubHub} />;
 * ```
 */
export function useGrubHubMetrics(): PlatformMetrics | null {
  return useAppSelector(selectGrubHubMetrics);
}

/**
 * Hook for accessing specific platform metrics
 * 
 * @param platform - Platform to get metrics for
 * @returns Platform metrics or null
 * 
 * @example
 * ```
 * const metrics = usePlatformMetrics('DoorDash');
 * return <PlatformCard metrics={metrics} />;
 * ```
 */
export function usePlatformMetrics(platform: DeliveryPlatform): PlatformMetrics | null {
  const platforms = useAppSelector(selectPlatformData);
  
  return useMemo(() => {
    if (!platforms) return null;
    
    switch (platform) {
      case 'DoorDash':
        return platforms.doorDash;
      case 'UberEats':
        return platforms.uberEats;
      case 'GrubHub':
        return platforms.grubHub;
      default:
        return null;
    }
  }, [platforms, platform]);
}

/**
 * Hook for accessing only DSQR summary
 * 
 * @returns DSQR summary or null
 * 
 * @example
 * ```
 * const summary = useDsqrSummary();
 * return <SummaryDashboard summary={summary} />;
 * ```
 */
export function useDsqrSummary(): DSQRSummary | null {
  return useAppSelector(selectDsqrSummary);
}

/**
 * Hook for accessing only DSQR alerts
 * 
 * @returns Array of performance alerts
 * 
 * @example
 * ```
 * const alerts = useDsqrAlerts();
 * return <AlertPanel alerts={alerts} />;
 * ```
 */
export function useDsqrAlerts(): PerformanceAlert[] {
  return useAppSelector(selectDsqrAlerts);
}

/**
 * Hook for accessing critical alerts only
 * 
 * @returns Array of critical alerts
 * 
 * @example
 * ```
 * const criticalAlerts = useCriticalDsqrAlerts();
 * if (criticalAlerts.length > 0) return <UrgentBanner alerts={criticalAlerts} />;
 * ```
 */
export function useCriticalDsqrAlerts(): PerformanceAlert[] {
  return useAppSelector(selectCriticalDsqrAlerts);
}

/**
 * Hook for accessing urgent alerts only
 * 
 * @returns Array of urgent alerts
 * 
 * @example
 * ```
 * const urgentAlerts = useUrgentDsqrAlerts();
 * return <UrgentNotifications alerts={urgentAlerts} />;
 * ```
 */
export function useUrgentDsqrAlerts(): PerformanceAlert[] {
  return useAppSelector(selectUrgentDsqrAlerts);
}

/**
 * Hook for checking if there are critical alerts
 * 
 * @returns Boolean indicating if critical alerts exist
 * 
 * @example
 * ```
 * const hasCritical = useHasCriticalDsqrAlerts();
 * return <StatusIndicator critical={hasCritical} />;
 * ```
 */
export function useHasCriticalDsqrAlerts(): boolean {
  return useAppSelector(selectHasCriticalAlerts);
}

/**
 * Hook for checking if there are urgent alerts
 * 
 * @returns Boolean indicating if urgent alerts exist
 * 
 * @example
 * ```
 * const hasUrgent = useHasUrgentDsqrAlerts();
 * return <UrgentBadge show={hasUrgent} />;
 * ```
 */
export function useHasUrgentDsqrAlerts(): boolean {
  return useAppSelector(selectHasUrgentAlerts);
}

/**
 * Hook for accessing performance grade
 * 
 * @returns Performance grade or null
 * 
 * @example
 * ```
 * const grade = useDsqrGrade();
 * return <GradeBadge grade={grade} />;
 * ```
 */
export function useDsqrGrade(): PerformanceGrade | null {
  return useAppSelector(selectPerformanceGrade);
}

/**
 * Hook for accessing key DSQR metrics only
 * 
 * @returns Object with key metrics
 * 
 * @example
 * ```
 * const metrics = useDsqrMetrics();
 * return <MetricsDashboard {...metrics} />;
 * ```
 */
export function useDsqrMetrics() {
  const overallPerformance = useAppSelector(selectOverallPerformance);
  const averageRating = useAppSelector(selectAverageRating);
  const totalOnTrack = useAppSelector(selectTotalOnTrack);
  const totalApplicable = useAppSelector(selectTotalApplicable);
  const bestPlatform = useAppSelector(selectBestPlatform);
  const attentionRequired = useAppSelector(selectAttentionRequiredPlatform);
  const grade = useAppSelector(selectPerformanceGrade);
  
  return useMemo(
    () => ({
      overallPerformance,
      averageRating,
      totalOnTrack,
      totalApplicable,
      bestPlatform,
      attentionRequired,
      grade,
    }),
    [
      overallPerformance,
      averageRating,
      totalOnTrack,
      totalApplicable,
      bestPlatform,
      attentionRequired,
      grade,
    ]
  );
}

/**
 * Hook for getting filtered platform data based on current filter
 * 
 * @returns Filtered platform data
 * 
 * @example
 * ```
 * const filteredPlatforms = useFilteredPlatforms();
 * return <PlatformList platforms={filteredPlatforms} />;
 * ```
 */
export function useFilteredPlatforms(): PlatformMetrics[] {
  const platforms = useAppSelector(selectPlatformData);
  const filter = useAppSelector(selectDsqrFilter);
  
  return useMemo(() => {
    if (!platforms) return [];
    
    let allPlatforms = [platforms.doorDash, platforms.uberEats, platforms.grubHub];
    
    // Apply platform filter
    if (filter.platforms && filter.platforms.length > 0) {
      allPlatforms = allPlatforms.filter(p => filter.platforms!.includes(p.platform));
    }
    
    // Apply rating filter
    if (filter.minRating !== undefined) {
      allPlatforms = allPlatforms.filter(p => p.overallRating >= filter.minRating!);
    }
    
    // Apply performance level filter
    if (filter.performanceLevels && filter.performanceLevels.length > 0) {
      allPlatforms = allPlatforms.filter(p => filter.performanceLevels!.includes(p.performanceLevel));
    }
    
    return allPlatforms;
  }, [platforms, filter]);
}


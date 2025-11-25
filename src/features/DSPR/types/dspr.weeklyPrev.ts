/**
 * ============================================================================
 * DSPR WEEKLY PREVIOUS TYPES
 * ============================================================================
 * Domain: Weekly DSPR (Previous Week Aggregate)
 * 
 * Responsibility:
 * - Defines types for previous week aggregate operational metrics
 * - Provides comparison baseline for week-over-week analysis
 * - Supports trend identification and performance benchmarking
 * - Contains same structure as current week for direct comparison
 * - Provides validation utilities and comparison helpers
 * 
 * Related Files:
 * - Data source: reports.weekly.PrevWeekDSPRData from DsprApiResponse
 * - Used by: state/dsprWeeklyPrevSlice.ts (Redux state)
 * - Used by: hooks/useWeeklyPrevDspr.ts (React hook)
 * - Compare with: dspr.weeklyCurrent.ts (current week comparison)
 * 
 * Key Types:
 * - PrevWeekDSPRData: Raw previous week aggregate metrics (identical to WeeklyDSPRData)
 * - ProcessedPrevWeekDSPR: Enriched data with categorized summaries
 * - PrevWeekFinancialSummary: Revenue, cost control, cash metrics
 * - PrevWeekOperationalSummary: Labor, customer count, portal, tickets
 * - WeekOverWeekComparison: Structured comparison between current and previous week
 * - TrendAnalysis: Multi-metric trend identification
 */

import { type ApiDate, type StoreId, type WeekNumber } from './dspr.common';

// ============================================================================
// RAW PREVIOUS WEEK DSPR TYPES (from API)
// ============================================================================

/**
 * Previous week aggregate DSPR data
 * Contains same fields as WeeklyDSPRData for direct comparison
 */
export interface PrevWeekDSPRData {
  // Financial metrics
  /** Labor cost as percentage of sales (0-1) */
  labor: number;
  
  /** Waste reported via Gateway system ($) */
  wastegateway: number;
  
  /** Over/short cash variance ($, can be negative) */
  overshort: number;
  
  /** Number of refunded orders */
  RefundedorderQty: number;
  
  /** Total cash sales ($) */
  TotalCashSales: number;
  
  /** Total sales for the week ($) */
  TotalSales: number;
  
  /** Waste reported via Alta system ($) */
  WasteAlta: number;
  
  /** Number of modified orders */
  ModifiedOrderQty: number;
  
  /** Total tips collected ($) */
  TotalTIPS: number;
  
  // Customer metrics
  /** Total customer count */
  Customercount: number;
  
  // Delivery platform sales
  /** DoorDash sales ($) */
  DoorDashSales: number;
  
  /** Uber Eats sales ($) */
  UberEatsSales: number;
  
  /** GrubHub sales ($) */
  GrubHubSales: number;
  
  // Sales channel breakdown
  /** Phone order sales ($) */
  Phone: number;
  
  /** Call center agent sales ($) */
  CallCenterAgent: number;
  
  /** Website order sales ($) */
  Website: number;
  
  /** Mobile app sales ($) */
  Mobile: number;
  
  /** Digital sales as percentage of total (0-1) */
  DigitalSalesPercent: number;
  
  // Portal metrics
  /** Total orders eligible for portal tracking */
  TotalPortalEligibleTransactions: number;
  
  /** Percentage of eligible orders put into portal (0-1) */
  PutintoPortalPercent: number;
  
  /** Percentage of portal orders marked on-time (0-1) */
  InPortalonTimePercent: number;
  
  // Other channels
  /** Drive-thru sales ($) */
  DriveThruSales: number;
  
  /** Upselling effectiveness score (0-1) */
  Upselling: number;
  
  /** Cash sales vs deposit difference ($) */
  CashSalesVsDepositeDifference: number;
  
  /** Average ticket value ($) */
  Avrageticket: number;
  
  // Performance percentages
  /** Customer count as percentage of target (0-1) */
  Customercountpercent: number;
  
  /** Customer service score (0-1) */
  CustomerService: number;
}

// ============================================================================
// PROCESSED/DERIVED TYPES
// ============================================================================

/**
 * Previous week financial summary
 */
export interface PrevWeekFinancialSummary {
  /** Total weekly sales ($) */
  totalSales: number;
  
  /** Total cash sales ($) */
  totalCashSales: number;
  
  /** Total tips ($) */
  totalTips: number;
  
  /** Total waste (Gateway + Alta) ($) */
  totalWaste: number;
  
  /** Waste as percentage of sales (0-1) */
  wastePercent: number;
  
  /** Over/short amount ($) */
  overshort: number;
  
  /** Cash deposit difference ($) */
  cashDepositDifference: number;
  
  /** Net revenue (sales - waste - overshort) ($) */
  netRevenue: number;
  
  /** Daily average sales ($) */
  dailyAverageSales: number;
}

/**
 * Previous week operational summary
 */
export interface PrevWeekOperationalSummary {
  /** Labor cost ($) */
  laborCost: number;
  
  /** Labor as percentage of sales (0-1) */
  laborPercent: number;
  
  /** Total customer count */
  customerCount: number;
  
  /** Customer count vs target percentage (0-1) */
  customerCountPercent: number;
  
  /** Average ticket value ($) */
  averageTicket: number;
  
  /** Total portal eligible transactions */
  portalEligibleTransactions: number;
  
  /** Portal usage rate (0-1) */
  portalUsageRate: number;
  
  /** Portal on-time rate (0-1) */
  portalOnTimeRate: number;
  
  /** Daily average customer count */
  dailyAverageCustomers: number;
}

/**
 * Previous week quality and service summary
 */
export interface PrevWeekQualitySummary {
  /** Customer service score (0-1) */
  customerService: number;
  
  /** Upselling score (0-1) */
  upselling: number;
  
  /** Portal on-time delivery percentage (0-1) */
  portalOnTimePercent: number;
  
  /** Portal usage percentage (0-1) */
  portalUsagePercent: number;
  
  /** Number of refunded orders */
  refundedOrderCount: number;
  
  /** Number of modified orders */
  modifiedOrderCount: number;
  
  /** Refund rate (refunds per 100 customers) */
  refundRate: number;
}

/**
 * Previous week sales channel summary
 */
export interface PrevWeekSalesChannelSummary {
  /** Total digital sales (Website + Mobile) ($) */
  digitalSales: number;
  
  /** Digital sales percentage (0-1) */
  digitalPercent: number;
  
  /** Phone sales ($) */
  phoneSales: number;
  
  /** Website sales ($) */
  websiteSales: number;
  
  /** Mobile sales ($) */
  mobileSales: number;
  
  /** Call center sales ($) */
  callCenterSales: number;
  
  /** Drive-thru sales ($) */
  driveThruSales: number;
  
  /** DoorDash sales ($) */
  doorDashSales: number;
  
  /** Uber Eats sales ($) */
  uberEatsSales: number;
  
  /** GrubHub sales ($) */
  grubHubSales: number;
  
  /** Total delivery platform sales ($) */
  totalDeliverySales: number;
  
  /** Delivery sales percentage (0-1) */
  deliveryPercent: number;
}

/**
 * Previous week cost control summary
 */
export interface PrevWeekCostControlSummary {
  /** Total waste ($) */
  totalWaste: number;
  
  /** Waste as percentage of sales (0-1) */
  wastePercent: number;
  
  /** Labor percentage (0-1) */
  laborPercent: number;
  
  /** Over/short amount ($) */
  overshort: number;
  
  /** Number of refunded orders */
  refundedOrderCount: number;
  
  /** Number of modified orders */
  modifiedOrderCount: number;
}

/**
 * Processed previous week DSPR with categorized summaries
 */
export interface ProcessedPrevWeekDSPR {
  /** Store ID */
  store: StoreId;
  
  /** Week number (1-52) */
  week: WeekNumber;
  
  /** Week start date */
  weekStartDate: ApiDate;
  
  /** Week end date */
  weekEndDate: ApiDate;
  
  /** Raw previous week data */
  raw: PrevWeekDSPRData;
  
  /** Financial summary */
  financial: PrevWeekFinancialSummary;
  
  /** Operational summary */
  operational: PrevWeekOperationalSummary;
  
  /** Quality summary */
  quality: PrevWeekQualitySummary;
  
  /** Sales channel summary */
  salesChannels: PrevWeekSalesChannelSummary;
  
  /** Cost control summary */
  costControl: PrevWeekCostControlSummary;
  
  /** Performance grade */
  grade: PerformanceGrade;
  
  /** Timestamp when this data was processed */
  processedAt: string;
}

/**
 * Performance grade levels
 */
export const PerformanceGrade = {
  EXCELLENT: 'Excellent',
  GOOD: 'Good',
  FAIR: 'Fair',
  POOR: 'Poor',
  CRITICAL: 'Critical',
} as const;

export type PerformanceGrade = (typeof PerformanceGrade)[keyof typeof PerformanceGrade];

// ============================================================================
// COMPARISON TYPES
// ============================================================================

/**
 * Comparison direction
 */
export const ComparisonDirection = {
  IMPROVED: 'improved',
  DECLINED: 'declined',
  UNCHANGED: 'unchanged',
} as const;

export type ComparisonDirection = (typeof ComparisonDirection)[keyof typeof ComparisonDirection];

/**
 * Metric comparison between current and previous week
 */
export interface MetricComparison {
  /** Metric name */
  name: string;
  
  /** Current week value */
  current: number;
  
  /** Previous week value */
  previous: number;
  
  /** Absolute change */
  absoluteChange: number;
  
  /** Percentage change (0-1) */
  percentChange: number;
  
  /** Comparison direction */
  direction: ComparisonDirection;
  
  /** Whether this represents improvement (higher is better) */
  isImprovement: boolean;
  
  /** Display format hint (e.g., "currency", "percent", "number") */
  format: string;
}

/**
 * Week-over-week comparison summary
 */
export interface WeekOverWeekComparison {
  /** Sales comparison */
  sales: MetricComparison;
  
  /** Customer count comparison */
  customerCount: MetricComparison;
  
  /** Average ticket comparison */
  averageTicket: MetricComparison;
  
  /** Labor percentage comparison */
  laborPercent: MetricComparison;
  
  /** Waste percentage comparison */
  wastePercent: MetricComparison;
  
  /** Digital sales percentage comparison */
  digitalPercent: MetricComparison;
  
  /** Customer service comparison */
  customerService: MetricComparison;
  
  /** Portal on-time percentage comparison */
  portalOnTime: MetricComparison;
  
  /** Number of improved metrics */
  improvedCount: number;
  
  /** Number of declined metrics */
  declinedCount: number;
  
  /** Overall performance trend */
  overallTrend: ComparisonDirection;
}

/**
 * Trend severity
 */
export const TrendSeverity = {
  STRONG: 'strong',
  MODERATE: 'moderate',
  WEAK: 'weak',
} as const;

export type TrendSeverity = (typeof TrendSeverity)[keyof typeof TrendSeverity];

/**
 * Trend analysis result
 */
export interface TrendAnalysis {
  /** Trend direction */
  direction: ComparisonDirection;
  
  /** Trend severity */
  severity: TrendSeverity;
  
  /** Percentage change magnitude (0-1) */
  magnitude: number;
  
  /** Description of the trend */
  description: string;
  
  /** Whether action is recommended */
  actionRecommended: boolean;
}

/**
 * Complete multi-metric trend analysis
 */
export interface MultiMetricTrendAnalysis {
  /** Sales trend */
  sales: TrendAnalysis;
  
  /** Customer trend */
  customer: TrendAnalysis;
  
  /** Operational efficiency trend (labor + waste) */
  operationalEfficiency: TrendAnalysis;
  
  /** Quality trend (service + portal) */
  quality: TrendAnalysis;
  
  /** Digital adoption trend */
  digitalAdoption: TrendAnalysis;
  
  /** Overall business health trend */
  overallHealth: TrendAnalysis;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * Comparison thresholds for determining significance
 */
export interface ComparisonThresholds {
  /** Minimum percent change to be considered significant (0-1) */
  significantChangeThreshold: number;
  
  /** Minimum percent change to be considered strong (0-1) */
  strongChangeThreshold: number;
  
  /** Metrics where higher is better */
  higherIsBetter: string[];
  
  /** Metrics where lower is better */
  lowerIsBetter: string[];
}

/**
 * Default comparison thresholds
 */
export const defaultComparisonThresholds: ComparisonThresholds = {
  significantChangeThreshold: 0.02, // 2%
  strongChangeThreshold: 0.10, // 10%
  higherIsBetter: [
    'sales',
    'customerCount',
    'averageTicket',
    'digitalPercent',
    'customerService',
    'portalOnTime',
  ],
  lowerIsBetter: ['laborPercent', 'wastePercent', 'overshort', 'refundedOrderCount'],
};

/**
 * Previous week DSPR configuration
 */
export interface PrevWeekDSPRConfig {
  comparisonThresholds: ComparisonThresholds;
  operatingDaysPerWeek: number;
}

/**
 * Default previous week DSPR configuration
 */
export const defaultPrevWeekDSPRConfig: PrevWeekDSPRConfig = {
  comparisonThresholds: defaultComparisonThresholds,
  operatingDaysPerWeek: 7,
};

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Previous week DSPR validation result
 */
export interface PrevWeekDSPRValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Type guard: Checks if a value is valid PrevWeekDSPRData
 */
export function isValidPrevWeekDSPRData(value: unknown): value is PrevWeekDSPRData {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  
  const data = value as PrevWeekDSPRData;
  return (
    typeof data.TotalSales === 'number' &&
    typeof data.labor === 'number' &&
    typeof data.Customercount === 'number' &&
    typeof data.Avrageticket === 'number' &&
    typeof data.DigitalSalesPercent === 'number'
  );
}

/**
 * Type guard: Checks if a value is a valid ComparisonDirection
 */
export function isValidComparisonDirection(value: unknown): value is ComparisonDirection {
  return typeof value === 'string' && Object.values(ComparisonDirection).includes(value as ComparisonDirection);
}

/**
 * Type guard: Checks if a value is a valid TrendSeverity
 */
export function isValidTrendSeverity(value: unknown): value is TrendSeverity {
  return typeof value === 'string' && Object.values(TrendSeverity).includes(value as TrendSeverity);
}

/**
 * Type guard: Checks if a value is a valid PerformanceGrade
 */
export function isValidPerformanceGrade(value: unknown): value is PerformanceGrade {
  return typeof value === 'string' && Object.values(PerformanceGrade).includes(value as PerformanceGrade);
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Validates previous week DSPR data
 */
export function validatePrevWeekDSPRData(data: PrevWeekDSPRData): PrevWeekDSPRValidation {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (!isValidPrevWeekDSPRData(data)) {
    errors.push('Invalid PrevWeekDSPRData structure');
    return { isValid: false, errors, warnings };
  }
  
  if (data.TotalSales < 0) {
    errors.push('Total sales cannot be negative');
  }
  
  if (data.labor < 0 || data.labor > 1) {
    warnings.push(`Labor percentage out of range: ${data.labor}`);
  }
  
  if (data.wastegateway < 0) {
    warnings.push('Negative waste (Gateway)');
  }
  
  if (data.WasteAlta < 0) {
    warnings.push('Negative waste (Alta)');
  }
  
  if (data.Customercount < 0) {
    errors.push('Customer count cannot be negative');
  }
  
  if (data.Avrageticket < 0) {
    errors.push('Average ticket cannot be negative');
  }
  
  if (data.DigitalSalesPercent < 0 || data.DigitalSalesPercent > 1) {
    warnings.push(`Digital sales percent out of range: ${data.DigitalSalesPercent}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Calculates total waste (Gateway + Alta)
 */
export function calculateTotalWaste(data: PrevWeekDSPRData): number {
  return data.wastegateway + data.WasteAlta;
}

/**
 * Calculates waste as percentage of sales
 */
export function calculateWastePercent(data: PrevWeekDSPRData): number {
  if (data.TotalSales === 0) return 0;
  return calculateTotalWaste(data) / data.TotalSales;
}

/**
 * Calculates total digital sales (Website + Mobile)
 */
export function calculateDigitalSales(data: PrevWeekDSPRData): number {
  return data.Website + data.Mobile;
}

/**
 * Calculates total delivery platform sales
 */
export function calculateDeliverySales(data: PrevWeekDSPRData): number {
  return data.DoorDashSales + data.UberEatsSales + data.GrubHubSales;
}

/**
 * Calculates delivery sales as percentage of total
 */
export function calculateDeliveryPercent(data: PrevWeekDSPRData): number {
  if (data.TotalSales === 0) return 0;
  return calculateDeliverySales(data) / data.TotalSales;
}

/**
 * Calculates labor cost in dollars
 */
export function calculateLaborCost(data: PrevWeekDSPRData): number {
  return data.TotalSales * data.labor;
}

/**
 * Calculates net revenue (sales - waste - overshort)
 */
export function calculateNetRevenue(data: PrevWeekDSPRData): number {
  return data.TotalSales - calculateTotalWaste(data) - Math.abs(data.overshort);
}

/**
 * Calculates daily average sales
 */
export function calculateDailyAverageSales(data: PrevWeekDSPRData, operatingDays: number = 7): number {
  return data.TotalSales / operatingDays;
}

/**
 * Calculates daily average customers
 */
export function calculateDailyAverageCustomers(data: PrevWeekDSPRData, operatingDays: number = 7): number {
  return data.Customercount / operatingDays;
}

/**
 * Calculates performance grade based on score
 */
export function calculatePerformanceGrade(score: number): PerformanceGrade {
  if (score >= 90) {
    return PerformanceGrade.EXCELLENT;
  } else if (score >= 75) {
    return PerformanceGrade.GOOD;
  } else if (score >= 60) {
    return PerformanceGrade.FAIR;
  } else if (score >= 45) {
    return PerformanceGrade.POOR;
  } else {
    return PerformanceGrade.CRITICAL;
  }
}

/**
 * Determines comparison direction based on change
 */
export function determineComparisonDirection(
  current: number,
  previous: number,
  higherIsBetter: boolean
): ComparisonDirection {
  const threshold = 0.001; // Negligible change threshold
  const change = current - previous;
  
  if (Math.abs(change) < threshold) {
    return ComparisonDirection.UNCHANGED;
  }
  
  const isIncrease = change > 0;
  
  if (higherIsBetter) {
    return isIncrease ? ComparisonDirection.IMPROVED : ComparisonDirection.DECLINED;
  } else {
    return isIncrease ? ComparisonDirection.DECLINED : ComparisonDirection.IMPROVED;
  }
}

/**
 * Calculates trend severity based on magnitude
 */
export function calculateTrendSeverity(
  percentChange: number,
  thresholds: ComparisonThresholds
): TrendSeverity {
  const magnitude = Math.abs(percentChange);
  
  if (magnitude >= thresholds.strongChangeThreshold) {
    return TrendSeverity.STRONG;
  } else if (magnitude >= thresholds.significantChangeThreshold) {
    return TrendSeverity.MODERATE;
  } else {
    return TrendSeverity.WEAK;
  }
}

/**
 * Creates a metric comparison
 */
export function createMetricComparison(
  name: string,
  current: number,
  previous: number,
  format: string = 'number',
  higherIsBetter: boolean = true
): MetricComparison {
  const absoluteChange = current - previous;
  const percentChange = previous !== 0 ? absoluteChange / previous : 0;
  const direction = determineComparisonDirection(current, previous, higherIsBetter);
  const isImprovement = direction === ComparisonDirection.IMPROVED;
  
  return {
    name,
    current,
    previous,
    absoluteChange,
    percentChange,
    direction,
    isImprovement,
    format,
  };
}

/**
 * Creates a complete week-over-week comparison
 */
export function createWeekOverWeekComparison(
  current: PrevWeekDSPRData,
  previous: PrevWeekDSPRData,
): WeekOverWeekComparison {
  const sales = createMetricComparison('Sales', current.TotalSales, previous.TotalSales, 'currency', true);
  const customerCount = createMetricComparison('Customer Count', current.Customercount, previous.Customercount, 'number', true);
  const averageTicket = createMetricComparison('Average Ticket', current.Avrageticket, previous.Avrageticket, 'currency', true);
  const laborPercent = createMetricComparison('Labor %', current.labor, previous.labor, 'percent', false);
  const wastePercent = createMetricComparison(
    'Waste %',
    calculateWastePercent(current),
    calculateWastePercent(previous),
    'percent',
    false
  );
  const digitalPercent = createMetricComparison('Digital %', current.DigitalSalesPercent, previous.DigitalSalesPercent, 'percent', true);
  const customerService = createMetricComparison('Customer Service', current.CustomerService, previous.CustomerService, 'percent', true);
  const portalOnTime = createMetricComparison('Portal On-Time', current.InPortalonTimePercent, previous.InPortalonTimePercent, 'percent', true);
  
  const comparisons = [sales, customerCount, averageTicket, laborPercent, wastePercent, digitalPercent, customerService, portalOnTime];
  
  const improvedCount = comparisons.filter((c) => c.isImprovement).length;
  const declinedCount = comparisons.filter((c) => !c.isImprovement && c.direction !== ComparisonDirection.UNCHANGED).length;
  
  let overallTrend: ComparisonDirection;
  if (improvedCount > declinedCount + 1) {
    overallTrend = ComparisonDirection.IMPROVED;
  } else if (declinedCount > improvedCount + 1) {
    overallTrend = ComparisonDirection.DECLINED;
  } else {
    overallTrend = ComparisonDirection.UNCHANGED;
  }
  
  return {
    sales,
    customerCount,
    averageTicket,
    laborPercent,
    wastePercent,
    digitalPercent,
    customerService,
    portalOnTime,
    improvedCount,
    declinedCount,
    overallTrend,
  };
}

/**
 * Analyzes trend for a metric
 */
export function analyzeTrend(
  comparison: MetricComparison,
  thresholds: ComparisonThresholds = defaultComparisonThresholds
): TrendAnalysis {
  const severity = calculateTrendSeverity(comparison.percentChange, thresholds);
  const magnitude = Math.abs(comparison.percentChange);
  
  let description = '';
  if (comparison.direction === ComparisonDirection.UNCHANGED) {
    description = `${comparison.name} remained stable`;
  } else {
    const changeText = severity === TrendSeverity.STRONG ? 'significantly' : severity === TrendSeverity.MODERATE ? 'moderately' : 'slightly';
    const directionText = comparison.direction === ComparisonDirection.IMPROVED ? 'improved' : 'declined';
    description = `${comparison.name} ${changeText} ${directionText} by ${(magnitude * 100).toFixed(1)}%`;
  }
  
  const actionRecommended = severity === TrendSeverity.STRONG && comparison.direction === ComparisonDirection.DECLINED;
  
  return {
    direction: comparison.direction,
    severity,
    magnitude,
    description,
    actionRecommended,
  };
}

/**
 * Creates multi-metric trend analysis
 */
export function createMultiMetricTrendAnalysis(
  comparison: WeekOverWeekComparison,
  thresholds: ComparisonThresholds = defaultComparisonThresholds
): MultiMetricTrendAnalysis {
  const sales = analyzeTrend(comparison.sales, thresholds);
  const customer = analyzeTrend(comparison.customerCount, thresholds);
  
  // Operational efficiency combines labor and waste
  const operationalMetrics = [comparison.laborPercent, comparison.wastePercent];
  const operationalImproved = operationalMetrics.filter((m) => m.isImprovement).length;
  const operationalDirection =
    operationalImproved > 1
      ? ComparisonDirection.IMPROVED
      : operationalImproved === 0
      ? ComparisonDirection.DECLINED
      : ComparisonDirection.UNCHANGED;
  
  const operationalEfficiency: TrendAnalysis = {
    direction: operationalDirection,
    severity: TrendSeverity.MODERATE,
    magnitude: (Math.abs(comparison.laborPercent.percentChange) + Math.abs(comparison.wastePercent.percentChange)) / 2,
    description: `Operational efficiency ${operationalDirection}`,
    actionRecommended: operationalDirection === ComparisonDirection.DECLINED,
  };
  
  // Quality combines service and portal
  const qualityMetrics = [comparison.customerService, comparison.portalOnTime];
  const qualityImproved = qualityMetrics.filter((m) => m.isImprovement).length;
  const qualityDirection =
    qualityImproved > 1 ? ComparisonDirection.IMPROVED : qualityImproved === 0 ? ComparisonDirection.DECLINED : ComparisonDirection.UNCHANGED;
  
  const quality: TrendAnalysis = {
    direction: qualityDirection,
    severity: TrendSeverity.MODERATE,
    magnitude: (Math.abs(comparison.customerService.percentChange) + Math.abs(comparison.portalOnTime.percentChange)) / 2,
    description: `Quality metrics ${qualityDirection}`,
    actionRecommended: qualityDirection === ComparisonDirection.DECLINED,
  };
  
  const digitalAdoption = analyzeTrend(comparison.digitalPercent, thresholds);
  
  // Overall health
  const overallHealth: TrendAnalysis = {
    direction: comparison.overallTrend,
    severity: TrendSeverity.MODERATE,
    magnitude: comparison.improvedCount / 8,
    description: `Overall business health ${comparison.overallTrend}`,
    actionRecommended: comparison.declinedCount > comparison.improvedCount,
  };
  
  return {
    sales,
    customer,
    operationalEfficiency,
    quality,
    digitalAdoption,
    overallHealth,
  };
}

/**
 * Formats metric comparison for display
 */
export function formatMetricComparison(comparison: MetricComparison): string {
  const sign = comparison.absoluteChange >= 0 ? '+' : '';
  const percent = (comparison.percentChange * 100).toFixed(1);
  
  let value = '';
  if (comparison.format === 'currency') {
    value = `$${comparison.absoluteChange.toFixed(2)}`;
  } else if (comparison.format === 'percent') {
    value = `${(comparison.absoluteChange * 100).toFixed(1)}%`;
  } else {
    value = comparison.absoluteChange.toFixed(1);
  }
  
  return `${sign}${value} (${sign}${percent}%)`;
}

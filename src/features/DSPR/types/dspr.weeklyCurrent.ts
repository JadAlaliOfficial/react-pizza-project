/**
 * ============================================================================
 * DSPR WEEKLY CURRENT TYPES
 * ============================================================================
 * Domain: Weekly DSPR (Current Week Aggregate)
 * 
 * Responsibility:
 * - Defines types for current week aggregate operational metrics
 * - Provides week-to-date (WTD) financial, operational, quality metrics
 * - Contains comparison helpers for week-over-week analysis
 * - Supports trend analysis and weekly performance scoring
 * - Provides validation utilities and weekly summaries
 * 
 * Related Files:
 * - Data source: reports.weekly.DSPRData from DsprApiResponse
 * - Used by: state/dsprWeeklySlice.ts (Redux state)
 * - Used by: hooks/useWeeklyDspr.ts (React hook)
 * - Compare with: dspr.weeklyPrev.ts (previous week comparison)
 * 
 * Key Types:
 * - WeeklyDSPRData: Raw current week aggregate metrics (same fields as DailyDSPRData)
 * - ProcessedWeeklyDSPR: Enriched data with categorized summaries
 * - WeeklyFinancialSummary: Revenue, cost control, cash metrics
 * - WeeklyOperationalSummary: Labor, customer count, portal, tickets
 * - WeeklyQualitySummary: Service, upselling, portal performance
 * - WeeklySalesChannelSummary: Digital, delivery, phone breakdown
 * - WeeklyTrends: Daily averages and growth indicators
 */

import { type ApiDate, type StoreId, type WeekNumber } from './dspr.common';

// ============================================================================
// RAW WEEKLY DSPR TYPES (from API)
// ============================================================================

/**
 * Current week aggregate DSPR data
 * Contains same fields as DailyDSPRData but aggregated across the week
 */
export interface WeeklyDSPRData {
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
 * Weekly financial summary
 */
export interface WeeklyFinancialSummary {
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
  
  /** Daily average tips ($) */
  dailyAverageTips: number;
}

/**
 * Weekly operational summary
 */
export interface WeeklyOperationalSummary {
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
  
  /** Customers per operating day */
  customersPerDay: number;
}

/**
 * Weekly quality and service summary
 */
export interface WeeklyQualitySummary {
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
 * Weekly sales channel summary
 */
export interface WeeklySalesChannelSummary {
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
  
  /** Digital growth indicator */
  digitalGrowthIndicator: GrowthIndicator;
}

/**
 * Weekly cost control summary
 */
export interface WeeklyCostControlSummary {
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
  
  /** Cost efficiency score (0-100) */
  costEfficiencyScore: number;
}

/**
 * Growth indicator enum
 */
export const GrowthIndicator = {
  STRONG: 'strong',
  MODERATE: 'moderate',
  FLAT: 'flat',
  DECLINING: 'declining',
} as const;

export type GrowthIndicator = (typeof GrowthIndicator)[keyof typeof GrowthIndicator];

/**
 * Weekly trends and insights
 */
export interface WeeklyTrends {
  /** Daily average sales ($) */
  dailyAverageSales: number;
  
  /** Daily average customers */
  dailyAverageCustomers: number;
  
  /** Daily average ticket ($) */
  dailyAverageTicket: number;
  
  /** Sales per customer ($) */
  salesPerCustomer: number;
  
  /** Operating days in the week */
  operatingDays: number;
  
  /** Projected week-end total (if week incomplete) ($) */
  projectedWeekTotal?: number;
  
  /** Run rate (extrapolated annual revenue) ($) */
  annualRunRate: number;
}

/**
 * Processed weekly DSPR with categorized summaries
 */
export interface ProcessedWeeklyDSPR {
  /** Store ID */
  store: StoreId;
  
  /** Week number (1-52) */
  week: WeekNumber;
  
  /** Week start date */
  weekStartDate: ApiDate;
  
  /** Week end date */
  weekEndDate: ApiDate;
  
  /** Raw weekly data */
  raw: WeeklyDSPRData;
  
  /** Financial summary */
  financial: WeeklyFinancialSummary;
  
  /** Operational summary */
  operational: WeeklyOperationalSummary;
  
  /** Quality summary */
  quality: WeeklyQualitySummary;
  
  /** Sales channel summary */
  salesChannels: WeeklySalesChannelSummary;
  
  /** Cost control summary */
  costControl: WeeklyCostControlSummary;
  
  /** Weekly trends */
  trends: WeeklyTrends;
  
  /** Performance grade */
  grade: PerformanceGrade;
  
  /** Week-to-date progress (0-1, based on days elapsed) */
  weekProgress: number;
  
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
 * Week-over-week change
 */
export interface WeekOverWeekChange {
  /** Metric name */
  metric: string;
  
  /** Current week value */
  current: number;
  
  /** Previous week value */
  previous: number;
  
  /** Absolute change */
  change: number;
  
  /** Percentage change (0-1) */
  changePercent: number;
  
  /** Growth indicator */
  indicator: GrowthIndicator;
}

/**
 * Weekly comparison summary
 */
export interface WeeklyComparison {
  /** Sales comparison */
  sales: WeekOverWeekChange;
  
  /** Customer count comparison */
  customers: WeekOverWeekChange;
  
  /** Average ticket comparison */
  averageTicket: WeekOverWeekChange;
  
  /** Labor percentage comparison */
  laborPercent: WeekOverWeekChange;
  
  /** Waste percentage comparison */
  wastePercent: WeekOverWeekChange;
  
  /** Digital sales percentage comparison */
  digitalPercent: WeekOverWeekChange;
  
  /** Customer service comparison */
  customerService: WeekOverWeekChange;
  
  /** Overall trend */
  overallTrend: GrowthIndicator;
}

// ============================================================================
// FILTERING & CONFIGURATION
// ============================================================================

/**
 * Weekly DSPR filter options
 */
export interface WeeklyDSPRFilter {
  /** Minimum total sales ($) */
  minSales?: number;
  
  /** Maximum labor percentage (0-1) */
  maxLaborPercent?: number;
  
  /** Maximum waste percentage (0-1) */
  maxWastePercent?: number;
  
  /** Minimum customer service score (0-1) */
  minCustomerService?: number;
  
  /** Minimum digital sales percentage (0-1) */
  minDigitalPercent?: number;
  
  /** Minimum grade */
  minGrade?: PerformanceGrade;
}

/**
 * Weekly performance thresholds
 */
export interface WeeklyPerformanceThresholds {
  /** Maximum labor percentage (0-1) */
  maxLaborPercent: number;
  
  /** Maximum waste percentage (0-1) */
  maxWastePercent: number;
  
  /** Minimum customer service score (0-1) */
  minCustomerService: number;
  
  /** Minimum portal usage rate (0-1) */
  minPortalUsageRate: number;
  
  /** Minimum portal on-time rate (0-1) */
  minPortalOnTimeRate: number;
  
  /** Minimum digital sales percentage (0-1) */
  minDigitalPercent: number;
  
  /** Minimum average ticket ($) */
  minAverageTicket: number;
  
  /** Minimum customer count percentage (0-1) */
  minCustomerCountPercent: number;
}

/**
 * Default weekly performance thresholds
 */
export const defaultWeeklyThresholds: WeeklyPerformanceThresholds = {
  maxLaborPercent: 0.25,
  maxWastePercent: 0.08,
  minCustomerService: 0.90,
  minPortalUsageRate: 0.95,
  minPortalOnTimeRate: 0.95,
  minDigitalPercent: 0.40,
  minAverageTicket: 12,
  minCustomerCountPercent: 0.80,
};

/**
 * Weekly DSPR configuration
 */
export interface WeeklyDSPRConfig {
  thresholds: WeeklyPerformanceThresholds;
  filter: WeeklyDSPRFilter;
  operatingDaysPerWeek: number;
}

/**
 * Default weekly DSPR configuration
 */
export const defaultWeeklyDSPRConfig: WeeklyDSPRConfig = {
  thresholds: defaultWeeklyThresholds,
  filter: {},
  operatingDaysPerWeek: 7,
};

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Weekly DSPR validation result
 */
export interface WeeklyDSPRValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Type guard: Checks if a value is valid WeeklyDSPRData
 */
export function isValidWeeklyDSPRData(value: unknown): value is WeeklyDSPRData {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  
  const data = value as WeeklyDSPRData;
  return (
    typeof data.TotalSales === 'number' &&
    typeof data.labor === 'number' &&
    typeof data.Customercount === 'number' &&
    typeof data.Avrageticket === 'number' &&
    typeof data.DigitalSalesPercent === 'number'
  );
}

/**
 * Type guard: Checks if a value is a valid GrowthIndicator
 */
export function isValidGrowthIndicator(value: unknown): value is GrowthIndicator {
  return typeof value === 'string' && Object.values(GrowthIndicator).includes(value as GrowthIndicator);
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
 * Validates weekly DSPR data
 */
export function validateWeeklyDSPRData(data: WeeklyDSPRData): WeeklyDSPRValidation {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (!isValidWeeklyDSPRData(data)) {
    errors.push('Invalid WeeklyDSPRData structure');
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

/**
 * Validates weekly DSPR filter
 */
export function validateWeeklyDSPRFilter(filter: WeeklyDSPRFilter): WeeklyDSPRValidation {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (filter.minSales !== undefined && filter.minSales < 0) {
    errors.push('minSales must be non-negative');
  }
  
  if (filter.maxLaborPercent !== undefined) {
    if (filter.maxLaborPercent < 0 || filter.maxLaborPercent > 1) {
      errors.push('maxLaborPercent must be between 0 and 1');
    }
  }
  
  if (filter.maxWastePercent !== undefined) {
    if (filter.maxWastePercent < 0 || filter.maxWastePercent > 1) {
      errors.push('maxWastePercent must be between 0 and 1');
    }
  }
  
  if (filter.minCustomerService !== undefined) {
    if (filter.minCustomerService < 0 || filter.minCustomerService > 1) {
      errors.push('minCustomerService must be between 0 and 1');
    }
  }
  
  if (filter.minDigitalPercent !== undefined) {
    if (filter.minDigitalPercent < 0 || filter.minDigitalPercent > 1) {
      errors.push('minDigitalPercent must be between 0 and 1');
    }
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
export function calculateTotalWaste(data: WeeklyDSPRData): number {
  return data.wastegateway + data.WasteAlta;
}

/**
 * Calculates waste as percentage of sales
 */
export function calculateWastePercent(data: WeeklyDSPRData): number {
  if (data.TotalSales === 0) return 0;
  return calculateTotalWaste(data) / data.TotalSales;
}

/**
 * Calculates total digital sales (Website + Mobile)
 */
export function calculateDigitalSales(data: WeeklyDSPRData): number {
  return data.Website + data.Mobile;
}

/**
 * Calculates total delivery platform sales
 */
export function calculateDeliverySales(data: WeeklyDSPRData): number {
  return data.DoorDashSales + data.UberEatsSales + data.GrubHubSales;
}

/**
 * Calculates delivery sales as percentage of total
 */
export function calculateDeliveryPercent(data: WeeklyDSPRData): number {
  if (data.TotalSales === 0) return 0;
  return calculateDeliverySales(data) / data.TotalSales;
}

/**
 * Calculates labor cost in dollars
 */
export function calculateLaborCost(data: WeeklyDSPRData): number {
  return data.TotalSales * data.labor;
}

/**
 * Calculates net revenue (sales - waste - overshort)
 */
export function calculateNetRevenue(data: WeeklyDSPRData): number {
  return data.TotalSales - calculateTotalWaste(data) - Math.abs(data.overshort);
}

/**
 * Calculates daily average sales
 */
export function calculateDailyAverageSales(data: WeeklyDSPRData, operatingDays: number = 7): number {
  return data.TotalSales / operatingDays;
}

/**
 * Calculates daily average customers
 */
export function calculateDailyAverageCustomers(data: WeeklyDSPRData, operatingDays: number = 7): number {
  return data.Customercount / operatingDays;
}

/**
 * Calculates annual run rate (extrapolated from weekly data)
 */
export function calculateAnnualRunRate(data: WeeklyDSPRData): number {
  return data.TotalSales * 52;
}

/**
 * Calculates cost efficiency score (0-100)
 */
export function calculateCostEfficiencyScore(
  data: WeeklyDSPRData,
  thresholds: WeeklyPerformanceThresholds
): number {
  let score = 100;
  
  // Labor penalty
  if (data.labor > thresholds.maxLaborPercent) {
    const excess = (data.labor - thresholds.maxLaborPercent) / thresholds.maxLaborPercent;
    score -= Math.min(30, excess * 100);
  }
  
  // Waste penalty
  const wastePercent = calculateWastePercent(data);
  if (wastePercent > thresholds.maxWastePercent) {
    const excess = (wastePercent - thresholds.maxWastePercent) / thresholds.maxWastePercent;
    score -= Math.min(30, excess * 100);
  }
  
  // Overshort penalty (proportional to sales)
  const overshortPercent = Math.abs(data.overshort) / data.TotalSales;
  if (overshortPercent > 0.01) {
    score -= Math.min(20, overshortPercent * 1000);
  }
  
  return Math.max(0, score);
}

/**
 * Calculates overall performance score (0-100)
 */
export function calculatePerformanceScore(
  data: WeeklyDSPRData,
  thresholds: WeeklyPerformanceThresholds
): number {
  let score = 100;
  
  // Labor penalty
  if (data.labor > thresholds.maxLaborPercent) {
    score -= 15;
  }
  
  // Waste penalty
  const wastePercent = calculateWastePercent(data);
  if (wastePercent > thresholds.maxWastePercent) {
    score -= 15;
  }
  
  // Customer service penalty
  if (data.CustomerService < thresholds.minCustomerService) {
    score -= 20;
  }
  
  // Portal metrics penalty
  if (data.PutintoPortalPercent < thresholds.minPortalUsageRate) {
    score -= 10;
  }
  
  if (data.InPortalonTimePercent < thresholds.minPortalOnTimeRate) {
    score -= 10;
  }
  
  // Digital sales penalty
  if (data.DigitalSalesPercent < thresholds.minDigitalPercent) {
    score -= 10;
  }
  
  // Customer count penalty
  if (data.Customercountpercent < thresholds.minCustomerCountPercent) {
    score -= 10;
  }
  
  // Average ticket penalty
  if (data.Avrageticket < thresholds.minAverageTicket) {
    score -= 10;
  }
  
  return Math.max(0, score);
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
 * Calculates growth indicator based on change percentage
 */
export function calculateGrowthIndicator(changePercent: number): GrowthIndicator {
  if (changePercent >= 0.05) {
    return GrowthIndicator.STRONG;
  } else if (changePercent >= 0.01) {
    return GrowthIndicator.MODERATE;
  } else if (changePercent >= -0.01) {
    return GrowthIndicator.FLAT;
  } else {
    return GrowthIndicator.DECLINING;
  }
}

/**
 * Calculates week-over-week change for a metric
 */
export function calculateWeekOverWeekChange(
  metric: string,
  current: number,
  previous: number
): WeekOverWeekChange {
  const change = current - previous;
  const changePercent = previous !== 0 ? change / previous : 0;
  const indicator = calculateGrowthIndicator(changePercent);
  
  return {
    metric,
    current,
    previous,
    change,
    changePercent,
    indicator,
  };
}

/**
 * Calculates week progress (0-1) based on current date and week boundaries
 */
export function calculateWeekProgress(weekStartDate: string, weekEndDate: string, currentDate?: string): number {
  const start = new Date(weekStartDate).getTime();
  const end = new Date(weekEndDate).getTime();
  const now = currentDate ? new Date(currentDate).getTime() : Date.now();
  
  if (now <= start) return 0;
  if (now >= end) return 1;
  
  const elapsed = now - start;
  const total = end - start;
  
  return Math.min(1, Math.max(0, elapsed / total));
}

/**
 * Projects week-end total based on current progress
 */
export function projectWeekTotal(currentTotal: number, weekProgress: number): number {
  if (weekProgress === 0) return 0;
  if (weekProgress === 1) return currentTotal;
  
  return currentTotal / weekProgress;
}

/**
 * Filters weekly DSPR data based on filter configuration
 */
export function filterWeeklyDSPR(data: ProcessedWeeklyDSPR, filter: WeeklyDSPRFilter): boolean {
  if (filter.minSales !== undefined && data.raw.TotalSales < filter.minSales) {
    return false;
  }
  
  if (filter.maxLaborPercent !== undefined && data.raw.labor > filter.maxLaborPercent) {
    return false;
  }
  
  if (filter.maxWastePercent !== undefined && calculateWastePercent(data.raw) > filter.maxWastePercent) {
    return false;
  }
  
  if (filter.minCustomerService !== undefined && data.raw.CustomerService < filter.minCustomerService) {
    return false;
  }
  
  if (filter.minDigitalPercent !== undefined && data.raw.DigitalSalesPercent < filter.minDigitalPercent) {
    return false;
  }
  
  if (filter.minGrade !== undefined) {
    const gradeOrder = [
      PerformanceGrade.CRITICAL,
      PerformanceGrade.POOR,
      PerformanceGrade.FAIR,
      PerformanceGrade.GOOD,
      PerformanceGrade.EXCELLENT,
    ];
    const currentGradeIndex = gradeOrder.indexOf(data.grade);
    const minGradeIndex = gradeOrder.indexOf(filter.minGrade);
    
    if (currentGradeIndex < minGradeIndex) {
      return false;
    }
  }
  
  return true;
}

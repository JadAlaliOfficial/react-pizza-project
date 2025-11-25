/**
 * ============================================================================
 * DSPR DAILY TYPES
 * ============================================================================
 * Domain: Daily DSPR (Daily Sales Performance Report)
 * 
 * Responsibility:
 * - Defines types for single-day operational metrics
 * - Provides comprehensive financial, operational, quality, and cost control KPIs
 * - Includes labor, waste, sales channels, delivery platforms, customer metrics
 * - Contains categorization, filtering, and threshold configuration
 * - Provides validation utilities and summary analysis
 * 
 * Related Files:
 * - Data source: reports.daily.dailyDSPRData from DsprApiResponse
 * - Used by: state/dsprDailySlice.ts (Redux state)
 * - Used by: hooks/useDailyDspr.ts (React hook)
 * 
 * Key Types:
 * - DailyDSPRData: Raw daily operational metrics from API (30+ fields)
 * - ProcessedDailyDSPR: Enriched data with categorized summaries
 * - FinancialSummary: Revenue, tips, cash, waste, overshort
 * - OperationalSummary: Labor, customer count, average ticket, portal metrics
 * - QualitySummary: HNR promise metrics, customer service, upselling
 * - SalesChannelBreakdown: Digital, delivery platforms, phone, website, mobile
 * - CostControlMetrics: Waste percentages, refunds, modified orders
 */

import { type ApiDate, type StoreId } from './dspr.common';

// ============================================================================
// RAW DAILY DSPR TYPES (from API)
// ============================================================================

/**
 * Complete daily DSPR operational metrics
 * Contains all KPIs for a single business day
 */
export interface DailyDSPRData {
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
  
  /** Total sales for the day ($) */
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
  
  // Portal metrics (order tracking system)
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
  
  // HNR (Hour-and-a-Half-Ready) promise metrics
  /** Total HNR transactions */
  HNRTransactions?: number;
  
  /** HNR transactions with credit card */
  HNRTransactionswithCC?: number;
  
  /** HNR promise broken percentage (0-100) */
  HNRPromiseBrokenPercent?: number;
  
  /** HNR promise met percentage (0-100) */
  HNRPromiseMetPercent?: number;
  
  /** Number of HNR promises met */
  HNRPromiseMetTransactions?: number;
  
  // Performance percentages
  /** Customer count as percentage of target (0-1) */
  Customercountpercent: number;
  
  /** Customer service score (0-1) */
  CustomerService: number;
}

// ============================================================================
// METRIC CATEGORIES
// ============================================================================

/**
 * Financial summary metrics
 */
export interface FinancialSummary {
  /** Total sales ($) */
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
  
  /** Cash sales vs deposit difference ($) */
  cashDepositDifference: number;
  
  /** Net revenue (sales - waste - overshort) ($) */
  netRevenue: number;
}

/**
 * Operational summary metrics
 */
export interface OperationalSummary {
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
}

/**
 * Quality and service metrics
 */
export interface QualitySummary {
  /** Customer service score (0-1) */
  customerService: number;
  
  /** Upselling score (0-1) */
  upselling: number;
  
  /** HNR promise met percentage (0-100) */
  hnrPromiseMetPercent: number;
  
  /** HNR promise broken percentage (0-100) */
  hnrPromiseBrokenPercent: number;
  
  /** Total HNR transactions */
  hnrTransactions: number;
  
  /** HNR promises met count */
  hnrPromisesMet: number;
  
  /** Portal on-time delivery percentage (0-1) */
  portalOnTimePercent: number;
}

/**
 * Cost control metrics
 */
export interface CostControlMetrics {
  /** Total waste ($) */
  totalWaste: number;
  
  /** Waste as percentage of sales (0-1) */
  wastePercent: number;
  
  /** Number of refunded orders */
  refundedOrderCount: number;
  
  /** Number of modified orders */
  modifiedOrderCount: number;
  
  /** Labor percentage (0-1) */
  laborPercent: number;
  
  /** Over/short amount ($) */
  overshort: number;
}

/**
 * Sales channel breakdown
 */
export interface SalesChannelBreakdown {
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

// ============================================================================
// PROCESSED/DERIVED TYPES
// ============================================================================

/**
 * Processed daily DSPR with categorized summaries
 */
export interface ProcessedDailyDSPR {
  /** Store ID */
  store: StoreId;
  
  /** Business date */
  date: ApiDate;
  
  /** Raw daily data */
  raw: DailyDSPRData;
  
  /** Financial summary */
  financial: FinancialSummary;
  
  /** Operational summary */
  operational: OperationalSummary;
  
  /** Quality summary */
  quality: QualitySummary;
  
  /** Cost control metrics */
  costControl: CostControlMetrics;
  
  /** Sales channel breakdown */
  salesChannels: SalesChannelBreakdown;
  
  /** Performance grade */
  grade: PerformanceGrade;
  
  /** Alert flags */
  alerts: DailyAlert[];
  
  /** Timestamp when this data was processed */
  processedAt: string;
}

/**
 * Performance grade levels for daily operations
 */
export const PerformanceGrade = {
  EXCELLENT: 'Excellent',
  GOOD: 'Good',
  FAIR: 'Fair',
  POOR: 'Poor',
  CRITICAL: 'Critical',
} as const;

export type PerformanceGrade = (typeof PerformanceGrade)[keyof typeof PerformanceGrade];

/**
 * Alert severity levels
 */
export const AlertSeverity = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  CRITICAL: 'critical',
} as const;

export type AlertSeverity = (typeof AlertSeverity)[keyof typeof AlertSeverity];

/**
 * Alert categories
 */
export const AlertCategory = {
  FINANCIAL: 'financial',
  OPERATIONAL: 'operational',
  QUALITY: 'quality',
  COST_CONTROL: 'cost_control',
} as const;

export type AlertCategory = (typeof AlertCategory)[keyof typeof AlertCategory];

/**
 * Daily alert notification
 */
export interface DailyAlert {
  /** Alert category */
  category: AlertCategory;
  
  /** Alert severity */
  severity: AlertSeverity;
  
  /** Alert message */
  message: string;
  
  /** Metric name that triggered the alert */
  metric: string;
  
  /** Actual value */
  value: number;
  
  /** Threshold value */
  threshold: number;
}

// ============================================================================
// THRESHOLDS & CONFIGURATION
// ============================================================================

/**
 * Daily performance thresholds
 */
export interface DailyPerformanceThresholds {
  // Financial thresholds
  /** Maximum acceptable labor percentage (0-1) */
  maxLaborPercent: number;
  
  /** Maximum acceptable waste percentage (0-1) */
  maxWastePercent: number;
  
  /** Maximum acceptable overshort ($) */
  maxOvershort: number;
  
  // Quality thresholds
  /** Minimum customer service score (0-1) */
  minCustomerService: number;
  
  /** Minimum HNR promise met percentage (0-100) */
  minPromiseMetPercent: number;
  
  /** Minimum upselling score (0-1) */
  minUpselling: number;
  
  // Operational thresholds
  /** Minimum customer count percentage (0-1) */
  minCustomerCountPercent: number;
  
  /** Minimum portal usage rate (0-1) */
  minPortalUsageRate: number;
  
  /** Minimum portal on-time rate (0-1) */
  minPortalOnTimeRate: number;
  
  // Sales thresholds
  /** Minimum digital sales percentage (0-1) */
  minDigitalPercent: number;
  
  /** Minimum average ticket ($) */
  minAverageTicket: number;
}

/**
 * Default daily performance thresholds
 */
export const defaultDailyThresholds: DailyPerformanceThresholds = {
  maxLaborPercent: 0.25,
  maxWastePercent: 0.08,
  maxOvershort: 10,
  minCustomerService: 0.90,
  minPromiseMetPercent: 80,
  minUpselling: 0.70,
  minCustomerCountPercent: 0.80,
  minPortalUsageRate: 0.95,
  minPortalOnTimeRate: 0.95,
  minDigitalPercent: 0.40,
  minAverageTicket: 12,
};

/**
 * Grade calculation thresholds
 */
export interface GradeThresholds {
  /** Excellent grade threshold (score 0-100) */
  excellent: number;
  
  /** Good grade threshold */
  good: number;
  
  /** Fair grade threshold */
  fair: number;
  
  /** Poor grade threshold */
  poor: number;
}

/**
 * Default grade thresholds
 */
export const defaultGradeThresholds: GradeThresholds = {
  excellent: 90,
  good: 75,
  fair: 60,
  poor: 45,
};

/**
 * Complete daily DSPR analysis configuration
 */
export interface DailyDSPRConfig {
  thresholds: DailyPerformanceThresholds;
  gradeThresholds: GradeThresholds;
  enableAlerts: boolean;
}

/**
 * Default daily DSPR configuration
 */
export const defaultDailyDSPRConfig: DailyDSPRConfig = {
  thresholds: defaultDailyThresholds,
  gradeThresholds: defaultGradeThresholds,
  enableAlerts: true,
};

// ============================================================================
// FILTERING & SORTING
// ============================================================================

/**
 * Daily DSPR filter options
 */
export interface DailyDSPRFilter {
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
  
  /** Show only days with alerts */
  alertsOnly?: boolean;
}

/**
 * Daily DSPR sort options
 */
export const DailyDSPRSort = {
  /** Sort by date */
  DATE: 'date',
  
  /** Sort by total sales (descending) */
  SALES_DESC: 'salesDesc',
  
  /** Sort by labor percentage (ascending) */
  LABOR_ASC: 'laborAsc',
  
  /** Sort by customer count (descending) */
  CUSTOMERS_DESC: 'customersDesc',
  
  /** Sort by average ticket (descending) */
  AVG_TICKET_DESC: 'avgTicketDesc',
  
  /** Sort by digital percentage (descending) */
  DIGITAL_DESC: 'digitalDesc',
} as const;

export type DailyDSPRSort = (typeof DailyDSPRSort)[keyof typeof DailyDSPRSort];

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Daily DSPR validation result
 */
export interface DailyDSPRValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Type guard: Checks if a value is valid DailyDSPRData
 */
export function isValidDailyDSPRData(value: unknown): value is DailyDSPRData {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  
  const data = value as DailyDSPRData;
  return (
    typeof data.TotalSales === 'number' &&
    typeof data.labor === 'number' &&
    typeof data.Customercount === 'number' &&
    typeof data.Avrageticket === 'number' &&
    typeof data.DigitalSalesPercent === 'number'
  );
}

/**
 * Type guard: Checks if a value is a valid AlertSeverity
 */
export function isValidAlertSeverity(value: unknown): value is AlertSeverity {
  return typeof value === 'string' && Object.values(AlertSeverity).includes(value as AlertSeverity);
}

/**
 * Type guard: Checks if a value is a valid AlertCategory
 */
export function isValidAlertCategory(value: unknown): value is AlertCategory {
  return typeof value === 'string' && Object.values(AlertCategory).includes(value as AlertCategory);
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
 * Validates daily DSPR data
 */
export function validateDailyDSPRData(data: DailyDSPRData): DailyDSPRValidation {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (!isValidDailyDSPRData(data)) {
    errors.push('Invalid DailyDSPRData structure');
    return { isValid: false, errors, warnings };
  }
  
  // Financial validations
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
  
  // Customer metrics
  if (data.Customercount < 0) {
    errors.push('Customer count cannot be negative');
  }
  
  if (data.Avrageticket < 0) {
    errors.push('Average ticket cannot be negative');
  }
  
  // Percentage validations
  if (data.DigitalSalesPercent < 0 || data.DigitalSalesPercent > 1) {
    warnings.push(`Digital sales percent out of range: ${data.DigitalSalesPercent}`);
  }
  
  if (data.PutintoPortalPercent < 0 || data.PutintoPortalPercent > 1) {
    warnings.push(`Portal usage percent out of range: ${data.PutintoPortalPercent}`);
  }
  
  if (data.InPortalonTimePercent < 0 || data.InPortalonTimePercent > 1) {
    warnings.push(`Portal on-time percent out of range: ${data.InPortalonTimePercent}`);
  }
  
  // HNR metrics (if present)
  if (data.HNRPromiseMetPercent !== undefined) {
    if (data.HNRPromiseMetPercent < 0 || data.HNRPromiseMetPercent > 100) {
      warnings.push(`HNR promise met percent out of range: ${data.HNRPromiseMetPercent}`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validates daily DSPR filter
 */
export function validateDailyDSPRFilter(filter: DailyDSPRFilter): DailyDSPRValidation {
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
export function calculateTotalWaste(data: DailyDSPRData): number {
  return data.wastegateway + data.WasteAlta;
}

/**
 * Calculates waste as percentage of sales
 */
export function calculateWastePercent(data: DailyDSPRData): number {
  if (data.TotalSales === 0) return 0;
  return calculateTotalWaste(data) / data.TotalSales;
}

/**
 * Calculates total digital sales (Website + Mobile)
 */
export function calculateDigitalSales(data: DailyDSPRData): number {
  return data.Website + data.Mobile;
}

/**
 * Calculates total delivery platform sales
 */
export function calculateDeliverySales(data: DailyDSPRData): number {
  return data.DoorDashSales + data.UberEatsSales + data.GrubHubSales;
}

/**
 * Calculates delivery sales as percentage of total
 */
export function calculateDeliveryPercent(data: DailyDSPRData): number {
  if (data.TotalSales === 0) return 0;
  return calculateDeliverySales(data) / data.TotalSales;
}

/**
 * Calculates labor cost in dollars
 */
export function calculateLaborCost(data: DailyDSPRData): number {
  return data.TotalSales * data.labor;
}

/**
 * Calculates net revenue (sales - waste - overshort)
 */
export function calculateNetRevenue(data: DailyDSPRData): number {
  return data.TotalSales - calculateTotalWaste(data) - Math.abs(data.overshort);
}

/**
 * Calculates overall performance score (0-100)
 */
export function calculatePerformanceScore(
  data: DailyDSPRData,
  thresholds: DailyPerformanceThresholds
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
  
  // HNR promise penalty
  if (data.HNRPromiseMetPercent !== undefined && data.HNRPromiseMetPercent < thresholds.minPromiseMetPercent) {
    score -= 15;
  }
  
  // Digital sales penalty
  if (data.DigitalSalesPercent < thresholds.minDigitalPercent) {
    score -= 10;
  }
  
  // Customer count penalty
  if (data.Customercountpercent < thresholds.minCustomerCountPercent) {
    score -= 5;
  }
  
  return Math.max(0, score);
}

/**
 * Calculates performance grade based on score
 */
export function calculatePerformanceGrade(score: number, thresholds: GradeThresholds = defaultGradeThresholds): PerformanceGrade {
  if (score >= thresholds.excellent) {
    return PerformanceGrade.EXCELLENT;
  } else if (score >= thresholds.good) {
    return PerformanceGrade.GOOD;
  } else if (score >= thresholds.fair) {
    return PerformanceGrade.FAIR;
  } else if (score >= thresholds.poor) {
    return PerformanceGrade.POOR;
  } else {
    return PerformanceGrade.CRITICAL;
  }
}

/**
 * Identifies alerts based on thresholds
 */
export function identifyDailyAlerts(
  data: DailyDSPRData,
  thresholds: DailyPerformanceThresholds
): DailyAlert[] {
  const alerts: DailyAlert[] = [];
  
  // Labor alert
  if (data.labor > thresholds.maxLaborPercent) {
    alerts.push({
      category: AlertCategory.COST_CONTROL,
      severity: data.labor > thresholds.maxLaborPercent * 1.2 ? AlertSeverity.CRITICAL : AlertSeverity.WARNING,
      message: `Labor percentage exceeds target (${(data.labor * 100).toFixed(1)}%)`,
      metric: 'labor',
      value: data.labor,
      threshold: thresholds.maxLaborPercent,
    });
  }
  
  // Waste alert
  const wastePercent = calculateWastePercent(data);
  if (wastePercent > thresholds.maxWastePercent) {
    alerts.push({
      category: AlertCategory.COST_CONTROL,
      severity: wastePercent > thresholds.maxWastePercent * 1.5 ? AlertSeverity.ERROR : AlertSeverity.WARNING,
      message: `Waste percentage exceeds target (${(wastePercent * 100).toFixed(1)}%)`,
      metric: 'waste',
      value: wastePercent,
      threshold: thresholds.maxWastePercent,
    });
  }
  
  // Customer service alert
  if (data.CustomerService < thresholds.minCustomerService) {
    alerts.push({
      category: AlertCategory.QUALITY,
      severity: data.CustomerService < thresholds.minCustomerService * 0.85 ? AlertSeverity.CRITICAL : AlertSeverity.WARNING,
      message: `Customer service score below target (${(data.CustomerService * 100).toFixed(1)}%)`,
      metric: 'customerService',
      value: data.CustomerService,
      threshold: thresholds.minCustomerService,
    });
  }
  
  // HNR promise alert
  if (data.HNRPromiseMetPercent !== undefined && data.HNRPromiseMetPercent < thresholds.minPromiseMetPercent) {
    alerts.push({
      category: AlertCategory.QUALITY,
      severity: data.HNRPromiseMetPercent < thresholds.minPromiseMetPercent * 0.8 ? AlertSeverity.ERROR : AlertSeverity.WARNING,
      message: `HNR promise rate below target (${data.HNRPromiseMetPercent.toFixed(1)}%)`,
      metric: 'hnrPromiseMet',
      value: data.HNRPromiseMetPercent,
      threshold: thresholds.minPromiseMetPercent,
    });
  }
  
  // Portal usage alert
  if (data.PutintoPortalPercent < thresholds.minPortalUsageRate) {
    alerts.push({
      category: AlertCategory.OPERATIONAL,
      severity: AlertSeverity.WARNING,
      message: `Portal usage rate below target (${(data.PutintoPortalPercent * 100).toFixed(1)}%)`,
      metric: 'portalUsage',
      value: data.PutintoPortalPercent,
      threshold: thresholds.minPortalUsageRate,
    });
  }
  
  // Digital sales alert
  if (data.DigitalSalesPercent < thresholds.minDigitalPercent) {
    alerts.push({
      category: AlertCategory.OPERATIONAL,
      severity: AlertSeverity.INFO,
      message: `Digital sales below target (${(data.DigitalSalesPercent * 100).toFixed(1)}%)`,
      metric: 'digitalSales',
      value: data.DigitalSalesPercent,
      threshold: thresholds.minDigitalPercent,
    });
  }
  
  // Overshort alert
  if (Math.abs(data.overshort) > thresholds.maxOvershort) {
    alerts.push({
      category: AlertCategory.FINANCIAL,
      severity: Math.abs(data.overshort) > thresholds.maxOvershort * 2 ? AlertSeverity.ERROR : AlertSeverity.WARNING,
      message: `Over/short exceeds threshold ($${Math.abs(data.overshort).toFixed(2)})`,
      metric: 'overshort',
      value: Math.abs(data.overshort),
      threshold: thresholds.maxOvershort,
    });
  }
  
  return alerts;
}

/**
 * Filters daily DSPR data based on filter configuration
 */
export function filterDailyDSPR(data: ProcessedDailyDSPR, filter: DailyDSPRFilter): boolean {
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
  
  if (filter.alertsOnly && data.alerts.length === 0) {
    return false;
  }
  
  return true;
}

/**
 * ============================================================================
 * DSPR DAILY BY DATE TYPES
 * ============================================================================
 * Domain: Daily DSPR By Date (Daily Breakdown with Week Comparison)
 *
 * Responsibility:
 * - Defines types for daily DSPR breakdown across multiple dates
 * - Provides date-keyed access to daily metrics with previous week comparison
 * - Supports timeline views, trend analysis, and day-over-day insights
 * - Contains same daily metrics as DailyDSPRData but organized by date
 * - Enables comparative analysis between current day and same day previous week
 *
 * NOTE (IMPORTANT):
 * API shape for DailyDSPRByDate is FLAT per date:
 *   "2025-11-18": { ...currentDayRawFields, PrevWeek: {...prevRawFields} }
 * and some dates may be strings like:
 *   "2025-11-24": "No Final Summary data available."
 */

import { type ApiDate, type StoreId, type WeekNumber, type ISODateTime } from './dspr.common';

// ============================================================================
// DAILY DSPR BY DATE TYPES (from API)
// ============================================================================

/**
 * Raw single day's DSPR data (snake_case as returned by API)
 */
export interface DailyDSPRDayRaw {
  labor: number;
  waste_gateway: number;
  over_short: number;
  Refunded_order_Qty: number;
  Total_Cash_Sales: number;
  Total_Sales: number;
  Waste_Alta: number;
  Modified_Order_Qty: number;
  Total_TIPS: number;
  Customer_count: number;
  DoorDash_Sales: number;
  UberEats_Sales: number;
  GrubHub_Sales: number;
  Phone: number;
  Call_Center_Agent: number;
  Website: number;
  Mobile: number;
  Digital_Sales_Percent: number;
  Total_Portal_Eligible_Transactions: number;
  Put_into_Portal_Percent: number;
  In_Portal_on_Time_Percent: number;
  Drive_Thru_Sales: number;
  Upselling: number;
  Cash_Sales_Vs_Deposite_Difference: number;
  Avrage_ticket: number;
  Customer_count_percent: number;
  Customer_Service: number;
}

/**
 * Flat per-date API entry:
 * current day fields at top-level + PrevWeek object.
 * PrevWeek may be missing or null in edge cases.
 */
export interface DailyDSPRDayWithPrevWeekRaw extends DailyDSPRDayRaw {
  PrevWeek?: DailyDSPRDayRaw;
}

/**
 * Normalized single day's DSPR data used internally by the app (camelCase)
 */
export interface DailyDSPRDay {
  labor: number;
  wastegateway: number;
  overshort: number;
  RefundedorderQty: number;
  TotalCashSales: number;
  TotalSales: number;
  WasteAlta: number;
  ModifiedOrderQty: number;
  TotalTIPS: number;
  Customercount: number;
  DoorDashSales: number;
  UberEatsSales: number;
  GrubHubSales: number;
  Phone: number;
  CallCenterAgent: number;
  Website: number;
  Mobile: number;
  DigitalSalesPercent: number;
  TotalPortalEligibleTransactions: number;
  PutintoPortalPercent: number;
  InPortalonTimePercent: number;
  DriveThruSales: number;
  Upselling: number;
  CashSalesVsDepositeDifference: number;
  Avrageticket: number;
  Customercountpercent: number;
  CustomerService: number;
}

/**
 * Single date entry in parsed DailyDSPRByDate
 * Contains normalized current day and previous week data
 */
export interface DailyDSPRByDateEntry {
  /** Date key (YYYY-MM-DD) */
  date: ApiDate;

  /** Current day normalized data */
  current: DailyDSPRDay;

  /** Previous week normalized data */
  prevWeek: DailyDSPRDay;
}

/**
 * Map of dates to their DSPR data (current + prev week).
 * Some dates can be string messages ("No Final Summary data available.").
 */
export type DailyDSPRByDate = Record<ApiDate, DailyDSPRDayWithPrevWeekRaw | string>;

/**
 * Complete weekly DSPR report wrapper
 * Combines current week aggregate, previous week aggregate, and daily breakdown
 */
export interface WeeklyDSPRReport {
  store: StoreId;
  week: WeekNumber;
  weekStartDate: ISODateTime;
  weekEndDate: ISODateTime;
  currentWeek: any;   // Import from dspr.weeklyCurrent
  previousWeek: any; // Import from dspr.weeklyPrev
  dailyByDate: DailyDSPRByDate;
  dates: ApiDate[];
}

// ============================================================================
// PROCESSED/DERIVED TYPES
// ============================================================================

export interface DayComparison {
  date: ApiDate;
  dayOfWeek: number;
  dayName: string;

  salesChange: number;
  salesChangePercent: number;

  customerChange: number;
  customerChangePercent: number;

  avgTicketChange: number;
  avgTicketChangePercent: number;

  laborChange: number;
  digitalChange: number;
  wasteChange: number;
  customerServiceChange: number;

  trend: ComparisonTrend;
}

export const ComparisonTrend = {
  SIGNIFICANT_IMPROVEMENT: 'significantImprovement',
  IMPROVEMENT: 'improvement',
  STABLE: 'stable',
  DECLINE: 'decline',
  SIGNIFICANT_DECLINE: 'significantDecline',
} as const;

export type ComparisonTrend = (typeof ComparisonTrend)[keyof typeof ComparisonTrend];

export interface ProcessedDailyByDate {
  store: StoreId;
  week: WeekNumber;
  entries: DailyDSPRByDateEntry[];
  comparisons: Record<ApiDate, DayComparison>;
  timeline: TimelineMetrics;
  bestDay: DailyDSPRByDateEntry;
  worstDay: DailyDSPRByDateEntry;
  averages: DailyAverages;
  processedAt: string;
}

export interface TimelineMetrics {
  dates: ApiDate[];
  sales: number[];
  customers: number[];
  avgTicket: number[];
  laborPercent: number[];
  digitalPercent: number[];
  wastePercent: number[];
  customerService: number[];
  prevWeekSales: number[];
  prevWeekCustomers: number[];
}

export interface DailyAverages {
  avgSales: number;
  avgCustomers: number;
  avgTicket: number;
  avgLaborPercent: number;
  avgWastePercent: number;
  avgDigitalPercent: number;
  avgCustomerService: number;
  salesStdDev: number;
  salesVariability: number;
}

export interface DayOfWeekAnalysis {
  dayOfWeek: number;
  dayName: string;
  avgSales: number;
  avgCustomers: number;
  avgTicket: number;
  occurrences: number;
  rank: number;
}

export interface WeekPatternAnalysis {
  dayOfWeekBreakdown: DayOfWeekAnalysis[];
  strongestDay: DayOfWeekAnalysis;
  weakestDay: DayOfWeekAnalysis;
  weekdayAvgSales: number;
  weekendAvgSales: number;
  weekendWeekdayRatio: number;
}

// ============================================================================
// FILTERING & CONFIGURATION
// ============================================================================

export interface DailyByDateFilter {
  startDate?: ApiDate;
  endDate?: ApiDate;
  daysOfWeek?: number[];
  minSales?: number;
  improvementOnly?: boolean;
  declineOnly?: boolean;
  minCustomerService?: number;
}

export const DailyByDateSort = {
  DATE_ASC: 'dateAsc',
  DATE_DESC: 'dateDesc',
  SALES_DESC: 'salesDesc',
  CUSTOMERS_DESC: 'customersDesc',
  AVG_TICKET_DESC: 'avgTicketDesc',
  SALES_CHANGE_DESC: 'salesChangeDesc',
  CUSTOMER_SERVICE_DESC: 'customerServiceDesc',
} as const;

export type DailyByDateSort = (typeof DailyByDateSort)[keyof typeof DailyByDateSort];

export interface ComparisonThresholds {
  significantChangeThreshold: number;
  improvementThreshold: number;
  declineThreshold: number;
}

export const defaultComparisonThresholds: ComparisonThresholds = {
  significantChangeThreshold: 0.10,
  improvementThreshold: 0.02,
  declineThreshold: -0.02,
};

export interface DailyByDateConfig {
  filter: DailyByDateFilter;
  sort: DailyByDateSort;
  comparisonThresholds: ComparisonThresholds;
}

export const defaultDailyByDateConfig: DailyByDateConfig = {
  filter: {},
  sort: DailyByDateSort.DATE_ASC,
  comparisonThresholds: defaultComparisonThresholds,
};

// ============================================================================
// VALIDATION
// ============================================================================

export interface DailyByDateValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

export function isValidDailyDSPRDay(value: unknown): value is DailyDSPRDay {
  if (typeof value !== 'object' || value === null) return false;
  const day = value as DailyDSPRDay;
  return (
    typeof day.TotalSales === 'number' &&
    typeof day.labor === 'number' &&
    typeof day.Customercount === 'number' &&
    typeof day.Avrageticket === 'number'
  );
}

export function isValidDailyDSPRDayRaw(value: unknown): value is DailyDSPRDayRaw {
  if (typeof value !== 'object' || value === null) return false;
  const day = value as DailyDSPRDayRaw;
  return (
    typeof day.Total_Sales === 'number' &&
    typeof day.labor === 'number' &&
    typeof day.Customer_count === 'number' &&
    typeof day.Avrage_ticket === 'number'
  );
}

export function isValidComparisonTrend(value: unknown): value is ComparisonTrend {
  return typeof value === 'string' && Object.values(ComparisonTrend).includes(value as ComparisonTrend);
}

export function isValidDayOfWeek(value: unknown): value is number {
  return typeof value === 'number' && value >= 0 && value <= 6 && Number.isInteger(value);
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

export function validateDailyByDate(data: DailyDSPRByDate): DailyByDateValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (typeof data !== 'object' || data === null) {
    errors.push('Invalid DailyDSPRByDate structure');
    return { isValid: false, errors, warnings };
  }

  const dates = Object.keys(data);
  if (dates.length === 0) warnings.push('No dates in DailyDSPRByDate');

  dates.forEach((date) => {
    const entry = (data as Record<string, unknown>)[date];

    // Skip string messages like "No Final Summary data available."
    if (typeof entry === 'string') {
      warnings.push(`Non-object entry for date ${date}: ${entry}`);
      return;
    }

    if (typeof entry !== 'object' || entry === null) {
      errors.push(`Invalid entry for date ${date}`);
      return;
    }

    const currentRaw = entry as DailyDSPRDayWithPrevWeekRaw;
    if (!isValidDailyDSPRDayRaw(currentRaw)) {
      errors.push(`Invalid current day data for ${date}`);
    }

    if (currentRaw.PrevWeek && !isValidDailyDSPRDayRaw(currentRaw.PrevWeek)) {
      warnings.push(`Missing or invalid prev week data for ${date}`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

export function validateDailyByDateFilter(filter: DailyByDateFilter): DailyByDateValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (filter.startDate && filter.endDate) {
    if (new Date(filter.startDate) > new Date(filter.endDate)) {
      errors.push('startDate must be before or equal to endDate');
    }
  }

  if (filter.daysOfWeek) {
    filter.daysOfWeek.forEach((day) => {
      if (!isValidDayOfWeek(day)) {
        errors.push(`Invalid day of week: ${day} (must be 0-6)`);
      }
    });
  }

  if (filter.minSales !== undefined && filter.minSales < 0) {
    errors.push('minSales must be non-negative');
  }

  if (filter.minCustomerService !== undefined) {
    if (filter.minCustomerService < 0 || filter.minCustomerService > 1) {
      errors.push('minCustomerService must be between 0 and 1');
    }
  }

  if (filter.improvementOnly && filter.declineOnly) {
    warnings.push('Both improvementOnly and declineOnly are enabled');
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
 * Normalizes raw daily data (snake_case) to internal camelCase structure
 */
export function normalizeDailyDay(raw: DailyDSPRDayRaw): DailyDSPRDay {
  return {
    labor: raw.labor,
    wastegateway: raw.waste_gateway,
    overshort: raw.over_short,
    RefundedorderQty: raw.Refunded_order_Qty,
    TotalCashSales: raw.Total_Cash_Sales,
    TotalSales: raw.Total_Sales,
    WasteAlta: raw.Waste_Alta,
    ModifiedOrderQty: raw.Modified_Order_Qty,
    TotalTIPS: raw.Total_TIPS,
    Customercount: raw.Customer_count,
    DoorDashSales: raw.DoorDash_Sales,
    UberEatsSales: raw.UberEats_Sales,
    GrubHubSales: raw.GrubHub_Sales,
    Phone: raw.Phone,
    CallCenterAgent: raw.Call_Center_Agent,
    Website: raw.Website,
    Mobile: raw.Mobile,
    DigitalSalesPercent: raw.Digital_Sales_Percent,
    TotalPortalEligibleTransactions: raw.Total_Portal_Eligible_Transactions,
    PutintoPortalPercent: raw.Put_into_Portal_Percent,
    InPortalonTimePercent: raw.In_Portal_on_Time_Percent,
    DriveThruSales: raw.Drive_Thru_Sales,
    Upselling: raw.Upselling,
    CashSalesVsDepositeDifference: raw.Cash_Sales_Vs_Deposite_Difference,
    Avrageticket: raw.Avrage_ticket,
    Customercountpercent: raw.Customer_count_percent,
    CustomerService: raw.Customer_Service,
  };
}

/**
 * Parses DailyDSPRByDate into array of normalized entries.
 * - Filters out string-only days.
 * - Treats per-date object as flat current-day raw + PrevWeek raw.
 */
export function parseDailyByDate(data: DailyDSPRByDate): DailyDSPRByDateEntry[] {
  return Object.entries(data)
    .filter(([, value]) => typeof value === 'object' && value !== null)
    .map(([date, value]) => {
      const entry = value as DailyDSPRDayWithPrevWeekRaw;
      const { PrevWeek, ...rawCurrent } = entry;

      const currentRaw = rawCurrent as DailyDSPRDayRaw;
      const prevRaw = (PrevWeek ?? rawCurrent) as DailyDSPRDayRaw;

      return {
        date: date as ApiDate,
        current: normalizeDailyDay(currentRaw),
        prevWeek: normalizeDailyDay(prevRaw),
      };
    });
}

export function getDayOfWeek(date: ApiDate): number {
  return new Date(date).getDay();
}

export function getDayName(dayOfWeek: number): string {
  const names = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return names[dayOfWeek] || 'Unknown';
}

export function isWeekend(dayOfWeek: number): boolean {
  return dayOfWeek === 0 || dayOfWeek === 6;
}

export function calculateDayWaste(day: DailyDSPRDay): number {
  return day.wastegateway + day.WasteAlta;
}

export function calculateDayWastePercent(day: DailyDSPRDay): number {
  if (day.TotalSales === 0) return 0;
  return calculateDayWaste(day) / day.TotalSales;
}

export function calculateDayDigitalSales(day: DailyDSPRDay): number {
  return day.Website + day.Mobile;
}

export function calculateDayDeliverySales(day: DailyDSPRDay): number {
  return day.DoorDashSales + day.UberEatsSales + day.GrubHubSales;
}

export function createDayComparison(
  entry: DailyDSPRByDateEntry,
  thresholds: ComparisonThresholds = defaultComparisonThresholds
): DayComparison {
  const { date, current, prevWeek } = entry;
  const dayOfWeek = getDayOfWeek(date);
  const dayName = getDayName(dayOfWeek);

  const salesChange = current.TotalSales - prevWeek.TotalSales;
  const salesChangePercent = prevWeek.TotalSales !== 0 ? salesChange / prevWeek.TotalSales : 0;

  const customerChange = current.Customercount - prevWeek.Customercount;
  const customerChangePercent = prevWeek.Customercount !== 0 ? customerChange / prevWeek.Customercount : 0;

  const avgTicketChange = current.Avrageticket - prevWeek.Avrageticket;
  const avgTicketChangePercent = prevWeek.Avrageticket !== 0 ? avgTicketChange / prevWeek.Avrageticket : 0;

  const laborChange = current.labor - prevWeek.labor;
  const digitalChange = current.DigitalSalesPercent - prevWeek.DigitalSalesPercent;
  const wasteChange = calculateDayWastePercent(current) - calculateDayWastePercent(prevWeek);
  const customerServiceChange = current.CustomerService - prevWeek.CustomerService;

  let trend: ComparisonTrend;
  if (salesChangePercent >= thresholds.significantChangeThreshold) {
    trend = ComparisonTrend.SIGNIFICANT_IMPROVEMENT;
  } else if (salesChangePercent >= thresholds.improvementThreshold) {
    trend = ComparisonTrend.IMPROVEMENT;
  } else if (salesChangePercent <= -thresholds.significantChangeThreshold) {
    trend = ComparisonTrend.SIGNIFICANT_DECLINE;
  } else if (salesChangePercent <= thresholds.declineThreshold) {
    trend = ComparisonTrend.DECLINE;
  } else {
    trend = ComparisonTrend.STABLE;
  }

  return {
    date,
    dayOfWeek,
    dayName,
    salesChange,
    salesChangePercent,
    customerChange,
    customerChangePercent,
    avgTicketChange,
    avgTicketChangePercent,
    laborChange,
    digitalChange,
    wasteChange,
    customerServiceChange,
    trend,
  };
}

export function createTimelineMetrics(entries: DailyDSPRByDateEntry[]): TimelineMetrics {
  const sorted = [...entries].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return {
    dates: sorted.map((e) => e.date),
    sales: sorted.map((e) => e.current.TotalSales),
    customers: sorted.map((e) => e.current.Customercount),
    avgTicket: sorted.map((e) => e.current.Avrageticket),
    laborPercent: sorted.map((e) => e.current.labor),
    digitalPercent: sorted.map((e) => e.current.DigitalSalesPercent),
    wastePercent: sorted.map((e) => calculateDayWastePercent(e.current)),
    customerService: sorted.map((e) => e.current.CustomerService),
    prevWeekSales: sorted.map((e) => e.prevWeek.TotalSales),
    prevWeekCustomers: sorted.map((e) => e.prevWeek.Customercount),
  };
}

export function calculateDailyAverages(entries: DailyDSPRByDateEntry[]): DailyAverages {
  if (entries.length === 0) {
    return {
      avgSales: 0,
      avgCustomers: 0,
      avgTicket: 0,
      avgLaborPercent: 0,
      avgWastePercent: 0,
      avgDigitalPercent: 0,
      avgCustomerService: 0,
      salesStdDev: 0,
      salesVariability: 0,
    };
  }

  const sales = entries.map((e) => e.current.TotalSales);
  const avgSales = sales.reduce((sum, val) => sum + val, 0) / entries.length;

  const avgCustomers =
    entries.reduce((sum, e) => sum + e.current.Customercount, 0) / entries.length;
  const avgTicket =
    entries.reduce((sum, e) => sum + e.current.Avrageticket, 0) / entries.length;
  const avgLaborPercent =
    entries.reduce((sum, e) => sum + e.current.labor, 0) / entries.length;
  const avgWastePercent =
    entries.reduce((sum, e) => sum + calculateDayWastePercent(e.current), 0) /
    entries.length;
  const avgDigitalPercent =
    entries.reduce((sum, e) => sum + e.current.DigitalSalesPercent, 0) /
    entries.length;
  const avgCustomerService =
    entries.reduce((sum, e) => sum + e.current.CustomerService, 0) /
    entries.length;

  const variance =
    sales.reduce((sum, val) => sum + Math.pow(val - avgSales, 2), 0) /
    entries.length;
  const salesStdDev = Math.sqrt(variance);

  const salesVariability = avgSales !== 0 ? salesStdDev / avgSales : 0;

  return {
    avgSales,
    avgCustomers,
    avgTicket,
    avgLaborPercent,
    avgWastePercent,
    avgDigitalPercent,
    avgCustomerService,
    salesStdDev,
    salesVariability,
  };
}

export function findBestDay(entries: DailyDSPRByDateEntry[]): DailyDSPRByDateEntry | null {
  if (entries.length === 0) return null;
  return entries.reduce((best, current) =>
    current.current.TotalSales > best.current.TotalSales ? current : best
  );
}

export function findWorstDay(entries: DailyDSPRByDateEntry[]): DailyDSPRByDateEntry | null {
  if (entries.length === 0) return null;
  return entries.reduce((worst, current) =>
    current.current.TotalSales < worst.current.TotalSales ? current : worst
  );
}

export function filterDailyByDate(
  entries: DailyDSPRByDateEntry[],
  filter: DailyByDateFilter
): DailyDSPRByDateEntry[] {
  return entries.filter((entry) => {
    if (filter.startDate && entry.date < filter.startDate) return false;
    if (filter.endDate && entry.date > filter.endDate) return false;

    if (filter.daysOfWeek && filter.daysOfWeek.length > 0) {
      const dayOfWeek = getDayOfWeek(entry.date);
      if (!filter.daysOfWeek.includes(dayOfWeek)) return false;
    }

    if (filter.minSales !== undefined && entry.current.TotalSales < filter.minSales) {
      return false;
    }

    if (
      filter.minCustomerService !== undefined &&
      entry.current.CustomerService < filter.minCustomerService
    ) {
      return false;
    }

    if (filter.improvementOnly) {
      if (entry.current.TotalSales <= entry.prevWeek.TotalSales) return false;
    }

    if (filter.declineOnly) {
      if (entry.current.TotalSales >= entry.prevWeek.TotalSales) return false;
    }

    return true;
  });
}

export function sortDailyByDate(
  entries: DailyDSPRByDateEntry[],
  sort: DailyByDateSort
): DailyDSPRByDateEntry[] {
  const sorted = [...entries];

  switch (sort) {
    case DailyByDateSort.DATE_ASC:
      return sorted.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );

    case DailyByDateSort.DATE_DESC:
      return sorted.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );

    case DailyByDateSort.SALES_DESC:
      return sorted.sort((a, b) => b.current.TotalSales - a.current.TotalSales);

    case DailyByDateSort.CUSTOMERS_DESC:
      return sorted.sort((a, b) => b.current.Customercount - a.current.Customercount);

    case DailyByDateSort.AVG_TICKET_DESC:
      return sorted.sort((a, b) => b.current.Avrageticket - a.current.Avrageticket);

    case DailyByDateSort.SALES_CHANGE_DESC:
      return sorted.sort((a, b) => {
        const changeA = a.current.TotalSales - a.prevWeek.TotalSales;
        const changeB = b.current.TotalSales - b.prevWeek.TotalSales;
        return changeB - changeA;
      });

    case DailyByDateSort.CUSTOMER_SERVICE_DESC:
      return sorted.sort(
        (a, b) => b.current.CustomerService - a.current.CustomerService
      );

    default:
      return sorted;
  }
}

export function toApiDate(value: unknown): ApiDate | undefined {
  if (!value) return undefined;

  // If already YYYY-MM-DD
  if (typeof value === 'string') {
    // Trim ISO to date part if needed
    const m = value.match(/^(\d{4}-\d{2}-\d{2})/);
    return (m ? m[1] : value) as ApiDate;
  }

  // If it's a Date object
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10) as ApiDate;
  }

  return undefined;
}


export function createWeekPatternAnalysis(entries: DailyDSPRByDateEntry[]): WeekPatternAnalysis {
  const dayGroups: Map<number, DailyDSPRByDateEntry[]> = new Map();

  entries.forEach((entry) => {
    const dow = getDayOfWeek(entry.date);
    if (!dayGroups.has(dow)) dayGroups.set(dow, []);
    dayGroups.get(dow)!.push(entry);
  });

  const dayOfWeekBreakdown: DayOfWeekAnalysis[] = [];

  dayGroups.forEach((groupEntries, dow) => {
    const avgSales =
      groupEntries.reduce((sum, e) => sum + e.current.TotalSales, 0) /
      groupEntries.length;
    const avgCustomers =
      groupEntries.reduce((sum, e) => sum + e.current.Customercount, 0) /
      groupEntries.length;
    const avgTicket =
      groupEntries.reduce((sum, e) => sum + e.current.Avrageticket, 0) /
      groupEntries.length;

    dayOfWeekBreakdown.push({
      dayOfWeek: dow,
      dayName: getDayName(dow),
      avgSales,
      avgCustomers,
      avgTicket,
      occurrences: groupEntries.length,
      rank: 0,
    });
  });

  dayOfWeekBreakdown.sort((a, b) => b.avgSales - a.avgSales);
  dayOfWeekBreakdown.forEach((day, index) => {
    day.rank = index + 1;
  });

  const strongestDay = dayOfWeekBreakdown[0];
  const weakestDay = dayOfWeekBreakdown[dayOfWeekBreakdown.length - 1];

  const weekdayEntries = entries.filter((e) => !isWeekend(getDayOfWeek(e.date)));
  const weekendEntries = entries.filter((e) => isWeekend(getDayOfWeek(e.date)));

  const weekdayAvgSales =
    weekdayEntries.length > 0
      ? weekdayEntries.reduce((sum, e) => sum + e.current.TotalSales, 0) /
        weekdayEntries.length
      : 0;

  const weekendAvgSales =
    weekendEntries.length > 0
      ? weekendEntries.reduce((sum, e) => sum + e.current.TotalSales, 0) /
        weekendEntries.length
      : 0;

  const weekendWeekdayRatio = weekdayAvgSales !== 0 ? weekendAvgSales / weekdayAvgSales : 0;

  return {
    dayOfWeekBreakdown,
    strongestDay,
    weakestDay,
    weekdayAvgSales,
    weekendAvgSales,
    weekendWeekdayRatio,
  };
}

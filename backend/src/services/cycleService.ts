import { PeriodRecord } from '@prisma/client';

export interface CycleStatsResult {
  hasSufficientData: boolean;
  totalRecordedPeriods: number;
  averageCycleLength: number | null; // days between start dates
  averagePeriodDuration: number | null; // bleeding duration in days
  lastPeriodStartDate: string | null;
  estimatedNextPeriodStart: string | null;
  estimatedNextPeriodEnd: string | null;
  currentCycleDay: number | null;
  isIrregular: boolean;
  cycleLengths: number[];
  explanation: string;
}

/**
 * Calculates day difference between two "YYYY-MM-DD" dates: dateB - dateA
 */
export function dateDiffInDays(dateStrA: string, dateStrB: string): number {
  const [y1, m1, d1] = dateStrA.split('-').map(Number);
  const [y2, m2, d2] = dateStrB.split('-').map(Number);
  const utc1 = Date.UTC(y1, m1 - 1, d1);
  const utc2 = Date.UTC(y2, m2 - 1, d2);
  return Math.round((utc2 - utc1) / (1000 * 60 * 60 * 24));
}

/**
 * Adds N days to a "YYYY-MM-DD" string and returns "YYYY-MM-DD"
 */
export function addDaysToDateString(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().split('T')[0];
}

/**
 * Formats today's date in YYYY-MM-DD UTC
 */
export function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

export function calculateCycleStatistics(records: PeriodRecord[]): CycleStatsResult {
  if (!records || records.length === 0) {
    return {
      hasSufficientData: false,
      totalRecordedPeriods: 0,
      averageCycleLength: null,
      averagePeriodDuration: null,
      lastPeriodStartDate: null,
      estimatedNextPeriodStart: null,
      estimatedNextPeriodEnd: null,
      currentCycleDay: null,
      isIrregular: false,
      cycleLengths: [],
      explanation: 'No period logs found yet. When you record your first period, we will help you keep track of your dates!'
    };
  }

  // Sort chronologically ascending by startDate
  const sorted = [...records].sort((a, b) => a.startDate.localeCompare(b.startDate));
  const totalRecorded = sorted.length;
  const latestRecord = sorted[sorted.length - 1];
  const lastPeriodStartDate = latestRecord.startDate;

  // Calculate duration of each period (endDate - startDate + 1)
  const durations: number[] = [];
  for (const rec of sorted) {
    if (rec.endDate) {
      const days = dateDiffInDays(rec.startDate, rec.endDate) + 1;
      if (days >= 1 && days <= 20) {
        durations.push(days);
      }
    }
  }

  const averagePeriodDuration =
    durations.length > 0
      ? Math.round(durations.reduce((sum, d) => sum + d, 0) / durations.length)
      : 5; // gentle default if only start dates were recorded

  // Calculate cycle lengths (days between consecutive period start dates)
  const cycleLengths: number[] = [];
  for (let i = 0; i < sorted.length - 1; i++) {
    const startA = sorted[i].startDate;
    const startB = sorted[i + 1].startDate;
    const diff = dateDiffInDays(startA, startB);
    // Biological cycle length check: ignore accidental duplicate logs or gaps > 120 days
    if (diff >= 15 && diff <= 120) {
      cycleLengths.push(diff);
    }
  }

  // Current cycle day relative to today
  const todayStr = getTodayDateString();
  const daysSinceLastStart = dateDiffInDays(lastPeriodStartDate, todayStr);
  const currentCycleDay = daysSinceLastStart >= 0 ? daysSinceLastStart + 1 : 1;

  if (cycleLengths.length === 0) {
    // Only 1 period recorded, or consecutive logs were outside valid cycle windows
    return {
      hasSufficientData: false,
      totalRecordedPeriods: totalRecorded,
      averageCycleLength: null,
      averagePeriodDuration: durations.length > 0 ? averagePeriodDuration : null,
      lastPeriodStartDate,
      estimatedNextPeriodStart: null,
      estimatedNextPeriodEnd: null,
      currentCycleDay,
      isIrregular: false,
      cycleLengths: [],
      explanation: 'You have recorded 1 period so far! To calculate your personal cycle length, Nurtura needs at least two recorded periods. Every body is unique!'
    };
  }

  // Average cycle length
  const sumCycles = cycleLengths.reduce((a, b) => a + b, 0);
  const averageCycleLength = Math.round(sumCycles / cycleLengths.length);

  // Check variability (irregularity)
  const minCycle = Math.min(...cycleLengths);
  const maxCycle = Math.max(...cycleLengths);
  const isIrregular = (maxCycle - minCycle) > 7; // variation greater than 7 days is very normal in teenage years

  // Estimate next period window based on personalized average cycle length
  const estimatedNextPeriodStart = addDaysToDateString(lastPeriodStartDate, averageCycleLength);
  const estimatedNextPeriodEnd = addDaysToDateString(
    estimatedNextPeriodStart,
    Math.max(1, averagePeriodDuration - 1)
  );

  let explanation = `Based on your ${cycleLengths.length} previous cycle interval${cycleLengths.length > 1 ? 's' : ''}, your average cycle is about ${averageCycleLength} days.`;

  if (isIrregular) {
    explanation += ' Your cycle lengths vary from ' + minCycle + ' to ' + maxCycle + ' days. In teenage years, your hormones are still balancing, so variation is completely normal and healthy!';
  } else {
    explanation += ' Predictions are gentle estimates based on your past dates, not medical guarantees.';
  }

  return {
    hasSufficientData: true,
    totalRecordedPeriods: totalRecorded,
    averageCycleLength,
    averagePeriodDuration,
    lastPeriodStartDate,
    estimatedNextPeriodStart,
    estimatedNextPeriodEnd,
    currentCycleDay,
    isIrregular,
    cycleLengths,
    explanation
  };
}

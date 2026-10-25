import { PeriodRecordDTO, CycleStats } from '../../../../shared/types/index.js';

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

export const GENTLE_CYCLE_DISCLAIMER =
  'This is an estimate based on your recorded cycle history. Periods can naturally vary, especially during the teen years.';

/**
 * Dynamic cycle prediction algorithm based on recorded period start dates.
 * - Sorts genuine user records chronologically
 * - Calculates cycle length between start dates
 * - Calculates average bleeding duration
 * - Projects next estimated period start date: lastPeriodStartDate + averageCycleLength
 */
export function calculateCycleStats(records: PeriodRecordDTO[]): CycleStats {
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
      explanation: 'No period logs recorded yet. When you record periods, your cycle predictions will appear here.'
    };
  }

  // Sort ascending by startDate
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
      : 5;

  // Calculate cycle intervals (days between consecutive start dates)
  const cycleLengths: number[] = [];
  for (let i = 0; i < sorted.length - 1; i++) {
    const startA = sorted[i].startDate;
    const startB = sorted[i + 1].startDate;
    const diff = dateDiffInDays(startA, startB);
    if (diff >= 15 && diff <= 120) {
      cycleLengths.push(diff);
    }
  }

  // Current cycle day relative to today
  const todayStr = new Date().toISOString().split('T')[0];
  const daysSinceLastStart = dateDiffInDays(lastPeriodStartDate, todayStr);
  const currentCycleDay = daysSinceLastStart >= 0 ? daysSinceLastStart + 1 : 1;

  if (cycleLengths.length === 0) {
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
      explanation:
        'You have recorded 1 period so far. Nurtura needs at least two recorded periods to calculate your personal cycle rhythm. Every body is unique!'
    };
  }

  // Average cycle length
  const sumCycles = cycleLengths.reduce((a, b) => a + b, 0);
  const averageCycleLength = Math.round(sumCycles / cycleLengths.length);

  const minCycle = Math.min(...cycleLengths);
  const maxCycle = Math.max(...cycleLengths);
  const isIrregular = maxCycle - minCycle > 7;

  // Calculate next predicted start date dynamically based on genuine user history
  const estimatedNextPeriodStart = addDaysToDateString(lastPeriodStartDate, averageCycleLength);
  const estimatedNextPeriodEnd = addDaysToDateString(
    estimatedNextPeriodStart,
    Math.max(1, averagePeriodDuration - 1)
  );

  let explanation = `Based on your ${cycleLengths.length} cycle interval${cycleLengths.length > 1 ? 's' : ''}, your average cycle is about ${averageCycleLength} days.`;

  if (isIrregular) {
    explanation += ` Cycle lengths naturally vary from ${minCycle} to ${maxCycle} days in teen years as hormones balance.`;
  } else {
    explanation += ' Your cycle intervals are steady and consistent.';
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
    explanation
  };
}

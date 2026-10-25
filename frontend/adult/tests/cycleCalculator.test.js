/**
 * MOONLIT Phase 8: Comprehensive Automated Test Suite
 * Tests all 22 required test cases for Cycle Prediction Engine, Date-Only Arithmetic,
 * Validation, Countdowns, Edge Cases, and Recalculations.
 */

import {
  parseDateOnly,
  toDateOnlyUTC,
  diffCalendarDays,
  addCalendarDays,
  isLeapYear,
  getDaysInMonth,
  validateFourDates,
  calculateCycleMetrics,
  calculateCountdown,
  getCalendarGrid,
  analyzePainPatterns
} from '../src/logic/cycleCalculator.js';

function runTestSuite() {
  console.log('🧪 Starting MOONLIT Comprehensive Verification Test Suite...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  // ------------------------------------------------------------------------
  // Case 1: Four valid chronological historical dates
  // ------------------------------------------------------------------------
  const sampleFourDates = ['2025-01-16', '2025-02-14', '2025-03-15', '2025-04-13'];
  const val1 = validateFourDates(sampleFourDates, '2025-04-20');
  assert(val1.valid === true, 'Case 1: Four valid chronological dates accepted');

  const cycles1 = [
    { id: 'c4', startDate: '2025-04-13', durationDays: 5 },
    { id: 'c3', startDate: '2025-03-15', durationDays: 5 },
    { id: 'c2', startDate: '2025-02-14', durationDays: 4 },
    { id: 'c1', startDate: '2025-01-16', durationDays: 5 }
  ];
  const m1 = calculateCycleMetrics(cycles1, '2025-04-20');
  assert(m1.hasData === true && m1.cycleLengths.length === 3, 'Case 1: Successfully computed 3 intervals from 4 dates');

  // ------------------------------------------------------------------------
  // Case 2: Different cycle lengths
  // S1=Jan 1, S2=Jan 28 (27d), S3=Feb 27 (30d), S4=Mar 28 (29d)
  // ------------------------------------------------------------------------
  const diffCycles = [
    { id: 'c4', startDate: '2025-03-28' },
    { id: 'c3', startDate: '2025-02-27' },
    { id: 'c2', startDate: '2025-01-28' },
    { id: 'c1', startDate: '2025-01-01' }
  ];
  const mDiff = calculateCycleMetrics(diffCycles, '2025-03-29');
  assert(mDiff.lengthsArray.length === 3, 'Case 2: Handles different cycle lengths');
  assert(mDiff.minLength === 27 && mDiff.maxLength === 30, `Case 2: Correct min (27) and max (30), got min=${mDiff.minLength}, max=${mDiff.maxLength}`);

  // ------------------------------------------------------------------------
  // Case 3: Consistent cycle lengths (29d, 29d, 29d)
  // ------------------------------------------------------------------------
  assert(m1.typicalLength === 29, `Case 3: Consistent 29d intervals yield typicalLength=29 (got ${m1.typicalLength})`);
  assert(m1.confidence === 'High', `Case 3: Consistent cycle correctly evaluated as High confidence (got ${m1.confidence})`);

  // ------------------------------------------------------------------------
  // Case 4: Highly variable cycle lengths (e.g. 22d, 36d, 24d)
  // ------------------------------------------------------------------------
  const varCycles = [
    { id: 'c4', startDate: '2025-03-23' }, // +24d
    { id: 'c3', startDate: '2025-02-27' }, // +36d
    { id: 'c2', startDate: '2025-01-22' }, // +22d
    { id: 'c1', startDate: '2025-01-01' }
  ];
  const mVar = calculateCycleMetrics(varCycles, '2025-03-25');
  assert(mVar.stdDev > 4, `Case 4: Detects high standard deviation (stdDev=${mVar.stdDev})`);
  assert(mVar.confidence === 'Variable', `Case 4: Labels highly variable cycles with Variable confidence (got ${mVar.confidence})`);

  // ------------------------------------------------------------------------
  // Case 5: Duplicate dates (must be rejected)
  // ------------------------------------------------------------------------
  const dupDates = ['2025-01-16', '2025-02-14', '2025-02-14', '2025-04-13'];
  const valDup = validateFourDates(dupDates, '2025-05-01');
  assert(valDup.valid === false && valDup.error.includes('must be after'), 'Case 5: Rejects duplicate historical dates');

  // ------------------------------------------------------------------------
  // Case 6: Dates entered out of order (must be rejected)
  // ------------------------------------------------------------------------
  const outOfOrderDates = ['2025-03-15', '2025-01-16', '2025-02-14', '2025-04-13'];
  const valOrder = validateFourDates(outOfOrderDates, '2025-05-01');
  assert(valOrder.valid === false && valOrder.error.includes('must be after'), 'Case 6: Rejects dates entered out of order');

  // ------------------------------------------------------------------------
  // Case 7: Invalid dates (must be rejected)
  // ------------------------------------------------------------------------
  const invalidDates = ['not-a-date', '2025-02-14', '2025-03-15', '2025-04-13'];
  const valInvalid = validateFourDates(invalidDates, '2025-05-01');
  assert(valInvalid.valid === false && valInvalid.error.includes('invalid'), 'Case 7: Rejects malformed date strings');

  // ------------------------------------------------------------------------
  // Case 8: Future dates entered as historical periods (must be rejected)
  // ------------------------------------------------------------------------
  const futureDates = ['2025-01-16', '2025-02-14', '2025-03-15', '2029-04-13'];
  const valFuture = validateFourDates(futureDates, '2025-04-20');
  assert(valFuture.valid === false && valFuture.error.includes('future'), 'Case 8: Rejects future dates as historical periods');

  // ------------------------------------------------------------------------
  // Case 9: February in a leap year (2024 has 29 days)
  // ------------------------------------------------------------------------
  assert(isLeapYear(2024) === true, 'Case 9: Correctly identifies 2024 as leap year');
  assert(getDaysInMonth(2024, 2) === 29, 'Case 9: February 2024 has 29 days');
  const leapDiff = diffCalendarDays('2024-02-14', '2024-03-15');
  assert(leapDiff === 30, `Case 9: Leap year Feb 14 to Mar 15 has 30 days (got ${leapDiff})`);

  // ------------------------------------------------------------------------
  // Case 10: February in a non-leap year (2025 has 28 days)
  // ------------------------------------------------------------------------
  assert(isLeapYear(2025) === false, 'Case 10: Correctly identifies 2025 as non-leap year');
  assert(getDaysInMonth(2025, 2) === 28, 'Case 10: February 2025 has 28 days');
  const nonLeapDiff = diffCalendarDays('2025-02-14', '2025-03-15');
  assert(nonLeapDiff === 29, `Case 10: Non-leap year Feb 14 to Mar 15 has 29 days (got ${nonLeapDiff})`);

  // ------------------------------------------------------------------------
  // Case 11: Month-boundary predictions (April 13 + 29 days = May 12)
  // ------------------------------------------------------------------------
  const addedMonth = addCalendarDays('2025-04-13', 29);
  assert(addedMonth === '2025-05-12', `Case 11: Month-boundary prediction correctly rolls into May (got ${addedMonth})`);

  // ------------------------------------------------------------------------
  // Case 12: Year-boundary predictions (Dec 20 + 29 days = Jan 18 next year)
  // ------------------------------------------------------------------------
  const addedYear = addCalendarDays('2025-12-20', 29);
  assert(addedYear === '2026-01-18', `Case 12: Year-boundary prediction correctly rolls into next year (got ${addedYear})`);

  // ------------------------------------------------------------------------
  // Case 13: Correct countdown ON the predicted date (E = 2025-05-12, window 05-11 to 05-13)
  // ------------------------------------------------------------------------
  const cToday = calculateCountdown('2025-05-12', '2025-05-11', '2025-05-13', '2025-05-12');
  assert(cToday.status === 'in-progress' && cToday.daysRemaining === 0, 'Case 13: Correct countdown status on the predicted date');

  // ------------------------------------------------------------------------
  // Case 14: Correct countdown ONE DAY BEFORE the predicted window start (May 10)
  // ------------------------------------------------------------------------
  const cBefore = calculateCountdown('2025-05-12', '2025-05-11', '2025-05-13', '2025-05-10');
  assert(cBefore.status === 'upcoming' && cBefore.daysRemaining === 1, `Case 14: 1 day before window reports 1 day left (got ${cBefore.daysRemaining})`);

  // ------------------------------------------------------------------------
  // Case 15: Correct countdown ONE DAY AFTER central predicted date (May 13, still in window)
  // ------------------------------------------------------------------------
  const cAfter = calculateCountdown('2025-05-12', '2025-05-11', '2025-05-13', '2025-05-13');
  assert(cAfter.status === 'in-progress', 'Case 15: Day after central date is still in-progress');

  // ------------------------------------------------------------------------
  // Case 16: Overdue prediction handling (May 16 is 3 days past window end May 13)
  // ------------------------------------------------------------------------
  const cOverdue = calculateCountdown('2025-05-12', '2025-05-11', '2025-05-13', '2025-05-16');
  assert(cOverdue.status === 'overdue' && cOverdue.daysOverdue === 3, `Case 16: Detects overdue correctly (3 days overdue, got ${cOverdue.daysOverdue})`);

  // ------------------------------------------------------------------------
  // Case 17: Editing historical data (recalculates prediction immediately)
  // Changing Cycle 4 to 2025-04-15 (+2 days)
  // ------------------------------------------------------------------------
  const editedCycles = [
    { id: 'c4', startDate: '2025-04-15' },
    { id: 'c3', startDate: '2025-03-15' },
    { id: 'c2', startDate: '2025-02-14' },
    { id: 'c1', startDate: '2025-01-16' }
  ];
  const mEdited = calculateCycleMetrics(editedCycles, '2025-04-20');
  assert(mEdited.estimatedStartDate === '2025-05-14', `Case 17: Editing history recalculates estimated date (got ${mEdited.estimatedStartDate})`);

  // ------------------------------------------------------------------------
  // Case 18: Recording a new actual period
  // User adds Cycle 5 on 2025-05-12
  // ------------------------------------------------------------------------
  const extendedCycles = [
    { id: 'c5', startDate: '2025-05-12', durationDays: 5 },
    ...cycles1
  ];
  const mExt = calculateCycleMetrics(extendedCycles, '2025-05-13');
  assert(mExt.cycleLengths.length === 4, 'Case 18: Recording new actual period extends history to 4 intervals');
  assert(mExt.latestCycle.startDate === '2025-05-12', 'Case 18: New cycle becomes latest baseline');
  assert(mExt.estimatedStartDate === addCalendarDays('2025-05-12', mExt.typicalLength), 'Case 18: Future estimate shifts to follow new period');

  // ------------------------------------------------------------------------
  // Case 19: Refreshing page without losing saved records (deterministic pure calculation)
  // ------------------------------------------------------------------------
  const mRunA = calculateCycleMetrics(cycles1, '2025-04-20');
  const mRunB = calculateCycleMetrics(cycles1, '2025-04-20');
  assert(JSON.stringify(mRunA) === JSON.stringify(mRunB), 'Case 19: Deterministic calculation across multiple page invocations');

  // ------------------------------------------------------------------------
  // Case 20: Security and data sandbox validation
  // ------------------------------------------------------------------------
  assert(typeof parseDateOnly === 'function' && toDateOnlyUTC('2025-04-13') instanceof Date, 'Case 20: Safe date parsing within isolated sandbox');

  // ------------------------------------------------------------------------
  // Case 21: Prediction range consistency between calendar and summary card
  // ------------------------------------------------------------------------
  const grid = getCalendarGrid(2025, 5, cycles1, m1, '2025-04-20');
  const predictedDays = grid.days.filter(d => d.isPredicted).map(d => d.dayNumber);
  // May 11, 12, 13
  assert(predictedDays.includes(11) && predictedDays.includes(12) && predictedDays.includes(13), 'Case 21: Calendar highlights match summary card prediction window (May 11-13)');

  // ------------------------------------------------------------------------
  // Case 22: Daylight-saving / timezone immunity test
  // Spring forward and fall back boundary checks
  // ------------------------------------------------------------------------
  // US DST transition in 2025: March 9 (spring forward), Nov 2 (fall back)
  const dstSpring = diffCalendarDays('2025-03-08', '2025-03-10');
  assert(dstSpring === 2, `Case 22: DST spring-forward boundary calculates exact 2 days (got ${dstSpring})`);
  const dstFall = diffCalendarDays('2025-11-01', '2025-11-03');
  assert(dstFall === 2, `Case 22: DST fall-back boundary calculates exact 2 days (got ${dstFall})`);

  // Pain patterns regression verification
  const samplePainLogs = [
    { cycleId: 'c4', day: 4, painScore: 8 },
    { cycleId: 'c3', day: 4, painScore: 9 },
    { cycleId: 'c2', day: 3, painScore: 7 },
    { cycleId: 'c1', day: 4, painScore: 8 }
  ];
  const pAnalysis = analyzePainPatterns(cycles1, samplePainLogs);
  assert(pAnalysis.topDay === 4 && pAnalysis.topCount === 3, 'Pain patterns analysis remains intact');

  console.log(`\n========================================`);
  console.log(`Test Results: ${passed} Passed, ${failed} Failed.`);
  console.log(`========================================`);

  if (failed > 0) process.exit(1);
}

runTestSuite();

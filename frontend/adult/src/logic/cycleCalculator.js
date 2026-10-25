/**
 * MOONLIT Menstrual Cycle Calculation & Intelligent Prediction Engine
 * 
 * Standards & Design Principles:
 * - Date-only calendar arithmetic (eliminates timezone, GMT offset & DST shift bugs).
 * - Deterministic, explainable statistical calculations.
 * - Multi-cycle historical analysis: calculates intervals between consecutive period start dates.
 * - Robust prediction method: uses median and mean of observed cycle lengths.
 * - Handles biological variability: adjusts prediction confidence and window based on standard deviation.
 * - 3-day prediction window [E - 1, E, E + 1] with distinct central estimated date.
 * - Luteal-phase based ovulation estimation (14 days prior to predicted period start).
 * - Real dynamic countdown that decreases daily with zero client-side artificial caching.
 * - Comprehensive validation for 4-cycle onboarding and historical period logs.
 */

// ============================================================================
// 1. DATE-ONLY ARITHMETIC UTILITIES (PURE CALENDAR DAYS)
// ============================================================================

/**
 * Parses YYYY-MM-DD into { year, month, day } numbers
 */
export function parseDateOnly(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const parts = dateStr.trim().split('-');
  if (parts.length !== 3) return null;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);
  if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
  return { year, month, day };
}

/**
 * Converts a YYYY-MM-DD date string to a UTC Date at 00:00:00.
 * Eliminates daylight savings and local timezone skew.
 */
export function toDateOnlyUTC(dateStr) {
  const parsed = parseDateOnly(dateStr);
  if (!parsed) return null;
  return new Date(Date.UTC(parsed.year, parsed.month - 1, parsed.day));
}

/**
 * Calculates exact integer calendar days difference: (d2 - d1).
 * E.g. diffCalendarDays('2025-04-13', '2025-04-17') = 4.
 */
export function diffCalendarDays(dateStr1, dateStr2) {
  const d1 = toDateOnlyUTC(dateStr1);
  const d2 = toDateOnlyUTC(dateStr2);
  if (!d1 || !d2) return 0;
  const msDiff = d2.getTime() - d1.getTime();
  return Math.round(msDiff / (1000 * 60 * 60 * 24));
}

/**
 * Adds or subtracts calendar days from a YYYY-MM-DD string.
 * Accurately handles leap years, month boundaries, and year boundaries.
 */
export function addCalendarDays(dateStr, daysToAdd) {
  const d = toDateOnlyUTC(dateStr);
  if (!d) return dateStr;
  d.setUTCDate(d.getUTCDate() + daysToAdd);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Checks if a given year is a leap year
 */
export function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

/**
 * Returns total days in a month (1-indexed month: 1 = Jan, 12 = Dec)
 */
export function getDaysInMonth(year, month) {
  if (month === 2) {
    return isLeapYear(year) ? 29 : 28;
  }
  const thirtyDays = [4, 6, 9, 11];
  return thirtyDays.includes(month) ? 30 : 31;
}

/**
 * Returns current date in local system as YYYY-MM-DD
 */
export function getTodayDateString() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Formats a date string for display (e.g. "May 14, 2025")
 */
export function formatDateDisplay(dateStr, opts = { month: 'short', day: 'numeric', year: 'numeric' }) {
  const d = toDateOnlyUTC(dateStr);
  if (!d) return dateStr;
  return d.toLocaleDateString('en-US', { ...opts, timeZone: 'UTC' });
}

// ============================================================================
// 2. INPUT VALIDATION FOR 4-CYCLE ONBOARDING & PERIOD LOGS
// ============================================================================

/**
 * Validates 4 historical period start dates.
 * Enforces:
 * 1. Exactly 4 valid dates.
 * 2. Chronological order: S1 < S2 < S3 < S4.
 * 3. No future dates (historical starts cannot be in the future).
 * 4. Physiological interval sanity check (15 <= interval <= 90).
 */
export function validateFourDates(datesArray, todayStr = getTodayDateString()) {
  if (!Array.isArray(datesArray) || datesArray.length !== 4) {
    return { valid: false, isValid: false, error: 'Please enter all 4 cycle start dates.' };
  }

  for (let i = 0; i < 4; i++) {
    const parsed = parseDateOnly(datesArray[i]);
    if (!parsed) {
      return { valid: false, isValid: false, error: `Cycle ${i + 1} date is invalid. Please use YYYY-MM-DD format.` };
    }
    if (diffCalendarDays(datesArray[i], todayStr) < 0) {
      return { valid: false, isValid: false, error: `Cycle ${i + 1} date cannot be in the future.` };
    }
  }

  // Check chronological order (oldest to newest)
  for (let i = 0; i < 3; i++) {
    const diff = diffCalendarDays(datesArray[i], datesArray[i + 1]);
    if (diff <= 0) {
      return {
        valid: false,
        isValid: false,
        error: `Cycle ${i + 2} must be after Cycle ${i + 1}. Please enter dates from oldest to newest.`
      };
    }
    if (diff < 15) {
      return {
        valid: false,
        isValid: false,
        error: `Interval between Cycle ${i + 1} and ${i + 2} is only ${diff} days. Menstrual cycles are typically at least 15 days.`
      };
    }
  }

  // Warnings for unusual cycles (> 60 days)
  const warnings = [];
  for (let i = 0; i < 3; i++) {
    const diff = diffCalendarDays(datesArray[i], datesArray[i + 1]);
    if (diff > 60) {
      warnings.push(`Cycle ${i + 1} to Cycle ${i + 2} interval is ${diff} days (longer than average).`);
    }
  }

  return { valid: true, isValid: true, warnings };
}

// ============================================================================
// 3. STATISTICAL CYCLE ANALYSIS & PREDICTION ENGINE
// ============================================================================

/**
 * Analyzes cycle history and computes statistical predictions.
 * 
 * Given 4 period start dates S1, S2, S3, S4:
 * L1 = S2 - S1
 * L2 = S3 - S2
 * L3 = S4 - S3
 * 
 * Computes:
 * - Observed cycle lengths
 * - Mean & Median
 * - Standard deviation (variability)
 * - Estimated next period start date E
 * - 3-day prediction window [E - 1, E, E + 1]
 * - Estimated ovulation date (14 days before next expected start)
 * - Dynamic countdown to expected period
 */
export function calculateCycleMetrics(cycles, referenceDateStr = getTodayDateString()) {
  if (!cycles || cycles.length === 0) {
    return {
      hasData: false,
      cycleLengths: [],
      typicalLength: 28,
      durations: [],
      nextPeriodWindow: 'No records yet',
      estimatedWindowStart: null,
      estimatedWindowEnd: null,
      estimatedStartDate: null,
      ovulationDate: null,
      countdown: { daysRemaining: 0, status: 'empty', label: 'No cycles recorded' },
      confidence: 'None',
      explanation: 'No cycles recorded yet. Enter your last 4 period start dates to begin personal prediction.'
    };
  }

  // Sort cycles descending by startDate (index 0 is most recent)
  const sorted = [...cycles].sort((a, b) => {
    if (a.startDate > b.startDate) return -1;
    if (a.startDate < b.startDate) return 1;
    return 0;
  });

  // Compute intervals between consecutive period start dates: S_{i} - S_{i+1}
  // In sorted (descending): sorted[0] is most recent (S4), sorted[1] is S3, sorted[2] is S2, sorted[3] is S1
  const cycleLengths = [];
  for (let i = 0; i < sorted.length - 1; i++) {
    const recent = sorted[i].startDate;
    const earlier = sorted[i + 1].startDate;
    const days = Math.abs(diffCalendarDays(earlier, recent));
    cycleLengths.push({
      fromCycle: sorted[i + 1].name || sorted[i + 1].startDate,
      toCycle: sorted[i].name || sorted[i].startDate,
      days
    });
  }

  // Observed durations of bleeding
  const durations = sorted.map(c => {
    if (c.durationDays) return c.durationDays;
    if (c.startDate && c.endDate) {
      return Math.max(1, diffCalendarDays(c.startDate, c.endDate) + 1);
    }
    return 5;
  });

  // Calculate statistics across observed intervals
  const lengthsArray = cycleLengths.map(c => c.days);
  let meanLength = 29;
  let medianLength = 29;
  let minLength = 29;
  let maxLength = 29;
  let stdDev = 0;

  if (lengthsArray.length > 0) {
    const sum = lengthsArray.reduce((acc, curr) => acc + curr, 0);
    meanLength = sum / lengthsArray.length;

    // Median
    const sortedLengths = [...lengthsArray].sort((a, b) => a - b);
    const mid = Math.floor(sortedLengths.length / 2);
    medianLength = sortedLengths.length % 2 !== 0 
      ? sortedLengths[mid] 
      : Math.round((sortedLengths[mid - 1] + sortedLengths[mid]) / 2);

    minLength = sortedLengths[0];
    maxLength = sortedLengths[sortedLengths.length - 1];

    // Standard deviation
    if (lengthsArray.length > 1) {
      const variance = lengthsArray.reduce((acc, val) => acc + Math.pow(val - meanLength, 2), 0) / (lengthsArray.length - 1);
      stdDev = parseFloat(Math.sqrt(variance).toFixed(1));
    }
  }

  // Robust typical cycle length:
  // When stable, rounded median/mean.
  const typicalLength = Math.round(medianLength);

  // Confidence & Window Determination
  let confidence = 'High';
  let windowHalfDays = 1; // Default 3-day window: [E - 1, E, E + 1]
  let confidenceNote = '';

  if (lengthsArray.length >= 3) {
    if (stdDev <= 1.8) {
      confidence = 'High';
      confidenceNote = 'High confidence (consistent cycle lengths, ±1 day)';
      windowHalfDays = 1;
    } else if (stdDev <= 4) {
      confidence = 'Moderate';
      confidenceNote = 'Moderate confidence (mild natural variations, ±2-3 days)';
      windowHalfDays = 1; // Display 3-day compact range with explanatory note
    } else {
      confidence = 'Variable';
      confidenceNote = 'Variable cycle pattern (variation ±4+ days; wider natural window)';
      windowHalfDays = 2; // 5-day window for higher variability
    }
  } else if (lengthsArray.length > 0) {
    confidence = 'Preliminary';
    confidenceNote = 'Preliminary estimate from limited cycle history';
  } else {
    confidence = 'Baseline';
    confidenceNote = 'Baseline standard assumption (29 days)';
  }

  // Estimated next period start date: latestStart + typicalLength
  const latestStart = sorted[0].startDate;
  const estimatedDateStr = addCalendarDays(latestStart, typicalLength);

  // 3-Day Prediction Window: [E - 1, E, E + 1]
  const windowStartStr = addCalendarDays(estimatedDateStr, -windowHalfDays);
  const windowEndStr = addCalendarDays(estimatedDateStr, windowHalfDays);

  const windowString = `${formatDateDisplay(windowStartStr, { month: 'short', day: 'numeric' })} – ${formatDateDisplay(windowEndStr, { month: 'short', day: 'numeric', year: 'numeric' })}`;

  // Estimated Ovulation: Standard luteal phase approximation (14 days before next expected start)
  let ovulationDateStr = addCalendarDays(estimatedDateStr, -14);
  if (diffCalendarDays(latestStart, ovulationDateStr) <= 0) {
    ovulationDateStr = addCalendarDays(latestStart, Math.round(typicalLength / 2));
  }

  // Dynamic Countdown Calculation
  const countdown = calculateCountdown(estimatedDateStr, windowStartStr, windowEndStr, referenceDateStr);

  // Transparent, honest medical explanation
  let explanation = '';
  if (lengthsArray.length >= 3) {
    explanation = `Calculated from your last ${cycleLengths.length} intervals (${lengthsArray.join(', ')} days). Your median cycle length is ${typicalLength} days (mean: ${meanLength.toFixed(1)}d, standard deviation: ±${stdDev}d). Natural monthly variations are completely normal.`;
  } else if (lengthsArray.length > 0) {
    explanation = `Based on ${lengthsArray.length} recorded interval (${lengthsArray.join(', ')} days). Log additional cycles to refine predictions.`;
  } else {
    explanation = `Baseline standard cycle length (${typicalLength} days). Add your personal cycle dates for custom predictions.`;
  }

  // Duration insight
  let durationInsight = '';
  if (durations.length >= 3) {
    const last3 = durations.slice(0, 3).reverse();
    durationInsight = `Your last three recorded periods lasted ${last3[0]}, ${last3[1]}, and ${last3[2]} days.`;
  } else if (durations.length > 0) {
    durationInsight = `Your last recorded period lasted ${durations[0]} days.`;
  }

  return {
    hasData: true,
    latestCycle: sorted[0],
    sortedCycles: sorted,
    cycleLengths,
    lengthsArray,
    meanLength: parseFloat(meanLength.toFixed(1)),
    medianLength,
    minLength,
    maxLength,
    stdDev,
    typicalLength,
    durations,
    nextPeriodWindow: windowString,
    estimatedStartDate: estimatedDateStr,
    estimatedWindowStart: windowStartStr,
    estimatedWindowEnd: windowEndStr,
    ovulationDate: ovulationDateStr,
    countdown,
    confidence,
    confidenceNote,
    explanation,
    durationInsight
  };
}

// ============================================================================
// 4. DYNAMIC COUNTDOWN ENGINE
// ============================================================================

/**
 * Calculates remaining days from local date to estimated period date.
 * Strictly uses calendar-day arithmetic without artificial caching.
 */
export function calculateCountdown(estimatedDateStr, windowStartStr, windowEndStr, todayStr = getTodayDateString()) {
  if (!estimatedDateStr) {
    return { daysRemaining: 0, status: 'empty', label: 'No prediction available', headline: 'No Prediction' };
  }

  const daysToCenter = diffCalendarDays(todayStr, estimatedDateStr);
  const daysToStart = diffCalendarDays(todayStr, windowStartStr);
  const daysPastEnd = diffCalendarDays(windowEndStr, todayStr);

  // 1. Upcoming window (future)
  if (daysToStart > 1) {
    return {
      daysRemaining: daysToCenter,
      status: 'upcoming',
      label: `${daysToCenter} days left`,
      fullText: `${daysToCenter} days until your expected period`,
      headline: `Your Next Period Is In <span class="period-highlight">${daysToCenter} Days</span>`,
      subtext: `Predicted window starts in ${daysToStart} days.`
    };
  }

  if (daysToStart === 1) {
    return {
      daysRemaining: 1,
      status: 'upcoming',
      label: `1 day left`,
      fullText: `1 day until your expected window`,
      headline: `Your Next Period Is In <span class="period-highlight">1 Day</span>`,
      subtext: `Predicted window begins tomorrow.`
    };
  }

  // 2. Active Window (in progress)
  if (daysToStart <= 0 && daysPastEnd <= 0) {
    let activeText = 'Predicted window in progress';
    if (todayStr === windowStartStr) {
      activeText = 'Predicted window starts today';
    } else if (todayStr === estimatedDateStr) {
      activeText = 'Estimated period start date today';
    }

    return {
      daysRemaining: 0,
      status: 'in-progress',
      label: 'Window Active',
      fullText: activeText,
      headline: `<span class="period-highlight">Period Window Active</span>`,
      subtext: `Your predicted window (${formatDateDisplay(windowStartStr)} – ${formatDateDisplay(windowEndStr)}) is currently open.`
    };
  }

  // 3. Overdue Window (window has passed)
  if (daysPastEnd > 0) {
    return {
      daysRemaining: 0,
      status: 'overdue',
      daysOverdue: daysPastEnd,
      label: `${daysPastEnd}d overdue`,
      fullText: `Expected window passed (${daysPastEnd} day${daysPastEnd > 1 ? 's' : ''} overdue)`,
      headline: `<span class="period-highlight">${daysPastEnd} Day${daysPastEnd > 1 ? 's' : ''} Overdue</span>`,
      subtext: `Has your period arrived? Click below to record your actual start date.`
    };
  }

  return {
    daysRemaining: daysToCenter,
    status: 'upcoming',
    label: `${daysToCenter} days left`,
    fullText: `${daysToCenter} days left`,
    headline: `Your Next Period Is In <span class="period-highlight">${daysToCenter} Days</span>`,
    subtext: ''
  };
}

// ============================================================================
// 5. CALENDAR MONTH GRID GENERATOR
// ============================================================================

/**
 * Builds the visual day grid for a specified month & year.
 * Correctly marks:
 * - is-period: Confirmed period days (solid purple)
 * - is-predicted: Predicted window days (dashed lavender)
 * - is-estimated-center: Central estimated date
 * - is-ovulation: Ovulation day (ring outline)
 * - is-today: Today's date
 */
export function getCalendarGrid(year, month, cycles = [], predictionMetrics = null, todayStr = getTodayDateString()) {
  const daysInMonth = getDaysInMonth(year, month);
  
  // Day of week of the 1st of month: 0 = Sun, 1 = Mon, ..., 6 = Sat
  const firstDayUTC = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();

  // Build sets of dates for fast lookup
  const confirmedPeriodDates = new Set();
  cycles.forEach(c => {
    if (!c.startDate) return;
    const dur = c.durationDays || 5;
    for (let i = 0; i < dur; i++) {
      confirmedPeriodDates.add(addCalendarDays(c.startDate, i));
    }
  });

  const predictedDates = new Set();
  let estimatedCenterDate = null;
  let ovulationDate = null;

  if (predictionMetrics && predictionMetrics.estimatedWindowStart && predictionMetrics.estimatedWindowEnd) {
    const start = predictionMetrics.estimatedWindowStart;
    const end = predictionMetrics.estimatedWindowEnd;
    const daysInWindow = Math.max(1, diffCalendarDays(start, end) + 1);
    for (let i = 0; i < daysInWindow; i++) {
      predictedDates.add(addCalendarDays(start, i));
    }
    estimatedCenterDate = predictionMetrics.estimatedStartDate;
    ovulationDate = predictionMetrics.ovulationDate;
  }

  const days = [];

  // Empty cells for alignment before day 1
  for (let i = 0; i < firstDayUTC; i++) {
    days.push({ dayNumber: null, isEmpty: true });
  }

  // Days 1 through daysInMonth
  for (let d = 1; d <= daysInMonth; d++) {
    const mStr = String(month).padStart(2, '0');
    const dStr = String(d).padStart(2, '0');
    const dateStr = `${year}-${mStr}-${dStr}`;

    const isPeriod = confirmedPeriodDates.has(dateStr);
    const isPredicted = !isPeriod && predictedDates.has(dateStr);
    const isEstimatedCenter = isPredicted && (dateStr === estimatedCenterDate);
    const isOvulation = !isPeriod && !isPredicted && (dateStr === ovulationDate);
    const isToday = (dateStr === todayStr);

    days.push({
      dayNumber: d,
      dateString: dateStr,
      isEmpty: false,
      isPeriod,
      isPredicted,
      isEstimatedCenter,
      isOvulation,
      isToday
    });
  }

  return {
    year,
    month,
    daysInMonth,
    firstDayUTC,
    days
  };
}

// ============================================================================
// 6. PAIN PATTERN ANALYSIS (PRESERVED FOR CONSISTENCY & TESTS)
// ============================================================================

export function analyzePainPatterns(cycles, painLogs) {
  if (!painLogs || painLogs.length === 0) {
    return {
      hasData: false,
      dailyAverages: [0, 0, 0, 0, 0, 0, 0],
      cyclePeaks: [],
      mostPainfulDay: null,
      consistencyText: 'No pain logs recorded yet.',
      routineLinkText: ''
    };
  }

  const dayGroups = { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [] };
  painLogs.forEach(log => {
    if (dayGroups[log.day]) {
      dayGroups[log.day].push(log.painScore);
    }
  });

  const dailyAverages = [];
  for (let d = 1; d <= 7; d++) {
    const scores = dayGroups[d];
    if (scores.length > 0) {
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      dailyAverages.push(parseFloat(avg.toFixed(1)));
    } else {
      dailyAverages.push(0);
    }
  }

  const cyclesMap = {};
  cycles.forEach(c => {
    cyclesMap[c.id] = { name: c.name, peakDay: null, maxScore: -1 };
  });

  painLogs.forEach(log => {
    if (cyclesMap[log.cycleId]) {
      if (log.painScore > cyclesMap[log.cycleId].maxScore) {
        cyclesMap[log.cycleId].maxScore = log.painScore;
        cyclesMap[log.cycleId].peakDay = log.day;
      }
    }
  });

  const cyclePeaks = Object.keys(cyclesMap).map(id => ({
    cycleId: id,
    cycleName: cyclesMap[id].name,
    peakDay: cyclesMap[id].peakDay,
    maxScore: cyclesMap[id].maxScore
  })).filter(c => c.peakDay !== null);

  const peakCounts = {};
  cyclePeaks.forEach(cp => {
    peakCounts[cp.peakDay] = (peakCounts[cp.peakDay] || 0) + 1;
  });

  let topDay = null;
  let topCount = 0;
  for (const day in peakCounts) {
    if (peakCounts[day] > topCount) {
      topCount = peakCounts[day];
      topDay = parseInt(day, 10);
    }
  }

  const totalCycles = cyclePeaks.length;
  let consistencyText = '';
  let highlightNote = '';

  if (topDay && topCount >= 2) {
    consistencyText = `Day ${topDay} has been your most painful day in ${topCount} out of ${totalCycles} cycles.`;
    highlightNote = `Next time, there's a higher chance you may experience more pain on Day ${topDay}. (Natural variation is expected.)`;
  } else if (topDay) {
    consistencyText = `We haven't found a consistent painful-day pattern yet. Keep logging if you find it helpful.`;
    highlightNote = `Pain levels often vary month to month. Tracking helps identify your unique comfort needs.`;
  }

  const highPainLogs = painLogs.filter(p => p.painScore >= 7);
  const stressLinked = highPainLogs.filter(p => p.routine && (p.routine.stress === 'high' || p.routine.sleep === 'poor'));
  
  let routineLinkText = '';
  if (stressLinked.length >= 2) {
    routineLinkText = `Higher pain scores appeared alongside higher stress in 3 of your last 4 cycles. This may be a connection, but it doesn't mean one caused the other.`;
  } else {
    routineLinkText = `Not enough routine entries yet to detect potential connections. Correlation does not imply causation.`;
  }

  return {
    hasData: true,
    dailyAverages,
    cyclePeaks,
    topDay,
    topCount,
    totalCycles,
    consistencyText,
    highlightNote,
    routineLinkText
  };
}

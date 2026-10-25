import { BloomStreakSummary, WeeklyDayStatus } from '../types/index.js';

// Helper: Format date to "YYYY-MM-DD"
export function formatDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Helper: Add days to "YYYY-MM-DD" string
export function addDays(dateStr: string, days: number): string {
  const parts = dateStr.split('-').map(Number);
  const d = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().split('T')[0];
}

// Helper: Difference in days between two "YYYY-MM-DD" strings (b - a)
export function diffInDays(dateA: string, dateB: string): number {
  const pA = dateA.split('-').map(Number);
  const pB = dateB.split('-').map(Number);
  const utcA = Date.UTC(pA[0], pA[1] - 1, pA[2]);
  const utcB = Date.UTC(pB[0], pB[1] - 1, pB[2]);
  return Math.round((utcB - utcA) / (1000 * 60 * 60 * 24));
}

/**
 * Calculates current streak, longest streak, 7-day Monday-Sunday calendar,
 * and encouraging message from a list of user completed activity dates.
 */
export function calculateStreak(
  completedDates: string[],
  referenceDateStr?: string
): BloomStreakSummary {
  const todayStr = referenceDateStr && /^\d{4}-\d{2}-\d{2}$/.test(referenceDateStr)
    ? referenceDateStr
    : formatDate(new Date());

  const yesterdayStr = addDays(todayStr, -1);

  // Deduplicate and sort dates ascending
  const uniqueDates = Array.from(new Set(completedDates.filter(d => /^\d{4}-\d{2}-\d{2}$/.test(d)))).sort();
  const activeDateSet = new Set(uniqueDates);

  const todayCompleted = activeDateSet.has(todayStr);
  const todayActivityCount = completedDates.filter(d => d === todayStr).length;

  // 1. Calculate Longest Streak
  let longestStreak = 0;
  let runningStreak = 0;
  let prevDate: string | null = null;

  for (const date of uniqueDates) {
    if (!prevDate) {
      runningStreak = 1;
    } else {
      const diff = diffInDays(prevDate, date);
      if (diff === 1) {
        runningStreak += 1;
      } else {
        runningStreak = 1;
      }
    }
    if (runningStreak > longestStreak) {
      longestStreak = runningStreak;
    }
    prevDate = date;
  }

  // 2. Calculate Current Consecutive Streak
  let currentStreak = 0;
  let checkDate: string | null = null;

  if (activeDateSet.has(todayStr)) {
    checkDate = todayStr;
  } else if (activeDateSet.has(yesterdayStr)) {
    checkDate = yesterdayStr;
  }

  if (checkDate) {
    let curr = checkDate;
    while (activeDateSet.has(curr)) {
      currentStreak += 1;
      curr = addDays(curr, -1);
    }
  }

  if (currentStreak > longestStreak) {
    longestStreak = currentStreak;
  }

  // 3. Generate Monday–Sunday 7-Day Weekly Calendar
  // Determine Monday of the current week based on todayStr
  const todayParts = todayStr.split('-').map(Number);
  const todayObj = new Date(todayParts[0], todayParts[1] - 1, todayParts[2]);
  
  // getDay(): 0 = Sun, 1 = Mon, ..., 6 = Sat
  const dayOfWeek = (todayObj.getDay() + 6) % 7; // 0 for Mon, ..., 6 for Sun
  const mondayStr = addDays(todayStr, -dayOfWeek);

  const dayNames: Array<'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun'> = [
    'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'
  ];

  const weeklyCalendar: WeeklyDayStatus[] = [];

  for (let i = 0; i < 7; i++) {
    const dStr = addDays(mondayStr, i);
    const dParts = dStr.split('-').map(Number);
    const dayNum = dParts[2];

    weeklyCalendar.push({
      date: dStr,
      dayName: dayNames[i],
      dayNumber: dayNum,
      isCompleted: activeDateSet.has(dStr),
      isToday: dStr === todayStr,
      isFuture: dStr > todayStr,
      isPast: dStr < todayStr
    });
  }

  // 4. Encouraging Message
  let encouragingMessage = "Welcome! Start your Bloom streak with today's learning.";
  if (todayCompleted) {
    if (currentStreak >= 7) {
      encouragingMessage = 'Your learning is blooming beautifully! Amazing dedication.';
    } else if (currentStreak >= 3) {
      encouragingMessage = 'Your learning is growing! Great job checking in today.';
    } else {
      encouragingMessage = "One small step at a time. Wonderful job completing today's activity!";
    }
  } else {
    if (currentStreak > 0) {
      encouragingMessage = 'Ready to explore something new? Complete an activity to keep your streak blooming!';
    } else {
      encouragingMessage = "Welcome back! Start a fresh streak with today's learning.";
    }
  }

  return {
    currentStreak,
    longestStreak,
    todayCompleted,
    todayActivityCount,
    weeklyCalendar,
    encouragingMessage,
    totalActivitiesCompleted: completedDates.length
  };
}

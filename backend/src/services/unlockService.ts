import { UnlockedDayInfo } from '../types/index.js';

export const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

/**
 * Calculates current unlocked day, program start timestamp, and countdown to next day unlock.
 * Strictly enforces 24-hour intervals from original program start timestamp without timer drift.
 */
export function calculateUnlockedDayInfo(
  programStartedAtDate: Date,
  nowDate: Date = new Date(),
  highestCompletedDay: number = 1
): UnlockedDayInfo {
  const startMs = programStartedAtDate.getTime();
  const nowMs = nowDate.getTime();

  // Elapsed milliseconds since program start
  const elapsedMs = Math.max(0, nowMs - startMs);

  // Day 1 unlocks immediately (elapsedMs >= 0)
  // Day 2 unlocks after 1 full 24h interval
  // Day N unlocks after (N - 1) full 24h intervals
  const additionalDaysUnlocked = Math.floor(elapsedMs / TWENTY_FOUR_HOURS_MS);
  let maxUnlockedDay = Math.min(50, 1 + additionalDaysUnlocked);

  // Preserve existing progress: if user already has completed activities on a higher day,
  // ensure that day remains unlocked
  if (highestCompletedDay > maxUnlockedDay) {
    maxUnlockedDay = Math.min(50, highestCompletedDay);
  }

  let nextDayUnlockTime: string | null = null;
  let nextDayUnlockSeconds = 0;

  if (maxUnlockedDay < 50) {
    // Exact timestamp when (maxUnlockedDay + 1) unlocks, computed from original start timestamp
    const nextUnlockMs = startMs + maxUnlockedDay * TWENTY_FOUR_HOURS_MS;
    nextDayUnlockTime = new Date(nextUnlockMs).toISOString();
    const remainingMs = Math.max(0, nextUnlockMs - nowMs);
    nextDayUnlockSeconds = Math.ceil(remainingMs / 1000);
  }

  return {
    maxUnlockedDay,
    programStartedAt: programStartedAtDate.toISOString(),
    nextDayUnlockTime,
    nextDayUnlockSeconds,
    serverTime: nowDate.toISOString()
  };
}

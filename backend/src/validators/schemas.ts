// Input validators and sanitizers

export const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export function isValidDateString(dateStr: string): boolean {
  if (!DATE_REGEX.test(dateStr)) return false;
  const d = new Date(dateStr);
  return !isNaN(d.getTime());
}

export function validatePeriodDates(startDate: string, endDate?: string | null): { valid: boolean; error?: string } {
  if (!startDate || !isValidDateString(startDate)) {
    return { valid: false, error: 'Start date must be a valid date in YYYY-MM-DD format.' };
  }

  // Prevent dates far in the future
  const now = new Date();
  const maxFutureDate = new Date();
  maxFutureDate.setDate(now.getDate() + 1); // Allow at most today or tomorrow for local tz quirks
  const parsedStart = new Date(startDate);

  if (parsedStart > maxFutureDate) {
    return { valid: false, error: 'Start date cannot be set in the future.' };
  }

  if (endDate) {
    if (!isValidDateString(endDate)) {
      return { valid: false, error: 'End date must be a valid date in YYYY-MM-DD format.' };
    }
    const parsedEnd = new Date(endDate);
    if (parsedEnd < parsedStart) {
      return { valid: false, error: 'End date cannot be earlier than start date.' };
    }
    // Most periods are 2-10 days. If someone enters > 30 days, warn or cap
    const diffDays = Math.ceil((parsedEnd.getTime() - parsedStart.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays > 25) {
      return { valid: false, error: 'Period duration cannot exceed 25 days in a single log. Please check the dates.' };
    }
  }

  return { valid: true };
}

export function sanitizeString(val: any): string {
  if (typeof val !== 'string') return '';
  return val.trim().slice(0, 500); // limit reasonable length
}

export const VALID_AGE_BANDS = ['10-12', '13-14', '15-16'];
export const VALID_PERIOD_STATUSES = ['not_started', 'started_recently', 'tracking_regularly'];
export const VALID_FLOWS = ['light', 'medium', 'heavy'];
export const VALID_MOODS = ['happy', 'calm', 'sensitive', 'tired', 'anxious', 'frustrated'];
export const VALID_ENERGIES = ['low', 'medium', 'high'];
export const VALID_CRAMPS = ['none', 'mild', 'moderate', 'strong'];

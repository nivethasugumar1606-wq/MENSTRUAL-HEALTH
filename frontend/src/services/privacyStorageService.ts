/**
 * Nurtura Local Privacy & Storage Service
 * Handles:
 * 1. 100% Local on-device storage (localStorage / IndexedDB) without external servers
 * 2. Optional 4-Digit PIN Lock with Web Crypto API (AES-GCM 256-bit + PBKDF2 with 100,000 iterations & random salt)
 * 3. Discreet Mode state and UI toggles
 * 4. Full JSON & CSV Data Export
 * 5. Validated JSON & CSV Data Import with duplicate protection
 * 6. "Delete everything" application wipe
 */

import {
  PeriodRecordDTO,
  JournalEntryDTO,
  UserProgressSummary,
  UserProfile,
  FlowLevel,
  MoodType,
  EnergyLevel,
  CrampLevel
} from '../../../shared/types/index.js';

const STORAGE_KEYS = {
  PERIODS: 'nurtura_periods_data',
  JOURNAL: 'nurtura_journal_data',
  PROGRESS: 'nurtura_progress_data',
  PROFILE: 'nurtura_local_profile',
  DISCREET_MODE: 'nurtura_discreet_mode',
  PIN_ENABLED: 'nurtura_pin_enabled',
  PIN_SALT: 'nurtura_pin_salt',
  PIN_IV: 'nurtura_pin_iv',
  ENCRYPTED_VAULT: 'nurtura_encrypted_vault',
  SESSION_UNLOCKED: 'nurtura_session_unlocked'
};

const VERIFICATION_TOKEN = 'NURTURA_VAULT_AUTHENTICATED_2026';

// -------------------------------------------------------------
// Base64 & ArrayBuffer Helpers
// -------------------------------------------------------------
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

// -------------------------------------------------------------
// Web Crypto API Key Derivation (PBKDF2 + AES-GCM)
// -------------------------------------------------------------
async function deriveAesKey(pin: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(pin),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: new Uint8Array(salt),
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

// -------------------------------------------------------------
// Local Data Accessors
// -------------------------------------------------------------
export function getLocalPeriods(): PeriodRecordDTO[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PERIODS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveLocalPeriods(periods: PeriodRecordDTO[]): void {
  // Never save demo data into real personal local storage
  const genuineOnly = periods.filter((p: any) => !p.isDemo);
  localStorage.setItem(STORAGE_KEYS.PERIODS, JSON.stringify(genuineOnly));
}

export function getLocalJournal(): JournalEntryDTO[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.JOURNAL);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveLocalJournal(entries: JournalEntryDTO[]): void {
  localStorage.setItem(STORAGE_KEYS.JOURNAL, JSON.stringify(entries));
}

export function getLocalProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return {
    id: 'local_user_private',
    username: 'local_user',
    nickname: 'Friend',
    ageBand: '13-14',
    periodStatus: 'started_recently',
    createdAt: new Date().toISOString()
  };
}

export function saveLocalProfile(profile: Partial<UserProfile>): UserProfile {
  const current = getLocalProfile();
  const updated: UserProfile = { ...current, ...profile };
  localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(updated));
  return updated;
}

// -------------------------------------------------------------
// Discreet Mode
// -------------------------------------------------------------
export function isDiscreetModeEnabled(): boolean {
  return localStorage.getItem(STORAGE_KEYS.DISCREET_MODE) === 'true';
}

export function setDiscreetMode(enabled: boolean): void {
  localStorage.setItem(STORAGE_KEYS.DISCREET_MODE, enabled ? 'true' : 'false');
  window.dispatchEvent(new CustomEvent('nurtura:discreet_mode_changed', { detail: enabled }));
}

// -------------------------------------------------------------
// 4-Digit PIN Lock & AES-GCM Encryption
// -------------------------------------------------------------
export function isPinLockEnabled(): boolean {
  return localStorage.getItem(STORAGE_KEYS.PIN_ENABLED) === 'true';
}

export function isSessionUnlocked(): boolean {
  if (!isPinLockEnabled()) return true;
  return sessionStorage.getItem(STORAGE_KEYS.SESSION_UNLOCKED) === 'true';
}

export function setSessionUnlocked(unlocked: boolean): void {
  if (unlocked) {
    sessionStorage.setItem(STORAGE_KEYS.SESSION_UNLOCKED, 'true');
  } else {
    sessionStorage.removeItem(STORAGE_KEYS.SESSION_UNLOCKED);
  }
}

export interface VaultPayload {
  verification: string;
  periods: PeriodRecordDTO[];
  journal: JournalEntryDTO[];
  profile: UserProfile;
}

/**
 * Enables PIN Lock by encrypting user data with AES-GCM and PBKDF2 derived key.
 * Never stores the PIN itself.
 */
export async function enablePinLock(
  pin: string,
  currentPeriods: PeriodRecordDTO[],
  currentJournal: JournalEntryDTO[],
  currentProfile: UserProfile
): Promise<void> {
  if (!/^\d{4}$/.test(pin)) {
    throw new Error('PIN must be exactly 4 digits (0-9).');
  }

  // Generate 16-byte random salt and 12-byte random IV
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const iv = window.crypto.getRandomValues(new Uint8Array(12));

  const key = await deriveAesKey(pin, salt);

  const payload: VaultPayload = {
    verification: VERIFICATION_TOKEN,
    periods: currentPeriods.filter((p: any) => !p.isDemo),
    journal: currentJournal,
    profile: currentProfile
  };

  const enc = new TextEncoder();
  const cipherBuffer = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    enc.encode(JSON.stringify(payload))
  );

  const encryptedBase64 = arrayBufferToBase64(cipherBuffer);

  // Store salt, IV, and ciphertext — NEVER store the PIN itself
  localStorage.setItem(STORAGE_KEYS.PIN_SALT, arrayBufferToBase64(salt.buffer));
  localStorage.setItem(STORAGE_KEYS.PIN_IV, arrayBufferToBase64(iv.buffer));
  localStorage.setItem(STORAGE_KEYS.ENCRYPTED_VAULT, encryptedBase64);
  localStorage.setItem(STORAGE_KEYS.PIN_ENABLED, 'true');

  // Mark session as unlocked now
  setSessionUnlocked(true);

  // Clear unencrypted sensitive records from plaintext storage
  localStorage.removeItem(STORAGE_KEYS.PERIODS);
  localStorage.removeItem(STORAGE_KEYS.JOURNAL);
}

/**
 * Validates PIN and decrypts vault data.
 * If PIN is incorrect, AES-GCM tag verification fails and throws without deleting user data.
 */
export async function unlockWithPin(pin: string): Promise<VaultPayload> {
  if (!/^\d{4}$/.test(pin)) {
    throw new Error('Please enter a valid 4-digit PIN.');
  }

  const saltBase64 = localStorage.getItem(STORAGE_KEYS.PIN_SALT);
  const ivBase64 = localStorage.getItem(STORAGE_KEYS.PIN_IV);
  const cipherBase64 = localStorage.getItem(STORAGE_KEYS.ENCRYPTED_VAULT);

  if (!saltBase64 || !ivBase64 || !cipherBase64) {
    throw new Error('Encrypted vault data not found.');
  }

  const salt = new Uint8Array(base64ToArrayBuffer(saltBase64));
  const iv = new Uint8Array(base64ToArrayBuffer(ivBase64));
  const cipherBuffer = base64ToArrayBuffer(cipherBase64);

  const key = await deriveAesKey(pin, salt);

  try {
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      cipherBuffer
    );

    const dec = new TextDecoder();
    const payload: VaultPayload = JSON.parse(dec.decode(decryptedBuffer));

    if (payload.verification !== VERIFICATION_TOKEN) {
      throw new Error('Authentication failed.');
    }

    setSessionUnlocked(true);
    return payload;
  } catch (err: any) {
    throw new Error('Incorrect PIN. Please try again.');
  }
}

/**
 * Disables PIN Lock by decrypting data and saving it back to unencrypted local storage.
 */
export async function disablePinLock(pin: string): Promise<VaultPayload> {
  const payload = await unlockWithPin(pin);

  // Save decrypted records back to regular local storage
  saveLocalPeriods(payload.periods);
  saveLocalJournal(payload.journal);
  saveLocalProfile(payload.profile);

  // Remove PIN lock keys
  localStorage.removeItem(STORAGE_KEYS.PIN_ENABLED);
  localStorage.removeItem(STORAGE_KEYS.PIN_SALT);
  localStorage.removeItem(STORAGE_KEYS.PIN_IV);
  localStorage.removeItem(STORAGE_KEYS.ENCRYPTED_VAULT);
  sessionStorage.removeItem(STORAGE_KEYS.SESSION_UNLOCKED);

  return payload;
}

// -------------------------------------------------------------
// Data Export (JSON & CSV)
// -------------------------------------------------------------
export function exportDataAsJson(
  periods: PeriodRecordDTO[],
  journal: JournalEntryDTO[],
  profile: UserProfile,
  progress?: UserProgressSummary
): void {
  const exportPayload = {
    exportedAt: new Date().toISOString(),
    appName: isDiscreetModeEnabled() ? 'Diary' : 'Nurtura',
    formatVersion: '1.0',
    profile: {
      nickname: profile.nickname,
      ageBand: profile.ageBand,
      periodStatus: profile.periodStatus
    },
    settings: {
      discreetMode: isDiscreetModeEnabled(),
      pinLockEnabled: isPinLockEnabled()
    },
    // Exclude demo records
    periods: periods.filter((p: any) => !p.isDemo).map((p) => ({
      id: p.id,
      startDate: p.startDate,
      endDate: p.endDate || null,
      flow: p.flow,
      symptoms: p.symptoms || [],
      mood: p.mood || null,
      energy: p.energy || null,
      notes: p.notes || ''
    })),
    journalEntries: journal.map((j) => ({
      id: j.id,
      date: j.date,
      mood: j.mood,
      energy: j.energy,
      cramps: j.cramps,
      symptoms: j.symptoms || [],
      notes: j.notes || ''
    })),
    learningProgress: progress
      ? {
          totalPoints: progress.totalPoints,
          completedLessonsCount: progress.completedLessonsCount,
          completedLessonIds: progress.completedLessonIds
        }
      : undefined
  };

  const filename = `${isDiscreetModeEnabled() ? 'diary' : 'nurtura'}_backup_${new Date().toISOString().split('T')[0]}.json`;
  const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json;charset=utf-8' });
  downloadBlob(blob, filename);
}

export function exportDataAsCsv(periods: PeriodRecordDTO[], journal: JournalEntryDTO[]): void {
  const escapeCsv = (val: any) => {
    if (val === null || val === undefined) return '';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows: string[] = [];

  // Section 1: Period History
  rows.push('--- PERIOD LOGS ---');
  rows.push(['Record Type', 'Start Date', 'End Date', 'Flow', 'Symptoms', 'Mood', 'Energy', 'Notes'].join(','));

  const genuinePeriods = periods.filter((p: any) => !p.isDemo);
  for (const p of genuinePeriods) {
    rows.push(
      [
        escapeCsv('Period'),
        escapeCsv(p.startDate),
        escapeCsv(p.endDate || ''),
        escapeCsv(p.flow),
        escapeCsv((p.symptoms || []).join('; ')),
        escapeCsv(p.mood || ''),
        escapeCsv(p.energy || ''),
        escapeCsv(p.notes || '')
      ].join(',')
    );
  }

  // Section 2: Body Journal Entries
  rows.push('');
  rows.push('--- BODY JOURNAL CHECK-INS ---');
  rows.push(['Record Type', 'Date', 'Mood', 'Energy', 'Cramps', 'Symptoms', 'Notes'].join(','));

  for (const j of journal) {
    rows.push(
      [
        escapeCsv('Journal'),
        escapeCsv(j.date),
        escapeCsv(j.mood),
        escapeCsv(j.energy),
        escapeCsv(j.cramps),
        escapeCsv((j.symptoms || []).join('; ')),
        escapeCsv(j.notes || '')
      ].join(',')
    );
  }

  const csvContent = rows.join('\r\n');
  const filename = `${isDiscreetModeEnabled() ? 'diary' : 'nurtura'}_records_${new Date().toISOString().split('T')[0]}.csv`;
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, filename);
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// -------------------------------------------------------------
// Data Import (JSON & CSV)
// -------------------------------------------------------------
export interface ImportResult {
  periodsAdded: number;
  periodsTotal: number;
  journalAdded: number;
  journalTotal: number;
  mergedPeriods: PeriodRecordDTO[];
  mergedJournal: JournalEntryDTO[];
}

export function importDataFile(
  fileContent: string,
  fileName: string,
  existingPeriods: PeriodRecordDTO[],
  existingJournal: JournalEntryDTO[]
): ImportResult {
  const isCsv = fileName.toLowerCase().endsWith('.csv');

  if (isCsv) {
    return importFromCsv(fileContent, existingPeriods, existingJournal);
  } else {
    return importFromJson(fileContent, existingPeriods, existingJournal);
  }
}

function importFromJson(
  jsonText: string,
  existingPeriods: PeriodRecordDTO[],
  existingJournal: JournalEntryDTO[]
): ImportResult {
  let parsed: any;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    throw new Error('Invalid JSON format: Could not parse the uploaded file.');
  }

  if (typeof parsed !== 'object' || parsed === null) {
    throw new Error('Invalid backup file: Root must be a valid JSON object.');
  }

  const rawPeriods: any[] = Array.isArray(parsed.periods) ? parsed.periods : [];
  const rawJournal: any[] = Array.isArray(parsed.journalEntries) ? parsed.journalEntries : [];

  if (rawPeriods.length === 0 && rawJournal.length === 0) {
    throw new Error('No valid period records or journal entries found in this JSON backup.');
  }

  // Merge periods avoiding duplicates (matching on startDate)
  const existingDateMap = new Set(existingPeriods.map((p) => p.startDate));
  const newPeriods: PeriodRecordDTO[] = [];

  for (const item of rawPeriods) {
    if (!item.startDate || !/^\d{4}-\d{2}-\d{2}$/.test(item.startDate)) continue;
    if (existingDateMap.has(item.startDate)) continue;

    const flowVal: FlowLevel = ['light', 'medium', 'heavy'].includes(item.flow || item.flowLevel)
      ? (item.flow || item.flowLevel)
      : 'medium';

    newPeriods.push({
      id: item.id || `imported_period_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId: item.userId || 'local_user_private',
      startDate: item.startDate,
      endDate: item.endDate && /^\d{4}-\d{2}-\d{2}$/.test(item.endDate) ? item.endDate : null,
      flow: flowVal,
      symptoms: Array.isArray(item.symptoms) ? item.symptoms : [],
      mood: item.mood || undefined,
      energy: item.energy || undefined,
      notes: typeof item.notes === 'string' ? item.notes : '',
      createdAt: item.createdAt || new Date().toISOString(),
      updatedAt: item.updatedAt || new Date().toISOString()
    });
    existingDateMap.add(item.startDate);
  }

  // Merge journal entries avoiding duplicates (matching on date)
  const existingJournalDateMap = new Set(existingJournal.map((j) => j.date));
  const newJournal: JournalEntryDTO[] = [];

  for (const item of rawJournal) {
    const entryDate = item.date || item.entryDate;
    if (!entryDate || !/^\d{4}-\d{2}-\d{2}$/.test(entryDate)) continue;
    if (existingJournalDateMap.has(entryDate)) continue;

    const moodVal: MoodType = ['happy', 'calm', 'sensitive', 'tired', 'anxious', 'frustrated'].includes(item.mood)
      ? item.mood
      : 'calm';
    const energyVal: EnergyLevel = ['low', 'medium', 'high'].includes(item.energy) ? item.energy : 'medium';
    const crampsVal: CrampLevel = ['none', 'mild', 'moderate', 'strong'].includes(item.cramps) ? item.cramps : 'none';

    newJournal.push({
      id: item.id || `imported_journal_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId: item.userId || 'local_user_private',
      date: entryDate,
      mood: moodVal,
      energy: energyVal,
      cramps: crampsVal,
      symptoms: Array.isArray(item.symptoms) ? item.symptoms : [],
      notes: typeof item.notes === 'string' ? item.notes : '',
      createdAt: item.createdAt || new Date().toISOString(),
      updatedAt: item.updatedAt || new Date().toISOString()
    });
    existingJournalDateMap.add(entryDate);
  }

  const mergedPeriods = [...existingPeriods, ...newPeriods].sort((a, b) => b.startDate.localeCompare(a.startDate));
  const mergedJournal = [...existingJournal, ...newJournal].sort((a, b) => b.date.localeCompare(a.date));

  return {
    periodsAdded: newPeriods.length,
    periodsTotal: mergedPeriods.length,
    journalAdded: newJournal.length,
    journalTotal: mergedJournal.length,
    mergedPeriods,
    mergedJournal
  };
}

function importFromCsv(
  csvText: string,
  existingPeriods: PeriodRecordDTO[],
  existingJournal: JournalEntryDTO[]
): ImportResult {
  const lines = csvText.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
  if (lines.length < 2) {
    throw new Error('CSV file is empty or does not contain data rows.');
  }

  const parseCsvLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const existingDateMap = new Set(existingPeriods.map((p) => p.startDate));
  const existingJournalDateMap = new Set(existingJournal.map((j) => j.date));
  const newPeriods: PeriodRecordDTO[] = [];
  const newJournal: JournalEntryDTO[] = [];

  let currentSection = '';

  for (const line of lines) {
    if (line.includes('--- PERIOD LOGS ---')) {
      currentSection = 'periods';
      continue;
    }
    if (line.includes('--- BODY JOURNAL CHECK-INS ---')) {
      currentSection = 'journal';
      continue;
    }

    const cols = parseCsvLine(line);
    if (cols.length === 0) continue;

    const firstCol = cols[0].toLowerCase();
    if (firstCol === 'record type' || firstCol === 'type') continue;

    if (firstCol === 'period' || currentSection === 'periods') {
      const startDate = cols[1] || cols[0];
      if (/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
        if (!existingDateMap.has(startDate)) {
          const endDate = cols[2] && /^\d{4}-\d{2}-\d{2}$/.test(cols[2]) ? cols[2] : null;
          const flow: FlowLevel = ['light', 'medium', 'heavy'].includes(cols[3]?.toLowerCase())
            ? (cols[3].toLowerCase() as FlowLevel)
            : 'medium';
          const symptoms = cols[4] ? cols[4].split(';').map((s) => s.trim()).filter(Boolean) : [];
          const mood = ['happy', 'calm', 'sensitive', 'tired', 'anxious', 'frustrated'].includes(cols[5])
            ? (cols[5] as MoodType)
            : undefined;
          const energy = ['low', 'medium', 'high'].includes(cols[6]) ? (cols[6] as EnergyLevel) : undefined;
          const notes = cols[7] || '';

          newPeriods.push({
            id: `imported_period_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            userId: 'local_user_private',
            startDate,
            endDate,
            flow,
            symptoms,
            mood,
            energy,
            notes,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
          existingDateMap.add(startDate);
        }
      }
    } else if (firstCol === 'journal' || currentSection === 'journal') {
      const entryDate = cols[1] || cols[0];
      if (/^\d{4}-\d{2}-\d{2}$/.test(entryDate)) {
        if (!existingJournalDateMap.has(entryDate)) {
          const mood: MoodType = ['happy', 'calm', 'sensitive', 'tired', 'anxious', 'frustrated'].includes(cols[2])
            ? (cols[2] as MoodType)
            : 'calm';
          const energy: EnergyLevel = ['low', 'medium', 'high'].includes(cols[3]) ? (cols[3] as EnergyLevel) : 'medium';
          const cramps: CrampLevel = ['none', 'mild', 'moderate', 'strong'].includes(cols[4])
            ? (cols[4] as CrampLevel)
            : 'none';
          const symptoms = cols[5] ? cols[5].split(';').map((s) => s.trim()).filter(Boolean) : [];
          const notes = cols[6] || '';

          newJournal.push({
            id: `imported_journal_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            userId: 'local_user_private',
            date: entryDate,
            mood,
            energy,
            cramps,
            symptoms,
            notes,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
          existingJournalDateMap.add(entryDate);
        }
      }
    }
  }

  if (newPeriods.length === 0 && newJournal.length === 0) {
    throw new Error('No valid or new records found in this CSV file to import.');
  }

  const mergedPeriods = [...existingPeriods, ...newPeriods].sort((a, b) => b.startDate.localeCompare(a.startDate));
  const mergedJournal = [...existingJournal, ...newJournal].sort((a, b) => b.date.localeCompare(a.date));

  return {
    periodsAdded: newPeriods.length,
    periodsTotal: mergedPeriods.length,
    journalAdded: newJournal.length,
    journalTotal: mergedJournal.length,
    mergedPeriods,
    mergedJournal
  };
}

// -------------------------------------------------------------
// Delete Everything
// -------------------------------------------------------------
export async function deleteEverythingLocal(): Promise<void> {
  // 1. Clear application localStorage keys
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.startsWith('nurtura_') || key.startsWith('lavender_bloom_'))) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach((k) => localStorage.removeItem(k));

  // 2. Clear sessionStorage
  sessionStorage.clear();

  // 3. Clear application caches if available
  if ('caches' in window) {
    try {
      const cacheNames = await window.caches.keys();
      await Promise.all(cacheNames.map((name) => window.caches.delete(name)));
    } catch {
      // ignore
    }
  }

  // 4. Clear IndexedDB databases related to this app if any exist
  if ('indexedDB' in window && 'databases' in indexedDB) {
    try {
      const dbs = await indexedDB.databases();
      for (const db of dbs) {
        if (db.name && (db.name.includes('nurtura') || db.name.includes('lavender') || db.name.includes('saheli'))) {
          indexedDB.deleteDatabase(db.name);
        }
      }
    } catch {
      // ignore
    }
  }
}

import React, { useState, useRef } from 'react';
import {
  UserProfile,
  AgeBand,
  PeriodStatus,
  PeriodRecordDTO,
  JournalEntryDTO,
  UserProgressSummary
} from '../../../../shared/types/index.js';
import {
  Shield,
  Download,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Unlock,
  User,
  Eye,
  EyeOff,
  Upload,
  FileText,
  FileCode,
  HardDrive,
  AlertCircle
} from 'lucide-react';
import { PetalMascot } from '../../components/mascot/PetalMascot.js';
import {
  isDiscreetModeEnabled,
  setDiscreetMode,
  isPinLockEnabled,
  enablePinLock,
  disablePinLock,
  exportDataAsJson,
  exportDataAsCsv,
  importDataFile,
  deleteEverythingLocal,
  getLocalProfile,
  saveLocalProfile
} from '../../services/privacyStorageService.js';

interface PrivacySettingsViewProps {
  user: UserProfile | null;
  periods: PeriodRecordDTO[];
  journalEntries: JournalEntryDTO[];
  learningProgress: UserProgressSummary;
  onUpdateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  onDataChanged: (updatedPeriods: PeriodRecordDTO[], updatedJournal: JournalEntryDTO[]) => void;
  onDeleteEverything: () => Promise<void>;
  onLogout?: () => void;
  onDiscreetModeToggled: (enabled: boolean) => void;
}

export const PrivacySettingsView: React.FC<PrivacySettingsViewProps> = ({
  user,
  periods,
  journalEntries,
  learningProgress,
  onUpdateProfile,
  onDataChanged,
  onDeleteEverything,
  onLogout,
  onDiscreetModeToggled
}) => {
  // Local profile fallback if no server user
  const effectiveProfile: UserProfile = user || getLocalProfile();

  const [nickname, setNickname] = useState(effectiveProfile.nickname);
  const [ageBand, setAgeBand] = useState<AgeBand>(effectiveProfile.ageBand);
  const [periodStatus, setPeriodStatus] = useState<PeriodStatus>(effectiveProfile.periodStatus);

  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Discreet Mode state
  const [discreetMode, setLocalDiscreetMode] = useState<boolean>(() => isDiscreetModeEnabled());

  // PIN Lock state
  const [pinLockActive, setPinLockActive] = useState<boolean>(() => isPinLockEnabled());
  const [showPinSetupModal, setShowPinSetupModal] = useState(false);
  const [showPinDisableModal, setShowPinDisableModal] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [disablePin, setDisablePin] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [pinProcessing, setPinProcessing] = useState(false);

  // Export states
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);

  // Import states
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // Delete Everything state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // 1. Profile Update Handler
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      if (user) {
        await onUpdateProfile({ nickname, ageBand, periodStatus });
      } else {
        saveLocalProfile({ nickname, ageBand, periodStatus });
      }
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err: any) {
      console.error(err);
    } finally {
      setSavingProfile(false);
    }
  };

  // 2. Discreet Mode Toggle
  const handleToggleDiscreetMode = () => {
    const nextVal = !discreetMode;
    setLocalDiscreetMode(nextVal);
    setDiscreetMode(nextVal);
    onDiscreetModeToggled(nextVal);
  };

  // 3. PIN Lock Enable
  const handleEnablePinLock = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinError(null);

    if (!/^\d{4}$/.test(newPin)) {
      setPinError('PIN must be exactly 4 numeric digits (0–9).');
      return;
    }
    if (newPin !== confirmPin) {
      setPinError('PINs do not match. Please re-enter carefully.');
      return;
    }

    setPinProcessing(true);
    try {
      await enablePinLock(newPin, periods, journalEntries, effectiveProfile);
      setPinLockActive(true);
      setShowPinSetupModal(false);
      setNewPin('');
      setConfirmPin('');
    } catch (err: any) {
      setPinError(err.message || 'Failed to encrypt and enable PIN lock.');
    } finally {
      setPinProcessing(false);
    }
  };

  // 4. PIN Lock Disable
  const handleDisablePinLock = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinError(null);

    if (!/^\d{4}$/.test(disablePin)) {
      setPinError('Please enter your 4-digit PIN.');
      return;
    }

    setPinProcessing(true);
    try {
      const payload = await disablePinLock(disablePin);
      setPinLockActive(false);
      setShowPinDisableModal(false);
      setDisablePin('');
      onDataChanged(payload.periods, payload.journal);
    } catch (err: any) {
      setPinError(err.message || 'Incorrect PIN. Please try again.');
    } finally {
      setPinProcessing(false);
    }
  };

  // 5. Export Handlers
  const handleExportJson = () => {
    exportDataAsJson(periods, journalEntries, effectiveProfile, learningProgress);
    setExportSuccess('JSON data backup downloaded successfully!');
    setTimeout(() => setExportSuccess(null), 4000);
  };

  const handleExportCsv = () => {
    exportDataAsCsv(periods, journalEntries);
    setExportSuccess('CSV records spreadsheet downloaded successfully!');
    setTimeout(() => setExportSuccess(null), 4000);
  };

  // 6. Import Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setImportStatus(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const result = importDataFile(text, file.name, periods, journalEntries);

        onDataChanged(result.mergedPeriods, result.mergedJournal);
        setImportStatus({
          success: true,
          message: `Success! Added ${result.periodsAdded} new period records and ${result.journalAdded} journal check-ins (duplicates skipped). Total: ${result.periodsTotal} periods, ${result.journalTotal} check-ins.`
        });
      } catch (err: any) {
        setImportStatus({
          success: false,
          message: err.message || 'Could not import file. Please check file format.'
        });
      } finally {
        setImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.onerror = () => {
      setImportStatus({ success: false, message: 'Failed to read file from disk.' });
      setImporting(false);
    };
    reader.readAsText(file);
  };

  // 7. Delete Everything Handler
  const handleConfirmDeleteEverything = async () => {
    setDeleting(true);
    try {
      await deleteEverythingLocal();
      setShowDeleteModal(false);
      await onDeleteEverything();
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* 1. LOCAL DATA PRIVACY BANNER */}
      <div className="bloom-card p-6 bg-gradient-to-r from-white to-bloom-light border border-bloom-secondary flex flex-col sm:flex-row items-center gap-5">
        <PetalMascot mood="soothing" size="md" />
        <div className="space-y-1.5 flex-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-1.5 text-[#784E82] text-xs font-bold uppercase tracking-wider">
            <Shield size={14} className="text-[#784E82]" />
            <span>100% On-Device Privacy Guaranteed</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-bloom-plum">
            Your Health Data Belongs Exclusively to You
          </h2>
          <p className="text-xs sm:text-sm text-bloom-dusty leading-relaxed">
            All your period dates, notes, and personal logs are stored locally on your device. No server account is required, no external tracking scripts are loaded, and your records are never shared.
          </p>
          <div className="flex flex-wrap gap-2 pt-1 justify-center sm:justify-start">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
              ✓ 100% Local Storage
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-bloom-secondary/60 text-[#342C40]">
              ✓ No Server Sign-up Required
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-bloom-secondary/60 text-[#342C40]">
              ✓ Zero Analytics / Trackers
            </span>
          </div>
        </div>
      </div>

      {/* 2. DISCREET MODE TOGGLE CARD */}
      <div className="bloom-card p-6 bg-white border border-bloom-border space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {discreetMode ? (
                <EyeOff size={18} className="text-[#784E82]" />
              ) : (
                <Eye size={18} className="text-[#784E82]" />
              )}
              <h3 className="text-base font-bold text-bloom-plum">Discreet Mode</h3>
              <span
                className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                  discreetMode
                    ? 'bg-purple-100 text-purple-900 border border-purple-200'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {discreetMode ? 'Active (Diary Mode)' : 'Standard'}
              </span>
            </div>
            <p className="text-xs text-bloom-dusty leading-relaxed">
              When enabled, the app title changes to <strong>"Diary"</strong> with a neutral notebook icon, and reminder messages display as <strong>"Time to check in"</strong> instead of mentioning menstrual health.
            </p>
          </div>

          {/* Toggle Switch */}
          <button
            type="button"
            role="switch"
            aria-checked={discreetMode}
            onClick={handleToggleDiscreetMode}
            className={`relative inline-flex h-7 w-13 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              discreetMode ? 'bg-[#784E82]' : 'bg-gray-200'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                discreetMode ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {discreetMode && (
          <div className="p-3 bg-[#FAF6FC] border border-[#E8DCF0] rounded-xl text-xs text-[#784E82] flex items-center gap-2">
            <CheckCircle2 size={16} className="text-[#784E82] shrink-0" />
            <span>Discreet mode is active: Interface is disguised as "Diary" with neutral reminder wording.</span>
          </div>
        )}
      </div>

      {/* 3. OPTIONAL 4-DIGIT PIN LOCK (WEB CRYPTO AES-GCM) */}
      <div className="bloom-card p-6 bg-white border border-bloom-border space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {pinLockActive ? (
                <Lock size={18} className="text-emerald-600" />
              ) : (
                <Unlock size={18} className="text-[#784E82]" />
              )}
              <h3 className="text-base font-bold text-bloom-plum">4-Digit PIN Lock &amp; Encryption</h3>
              <span
                className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                  pinLockActive
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {pinLockActive ? 'Locked & Encrypted (AES-GCM)' : 'Disabled'}
              </span>
            </div>
            <p className="text-xs text-bloom-dusty leading-relaxed">
              Encrypt your stored records on this device using military-grade <strong>AES-GCM 256-bit encryption</strong> derived from your 4-digit PIN using PBKDF2 with a random salt. The PIN itself is never saved.
            </p>
          </div>

          <div>
            {pinLockActive ? (
              <button
                type="button"
                onClick={() => {
                  setPinError(null);
                  setDisablePin('');
                  setShowPinDisableModal(true);
                }}
                className="py-2 px-4 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition"
              >
                Disable PIN Lock
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setPinError(null);
                  setNewPin('');
                  setConfirmPin('');
                  setShowPinSetupModal(true);
                }}
                className="btn-primary py-2 px-4 text-xs rounded-xl shadow-none"
              >
                Set 4-Digit PIN
              </button>
            )}
          </div>
        </div>

        {pinLockActive && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-700 shrink-0" />
            <span>Vault encryption active. Your records are protected by your 4-digit PIN.</span>
          </div>
        )}
      </div>

      {/* 4. EXPORT DATA (JSON & CSV) */}
      <div className="bloom-card p-6 bg-white border border-bloom-border space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-bloom-border">
          <Download size={18} className="text-[#784E82]" />
          <h3 className="text-base font-bold text-bloom-plum">Export Your Data</h3>
        </div>

        <p className="text-xs text-bloom-dusty leading-relaxed">
          Download a complete copy of your genuine records. You can save this backup to your computer or use it to transfer your history to another device. No demo data is included.
        </p>

        {exportSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600" />
            <span>{exportSuccess}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* JSON Export */}
          <div className="p-4 rounded-2xl bg-bloom-light border border-bloom-border flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <FileCode size={16} className="text-[#784E82]" />
                <h4 className="font-bold text-xs sm:text-sm text-bloom-plum">Export JSON Backup</h4>
              </div>
              <p className="text-[11px] text-bloom-dusty">
                Full structured data file including periods, body journal entries, and progress. Recommended for full backups.
              </p>
            </div>
            <button
              type="button"
              onClick={handleExportJson}
              className="btn-secondary py-2 px-3 text-xs rounded-xl w-full flex items-center justify-center gap-2 shadow-none"
            >
              <Download size={14} />
              <span>Download .JSON</span>
            </button>
          </div>

          {/* CSV Export */}
          <div className="p-4 rounded-2xl bg-bloom-light border border-bloom-border flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <FileText size={16} className="text-[#784E82]" />
                <h4 className="font-bold text-xs sm:text-sm text-bloom-plum">Export CSV Spreadsheet</h4>
              </div>
              <p className="text-[11px] text-bloom-dusty">
                Human-readable table format compatible with Microsoft Excel, Google Sheets, or Apple Numbers.
              </p>
            </div>
            <button
              type="button"
              onClick={handleExportCsv}
              className="btn-secondary py-2 px-3 text-xs rounded-xl w-full flex items-center justify-center gap-2 shadow-none"
            >
              <Download size={14} />
              <span>Download .CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5. IMPORT DATA (JSON & CSV) */}
      <div className="bloom-card p-6 bg-white border border-bloom-border space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-bloom-border">
          <Upload size={18} className="text-[#784E82]" />
          <h3 className="text-base font-bold text-bloom-plum">Import Previous Records</h3>
        </div>

        <p className="text-xs text-bloom-dusty leading-relaxed">
          Restore records from a previously exported <strong>.json</strong> or <strong>.csv</strong> file. Imported records are safely merged with your existing history without creating duplicates or overwriting existing entries.
        </p>

        {importStatus && (
          <div
            className={`p-3.5 rounded-xl text-xs flex items-center gap-2 ${
              importStatus.success
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border border-rose-200 text-rose-800'
            }`}
          >
            {importStatus.success ? (
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle size={16} className="text-rose-600 shrink-0" />
            )}
            <span>{importStatus.message}</span>
          </div>
        )}

        <div className="flex items-center gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".json,.csv,text/csv,application/json"
            className="hidden"
            id="nurtura-import-input"
          />
          <button
            type="button"
            disabled={importing}
            onClick={() => fileInputRef.current?.click()}
            className="btn-primary py-2.5 px-5 text-xs rounded-xl flex items-center gap-2 shadow-none cursor-pointer"
          >
            <Upload size={14} />
            <span>{importing ? 'Validating & Merging...' : 'Choose File (.json or .csv)'}</span>
          </button>
          <span className="text-[11px] text-bloom-dusty">
            Supports Nurtura JSON backups &amp; CSV logs
          </span>
        </div>
      </div>

      {/* 6. PROFILE INFORMATION (LOCAL / SERVER) */}
      <div className="bloom-card p-6 bg-white border border-bloom-border space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-bloom-border">
          <User size={18} className="text-[#784E82]" />
          <h3 className="text-base font-bold text-bloom-plum">Profile Preferences</h3>
        </div>

        {profileSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600" />
            <span>Profile preferences saved!</span>
          </div>
        )}

        <form onSubmit={handleProfileSubmit} className="space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block font-bold text-bloom-plum mb-1.5">
              Friendly Nickname
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="e.g. Maya, PetalLover, StarGazer"
              className="w-full sm:w-80 px-3.5 py-2 bg-bloom-bg border border-bloom-border rounded-xl text-bloom-plum focus:outline-none focus:border-[#784E82]"
            />
            <p className="text-[11px] text-bloom-dusty mt-1">
              Used only to greet you warmly on screen. Never your full legal name.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-bloom-plum mb-1.5">
                Age Band
              </label>
              <select
                value={ageBand}
                onChange={(e) => setAgeBand(e.target.value as AgeBand)}
                className="w-full px-3.5 py-2 bg-bloom-bg border border-bloom-border rounded-xl text-bloom-plum font-semibold focus:outline-none focus:border-[#784E82]"
              >
                <option value="10-12">10 – 12 years old</option>
                <option value="13-14">13 – 14 years old</option>
                <option value="15-16">15 – 16 years old</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-bloom-plum mb-1.5">
                Period Status
              </label>
              <select
                value={periodStatus}
                onChange={(e) => setPeriodStatus(e.target.value as PeriodStatus)}
                className="w-full px-3.5 py-2 bg-bloom-bg border border-bloom-border rounded-xl text-bloom-plum font-semibold focus:outline-none focus:border-[#784E82]"
              >
                <option value="not_started">Haven't started periods yet</option>
                <option value="started_recently">Started recently (within last year)</option>
                <option value="tracking_regularly">Tracking regularly</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={savingProfile}
            className="btn-primary py-2 px-5 text-xs rounded-xl shadow-none"
          >
            {savingProfile ? 'Updating...' : 'Save Profile Changes'}
          </button>
        </form>
      </div>

      {/* 7. DELETE EVERYTHING (WIPE LOCAL DATA) */}
      <div className="bloom-card p-6 bg-white border border-rose-200 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-rose-950 flex items-center gap-2">
              <Trash2 size={18} className="text-rose-600" />
              <span>Delete Everything</span>
            </h3>
            <p className="text-xs text-bloom-dusty leading-relaxed">
              Permanently wipe all locally stored application data, including your period records, body journal entries, PIN-lock encryption keys, learning badges, and cached settings.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition shrink-0"
          >
            Delete Everything
          </button>
        </div>
      </div>

      {/* Sign Out Option (if logged in with an account) */}
      {user && onLogout && (
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={onLogout}
            className="py-2 px-5 rounded-xl text-xs font-bold text-bloom-dusty hover:bg-bloom-bg border border-bloom-border flex items-center gap-2 transition"
          >
            <span>Sign Out of Account</span>
          </button>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* MODAL 1: PIN SETUP MODAL */}
      {/* ------------------------------------------------------------------- */}
      {showPinSetupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bloom-plum/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl border border-[#D7C4E8] shadow-bloomHover max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-bloom-secondary/60 text-[#784E82] flex items-center justify-center shrink-0">
                <Lock size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-bloom-plum">Enable 4-Digit PIN Lock</h3>
                <p className="text-xs text-bloom-dusty">AES-GCM 256-bit Web Crypto Encryption</p>
              </div>
            </div>

            {/* MANDATORY WARNING BANNER */}
            <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-2xl space-y-1.5 text-xs text-amber-950">
              <div className="flex items-center gap-1.5 font-bold text-amber-900">
                <AlertTriangle size={15} className="text-amber-600 shrink-0" />
                <span>Important Safety Warning</span>
              </div>
              <p className="font-semibold text-amber-900">
                "If you forget your PIN, it cannot be recovered."
              </p>
              <p className="text-amber-800 text-[11px] leading-relaxed">
                Because your records are encrypted directly with the key derived from your PIN, there is no backdoor or reset link.
              </p>
            </div>

            {/* RECOMMENDED EXPORT OPTION */}
            <div className="p-3 bg-bloom-light border border-bloom-border rounded-xl flex items-center justify-between gap-3 text-xs">
              <span className="text-bloom-dusty">Protect yourself by taking a backup now:</span>
              <button
                type="button"
                onClick={handleExportJson}
                className="py-1.5 px-3 rounded-lg bg-white border border-bloom-border text-[#784E82] font-bold text-xs hover:bg-bloom-secondary/30 transition shrink-0"
              >
                Export Data First
              </button>
            </div>

            {/* Error Message */}
            {pinError && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold flex items-center gap-1.5">
                <AlertCircle size={15} className="shrink-0" />
                <span>{pinError}</span>
              </div>
            )}

            <form onSubmit={handleEnablePinLock} className="space-y-3.5 pt-1">
              <div>
                <label className="block text-xs font-bold text-bloom-plum mb-1">
                  Choose 4-Digit PIN
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="••••"
                  autoFocus
                  className="w-full text-center tracking-[1em] text-xl font-bold px-4 py-2.5 bg-bloom-bg border border-bloom-border rounded-xl text-bloom-plum focus:outline-none focus:border-[#784E82]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-bloom-plum mb-1">
                  Confirm 4-Digit PIN
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="••••"
                  className="w-full text-center tracking-[1em] text-xl font-bold px-4 py-2.5 bg-bloom-bg border border-bloom-border rounded-xl text-bloom-plum focus:outline-none focus:border-[#784E82]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPinSetupModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-bloom-dusty hover:bg-bloom-bg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={pinProcessing || newPin.length !== 4 || confirmPin.length !== 4}
                  className="btn-primary py-2 px-5 text-xs rounded-xl shadow-none"
                >
                  {pinProcessing ? 'Encrypting Vault...' : 'Enable PIN Lock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* MODAL 2: PIN DISABLE MODAL */}
      {/* ------------------------------------------------------------------- */}
      {showPinDisableModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bloom-plum/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl border border-[#D7C4E8] shadow-bloomHover max-w-sm w-full p-6 space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-bloom-secondary/60 text-[#784E82] flex items-center justify-center mx-auto">
              <Unlock size={22} />
            </div>

            <div>
              <h3 className="text-lg font-bold text-bloom-plum">Disable PIN Lock</h3>
              <p className="text-xs text-bloom-dusty mt-1">
                Enter your current 4-digit PIN to decrypt your records and store them normally.
              </p>
            </div>

            {pinError && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold flex items-center justify-center gap-1.5">
                <AlertCircle size={15} className="shrink-0" />
                <span>{pinError}</span>
              </div>
            )}

            <form onSubmit={handleDisablePinLock} className="space-y-4">
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={disablePin}
                onChange={(e) => setDisablePin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="••••"
                autoFocus
                className="w-full text-center tracking-[1em] text-xl font-bold px-4 py-2.5 bg-bloom-bg border border-bloom-border rounded-xl text-bloom-plum focus:outline-none focus:border-[#784E82]"
              />

              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowPinDisableModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-bloom-dusty hover:bg-bloom-bg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={pinProcessing || disablePin.length !== 4}
                  className="py-2 px-5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition"
                >
                  {pinProcessing ? 'Decrypting...' : 'Confirm & Disable'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* MODAL 3: DELETE EVERYTHING CONFIRMATION */}
      {/* ------------------------------------------------------------------- */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bloom-plum/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl border border-rose-200 shadow-bloomHover max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center shrink-0">
                <AlertTriangle size={20} />
              </div>
              <h3 className="text-lg font-bold text-rose-950">Delete everything?</h3>
            </div>

            <p className="text-xs sm:text-sm text-bloom-dusty leading-relaxed">
              This action cannot be undone. All your locally saved period logs, cycle predictions, body journal entries, encrypted PIN vault, and preferences will be permanently wiped from this browser.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-bloom-dusty hover:bg-bloom-bg transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleConfirmDeleteEverything}
                className="py-2.5 px-5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition"
              >
                {deleting ? 'Wiping All Data...' : 'Yes, Delete Everything'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

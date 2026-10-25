import React, { useState, useEffect } from 'react';
import { PeriodRecordDTO, FlowLevel, MoodType, EnergyLevel } from '../../../../shared/types/index.js';
import { X, Droplet, Sparkles, AlertCircle, Trash2, CheckCircle2 } from 'lucide-react';

interface LogPeriodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: any) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  initialRecord?: PeriodRecordDTO | null;
  defaultStartDate?: string;
}

export const LogPeriodModal: React.FC<LogPeriodModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialRecord,
  defaultStartDate
}) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [flow, setFlow] = useState<FlowLevel>('medium');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [mood, setMood] = useState<MoodType | ''>('');
  const [energy, setEnergy] = useState<EnergyLevel | ''>('');
  const [notes, setNotes] = useState('');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (initialRecord) {
      setStartDate(initialRecord.startDate);
      setEndDate(initialRecord.endDate || '');
      setFlow(initialRecord.flow);
      setSelectedSymptoms(initialRecord.symptoms || []);
      setMood(initialRecord.mood || '');
      setEnergy(initialRecord.energy || '');
      setNotes(initialRecord.notes || '');
    } else {
      const today = new Date().toISOString().split('T')[0];
      setStartDate(defaultStartDate || today);
      setEndDate('');
      setFlow('medium');
      setSelectedSymptoms([]);
      setMood('');
      setEnergy('');
      setNotes('');
    }
    setError(null);
    setShowDeleteConfirm(false);
  }, [initialRecord, defaultStartDate, isOpen]);

  if (!isOpen) return null;

  const symptomOptions = [
    'Mild cramps',
    'Bloating',
    'Headache',
    'Backache',
    'Tender breasts',
    'Fatigue / Tiredness',
    'Skin breakouts',
    'Cravings'
  ];

  const moodOptions: { type: MoodType; label: string; emoji: string }[] = [
    { type: 'happy', label: 'Happy', emoji: '😊' },
    { type: 'calm', label: 'Calm', emoji: '😌' },
    { type: 'sensitive', label: 'Sensitive', emoji: '🥺' },
    { type: 'tired', label: 'Tired', emoji: '😴' },
    { type: 'anxious', label: 'Anxious', emoji: '😟' },
    { type: 'frustrated', label: 'Grumpy', emoji: '😤' }
  ];

  const energyOptions: { level: EnergyLevel; label: string }[] = [
    { level: 'low', label: 'Low 🛋️' },
    { level: 'medium', label: 'Normal 🚶' },
    { level: 'high', label: 'High ⚡' }
  ];

  const toggleSymptom = (sym: string) => {
    if (selectedSymptoms.includes(sym)) {
      setSelectedSymptoms(selectedSymptoms.filter((s) => s !== sym));
    } else {
      setSelectedSymptoms([...selectedSymptoms, sym]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!startDate) {
      setError('Please choose a start date.');
      return;
    }

    if (endDate && endDate < startDate) {
      setError('End date cannot be earlier than start date.');
      return;
    }

    try {
      setSaving(true);
      await onSave({
        startDate,
        endDate: endDate || null,
        flow,
        symptoms: selectedSymptoms,
        mood: mood || undefined,
        energy: energy || undefined,
        notes: notes.trim() || undefined
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Could not save your period log. Please check your connection and try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!initialRecord || !onDelete) return;
    try {
      setDeleting(true);
      await onDelete(initialRecord.id);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to delete period entry.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bloom-plum/50 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl border border-bloom-secondary shadow-bloomHover w-full max-w-lg my-8 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-bloom-border flex items-center justify-between bg-bloom-bg/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E26D7D] text-white flex items-center justify-center shadow-sm">
              <Droplet size={20} className="fill-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-bloom-plum">
                {initialRecord ? 'Edit Period Entry' : 'Log Your Period'}
              </h2>
              <p className="text-xs text-bloom-dusty">
                {initialRecord ? 'Update dates, flow, or symptoms' : 'Record your start date now; add end date later'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white hover:bg-bloom-secondary/40 text-bloom-dusty hover:text-bloom-plum flex items-center justify-center transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mx-5 mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700">
            <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-500" />
            <div>
              <p className="font-bold">Check details:</p>
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Dates Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-bloom-plum mb-1.5">
                Period Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 bg-bloom-bg border border-bloom-border rounded-xl text-sm focus:outline-none focus:border-bloom-dusty text-bloom-plum font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-bloom-plum mb-1.5">
                Period End Date <span className="text-bloom-dusty font-normal">(optional)</span>
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 bg-bloom-bg border border-bloom-border rounded-xl text-sm focus:outline-none focus:border-bloom-dusty text-bloom-plum font-semibold"
              />
              <p className="text-[10px] text-bloom-dusty mt-1">Leave blank if still ongoing</p>
            </div>
          </div>

          {/* Flow Level */}
          <div>
            <label className="block text-xs font-bold text-bloom-plum mb-1.5">
              Flow Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['light', 'medium', 'heavy'] as FlowLevel[]).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFlow(f)}
                  className={`py-2 rounded-xl text-xs font-bold capitalize transition flex items-center justify-center gap-1.5 ${
                    flow === f
                      ? 'bg-bloom-mauve text-white shadow-sm'
                      : 'bg-bloom-bg text-bloom-dusty hover:bg-bloom-secondary/30'
                  }`}
                >
                  <span className="text-sm">
                    {f === 'light' ? '💧' : f === 'medium' ? '💧💧' : '💧💧💧'}
                  </span>
                  <span>{f}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Symptoms Checklist */}
          <div>
            <label className="block text-xs font-bold text-bloom-plum mb-1.5">
              Optional Symptoms
            </label>
            <div className="flex flex-wrap gap-1.5">
              {symptomOptions.map((sym) => {
                const isSelected = selectedSymptoms.includes(sym);
                return (
                  <button
                    key={sym}
                    type="button"
                    onClick={() => toggleSymptom(sym)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                      isSelected
                        ? 'bg-bloom-secondary text-bloom-plum font-bold border border-bloom-mauve shadow-sm'
                        : 'bg-bloom-bg text-bloom-dusty hover:bg-bloom-secondary/20 border border-transparent'
                    }`}
                  >
                    {isSelected && <span className="mr-1">✓</span>}
                    {sym}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mood & Energy */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-bold text-bloom-plum mb-1.5">
                How did you feel emotionally?
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {moodOptions.map((m) => (
                  <button
                    key={m.type}
                    type="button"
                    onClick={() => setMood(mood === m.type ? '' : m.type)}
                    className={`p-1.5 rounded-xl text-[11px] font-bold flex flex-col items-center gap-0.5 transition ${
                      mood === m.type
                        ? 'bg-bloom-mauve text-white shadow-sm'
                        : 'bg-bloom-bg text-bloom-dusty hover:bg-bloom-secondary/30'
                    }`}
                  >
                    <span className="text-base">{m.emoji}</span>
                    <span>{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-bloom-plum mb-1.5">
                Energy Level
              </label>
              <div className="space-y-1.5">
                {energyOptions.map((e) => (
                  <button
                    key={e.level}
                    type="button"
                    onClick={() => setEnergy(energy === e.level ? '' : e.level)}
                    className={`w-full py-1.5 px-3 rounded-xl text-xs font-bold text-left transition flex items-center justify-between ${
                      energy === e.level
                        ? 'bg-bloom-secondary text-bloom-plum border border-bloom-mauve font-bold'
                        : 'bg-bloom-bg text-bloom-dusty hover:bg-bloom-secondary/30'
                    }`}
                  >
                    <span>{e.label}</span>
                    {energy === e.level && <CheckCircle2 size={14} className="text-bloom-dusty" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-bloom-plum mb-1.5">
              Private Notes <span className="text-bloom-dusty font-normal">(only you can see this)</span>
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="E.g. Drank peppermint tea, had PE class, felt cozy with heat pack..."
              className="w-full px-3 py-2 bg-bloom-bg border border-bloom-border rounded-xl text-xs focus:outline-none focus:border-bloom-dusty text-bloom-plum"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-bloom-border flex items-center justify-between gap-3">
            {initialRecord && onDelete && (
              <div>
                {!showDeleteConfirm ? (
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="text-xs text-red-500 hover:text-red-700 font-bold flex items-center gap-1 px-2.5 py-1.5 rounded-xl hover:bg-red-50 transition"
                  >
                    <Trash2 size={14} />
                    <span>Delete</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={deleting}
                      onClick={handleDelete}
                      className="text-xs bg-red-600 text-white font-bold px-2.5 py-1.5 rounded-xl hover:bg-red-700 transition"
                    >
                      {deleting ? 'Deleting...' : 'Confirm Delete?'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="text-xs text-bloom-dusty px-2 py-1.5"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-bold text-bloom-dusty hover:bg-bloom-bg transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="btn-primary py-2 px-5 text-xs rounded-xl shadow-none"
              >
                {saving ? (
                  <span>Saving to Database...</span>
                ) : (
                  <>
                    <Droplet size={14} />
                    <span>Save Period Entry</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { JournalEntryDTO, MoodType, EnergyLevel, CrampLevel } from '../../../../shared/types/index.js';
import { Lock, Heart, Calendar, Trash2, Check, Sparkles, AlertCircle, Edit2 } from 'lucide-react';
import { PetalMascot } from '../../components/mascot/PetalMascot.js';

interface BodyJournalViewProps {
  entries: JournalEntryDTO[];
  onSaveEntry: (payload: any) => Promise<void>;
  onDeleteEntry: (id: string) => Promise<void>;
}

export const BodyJournalView: React.FC<BodyJournalViewProps> = ({
  entries,
  onSaveEntry,
  onDeleteEntry
}) => {
  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const [mood, setMood] = useState<MoodType>('calm');
  const [energy, setEnergy] = useState<EnergyLevel>('medium');
  const [cramps, setCramps] = useState<CrampLevel>('none');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if entry exists for selected date
  const existingForDate = entries.find((e) => e.date === selectedDate);

  useEffect(() => {
    if (existingForDate) {
      setMood(existingForDate.mood);
      setEnergy(existingForDate.energy);
      setCramps(existingForDate.cramps);
      setSelectedSymptoms(existingForDate.symptoms || []);
      setNotes(existingForDate.notes || '');
    } else {
      setMood('calm');
      setEnergy('medium');
      setCramps('none');
      setSelectedSymptoms([]);
      setNotes('');
    }
    setSaveSuccess(false);
    setError(null);
  }, [selectedDate, existingForDate]);

  const moods: { type: MoodType; label: string; emoji: string }[] = [
    { type: 'happy', label: 'Happy', emoji: '😊' },
    { type: 'calm', label: 'Calm', emoji: '😌' },
    { type: 'sensitive', label: 'Emotional', emoji: '🥺' },
    { type: 'tired', label: 'Tired', emoji: '😴' },
    { type: 'anxious', label: 'Anxious', emoji: '😟' },
    { type: 'frustrated', label: 'Irritable', emoji: '😤' }
  ];

  const energies: { level: EnergyLevel; label: string }[] = [
    { level: 'low', label: 'Low / Need Rest 🛋️' },
    { level: 'medium', label: 'Normal / Balanced 🚶' },
    { level: 'high', label: 'Energetic / Playful ⚡' }
  ];

  const crampsLevels: { level: CrampLevel; label: string; desc: string }[] = [
    { level: 'none', label: 'None', desc: 'Feeling totally relaxed' },
    { level: 'mild', label: 'Mild', desc: 'Slight tummy tightness' },
    { level: 'moderate', label: 'Moderate', desc: 'Need a warm heat pack' },
    { level: 'strong', label: 'Strong', desc: 'Need bed rest or adult help' }
  ];

  const symptomList = [
    'Lower back pain',
    'Headache',
    'Tender breasts',
    'Bloating',
    'Clear discharge',
    'Skin breakouts',
    'Sweet cravings',
    'Restless sleep'
  ];

  const toggleSymptom = (sym: string) => {
    if (selectedSymptoms.includes(sym)) {
      setSelectedSymptoms(selectedSymptoms.filter((s) => s !== sym));
    } else {
      setSelectedSymptoms([...selectedSymptoms, sym]);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaveSuccess(false);

    try {
      setSaving(true);
      await onSaveEntry({
        date: selectedDate,
        mood,
        energy,
        cramps,
        symptoms: selectedSymptoms,
        notes: notes.trim() || undefined
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      setError(err?.message || 'Could not save journal entry.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Private Notice Banner */}
      <div className="bloom-card p-6 bg-gradient-to-r from-white to-bloom-light border border-bloom-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <img
            src="/illustrations/girl-teddy.png"
            alt="Gentle comfort and care"
            className="w-14 h-16 sm:w-16 sm:h-20 object-contain drop-shadow-xs shrink-0"
          />
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-7 h-7 rounded-lg bg-bloom-mauve text-white flex items-center justify-center">
                <Heart size={16} />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-bloom-dusty">
                Private Daily Check-In
              </span>
            </div>
            <h2 className="text-2xl font-bold text-bloom-plum">My Body Journal</h2>
            <p className="text-xs sm:text-sm text-bloom-dusty mt-0.5">
              Check in whenever you like — no need to log every single day!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white border border-bloom-border shadow-sm text-xs font-semibold text-bloom-dusty">
          <Lock size={14} className="text-bloom-mauve shrink-0" />
          <span>Strictly Private: Only your account can view these notes</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Entry Form */}
        <div className="lg:col-span-2 bloom-card p-6 bg-white border border-bloom-border space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-bloom-border">
            <div>
              <h3 className="text-lg font-bold text-bloom-plum">
                {existingForDate ? 'Edit Journal Entry' : 'New Check-In'}
              </h3>
              <p className="text-xs text-bloom-dusty">Select date and share how your body feels</p>
            </div>

            <div className="flex items-center gap-2">
              <Calendar size={15} className="text-bloom-dusty" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-1.5 bg-bloom-bg border border-bloom-border rounded-xl text-xs font-bold text-bloom-plum focus:outline-none focus:border-bloom-dusty"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
              <AlertCircle size={16} className="text-red-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {saveSuccess && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 animate-fade-in">
              <PetalMascot imageSrc="/illustrations/girl-teddy.png" size="sm" />
              <div className="text-xs text-emerald-900">
                <p className="font-bold">Saved safely!</p>
                <p>Your private check-in has been stored in your personal vault.</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4">
            {/* Mood Selector */}
            <div>
              <label className="block text-xs font-bold text-bloom-plum mb-2">
                1. How is your mood today?
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {moods.map((m) => (
                  <button
                    key={m.type}
                    type="button"
                    onClick={() => setMood(m.type)}
                    className={`py-2 px-1 rounded-2xl text-xs font-bold flex flex-col items-center gap-1 transition ${
                      mood === m.type
                        ? 'bg-bloom-mauve text-white shadow-sm ring-2 ring-bloom-plum/20'
                        : 'bg-bloom-bg text-bloom-dusty hover:bg-bloom-secondary/30'
                    }`}
                  >
                    <span className="text-xl">{m.emoji}</span>
                    <span className="text-[11px]">{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Energy Level */}
            <div>
              <label className="block text-xs font-bold text-bloom-plum mb-2">
                2. Energy Level
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {energies.map((e) => (
                  <button
                    key={e.level}
                    type="button"
                    onClick={() => setEnergy(e.level)}
                    className={`p-2.5 rounded-2xl text-xs font-bold transition text-center ${
                      energy === e.level
                        ? 'bg-bloom-secondary text-bloom-plum border border-bloom-mauve shadow-sm'
                        : 'bg-bloom-bg text-bloom-dusty hover:bg-bloom-secondary/30'
                    }`}
                  >
                    {e.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Cramps or Discomfort */}
            <div>
              <label className="block text-xs font-bold text-bloom-plum mb-2">
                3. Cramps or Tummy Discomfort
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {crampsLevels.map((c) => (
                  <button
                    key={c.level}
                    type="button"
                    onClick={() => setCramps(c.level)}
                    className={`p-2.5 rounded-2xl text-xs transition text-left flex flex-col justify-between ${
                      cramps === c.level
                        ? 'bg-bloom-secondary text-bloom-plum border border-bloom-mauve font-bold shadow-sm'
                        : 'bg-bloom-bg text-bloom-dusty hover:bg-bloom-secondary/30'
                    }`}
                  >
                    <span className="font-bold text-xs">{c.label}</span>
                    <span className="text-[10px] opacity-80 mt-1">{c.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Symptoms Tags */}
            <div>
              <label className="block text-xs font-bold text-bloom-plum mb-2">
                4. Notice any other body sensations? (Optional)
              </label>
              <div className="flex flex-wrap gap-1.5">
                {symptomList.map((sym) => {
                  const isSel = selectedSymptoms.includes(sym);
                  return (
                    <button
                      key={sym}
                      type="button"
                      onClick={() => toggleSymptom(sym)}
                      className={`px-3 py-1.5 rounded-xl text-xs transition ${
                        isSel
                          ? 'bg-bloom-secondary text-bloom-plum font-bold border border-bloom-mauve'
                          : 'bg-bloom-bg text-bloom-dusty hover:bg-bloom-secondary/20'
                      }`}
                    >
                      {isSel && '✓ '}
                      {sym}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Private Notes */}
            <div>
              <label className="block text-xs font-bold text-bloom-plum mb-1.5">
                5. Private Thoughts & Self-Care Reflections
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="How was school? Did you take time to rest? Write anything you like..."
                className="w-full p-3 bg-bloom-bg border border-bloom-border rounded-2xl text-xs sm:text-sm text-bloom-plum focus:outline-none focus:border-bloom-dusty leading-relaxed"
              />
            </div>

            <div className="pt-2 flex items-center justify-between">
              <span className="text-[11px] text-bloom-dusty">
                🛡️ Entries are never used to diagnose medical conditions.
              </span>

              <button
                type="submit"
                disabled={saving}
                className="btn-primary py-2.5 px-6 rounded-xl text-xs font-bold shadow-none"
              >
                {saving ? 'Saving...' : 'Save Check-In'}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Previous Journal Entries List */}
        <div className="bloom-card p-5 bg-white border border-bloom-border space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-bloom-border">
            <h3 className="font-bold text-bloom-plum text-sm">Past Check-Ins</h3>
            <span className="text-xs text-bloom-dusty">{entries.length} logged</span>
          </div>

          {entries.length === 0 ? (
            <div className="py-10 text-center text-bloom-dusty space-y-3 flex flex-col items-center">
              <img
                src="/illustrations/girl-music.png"
                alt="Relaxing check-in"
                className="w-20 h-24 object-contain drop-shadow-xs"
              />
              <p className="text-xs font-semibold text-bloom-plum">No journal entries yet</p>
              <p className="text-[11px] max-w-xs mx-auto leading-relaxed">
                Fill in the form on the left to record your very first body check-in!
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className={`p-3.5 rounded-2xl border transition text-xs space-y-2 ${
                    entry.date === selectedDate
                      ? 'bg-bloom-secondary/30 border-bloom-mauve ring-1 ring-bloom-mauve'
                      : 'bg-bloom-light border-bloom-border hover:border-bloom-secondary'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setSelectedDate(entry.date)}
                      className="font-bold text-bloom-plum hover:underline text-left flex items-center gap-1.5"
                    >
                      <Calendar size={13} className="text-bloom-mauve" />
                      <span>{entry.date}</span>
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setSelectedDate(entry.date)}
                        className="p-1 text-bloom-dusty hover:text-bloom-plum"
                        title="Edit entry"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteEntry(entry.id)}
                        className="p-1 text-bloom-dusty hover:text-red-600"
                        title="Delete entry"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 text-[11px] text-bloom-dusty">
                    <span>Mood: <strong>{entry.mood}</strong></span>
                    <span>•</span>
                    <span>Energy: <strong>{entry.energy}</strong></span>
                    <span>•</span>
                    <span>Cramps: <strong>{entry.cramps}</strong></span>
                  </div>

                  {entry.notes && (
                    <p className="text-[11px] italic text-bloom-dusty bg-white/70 p-2 rounded-xl border border-bloom-border/60">
                      "{entry.notes}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Gentle Self-Care Reminder Note */}
          <div className="pt-2 border-t border-bloom-border/60">
            <div className="p-3.5 rounded-2xl bg-[#F5EFF8] border border-[#D7C4E8] flex items-center gap-3">
              <img
                src="/illustrations/reminder-note.png"
                alt="Self-care reminder note"
                className="w-14 h-auto object-contain shrink-0 drop-shadow-xs"
              />
              <div className="text-[11px] text-[#765477] leading-relaxed">
                <strong className="text-[#342C40] block font-bold mb-0.5">Gentle Self-Care Note</strong>
                Rest your body with a warm drink or your favourite music whenever you feel tired.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

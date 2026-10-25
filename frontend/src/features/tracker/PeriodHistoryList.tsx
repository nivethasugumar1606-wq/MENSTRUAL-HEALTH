import React from 'react';
import { PeriodRecordDTO } from '../../../../shared/types/index.js';
import { Droplet, Calendar, Edit3, Trash2, Clock } from 'lucide-react';

interface PeriodHistoryListProps {
  periods: PeriodRecordDTO[];
  onEdit: (period: PeriodRecordDTO) => void;
  onDelete: (id: string) => void;
  onOpenLogModal?: () => void;
}

export const PeriodHistoryList: React.FC<PeriodHistoryListProps> = ({
  periods,
  onEdit,
  onDelete,
  onOpenLogModal
}) => {
  if (periods.length === 0) {
    return (
      <div className="bloom-card p-6 text-center bg-white border border-bloom-border flex flex-col items-center">
        <img
          src="/illustrations/girl-sleeping.png"
          alt="Gentle rest and care"
          className="w-28 sm:w-32 h-auto object-contain mb-3 drop-shadow-xs"
        />
        <h3 className="font-bold text-bloom-plum text-base">No period history logged yet</h3>
        <p className="text-xs text-bloom-dusty mt-1 max-w-sm mx-auto leading-relaxed">
          When you click "Log Period" and save your dates, your past cycles and flow history will appear right here. Take your time!
        </p>
        {onOpenLogModal && (
          <button
            onClick={onOpenLogModal}
            className="btn-primary py-2 px-4 text-xs rounded-xl shadow-none mt-3"
          >
            <Droplet size={13} />
            <span>Log Your First Period</span>
          </button>
        )}
      </div>
    );
  }

  // Calculate duration in days between start and end
  const getDurationDays = (start: string, end: string | null): string => {
    if (!end) return 'Ongoing';
    const [y1, m1, d1] = start.split('-').map(Number);
    const [y2, m2, d2] = end.split('-').map(Number);
    const ms1 = Date.UTC(y1, m1 - 1, d1);
    const ms2 = Date.UTC(y2, m2 - 1, d2);
    const days = Math.round((ms2 - ms1) / (1000 * 60 * 60 * 24)) + 1;
    return `${days} days`;
  };

  return (
    <div className="bloom-card p-5 sm:p-6 bg-white space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-bloom-border">
        <div>
          <h3 className="text-lg font-bold text-bloom-plum">Past Period History</h3>
          <p className="text-xs text-bloom-dusty">
            {periods.length} recorded cycle{periods.length > 1 ? 's' : ''} in total
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {periods.map((item) => (
          <div
            key={item.id}
            className="p-4 rounded-2xl bg-bloom-light border border-bloom-border hover:border-bloom-secondary transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
          >
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-bloom-plum text-sm sm:text-base">
                  {item.startDate} {item.endDate ? `to ${item.endDate}` : '(ongoing)'}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#9B68A6]/20 text-[#834E8F] border border-[#9B68A6]/30">
                  {item.flow} flow
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-bloom-dusty">
                <span className="flex items-center gap-1 font-semibold">
                  <Clock size={12} className="text-bloom-mauve" />
                  Duration: {getDurationDays(item.startDate, item.endDate)}
                </span>
                {item.mood && <span>Mood: {item.mood}</span>}
                {item.energy && <span>Energy: {item.energy}</span>}
              </div>

              {item.symptoms && item.symptoms.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {item.symptoms.map((s) => (
                    <span
                      key={s}
                      className="text-[10px] font-medium bg-white px-2 py-0.5 rounded-lg border border-bloom-border text-bloom-dusty"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              )}

              {item.notes && (
                <p className="text-xs italic text-bloom-dusty/90 pt-0.5">
                  "{item.notes}"
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <button
                type="button"
                onClick={() => onEdit(item)}
                className="p-2 rounded-xl border border-bloom-border bg-white hover:bg-bloom-secondary/30 text-bloom-dusty hover:text-bloom-plum transition"
                title="Edit this entry"
                aria-label="Edit period entry"
              >
                <Edit3 size={15} />
              </button>
              <button
                type="button"
                onClick={() => onDelete(item.id)}
                className="p-2 rounded-xl border border-bloom-border bg-white hover:bg-red-50 text-bloom-dusty hover:text-red-600 transition"
                title="Delete this entry"
                aria-label="Delete period entry"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

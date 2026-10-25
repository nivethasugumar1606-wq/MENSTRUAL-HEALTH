import React, { useState } from 'react';
import { PeriodRecordDTO, CycleStats } from '../../../../shared/types/index.js';
import { ChevronLeft, ChevronRight, Droplet, Sparkles, Calendar as CalendarIcon } from 'lucide-react';

interface CycleCalendarProps {
  periods: PeriodRecordDTO[];
  stats: CycleStats;
  selectedDate: string;
  onSelectDate: (dateStr: string) => void;
  onLogForDate: (dateStr: string) => void;
}

export const CycleCalendar: React.FC<CycleCalendarProps> = ({
  periods,
  stats,
  selectedDate,
  onSelectDate,
  onLogForDate
}) => {
  const [currentMonthDate, setCurrentMonthDate] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();

  const prevMonth = () => {
    setCurrentMonthDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonthDate(new Date(year, month + 1, 1));
  };

  const monthName = currentMonthDate.toLocaleString('default', { month: 'long' });

  // Today in YYYY-MM-DD
  const todayStr = new Date().toISOString().split('T')[0];

  // Helper to test if a date falls within confirmed period
  const getPeriodDayInfo = (
    dateStr: string
  ): { isPeriod: boolean; flow?: string } => {
    for (const p of periods) {
      if (!p.endDate) {
        if (p.startDate === dateStr) return { isPeriod: true, flow: p.flow };
      } else {
        if (dateStr >= p.startDate && dateStr <= p.endDate) {
          return { isPeriod: true, flow: p.flow };
        }
      }
    }
    return { isPeriod: false };
  };

  // Helper to test if date is the exact predicted start date
  const isPredictedStartDate = (dateStr: string): boolean => {
    return Boolean(stats.hasSufficientData && stats.estimatedNextPeriodStart === dateStr);
  };

  // Helper to test if date falls within predicted period window
  const isPredictedWindowDay = (dateStr: string): boolean => {
    if (!stats.hasSufficientData || !stats.estimatedNextPeriodStart || !stats.estimatedNextPeriodEnd) {
      return false;
    }
    return dateStr >= stats.estimatedNextPeriodStart && dateStr <= stats.estimatedNextPeriodEnd;
  };

  // Build days grid
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const dayCells: (string | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    dayCells.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    dayCells.push(dayStr);
  }

  // Selected date status description
  const selectedPeriodInfo = getPeriodDayInfo(selectedDate);
  const selectedIsPredictedStart = isPredictedStartDate(selectedDate);
  const selectedIsPredictedWindow = isPredictedWindowDay(selectedDate);

  let selectedStatusText = 'No period logged';
  if (selectedPeriodInfo.isPeriod) {
    selectedStatusText = 'Period';
  } else if (selectedIsPredictedStart) {
    selectedStatusText = 'Predicted period start date';
  } else if (selectedIsPredictedWindow) {
    selectedStatusText = 'Estimated period window';
  }

  return (
    <div className="bloom-card p-5 sm:p-6 bg-white space-y-4">
      {/* Top Header & Navigation */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-bloom-border">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-bloom-secondary/50 text-bloom-dusty flex items-center justify-center">
            <CalendarIcon size={20} />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-bloom-plum">
              {monthName} {year}
            </h2>
            <p className="text-xs text-bloom-dusty">Tap any day to view or record entries</p>
          </div>
        </div>

        {/* Month Navigation Prev/Next */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={prevMonth}
            className="w-9 h-9 rounded-xl border border-bloom-border hover:bg-bloom-bg flex items-center justify-center text-bloom-dusty hover:text-bloom-plum transition"
            aria-label="Previous month"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={nextMonth}
            className="w-9 h-9 rounded-xl border border-bloom-border hover:bg-bloom-bg flex items-center justify-center text-bloom-dusty hover:text-bloom-plum transition"
            aria-label="Next month"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Weekday Labels */}
      <div className="grid grid-cols-7 gap-1 text-center mb-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((w) => (
          <div key={w} className="text-xs font-bold text-bloom-dusty/80 py-1 uppercase tracking-wider">
            {w}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {dayCells.map((dateStr, idx) => {
          if (!dateStr) {
            return <div key={`empty-${idx}`} className="h-12 sm:h-16 rounded-2xl bg-bloom-bg/30"></div>;
          }

          const dayNumber = parseInt(dateStr.split('-')[2], 10);
          const isToday = dateStr === todayStr;
          const isSelected = dateStr === selectedDate;
          const { isPeriod, flow } = getPeriodDayInfo(dateStr);
          const isPredictedStart = isPredictedStartDate(dateStr);
          const isPredictedWindow = isPredictedWindowDay(dateStr);

          // Card styles depending on status
          let cellStyle = 'bg-bloom-light text-bloom-plum hover:bg-bloom-secondary/30 border border-transparent';

          if (isPeriod) {
            // Main Period Style: Mauve palette with white text and droplet
            cellStyle = 'bg-[#9B68A6] text-white font-bold shadow-sm hover:brightness-105 border border-[#834E8F]';
          } else if (isPredictedStart) {
            // Distinct visual style for predicted start date (dashed outline + sparkles)
            cellStyle =
              'bg-[#F2E5F3] text-bloom-plum font-extrabold border-2 border-dashed border-[#8A5082] shadow-sm ring-1 ring-[#8A5082]/40 animate-pulse-slow';
          } else if (isPredictedWindow) {
            // Remainder of estimated range
            cellStyle = 'bg-bloom-secondary/40 text-bloom-dusty border-2 border-dashed border-bloom-mauve/80 font-bold';
          }

          if (isSelected) {
            cellStyle += ' ring-2 ring-bloom-plum ring-offset-2';
          }

          return (
            <button
              key={dateStr}
              type="button"
              onClick={() => onSelectDate(dateStr)}
              className={`h-12 sm:h-16 rounded-2xl p-1 sm:p-1.5 flex flex-col items-center justify-between transition relative text-xs sm:text-sm ${cellStyle}`}
              title={`${dateStr}${
                isPeriod
                  ? ' (Period)'
                  : ''
              }${isPredictedStart ? ' (Predicted Period Start Date)' : isPredictedWindow ? ' (Estimated Period Range)' : ''}`}
            >
              <div className="flex items-center justify-between w-full px-1">
                <span
                  className={`font-bold ${
                    isToday
                      ? 'bg-bloom-plum text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px]'
                      : ''
                  }`}
                >
                  {dayNumber}
                </span>

                {isPeriod && (
                  <Droplet
                    size={12}
                    className="fill-white text-white opacity-95"
                  />
                )}
                {isPredictedStart && (
                  <Sparkles size={13} className="text-[#8A5082] fill-[#8A5082]" />
                )}
                {isPredictedWindow && !isPredictedStart && !isPeriod && (
                  <Sparkles size={11} className="text-bloom-dusty fill-bloom-mauve/40" />
                )}
              </div>

              {/* Sub-label inside calendar cell */}
              {isPeriod && (
                <span className="text-[9px] uppercase tracking-tighter opacity-95 hidden sm:block font-extrabold truncate w-full text-center">
                  {flow || 'Period'}
                </span>
              )}
              {isPredictedStart && (
                <span className="text-[9px] uppercase tracking-tighter text-[#8A5082] hidden sm:block font-extrabold truncate w-full text-center">
                  Predicted
                </span>
              )}
              {isPredictedWindow && !isPredictedStart && !isPeriod && (
                <span className="text-[9px] uppercase tracking-tighter text-bloom-dusty hidden sm:block font-bold truncate w-full text-center">
                  Estimate
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Comprehensive Legend */}
      <div className="pt-3 border-t border-bloom-border flex flex-wrap items-center justify-center gap-3 sm:gap-5 text-xs font-semibold text-bloom-dusty">
        {/* Main Period */}
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded-md bg-[#9B68A6] inline-flex items-center justify-center text-white shadow-xs">
            <Droplet size={9} className="fill-white" />
          </span>
          <span>Period</span>
        </div>

        {/* Predicted Period */}
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded-md bg-[#F2E5F3] border-2 border-dashed border-[#8A5082] inline-flex items-center justify-center text-[#8A5082]">
            <Sparkles size={9} className="fill-[#8A5082]" />
          </span>
          <span>Predicted period</span>
        </div>

        {/* Today */}
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded-full bg-bloom-plum text-white text-[9px] font-bold inline-flex items-center justify-center">
            •
          </span>
          <span>Today</span>
        </div>

        {/* Selected Date */}
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded-md ring-2 ring-bloom-plum ring-offset-1 bg-white"></span>
          <span>Selected Date</span>
        </div>
      </div>

      {/* Selected Day Info & Action Box */}
      <div className="mt-2 p-4 bg-bloom-bg/80 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border border-bloom-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-bold text-bloom-plum">
              Selected: {selectedDate}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-lg bg-white border border-bloom-border text-bloom-dusty font-medium">
              {selectedStatusText}
            </span>
          </div>
        </div>

        <button
          onClick={() => onLogForDate(selectedDate)}
          className="btn-primary py-2 px-4 text-xs rounded-xl shadow-none shrink-0"
        >
          <Droplet size={13} />
          <span>Log For This Date</span>
        </button>
      </div>
    </div>
  );
};

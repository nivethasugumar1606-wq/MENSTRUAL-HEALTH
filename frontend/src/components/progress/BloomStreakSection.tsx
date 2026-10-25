import React from 'react';
import { BloomStreakSummary, WeeklyDayStatus } from '../../../../shared/types/index.js';
import { Flame, Trophy, CheckCircle2, Clock, Calendar, ArrowRight, Sparkles } from 'lucide-react';
import { PetalMascot } from '../mascot/PetalMascot.js';

interface BloomStreakSectionProps {
  streak?: BloomStreakSummary;
  onContinueLearning?: () => void;
}

export const BloomStreakSection: React.FC<BloomStreakSectionProps> = ({
  streak,
  onContinueLearning
}) => {
  const currentStreak = streak?.currentStreak || 0;
  const longestStreak = streak?.longestStreak || 0;
  const todayCompleted = streak?.todayCompleted || false;
  const weeklyCalendar: WeeklyDayStatus[] = streak?.weeklyCalendar || [];
  const encouragingMessage = streak?.encouragingMessage || "Welcome! Start your Bloom streak with today's learning.";

  // Full day names for accessibility
  const fullDayNames: Record<string, string> = {
    Mon: 'Monday',
    Tue: 'Tuesday',
    Wed: 'Wednesday',
    Thu: 'Thursday',
    Fri: 'Friday',
    Sat: 'Saturday',
    Sun: 'Sunday'
  };

  return (
    <div className="bloom-card p-6 bg-gradient-to-br from-white via-[#F5EFF8] to-[#D7C4E8]/30 border-2 border-[#B48AB8]/40 space-y-6 shadow-sm">
      {/* Header with Title, Mascot, and Current Streak */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-4 border-b border-[#D7C4E8]/60">
        <div className="flex items-center gap-4 text-center md:text-left">
          <div className="relative shrink-0">
            <PetalMascot imageSrc="/illustrations/girl-ukulele.png" size="md" />
            {todayCompleted && (
              <span className="absolute -top-1 -right-1 bg-emerald-500 text-white p-1 rounded-full shadow-xs">
                <CheckCircle2 size={12} />
              </span>
            )}
          </div>
          <div>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#765477] bg-[#D7C4E8]/50 px-2.5 py-0.5 rounded-full">
                Daily Bloom Streak
              </span>
              {todayCompleted ? (
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100/90 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 size={12} /> Completed Today
                </span>
              ) : (
                <span className="text-[11px] font-bold text-[#765477] bg-white border border-[#D7C4E8] px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Clock size={12} className="text-[#B48AB8]" /> Activity Ready Today
                </span>
              )}
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#342C40]">
              My Bloom Streak
            </h2>
            <p className="text-xs sm:text-sm text-[#765477] font-medium max-w-md mt-0.5">
              {encouragingMessage}
            </p>
          </div>
        </div>

        {/* Streak Counters */}
        <div className="flex items-center gap-3">
          {/* Current Streak */}
          <div className="bg-white px-5 py-3 rounded-2xl border border-[#D7C4E8] shadow-xs text-center min-w-[120px]">
            <div className="flex items-center justify-center gap-1 text-amber-500 mb-0.5">
              <Flame size={20} className="fill-amber-400 text-amber-500 animate-bounce" />
              <span className="text-2xl font-black text-[#342C40]">{currentStreak}</span>
            </div>
            <span className="text-[11px] font-bold text-[#765477] uppercase tracking-wider">
              {currentStreak === 1 ? '1-Day Streak' : `${currentStreak}-Day Streak`}
            </span>
          </div>

          {/* Longest Streak */}
          <div className="bg-white/80 px-4 py-3 rounded-2xl border border-[#D7C4E8]/80 shadow-xs text-center min-w-[110px]">
            <div className="flex items-center justify-center gap-1 text-[#B48AB8] mb-0.5">
              <Trophy size={18} />
              <span className="text-xl font-bold text-[#342C40]">{longestStreak}</span>
            </div>
            <span className="text-[10px] font-bold text-[#765477] uppercase tracking-wider">
              Longest Streak
            </span>
          </div>
        </div>
      </div>

      {/* Monday–Sunday 7-Day Weekly Activity Calendar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#342C40]">
            <Calendar size={14} className="text-[#B48AB8]" />
            <span>This Week's Learning Activity (Monday – Sunday)</span>
          </div>
          <span className="text-[11px] text-[#765477]">
            Complete 1 activity per calendar day to grow
          </span>
        </div>

        <div className="grid grid-cols-7 gap-2 sm:gap-3">
          {weeklyCalendar.map((day) => {
            const isCompleted = day.isCompleted;
            const isToday = day.isToday;
            const isFuture = day.isFuture;
            const isMissed = day.isPast && !isCompleted;

            let cardBg = 'bg-white border-[#D7C4E8] text-[#342C40]';
            let statusLabel = 'Missed';
            let icon = <span className="text-[11px] text-gray-400 font-semibold">—</span>;

            if (isCompleted) {
              cardBg = 'bg-[#B48AB8] text-white border-[#765477] shadow-xs';
              statusLabel = 'Completed';
              icon = <CheckCircle2 size={16} className="text-white" />;
            } else if (isToday) {
              cardBg = 'bg-white border-2 border-[#B48AB8] text-[#342C40] shadow-sm';
              statusLabel = 'Today';
              icon = <Clock size={16} className="text-[#B48AB8] animate-pulse" />;
            } else if (isFuture) {
              cardBg = 'bg-white/50 border-dashed border-[#D7C4E8] text-gray-400';
              statusLabel = 'Upcoming';
              icon = <span className="text-[11px] text-gray-300">○</span>;
            } else if (isMissed) {
              cardBg = 'bg-white/70 border-[#D7C4E8] text-gray-400';
              statusLabel = 'No activity';
              icon = <span className="text-[11px] text-gray-400 font-semibold">—</span>;
            }

            return (
              <div
                key={day.date}
                className={`p-2.5 rounded-xl border flex flex-col items-center justify-between text-center transition min-h-[90px] ${cardBg}`}
                title={`${fullDayNames[day.dayName] || day.dayName} (${day.date}): ${statusLabel}`}
                aria-label={`${fullDayNames[day.dayName] || day.dayName}: ${statusLabel}`}
              >
                {/* Day Name */}
                <span className={`text-[11px] font-bold uppercase tracking-wider ${
                  isCompleted ? 'text-white/90' : isToday ? 'text-[#B48AB8]' : 'text-[#765477]'
                }`}>
                  {day.dayName}
                </span>

                {/* Day of Month */}
                <span className={`text-base font-black ${
                  isCompleted ? 'text-white' : 'text-[#342C40]'
                }`}>
                  {day.dayNumber}
                </span>

                {/* Status Icon & Accessible Label */}
                <div className="flex flex-col items-center gap-0.5">
                  <div className="flex items-center justify-center">
                    {icon}
                  </div>
                  <span className={`text-[9px] font-bold leading-tight ${
                    isCompleted ? 'text-white/90' : isToday ? 'text-[#B48AB8]' : 'text-gray-400'
                  }`}>
                    {statusLabel}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Banner: Today's Status & Continue Learning Button */}
      <div className="bg-white p-4 rounded-2xl border border-[#D7C4E8] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-center sm:text-left">
          <div className="w-10 h-10 rounded-xl bg-[#F5EFF8] flex items-center justify-center text-[#B48AB8] shrink-0 border border-[#D7C4E8]">
            <Sparkles size={20} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#342C40]">
              {todayCompleted
                ? "Today's Learning: Activity Completed! 🌸"
                : "Today's Learning: Ready for Your Daily Check-In"}
            </h4>
            <p className="text-xs text-[#765477]">
              {todayCompleted
                ? 'Great job keeping your streak active today. You can always explore more days anytime!'
                : 'Complete any question or Myth & Fact in Learn & Play to maintain your Bloom streak.'}
            </p>
          </div>
        </div>

        {onContinueLearning && (
          <button
            type="button"
            onClick={onContinueLearning}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#B48AB8] hover:bg-[#765477] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition shrink-0"
          >
            <span>{todayCompleted ? 'Explore More Days' : 'Continue Learning'}</span>
            <ArrowRight size={14} />
          </button>
        )}
      </div>
    </div>
  );
};

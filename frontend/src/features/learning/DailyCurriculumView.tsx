import React, { useState, useEffect } from 'react';
import { DAILY_CURRICULUM } from '../../../../shared/data/dailyCurriculum.js';
import { DayContent, DailyMCQ, DailyMythFact, BloomStreakSummary, UnlockedDayInfo } from '../../../../shared/types/index.js';
import {
  CheckCircle2,
  XCircle,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Flame,
  HelpCircle,
  BookOpen,
  Calendar,
  Check,
  Lock,
  Clock
} from 'lucide-react';
import { PetalMascot } from '../../components/mascot/PetalMascot.js';

interface DailyCurriculumViewProps {
  completedActivityIds: string[];
  streak?: BloomStreakSummary;
  unlockedDayInfo?: UnlockedDayInfo;
  onActivityComplete: (activityId: string, dayNumber: number, activityType: 'mcq' | 'myth_fact') => Promise<void>;
  onRefreshProgress?: () => Promise<void>;
}

export const DailyCurriculumView: React.FC<DailyCurriculumViewProps> = ({
  completedActivityIds,
  streak,
  unlockedDayInfo,
  onActivityComplete,
  onRefreshProgress
}) => {
  const maxUnlockedDay = Math.min(50, Math.max(1, unlockedDayInfo?.maxUnlockedDay || 1));

  // Find the first unlocked day with incomplete activities or default to Day 1
  const [selectedDayNumber, setSelectedDayNumber] = useState<number>(() => {
    for (const day of DAILY_CURRICULUM) {
      if (day.dayNumber > maxUnlockedDay) break;
      const allIds = [
        ...day.mcqs.map((m) => m.id),
        ...day.mythFacts.map((m) => m.id)
      ];
      const isDayFinished = allIds.every((id) => completedActivityIds.includes(id));
      if (!isDayFinished) {
        return day.dayNumber;
      }
    }
    return Math.min(maxUnlockedDay, 1);
  });

  // Ensure selectedDayNumber never exceeds maxUnlockedDay
  useEffect(() => {
    if (selectedDayNumber > maxUnlockedDay) {
      setSelectedDayNumber(maxUnlockedDay);
    }
  }, [maxUnlockedDay, selectedDayNumber]);

  // Live countdown timer calculation synced with server timestamp
  const [countdownSeconds, setCountdownSeconds] = useState<number>(() => {
    return unlockedDayInfo?.nextDayUnlockSeconds || 0;
  });

  useEffect(() => {
    if (!unlockedDayInfo?.nextDayUnlockTime) {
      setCountdownSeconds(0);
      return;
    }

    // Offset between server clock and client browser clock
    const serverTimeMs = new Date(unlockedDayInfo.serverTime).getTime();
    const clientTimeMs = Date.now();
    const serverOffsetMs = serverTimeMs - clientTimeMs;

    const tickCountdown = () => {
      const nowAdjusted = Date.now() + serverOffsetMs;
      const targetMs = new Date(unlockedDayInfo.nextDayUnlockTime!).getTime();
      const diffSec = Math.max(0, Math.ceil((targetMs - nowAdjusted) / 1000));
      setCountdownSeconds(diffSec);

      // When countdown reaches 0, fetch updated unlock status from server
      if (diffSec <= 0 && onRefreshProgress) {
        onRefreshProgress();
      }
    };

    tickCountdown();
    const timer = setInterval(tickCountdown, 1000);
    return () => clearInterval(timer);
  }, [unlockedDayInfo?.nextDayUnlockTime, unlockedDayInfo?.serverTime, onRefreshProgress]);

  // Format countdown string: e.g. "12h 35m" or "35m 12s"
  const formatCountdown = (totalSeconds: number): string => {
    if (totalSeconds <= 0) return '0m';
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m ${seconds}s`;
  };

  // Track local answers for immediate interactive feedback
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number | boolean>>({});
  const [submittingIds, setSubmittingIds] = useState<Record<string, boolean>>({});

  const currentDay: DayContent = DAILY_CURRICULUM.find((d) => d.dayNumber === selectedDayNumber) || DAILY_CURRICULUM[0];

  // Activities for this day
  const dayActivityIds = [
    ...currentDay.mcqs.map((m) => m.id),
    ...currentDay.mythFacts.map((m) => m.id)
  ];
  const completedInDayCount = dayActivityIds.filter((id) => completedActivityIds.includes(id)).length;
  const isDayFullyComplete = completedInDayCount === 4;

  const isNextDayLocked = selectedDayNumber >= maxUnlockedDay;
  const nextDayNumber = Math.min(50, selectedDayNumber + 1);

  const handleSelectMCQOption = async (mcq: DailyMCQ, optionIndex: number) => {
    if (completedActivityIds.includes(mcq.id) || submittingIds[mcq.id]) return;

    setSelectedAnswers((prev) => ({ ...prev, [mcq.id]: optionIndex }));
    setSubmittingIds((prev) => ({ ...prev, [mcq.id]: true }));

    try {
      await onActivityComplete(mcq.id, currentDay.dayNumber, 'mcq');
    } finally {
      setSubmittingIds((prev) => ({ ...prev, [mcq.id]: false }));
    }
  };

  const handleSelectMythFact = async (mf: DailyMythFact, choice: boolean) => {
    if (completedActivityIds.includes(mf.id) || submittingIds[mf.id]) return;

    setSelectedAnswers((prev) => ({ ...prev, [mf.id]: choice }));
    setSubmittingIds((prev) => ({ ...prev, [mf.id]: true }));

    try {
      await onActivityComplete(mf.id, currentDay.dayNumber, 'myth_fact');
    } finally {
      setSubmittingIds((prev) => ({ ...prev, [mf.id]: false }));
    }
  };

  const optionLetters = ['A', 'B', 'C', 'D'];

  return (
    <div className="space-y-6">
      {/* 50-Day Curriculum Header Banner */}
      <div className="bloom-card p-6 bg-gradient-to-r from-white via-bloom-light to-bloom-secondary/30 border border-bloom-secondary flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="flex items-center gap-4">
          <PetalMascot
            imageSrc={isDayFullyComplete ? '/illustrations/girl-ukulele.png' : '/illustrations/girl-thinking.png'}
            size="md"
          />
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-bloom-dusty bg-bloom-secondary/50 px-2.5 py-0.5 rounded-full">
                50-Day Learning Journey
              </span>
              <span className="text-xs font-bold text-bloom-mauve bg-white px-2.5 py-0.5 rounded-full border border-bloom-border flex items-center gap-1 shadow-xs">
                <Flame size={12} className="text-amber-500 fill-amber-500" />
                {streak?.currentStreak || 0}-day streak
              </span>
              <span className="text-xs font-bold text-[#765477] bg-white px-2.5 py-0.5 rounded-full border border-bloom-border flex items-center gap-1 shadow-xs">
                <Clock size={12} className="text-bloom-mauve" />
                Unlocked: Day {maxUnlockedDay} of 50
              </span>
            </div>
            <h2 className="text-2xl font-extrabold text-bloom-plum">
              Day {currentDay.dayNumber}: {currentDay.title}
            </h2>
            <p className="text-xs text-bloom-dusty flex items-center gap-1">
              <BookOpen size={13} className="text-bloom-mauve" />
              Topic: <strong className="text-bloom-plum">{currentDay.topic}</strong>
            </p>
          </div>
        </div>

      </div>


      {/* Daily Progress Bar */}
      <div className="bloom-card p-4 bg-white border border-bloom-border flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-bloom-light flex items-center justify-center text-bloom-plum font-bold text-sm border border-bloom-border">
            {completedInDayCount}/4
          </div>
          <div>
            <p className="text-sm font-bold text-bloom-plum">
              {isDayFullyComplete
                ? '🎉 Day Completed! All 4 activities done!'
                : `Day ${currentDay.dayNumber} Progress: ${completedInDayCount} of 4 activities done`}
            </p>
            <p className="text-xs text-bloom-dusty">
              Take your time! You are never required to finish everything in one sitting.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          {[0, 1, 2, 3].map((idx) => {
            const isDone = idx < completedInDayCount;
            return (
              <div
                key={idx}
                className={`h-2.5 flex-1 sm:w-12 rounded-full transition-all duration-300 ${
                  isDone ? 'bg-bloom-mauve' : 'bg-bloom-secondary/30'
                }`}
              />
            );
          })}
        </div>
      </div>

      {/* Grid of 4 Activities: 2 MCQs + 2 Myth/Facts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ==================== 1. MULTIPLE CHOICE QUESTION #1 ==================== */}
        {(() => {
          const mcq = currentDay.mcqs[0];
          const isCompleted = completedActivityIds.includes(mcq.id);
          const userChoice = selectedAnswers[mcq.id];
          const hasAttempted = isCompleted || userChoice !== undefined;
          const isCorrect = userChoice === mcq.correctIndex || (isCompleted && userChoice === undefined);

          return (
            <div className="bloom-card p-6 bg-white border border-bloom-border space-y-4 hover:border-bloom-mauve/60 transition">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-bloom-dusty bg-bloom-light px-2.5 py-1 rounded-md flex items-center gap-1">
                  <HelpCircle size={13} className="text-bloom-mauve" /> Question 1 of 2
                </span>
                {isCompleted ? (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 size={13} /> Completed (+10 pts)
                  </span>
                ) : (
                  <span className="text-xs font-bold text-bloom-mauve flex items-center gap-1">
                    <Sparkles size={12} /> +10 pts
                  </span>
                )}
              </div>

              <h3 className="font-bold text-bloom-plum text-base leading-snug">
                {mcq.question}
              </h3>

              <div className="space-y-2">
                {mcq.options.map((option, optIdx) => {
                  const letter = optionLetters[optIdx];
                  const isThisSelected = userChoice === optIdx;
                  const isThisCorrect = optIdx === mcq.correctIndex;

                  let btnStyle = 'bg-white border-bloom-border text-bloom-plum hover:bg-bloom-light/50';
                  let badgeStyle = 'bg-bloom-light text-bloom-dusty';

                  if (hasAttempted) {
                    if (isThisCorrect) {
                      btnStyle = 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold shadow-xs';
                      badgeStyle = 'bg-emerald-600 text-white';
                    } else if (isThisSelected && !isThisCorrect) {
                      btnStyle = 'bg-rose-50 border-rose-300 text-rose-900 line-through';
                      badgeStyle = 'bg-rose-500 text-white';
                    } else {
                      btnStyle = 'bg-gray-50 border-gray-200 text-gray-400 opacity-60';
                    }
                  }

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      disabled={hasAttempted}
                      onClick={() => handleSelectMCQOption(mcq, optIdx)}
                      className={`w-full p-3.5 rounded-xl border text-left flex items-center gap-3 transition text-sm ${btnStyle}`}
                    >
                      <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${badgeStyle}`}>
                        {letter}
                      </span>
                      <span className="flex-1 leading-snug">{option}</span>
                      {hasAttempted && isThisCorrect && (
                        <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                      )}
                      {hasAttempted && isThisSelected && !isThisCorrect && (
                        <XCircle size={18} className="text-rose-500 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {hasAttempted && (
                <div className={`p-4 rounded-xl text-xs space-y-1.5 border animate-fadeIn ${
                  isCorrect
                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                    : 'bg-purple-50/70 border-bloom-secondary text-bloom-plum'
                }`}>
                  <div className="flex items-center gap-1.5 font-bold">
                    {isCorrect ? (
                      <>
                        <Check size={14} className="text-emerald-600" />
                        <span>Correct! Well done.</span>
                      </>
                    ) : (
                      <>
                        <HelpCircle size={14} className="text-bloom-mauve" />
                        <span>Here's the scientific explanation:</span>
                      </>
                    )}
                  </div>
                  <p className="leading-relaxed">{mcq.explanation}</p>
                </div>
              )}
            </div>
          );
        })()}

        {/* ==================== 2. MULTIPLE CHOICE QUESTION #2 ==================== */}
        {(() => {
          const mcq = currentDay.mcqs[1];
          const isCompleted = completedActivityIds.includes(mcq.id);
          const userChoice = selectedAnswers[mcq.id];
          const hasAttempted = isCompleted || userChoice !== undefined;
          const isCorrect = userChoice === mcq.correctIndex || (isCompleted && userChoice === undefined);

          return (
            <div className="bloom-card p-6 bg-white border border-bloom-border space-y-4 hover:border-bloom-mauve/60 transition">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-bloom-dusty bg-bloom-light px-2.5 py-1 rounded-md flex items-center gap-1">
                  <HelpCircle size={13} className="text-bloom-mauve" /> Question 2 of 2
                </span>
                {isCompleted ? (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 size={13} /> Completed (+10 pts)
                  </span>
                ) : (
                  <span className="text-xs font-bold text-bloom-mauve flex items-center gap-1">
                    <Sparkles size={12} /> +10 pts
                  </span>
                )}
              </div>

              <h3 className="font-bold text-bloom-plum text-base leading-snug">
                {mcq.question}
              </h3>

              <div className="space-y-2">
                {mcq.options.map((option, optIdx) => {
                  const letter = optionLetters[optIdx];
                  const isThisSelected = userChoice === optIdx;
                  const isThisCorrect = optIdx === mcq.correctIndex;

                  let btnStyle = 'bg-white border-bloom-border text-bloom-plum hover:bg-bloom-light/50';
                  let badgeStyle = 'bg-bloom-light text-bloom-dusty';

                  if (hasAttempted) {
                    if (isThisCorrect) {
                      btnStyle = 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold shadow-xs';
                      badgeStyle = 'bg-emerald-600 text-white';
                    } else if (isThisSelected && !isThisCorrect) {
                      btnStyle = 'bg-rose-50 border-rose-300 text-rose-900 line-through';
                      badgeStyle = 'bg-rose-500 text-white';
                    } else {
                      btnStyle = 'bg-gray-50 border-gray-200 text-gray-400 opacity-60';
                    }
                  }

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      disabled={hasAttempted}
                      onClick={() => handleSelectMCQOption(mcq, optIdx)}
                      className={`w-full p-3.5 rounded-xl border text-left flex items-center gap-3 transition text-sm ${btnStyle}`}
                    >
                      <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${badgeStyle}`}>
                        {letter}
                      </span>
                      <span className="flex-1 leading-snug">{option}</span>
                      {hasAttempted && isThisCorrect && (
                        <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                      )}
                      {hasAttempted && isThisSelected && !isThisCorrect && (
                        <XCircle size={18} className="text-rose-500 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {hasAttempted && (
                <div className={`p-4 rounded-xl text-xs space-y-1.5 border animate-fadeIn ${
                  isCorrect
                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                    : 'bg-purple-50/70 border-bloom-secondary text-bloom-plum'
                }`}>
                  <div className="flex items-center gap-1.5 font-bold">
                    {isCorrect ? (
                      <>
                        <Check size={14} className="text-emerald-600" />
                        <span>Correct! Well done.</span>
                      </>
                    ) : (
                      <>
                        <HelpCircle size={14} className="text-bloom-mauve" />
                        <span>Here's the scientific explanation:</span>
                      </>
                    )}
                  </div>
                  <p className="leading-relaxed">{mcq.explanation}</p>
                </div>
              )}
            </div>
          );
        })()}

        {/* ==================== 3. MYTH OR FACT #1 ==================== */}
        {(() => {
          const mf = currentDay.mythFacts[0];
          const isCompleted = completedActivityIds.includes(mf.id);
          const userChoice = selectedAnswers[mf.id];
          const hasAttempted = isCompleted || userChoice !== undefined;
          const isCorrect = userChoice === mf.isFact || (isCompleted && userChoice === undefined);

          return (
            <div className="bloom-card p-6 bg-white border border-bloom-border space-y-4 hover:border-bloom-mauve/60 transition">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-bloom-dusty bg-bloom-light px-2.5 py-1 rounded-md">
                  Myth or Fact? #1
                </span>
                {isCompleted ? (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 size={13} /> Completed (+10 pts)
                  </span>
                ) : (
                  <span className="text-xs font-bold text-bloom-mauve flex items-center gap-1">
                    <Sparkles size={12} /> +10 pts
                  </span>
                )}
              </div>

              <blockquote className="italic font-bold text-bloom-plum text-base leading-snug border-l-4 border-bloom-mauve pl-3 py-1">
                "{mf.statement}"
              </blockquote>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  disabled={hasAttempted}
                  onClick={() => handleSelectMythFact(mf, false)}
                  className={`p-3.5 rounded-xl border text-center font-bold text-sm transition ${
                    hasAttempted
                      ? !mf.isFact
                        ? 'bg-rose-50 border-rose-300 text-rose-800'
                        : 'bg-gray-50 border-gray-200 text-gray-400 opacity-60'
                      : 'bg-white border-bloom-border text-bloom-plum hover:bg-rose-50 hover:border-rose-300'
                  }`}
                >
                  🙅 Myth
                </button>

                <button
                  type="button"
                  disabled={hasAttempted}
                  onClick={() => handleSelectMythFact(mf, true)}
                  className={`p-3.5 rounded-xl border text-center font-bold text-sm transition ${
                    hasAttempted
                      ? mf.isFact
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                        : 'bg-gray-50 border-gray-200 text-gray-400 opacity-60'
                      : 'bg-white border-bloom-border text-bloom-plum hover:bg-emerald-50 hover:border-emerald-300'
                  }`}
                >
                  ✓ Fact
                </button>
              </div>

              {hasAttempted && (
                <div className="p-4 rounded-xl text-xs space-y-1.5 border bg-bloom-light/60 border-bloom-secondary text-bloom-plum animate-fadeIn">
                  <div className="flex items-center gap-1.5 font-bold">
                    <span className={`px-2 py-0.5 rounded text-[11px] ${
                      mf.isFact ? 'bg-emerald-600 text-white' : 'bg-rose-500 text-white'
                    }`}>
                      {mf.isFact ? 'FACT' : 'MYTH'}
                    </span>
                    <span>{isCorrect ? 'You got it right!' : 'Here are the facts:'}</span>
                  </div>
                  <p className="leading-relaxed">{mf.explanation}</p>
                </div>
              )}
            </div>
          );
        })()}

        {/* ==================== 4. MYTH OR FACT #2 ==================== */}
        {(() => {
          const mf = currentDay.mythFacts[1];
          const isCompleted = completedActivityIds.includes(mf.id);
          const userChoice = selectedAnswers[mf.id];
          const hasAttempted = isCompleted || userChoice !== undefined;
          const isCorrect = userChoice === mf.isFact || (isCompleted && userChoice === undefined);

          return (
            <div className="bloom-card p-6 bg-white border border-bloom-border space-y-4 hover:border-bloom-mauve/60 transition">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-bloom-dusty bg-bloom-light px-2.5 py-1 rounded-md">
                  Myth or Fact? #2
                </span>
                {isCompleted ? (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 size={13} /> Completed (+10 pts)
                  </span>
                ) : (
                  <span className="text-xs font-bold text-bloom-mauve flex items-center gap-1">
                    <Sparkles size={12} /> +10 pts
                  </span>
                )}
              </div>

              <blockquote className="italic font-bold text-bloom-plum text-base leading-snug border-l-4 border-bloom-mauve pl-3 py-1">
                "{mf.statement}"
              </blockquote>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  disabled={hasAttempted}
                  onClick={() => handleSelectMythFact(mf, false)}
                  className={`p-3.5 rounded-xl border text-center font-bold text-sm transition ${
                    hasAttempted
                      ? !mf.isFact
                        ? 'bg-rose-50 border-rose-300 text-rose-800'
                        : 'bg-gray-50 border-gray-200 text-gray-400 opacity-60'
                      : 'bg-white border-bloom-border text-bloom-plum hover:bg-rose-50 hover:border-rose-300'
                  }`}
                >
                  🙅 Myth
                </button>

                <button
                  type="button"
                  disabled={hasAttempted}
                  onClick={() => handleSelectMythFact(mf, true)}
                  className={`p-3.5 rounded-xl border text-center font-bold text-sm transition ${
                    hasAttempted
                      ? mf.isFact
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                        : 'bg-gray-50 border-gray-200 text-gray-400 opacity-60'
                      : 'bg-white border-bloom-border text-bloom-plum hover:bg-emerald-50 hover:border-emerald-300'
                  }`}
                >
                  ✓ Fact
                </button>
              </div>

              {hasAttempted && (
                <div className="p-4 rounded-xl text-xs space-y-1.5 border bg-bloom-light/60 border-bloom-secondary text-bloom-plum animate-fadeIn">
                  <div className="flex items-center gap-1.5 font-bold">
                    <span className={`px-2 py-0.5 rounded text-[11px] ${
                      mf.isFact ? 'bg-emerald-600 text-white' : 'bg-rose-500 text-white'
                    }`}>
                      {mf.isFact ? 'FACT' : 'MYTH'}
                    </span>
                    <span>{isCorrect ? 'You got it right!' : 'Here are the facts:'}</span>
                  </div>
                  <p className="leading-relaxed">{mf.explanation}</p>
                </div>
              )}
            </div>
          );
        })()}
      </div>

      {/* Bottom day navigation banner with 24-Hour Unlock Countdown and Disabled Next Day Button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <button
          type="button"
          disabled={selectedDayNumber <= 1}
          onClick={() => setSelectedDayNumber((prev) => Math.max(1, prev - 1))}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-bloom-border bg-white text-bloom-plum font-bold text-xs hover:bg-bloom-light disabled:opacity-40 disabled:pointer-events-none transition flex items-center justify-center gap-1.5 shadow-xs"
        >
          <ChevronLeft size={16} /> Previous Day ({selectedDayNumber > 1 ? selectedDayNumber - 1 : 1})
        </button>

        <span className="text-xs text-bloom-dusty font-medium text-center">
          Day {selectedDayNumber} of 50 {selectedDayNumber <= maxUnlockedDay ? '• Available' : ''}
        </span>

        {isNextDayLocked ? (
          <button
            type="button"
            disabled={true}
            title={`Day ${nextDayNumber} unlocks after 24 hours from your program start.`}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gray-100 border border-gray-300 text-gray-500 font-bold text-xs opacity-70 cursor-not-allowed flex items-center justify-center gap-2 shadow-none"
          >
            <Lock size={14} className="text-gray-400" />
            <span>Day {nextDayNumber} unlocks in {formatCountdown(countdownSeconds)}</span>
          </button>
        ) : (
          <button
            type="button"
            disabled={selectedDayNumber >= 50}
            onClick={() => setSelectedDayNumber((prev) => Math.min(maxUnlockedDay, prev + 1))}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-bloom-mauve hover:bg-bloom-dusty text-white font-bold text-xs disabled:opacity-40 disabled:pointer-events-none transition flex items-center justify-center gap-1.5 shadow-xs"
          >
            <span>Next Day ({nextDayNumber})</span>
            <ChevronRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

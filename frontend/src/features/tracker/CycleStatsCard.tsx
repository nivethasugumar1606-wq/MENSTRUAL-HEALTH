import React, { useState } from 'react';
import { CycleStats, PeriodRecordDTO } from '../../../../shared/types/index.js';
import { Sparkles, Info, Heart, ShieldAlert, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { PetalMascot } from '../../components/mascot/PetalMascot.js';
import { GENTLE_CYCLE_DISCLAIMER } from './cyclePrediction.js';

interface CycleStatsCardProps {
  stats: CycleStats;
  periods: PeriodRecordDTO[];
  userPeriodStatus?: string;
  discreetMode?: boolean;
}

export const CycleStatsCard: React.FC<CycleStatsCardProps> = ({
  stats,
  periods,
  userPeriodStatus,
  discreetMode = false
}) => {
  const [showExplanationModal, setShowExplanationModal] = useState(false);

  // If user hasn't started yet and has 0 periods recorded, show gentle supportive state
  if (periods.length === 0 && userPeriodStatus === 'not_started') {
    return (
      <div className="bloom-card p-6 bg-gradient-to-br from-white to-bloom-light border border-bloom-secondary">
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          <div className="shrink-0">
            <PetalMascot imageSrc="/illustrations/girl-boba.png" size="lg" />
          </div>
          <div className="space-y-2 flex-1">
            <span className="text-xs font-bold uppercase tracking-wider text-bloom-dusty bg-bloom-secondary/40 px-3 py-1 rounded-full">
              Safe & Patient Learning Mode
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-bloom-plum">
              Welcome! You haven't started your period yet — and that is completely normal!
            </h2>
            <p className="text-sm text-bloom-dusty leading-relaxed">
              Periods can begin anytime between ages 9 and 16. There is no rush and no right time. You can explore all our lessons, quizzes, and product guides anytime you like!
            </p>
            <div className="pt-2 flex flex-wrap gap-2 justify-center sm:justify-start">
              <span className="text-xs font-semibold text-bloom-dusty bg-white border border-bloom-border px-3 py-1.5 rounded-xl">
                🌸 No fake cycle data
              </span>
              <span className="text-xs font-semibold text-bloom-dusty bg-white border border-bloom-border px-3 py-1.5 rounded-xl">
                ✨ Ready whenever you are
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bloom-card p-6 bg-white space-y-5">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-bloom-border">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-bloom-dusty bg-bloom-secondary/30 px-2.5 py-1 rounded-lg">
            Personal Cycle Summary
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-bloom-plum mt-1">
            {stats.currentCycleDay ? `Day ${stats.currentCycleDay} of Your Cycle` : 'Cycle Status'}
          </h2>
        </div>

        <button
          onClick={() => setShowExplanationModal(true)}
          className="text-xs font-bold text-bloom-dusty hover:text-bloom-plum flex items-center gap-1.5 px-3 py-1.5 bg-bloom-bg hover:bg-bloom-secondary/40 rounded-xl transition"
        >
          <Info size={14} className="text-bloom-mauve" />
          <span>How calculations work</span>
        </button>
      </div>

      {/* 3 Metric Stat Pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Metric 1: Average Cycle Length */}
        <div className="p-4 rounded-2xl bg-bloom-light border border-bloom-border flex flex-col justify-between">
          <span className="text-xs font-bold text-bloom-dusty uppercase tracking-wide">
            Average Cycle Length
          </span>
          <div className="my-2">
            {stats.hasSufficientData && stats.averageCycleLength ? (
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-extrabold text-bloom-plum">
                  {stats.averageCycleLength}
                </span>
                <span className="text-xs font-bold text-bloom-dusty">days</span>
              </div>
            ) : (
              <span className="text-sm font-bold text-bloom-dusty">Needs 2+ cycles</span>
            )}
          </div>
          <p className="text-[11px] text-bloom-dusty">
            {stats.isIrregular ? 'Varies naturally month to month' : 'Based on your recorded dates'}
          </p>
        </div>

        {/* Metric 2: Period Duration */}
        <div className="p-4 rounded-2xl bg-bloom-light border border-bloom-border flex flex-col justify-between">
          <span className="text-xs font-bold text-bloom-dusty uppercase tracking-wide">
            Average Bleeding Duration
          </span>
          <div className="my-2">
            {stats.averagePeriodDuration ? (
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-extrabold text-bloom-plum">
                  {stats.averagePeriodDuration}
                </span>
                <span className="text-xs font-bold text-bloom-dusty">days</span>
              </div>
            ) : (
              <span className="text-sm font-bold text-bloom-dusty">Approx. 4-6 days</span>
            )}
          </div>
          <p className="text-[11px] text-bloom-dusty">
            From period start to period end
          </p>
        </div>

        {/* Metric 3: Next Estimated Window */}
        <div className="p-4 rounded-2xl bg-bloom-secondary/30 border border-bloom-secondary flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-bloom-dusty uppercase tracking-wide">
              {discreetMode ? 'Next Check-in' : 'Estimated Next Period'}
            </span>
            <Sparkles size={14} className="text-[#8A5082]" />
          </div>
          <div className="my-2">
            {stats.hasSufficientData && stats.estimatedNextPeriodStart ? (
              <span className="text-base font-extrabold text-bloom-plum">
                Around {stats.estimatedNextPeriodStart}
              </span>
            ) : (
              <span className="text-xs font-semibold text-bloom-dusty">
                {periods.length === 1
                  ? (discreetMode ? '1 more check-in needed' : 'Log 1 more period for estimate')
                  : (discreetMode ? 'Log check-in to see dates' : 'Log periods to see estimates')}
              </span>
            )}
          </div>
          <p className="text-[11px] text-bloom-dusty font-medium">
            {discreetMode ? 'Supportive estimate' : 'Supportive estimate, not medical guarantee'}
          </p>
        </div>
      </div>

      {/* Gentle Disclaimer Banner */}
      <div className="p-4 rounded-2xl bg-[#FAF6FB] border border-bloom-secondary/60 flex items-start gap-3">
        <PetalMascot mood={stats.isIrregular ? 'soothing' : 'happy'} size="sm" className="shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm text-bloom-dusty leading-relaxed">
          <p className="font-bold text-bloom-plum mb-0.5">
            {discreetMode ? 'Time to check in:' : 'Note on your estimates:'}
          </p>
          <p className="text-bloom-dusty">
            {discreetMode
              ? 'Time to check in with your personal notes and wellness logs.'
              : GENTLE_CYCLE_DISCLAIMER}
          </p>
        </div>
      </div>

      {/* Explanation Modal */}
      {showExplanationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bloom-plum/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl border border-bloom-secondary shadow-bloomHover max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-bloom-border">
              <h3 className="text-lg font-bold text-bloom-plum">How Cycle Calculations Work</h3>
              <button
                onClick={() => setShowExplanationModal(false)}
                className="text-bloom-dusty hover:text-bloom-plum text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-bloom-dusty leading-relaxed">
              <div>
                <h4 className="font-bold text-bloom-plum">1. Cycle Length Calculation</h4>
                <p>
                  Cycle length is calculated by counting the days from the start date of one period to the start date of the next period.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-bloom-plum">2. Next Period Prediction</h4>
                <p>
                  The estimated start date is calculated by adding your average cycle length to your most recent period start date.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-bloom-plum">3. Why We Never Guess Without Data</h4>
                <p>
                  Nurtura will never invent fake dates for real users. It requires at least two consecutive period start dates before calculating an estimate.
                </p>
              </div>

              <div className="p-3 bg-bloom-bg rounded-xl text-bloom-plum font-semibold">
                🌸 {GENTLE_CYCLE_DISCLAIMER}
              </div>
            </div>

            <button
              onClick={() => setShowExplanationModal(false)}
              className="btn-primary w-full py-2.5 rounded-xl text-xs font-bold"
            >
              Got it, thank you!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

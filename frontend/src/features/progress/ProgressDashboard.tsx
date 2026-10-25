import React from 'react';
import { UserProgressSummary } from '../../../../shared/types/index.js';
import { Sparkles } from 'lucide-react';
import { PetalMascot } from '../../components/mascot/PetalMascot.js';
import { BloomStreakSection } from '../../components/progress/BloomStreakSection.js';

interface ProgressDashboardProps {
  progress: UserProgressSummary;
  onSelectLesson?: (lessonId: string) => void;
  onContinueLearning?: () => void;
}

export const ProgressDashboard: React.FC<ProgressDashboardProps> = ({
  progress,
  onContinueLearning
}) => {
  return (
    <div className="space-y-6">
      {/* 1. Prominent "My Bloom Streak" Section at the top */}
      <BloomStreakSection
        streak={progress.streak}
        onContinueLearning={onContinueLearning}
      />

      {/* 2. Existing Learning Progress Banner & Information */}
      <div className="bloom-card p-6 bg-gradient-to-r from-white via-bloom-light to-bloom-secondary/20 border border-bloom-secondary flex flex-col sm:flex-row items-center gap-6">
        <div className="shrink-0">
          <img
            src="/illustrations/girl-camera.png"
            alt="Celebrating learning growth"
            className="w-20 h-20 sm:w-24 sm:h-24 object-contain drop-shadow-xs"
          />
        </div>
        <div className="space-y-2 flex-1 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-bloom-dusty bg-bloom-secondary/40 px-3 py-1 rounded-full">
              Learning Journey
            </span>
            <span className="text-xs font-bold text-bloom-mauve bg-white px-3 py-1 rounded-full border border-bloom-border flex items-center gap-1 shadow-sm">
              <Sparkles size={13} />
              {progress.totalPoints} Learning Points
            </span>
          </div>

          <h2 className="text-2xl font-bold text-bloom-plum">
            You're Becoming an Expert on Your Body!
          </h2>
          <p className="text-sm text-bloom-dusty leading-relaxed max-w-xl">
            Knowledge gives you peace of mind. Learning about biology, puberty, and hygiene at your own pace is something to be proud of.
          </p>
        </div>
      </div>
    </div>
  );
};

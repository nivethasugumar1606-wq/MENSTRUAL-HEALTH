import React from 'react';
import { Lesson } from '../../data/lessons.js';
import { GlossaryTooltip } from '../../components/common/GlossaryTooltip.js';
import { X, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface LessonDetailModalProps {
  lesson: Lesson | null;
  isOpen: boolean;
  onClose: () => void;
  isCompleted: boolean;
  onComplete: (lessonId: string, points: number) => Promise<void>;
  onOpenFullGlossary: (term: string) => void;
}

export const LessonDetailModal: React.FC<LessonDetailModalProps> = ({
  lesson,
  isOpen,
  onClose,
  isCompleted,
  onComplete,
  onOpenFullGlossary
}) => {
  if (!isOpen || !lesson) return null;

  const handleComplete = async () => {
    try {
      await onComplete(lesson.id, lesson.points);
      // Gentle celebratory confetti
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#D7C4E8', '#B48AB8', '#F9D8DE', '#765477']
      });
    } catch (e) {
      console.error(e);
    }
  };

  // Helper to replace known medical terms with GlossaryTooltip components
  const renderParagraphWithTerms = (text: string, terms?: string[]) => {
    if (!terms || terms.length === 0) {
      return <span>{text}</span>;
    }

    // Split text by known terms
    let elements: (string | React.ReactNode)[] = [text];

    for (const term of terms) {
      const nextElements: (string | React.ReactNode)[] = [];
      const regex = new RegExp(`(${term})`, 'gi');

      for (const el of elements) {
        if (typeof el === 'string') {
          const parts = el.split(regex);
          for (const p of parts) {
            if (p.toLowerCase() === term.toLowerCase()) {
              nextElements.push(
                <GlossaryTooltip
                  key={`${term}-${Math.random()}`}
                  term={term}
                  onOpenFullGlossary={onOpenFullGlossary}
                >
                  {p}
                </GlossaryTooltip>
              );
            } else if (p) {
              nextElements.push(p);
            }
          }
        } else {
          nextElements.push(el);
        }
      }
      elements = nextElements;
    }

    return <>{elements}</>;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bloom-plum/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl border border-bloom-secondary shadow-bloomHover w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-bloom-border flex items-start justify-between bg-bloom-bg/60">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-bloom-dusty bg-bloom-secondary/40 px-2 py-0.5 rounded-md">
                {lesson.category === 'basics' ? 'Period Basics' : lesson.category === 'body' ? 'Body Science' : 'Tracker Guide'}
              </span>
              <span className="text-xs text-bloom-dusty flex items-center gap-1 font-semibold">
                <Clock size={12} />
                {lesson.readTime}
              </span>
              <span className="text-xs text-bloom-mauve font-bold flex items-center gap-1">
                <Sparkles size={12} />
                +{lesson.points} Points
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-bloom-plum">
              {lesson.title}
            </h2>
            <p className="text-xs sm:text-sm text-bloom-dusty mt-0.5">
              {lesson.subtitle}
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white hover:bg-bloom-secondary/40 text-bloom-dusty hover:text-bloom-plum flex items-center justify-center transition shrink-0 ml-3"
            aria-label="Close lesson"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 leading-relaxed text-sm text-bloom-plum/90">
          {lesson.sections.map((sec, idx) => (
            <div key={idx} className="space-y-2">
              <h3 className="text-base font-bold text-bloom-plum">
                {sec.heading}
              </h3>
              <p className="text-bloom-dusty leading-relaxed">
                {renderParagraphWithTerms(sec.body, sec.medicalTerms)}
              </p>
              {sec.tip && (
                <div className="p-3.5 rounded-2xl bg-bloom-bg border border-bloom-secondary/60 text-xs text-bloom-dusty font-semibold flex items-start gap-2.5">
                  <span className="text-base">💡</span>
                  <p>{sec.tip}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 bg-bloom-bg/60 border-t border-bloom-border flex items-center justify-between gap-3">
          <span className="text-xs text-bloom-dusty font-semibold">
            Medical terms with ✦ can be clicked for instant explanations!
          </span>

          <button
            type="button"
            onClick={handleComplete}
            disabled={isCompleted}
            className={`py-2 px-5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              isCompleted
                ? 'bg-emerald-100 text-emerald-800 cursor-default'
                : 'btn-primary shadow-none'
            }`}
          >
            <CheckCircle2 size={16} />
            <span>{isCompleted ? 'Completed ✓' : 'Mark Lesson Complete'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

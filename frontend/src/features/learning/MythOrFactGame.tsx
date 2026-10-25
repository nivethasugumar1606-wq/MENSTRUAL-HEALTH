import React, { useState } from 'react';
import { MYTH_OR_FACT_QUESTIONS, MythFactQuestion } from '../../data/quizzes.js';
import { PetalMascot } from '../../components/mascot/PetalMascot.js';
import { Sparkles, CheckCircle2, XCircle, RotateCcw, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

interface MythOrFactGameProps {
  onGameComplete: (score: number, total: number) => Promise<void>;
}

export const MythOrFactGame: React.FC<MythOrFactGameProps> = ({ onGameComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const question = MYTH_OR_FACT_QUESTIONS[currentIndex];

  const handleSelect = (userSaidFact: boolean) => {
    if (hasAnswered) return;
    setSelectedAnswer(userSaidFact);
    setHasAnswered(true);

    const isCorrect = userSaidFact === question.isFact;
    if (isCorrect) {
      setScore((s) => s + 1);
    }
  };

  const handleNext = async () => {
    if (currentIndex < MYTH_OR_FACT_QUESTIONS.length - 1) {
      setCurrentIndex((i) => i + 1);
      setSelectedAnswer(null);
      setHasAnswered(false);
    } else {
      setIsFinished(true);
      await onGameComplete(score + (selectedAnswer === question.isFact ? 0 : 0), MYTH_OR_FACT_QUESTIONS.length);
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#D7C4E8', '#B48AB8', '#F9D8DE', '#765477']
      });
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setHasAnswered(false);
    setScore(0);
    setIsFinished(false);
  };

  if (isFinished) {
    return (
      <div className="bloom-card p-6 sm:p-8 text-center bg-white border border-bloom-secondary space-y-4">
        <PetalMascot imageSrc="/illustrations/girl-ukulele.png" size="lg" />
        <h3 className="text-2xl font-bold text-bloom-plum">
          Myth Buster Challenge Complete!
        </h3>
        <p className="text-sm text-bloom-dusty max-w-md mx-auto">
          You scored <strong className="text-bloom-plum font-extrabold">{score}</strong> out of{' '}
          {MYTH_OR_FACT_QUESTIONS.length}! Understanding scientific facts about our bodies helps keep us healthy and confident.
        </p>

        <div className="pt-2 flex justify-center">
          <button
            onClick={handleRestart}
            className="btn-primary py-2.5 px-6 rounded-xl text-xs font-bold"
          >
            <RotateCcw size={15} />
            <span>Play Again</span>
          </button>
        </div>
      </div>
    );
  }

  const isUserCorrect = selectedAnswer === question.isFact;

  return (
    <div className="bloom-card p-6 bg-white border border-bloom-secondary space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-bloom-border">
        <div className="flex items-center gap-2.5">
          <img
            src="/illustrations/cup-books.png"
            alt="Cup and books"
            className="w-10 h-10 object-contain shrink-0 drop-shadow-xs"
          />
          <div>
            <h3 className="text-base font-bold text-bloom-plum">Myth or Fact?</h3>
            <p className="text-[11px] text-bloom-dusty">
              Question {currentIndex + 1} of {MYTH_OR_FACT_QUESTIONS.length}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-bold text-bloom-mauve bg-bloom-bg px-3 py-1 rounded-full border border-bloom-border">
          <Sparkles size={13} />
          <span>Score: {score}</span>
        </div>
      </div>

      {/* Statement Card */}
      <div className="p-5 rounded-2xl bg-bloom-light border border-bloom-border text-center space-y-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-bloom-dusty">
          Read this statement:
        </span>
        <p className="text-base sm:text-lg font-bold text-bloom-plum max-w-lg mx-auto leading-snug">
          "{question.statement}"
        </p>
      </div>

      {/* Myth / Fact Buttons */}
      {!hasAnswered ? (
        <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
          <button
            type="button"
            onClick={() => handleSelect(false)}
            className="py-3 px-4 rounded-2xl bg-white border-2 border-bloom-mauve/40 hover:border-bloom-mauve text-bloom-plum font-bold text-sm transition hover:bg-bloom-bg shadow-sm"
          >
            🙅‍♀️ It's a MYTH
          </button>
          <button
            type="button"
            onClick={() => handleSelect(true)}
            className="py-3 px-4 rounded-2xl bg-bloom-mauve hover:bg-bloom-dusty text-white font-bold text-sm transition shadow-sm"
          >
            💡 It's a FACT
          </button>
        </div>
      ) : (
        /* Answer Feedback Section */
        <div className="space-y-4 animate-fade-in">
          <div
            className={`p-4 rounded-2xl border flex items-start gap-3 ${
              isUserCorrect
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}
          >
            {isUserCorrect ? (
              <CheckCircle2 size={22} className="text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <XCircle size={22} className="text-rose-500 shrink-0 mt-0.5" />
            )}
            <div className="text-xs sm:text-sm space-y-1">
              <div className="font-bold flex items-center gap-2">
                <span>{isUserCorrect ? 'Correct! 🌟' : 'Not quite!'}</span>
                <span className="font-extrabold uppercase">{question.correctAnswerText}</span>
              </div>
              <p className="leading-relaxed opacity-90">{question.explanation}</p>
              {question.whyMisconceptionExists && (
                <p className="text-[11px] italic pt-1 border-t border-current/10">
                  <strong>Why this myth exists:</strong> {question.whyMisconceptionExists}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleNext}
              className="btn-primary py-2 px-5 text-xs rounded-xl shadow-none"
            >
              <span>{currentIndex === MYTH_OR_FACT_QUESTIONS.length - 1 ? 'Finish Challenge' : 'Next Question'}</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

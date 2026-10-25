import React, { useState } from 'react';
import { QUICK_QUIZZES, QuizTopic, QuizQuestion } from '../../data/quizzes.js';
import { CheckCircle2, XCircle, RotateCcw, ArrowRight, Award, HelpCircle } from 'lucide-react';
import { PetalMascot } from '../../components/mascot/PetalMascot.js';
import confetti from 'canvas-confetti';

interface QuickQuizGameProps {
  onQuizSubmit: (quizId: string, score: number, total: number) => Promise<void>;
}

export const QuickQuizGame: React.FC<QuickQuizGameProps> = ({ onQuizSubmit }) => {
  const [selectedTopic, setSelectedTopic] = useState<QuizTopic>(QUICK_QUIZZES[0]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [answeredHistory, setAnsweredHistory] = useState<{
    question: QuizQuestion;
    chosenIndex: number;
    isCorrect: boolean;
  }[]>([]);
  const [isFinished, setIsFinished] = useState(false);

  const currentQ = selectedTopic.questions[currentIndex];

  const handleSelectOption = (idx: number) => {
    if (hasAnswered) return;
    setSelectedOption(idx);
    setHasAnswered(true);

    const isCorrect = idx === currentQ.correctIndex;
    if (isCorrect) {
      setScore((s) => s + 1);
    }

    setAnsweredHistory((prev) => [
      ...prev,
      {
        question: currentQ,
        chosenIndex: idx,
        isCorrect
      }
    ]);
  };

  const handleNext = async () => {
    if (currentIndex < selectedTopic.questions.length - 1) {
      setCurrentIndex((i) => i + 1);
      setSelectedOption(null);
      setHasAnswered(false);
    } else {
      setIsFinished(true);
      await onQuizSubmit(selectedTopic.id, score, selectedTopic.questions.length);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#D7C4E8', '#B48AB8', '#F9D8DE', '#765477']
      });
    }
  };

  const handleRestart = (topic?: QuizTopic) => {
    if (topic) setSelectedTopic(topic);
    setCurrentIndex(0);
    setSelectedOption(null);
    setHasAnswered(false);
    setScore(0);
    setAnsweredHistory([]);
    setIsFinished(false);
  };

  if (isFinished) {
    return (
      <div className="bloom-card p-6 sm:p-8 bg-white border border-bloom-secondary space-y-5">
        <div className="text-center space-y-3">
          <PetalMascot imageSrc="/illustrations/girl-reading-cat.png" size="lg" />
          <h3 className="text-2xl font-bold text-bloom-plum">
            Quiz Completed!
          </h3>
          <p className="text-sm text-bloom-dusty">
            You scored <strong className="text-bloom-plum font-extrabold">{score}</strong> out of{' '}
            {selectedTopic.questions.length} on <em>{selectedTopic.title}</em>.
          </p>
        </div>

        {/* Review Answers */}
        <div className="space-y-3 pt-3 border-t border-bloom-border">
          <h4 className="text-xs font-bold uppercase tracking-wider text-bloom-dusty">
            Review Your Answers:
          </h4>
          <div className="space-y-2">
            {answeredHistory.map((h, i) => (
              <div
                key={i}
                className={`p-3 rounded-2xl border text-xs space-y-1 ${
                  h.isCorrect
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}
              >
                <div className="font-bold flex items-center justify-between">
                  <span>Q{i + 1}: {h.question.question}</span>
                  <span>{h.isCorrect ? '✓ Correct' : '✗ Incorrect'}</span>
                </div>
                <p className="opacity-90">
                  <strong>Your answer:</strong> {h.question.options[h.chosenIndex]}
                </p>
                {!h.isCorrect && (
                  <p className="text-emerald-800 font-semibold">
                    <strong>Correct answer:</strong> {h.question.options[h.question.correctIndex]}
                  </p>
                )}
                <p className="text-[11px] italic opacity-80 pt-1">
                  {h.question.explanation}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Topic Selector & Retry */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2">
            {QUICK_QUIZZES.map((t) => (
              <button
                key={t.id}
                onClick={() => handleRestart(t)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  selectedTopic.id === t.id
                    ? 'bg-bloom-mauve text-white'
                    : 'bg-bloom-bg text-bloom-dusty hover:bg-bloom-secondary/30'
                }`}
              >
                {t.title}
              </button>
            ))}
          </div>

          <button
            onClick={() => handleRestart()}
            className="btn-primary py-2 px-5 text-xs rounded-xl shadow-none"
          >
            <RotateCcw size={14} />
            <span>Try Again</span>
          </button>
        </div>
      </div>
    );
  }

  const isCorrect = selectedOption === currentQ.correctIndex;

  return (
    <div className="bloom-card p-6 bg-white border border-bloom-secondary space-y-5">
      {/* Header and Topic Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-bloom-border">
        <div className="flex items-center gap-3">
          <img
            src="/illustrations/girl-thinking.png"
            alt="Girl thinking about quiz"
            className="w-11 h-11 sm:w-12 sm:h-12 object-contain shrink-0 drop-shadow-xs"
          />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-bloom-plum">{selectedTopic.title}</h3>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-bloom-secondary/40 text-bloom-dusty px-2 py-0.5 rounded-md">
                {selectedTopic.difficulty}
              </span>
            </div>
            <p className="text-xs text-bloom-dusty">
              Question {currentIndex + 1} of {selectedTopic.questions.length}
            </p>
          </div>
        </div>

        <div className="flex gap-1.5 self-end sm:self-center">
          {QUICK_QUIZZES.map((t) => (
            <button
              key={t.id}
              onClick={() => handleRestart(t)}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition ${
                selectedTopic.id === t.id
                  ? 'bg-bloom-mauve text-white shadow-sm'
                  : 'bg-bloom-bg text-bloom-dusty hover:bg-bloom-secondary/30'
              }`}
            >
              {t.title}
            </button>
          ))}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-bloom-bg h-2 rounded-full overflow-hidden">
        <div
          className="bg-bloom-mauve h-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / selectedTopic.questions.length) * 100}%` }}
        />
      </div>

      {/* Question Card */}
      <div className="p-4 rounded-2xl bg-bloom-light border border-bloom-border">
        <h4 className="text-base sm:text-lg font-bold text-bloom-plum">
          {currentQ.question}
        </h4>
      </div>

      {/* 4 Option Buttons */}
      <div className="grid grid-cols-1 gap-2.5">
        {currentQ.options.map((opt, idx) => {
          let btnStyle = 'bg-white border-bloom-border text-bloom-plum hover:border-bloom-mauve hover:bg-bloom-bg';

          if (hasAnswered) {
            if (idx === currentQ.correctIndex) {
              btnStyle = 'bg-emerald-50 border-emerald-400 text-emerald-900 font-bold';
            } else if (idx === selectedOption) {
              btnStyle = 'bg-rose-50 border-rose-400 text-rose-900 font-bold';
            } else {
              btnStyle = 'bg-white border-bloom-border text-bloom-dusty/60 opacity-60';
            }
          }

          return (
            <button
              key={idx}
              type="button"
              disabled={hasAnswered}
              onClick={() => handleSelectOption(idx)}
              className={`w-full p-3.5 rounded-2xl border text-left text-xs sm:text-sm transition flex items-center justify-between ${btnStyle}`}
            >
              <span>{opt}</span>
              {hasAnswered && idx === currentQ.correctIndex && (
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              )}
              {hasAnswered && idx === selectedOption && idx !== currentQ.correctIndex && (
                <XCircle size={16} className="text-rose-500 shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* Explanation Feedback */}
      {hasAnswered && (
        <div className="p-4 rounded-2xl bg-bloom-bg border border-bloom-secondary/60 space-y-3 animate-fade-in">
          <div className="text-xs sm:text-sm text-bloom-plum">
            <span className="font-bold mr-1">
              {isCorrect ? '🌟 Brilliant!' : '💡 Learning moment:'}
            </span>
            <span>{currentQ.explanation}</span>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleNext}
              className="btn-primary py-2 px-5 text-xs rounded-xl shadow-none"
            >
              <span>{currentIndex === selectedTopic.questions.length - 1 ? 'View Results' : 'Next Question'}</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

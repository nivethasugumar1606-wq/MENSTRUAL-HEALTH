import React, { useState, useRef, useEffect } from 'react';
import { findGlossaryTerm } from '../../data/glossary.js';
import { BookOpen, X } from 'lucide-react';

interface GlossaryTooltipProps {
  term: string;
  children?: React.ReactNode;
  onOpenFullGlossary?: (term: string) => void;
}

export const GlossaryTooltip: React.FC<GlossaryTooltipProps> = ({
  term,
  children,
  onOpenFullGlossary
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const info = findGlossaryTerm(term);
  const ref = useRef<HTMLSpanElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  if (!info) {
    return <span>{children || term}</span>;
  }

  return (
    <span ref={ref} className="relative inline-block">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-0.5 text-bloom-dusty font-bold underline decoration-bloom-mauve decoration-2 underline-offset-4 hover:text-bloom-plum hover:bg-bloom-secondary/30 rounded px-1 transition-colors"
        aria-expanded={isOpen}
        title={`Click for simple explanation of ${info.term}`}
      >
        <span>{children || info.term}</span>
        <span className="text-[10px] text-bloom-mauve font-extrabold select-none">✦</span>
      </button>

      {isOpen && (
        <div className="absolute z-50 left-1/2 -translate-x-1/2 bottom-full mb-2 w-72 sm:w-80 p-3.5 bg-white rounded-2xl border border-bloom-secondary shadow-bloomHover text-left text-xs leading-relaxed animate-fade-in">
          <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-bloom-border">
            <div>
              <span className="font-bold text-bloom-plum text-sm">{info.term}</span>
              {info.pronunciation && (
                <span className="text-[11px] text-bloom-dusty italic ml-2">
                  ({info.pronunciation})
                </span>
              )}
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-bloom-dusty hover:text-bloom-plum p-0.5"
              aria-label="Close explanation"
            >
              <X size={14} />
            </button>
          </div>

          <p className="text-bloom-dusty font-medium mb-2.5">
            {info.simpleDefinition}
          </p>

          {onOpenFullGlossary && (
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onOpenFullGlossary(info.term);
              }}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 bg-bloom-bg hover:bg-bloom-secondary/50 text-bloom-dusty font-bold rounded-xl transition text-[11px]"
            >
              <BookOpen size={12} />
              <span>Read more in Medical Glossary</span>
            </button>
          )}

          {/* Popover arrow */}
          <div className="w-2.5 h-2.5 bg-white border-b border-r border-bloom-secondary transform rotate-45 absolute -bottom-1.5 left-1/2 -translate-x-1/2"></div>
        </div>
      )}
    </span>
  );
};

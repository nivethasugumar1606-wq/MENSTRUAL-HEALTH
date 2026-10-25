import React, { useState } from 'react';
import { MEDICAL_GLOSSARY } from '../../data/glossary.js';
import { Search, X, BookOpen, Volume2 } from 'lucide-react';

interface GlossaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTerm?: string;
}

export const GlossaryModal: React.FC<GlossaryModalProps> = ({
  isOpen,
  onClose,
  initialTerm = ''
}) => {
  const [search, setSearch] = useState(initialTerm);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  if (!isOpen) return null;

  const categories = [
    { id: 'all', label: 'All Terms' },
    { id: 'cycle', label: 'Cycle & Periods' },
    { id: 'anatomy', label: 'Body Anatomy' },
    { id: 'puberty', label: 'Puberty Growth' },
    { id: 'hygiene', label: 'Hygiene & Care' },
    { id: 'health', label: 'Health & Comfort' }
  ];

  const filtered = MEDICAL_GLOSSARY.filter((item) => {
    const matchesSearch =
      item.term.toLowerCase().includes(search.toLowerCase()) ||
      item.simpleDefinition.toLowerCase().includes(search.toLowerCase()) ||
      item.detailedExplanation.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bloom-plum/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl border border-bloom-secondary shadow-bloomHover w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-bloom-border flex items-center justify-between bg-bloom-bg/60">
          <div className="flex items-center gap-3">
            <img
              src="/illustrations/girl-reading-cat.png"
              alt="Studying medical terms"
              className="w-12 h-12 object-contain drop-shadow-sm shrink-0"
            />
            <div>
              <h2 className="text-xl font-bold text-bloom-plum">Medical Words Dictionary</h2>
              <p className="text-xs text-bloom-dusty">Simple, comforting explanations in plain English</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white hover:bg-bloom-secondary/40 text-bloom-dusty hover:text-bloom-plum flex items-center justify-center transition"
            aria-label="Close glossary"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search & Filters */}
        <div className="p-4 bg-white border-b border-bloom-border space-y-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-bloom-dusty" size={18} />
            <input
              type="text"
              placeholder="Search medical words (e.g. Ovulation, Cervix, Cramps)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-bloom-bg border border-bloom-border rounded-xl text-sm focus:outline-none focus:border-bloom-dusty text-bloom-plum"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition ${
                  selectedCategory === cat.id
                    ? 'bg-bloom-mauve text-white shadow-sm'
                    : 'bg-bloom-bg text-bloom-dusty hover:bg-bloom-secondary/40'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Term Cards List */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-bloom-dusty">
              <p className="font-bold text-base">No medical terms found</p>
              <p className="text-xs mt-1">Try another keyword or click "All Terms" to explore.</p>
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.term}
                className="p-4 rounded-2xl bg-bloom-light border border-bloom-border hover:border-bloom-secondary transition"
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-bloom-plum">{item.term}</h3>
                    {item.pronunciation && (
                      <span className="text-xs text-bloom-dusty italic flex items-center gap-1 bg-white px-2 py-0.5 rounded-lg border border-bloom-border">
                        <Volume2 size={12} className="text-bloom-mauve" />
                        {item.pronunciation}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-bloom-dusty bg-bloom-secondary/40 px-2 py-0.5 rounded-md">
                    {item.category}
                  </span>
                </div>

                <p className="text-sm font-semibold text-bloom-dusty mb-2">
                  {item.simpleDefinition}
                </p>

                <p className="text-xs text-bloom-plum/80 leading-relaxed bg-white/80 p-2.5 rounded-xl border border-bloom-border/60">
                  {item.detailedExplanation}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-bloom-bg border-t border-bloom-border text-center text-xs text-bloom-dusty font-medium">
          Need more medical advice? Talk to your parent, guardian, school nurse, or doctor.
        </div>
      </div>
    </div>
  );
};

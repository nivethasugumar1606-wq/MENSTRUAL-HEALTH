import React from 'react';
import { ProductItem } from '../../data/products.js';
import { ProductImageWithFallback } from '../../components/products/ProductIllustration.js';
import { X, Check, AlertTriangle, Sparkles, RefreshCw, Trash2, HeartHandshake } from 'lucide-react';

interface ProductDetailModalProps {
  product: ProductItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isOpen,
  onClose
}) => {
  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bloom-plum/50 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl border border-bloom-secondary shadow-bloomHover w-full max-w-2xl my-8 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-bloom-border flex items-center justify-between bg-bloom-bg/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md ${
                product.type === 'reusable'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-bloom-secondary/60 text-bloom-plum'
              }`}
            >
              {product.type === 'reusable' ? '🌿 Reusable' : '📦 Disposable'}
            </span>
            <span className="text-xs font-bold text-bloom-dusty capitalize">
              {product.category} Protection
            </span>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white hover:bg-bloom-secondary/40 text-bloom-dusty hover:text-bloom-plum flex items-center justify-center transition"
            aria-label="Close product guide"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs sm:text-sm leading-relaxed text-bloom-plum">
          {/* Top Title & Image */}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-bloom-plum mb-1">
              {product.name}
            </h2>
            <p className="text-bloom-dusty font-medium mb-4">
              {product.shortIntro}
            </p>
            <ProductImageWithFallback
              src={product.imageUrl}
              alt={product.imageAlt}
              type={product.fallbackSvgType}
            />
          </div>

          {/* What it is & used for */}
          <div className="p-4 rounded-2xl bg-bloom-light border border-bloom-border space-y-2">
            <div>
              <h3 className="font-bold text-bloom-plum text-xs uppercase tracking-wider">
                What it is:
              </h3>
              <p className="text-bloom-dusty">{product.whatItIs}</p>
            </div>
            <div>
              <h3 className="font-bold text-bloom-plum text-xs uppercase tracking-wider">
                What it is used for:
              </h3>
              <p className="text-bloom-dusty">{product.whatItIsUsedFor}</p>
            </div>
          </div>

          {/* Step by step use */}
          <div>
            <h3 className="text-base font-bold text-bloom-plum mb-2">
              Step-by-Step: How to Use
            </h3>
            <ol className="space-y-2">
              {product.stepByStepUse.map((step, idx) => (
                <li
                  key={idx}
                  className="p-3 rounded-2xl bg-bloom-bg border border-bloom-border flex items-start gap-3"
                >
                  <span className="w-5 h-5 rounded-full bg-bloom-mauve text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="text-bloom-dusty">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Changing frequency & Hygiene */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-bloom-light border border-bloom-border space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-bloom-plum text-xs">
                <RefreshCw size={14} className="text-bloom-mauve" />
                <span>Changing Frequency</span>
              </div>
              <p className="text-bloom-dusty text-xs">{product.changeFrequency}</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-bloom-light border border-bloom-border space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-bloom-plum text-xs">
                <Trash2 size={14} className="text-[#E26D7D]" />
                <span>Safe Disposal</span>
              </div>
              <p className="text-bloom-dusty text-xs">{product.safeDisposal}</p>
            </div>
          </div>

          {/* Cleaning care if reusable */}
          {product.cleaningCare && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-1">
              <h4 className="font-bold text-xs uppercase tracking-wide text-emerald-800">
                Cleaning & Care Instructions:
              </h4>
              <p className="text-xs text-emerald-900 leading-relaxed">{product.cleaningCare}</p>
            </div>
          )}

          {/* Hygiene and Safety */}
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-amber-800 text-xs">
              <AlertTriangle size={14} />
              <span>Hygiene & Safety Guidance</span>
            </div>
            <p className="text-xs text-amber-900 leading-relaxed">{product.hygieneSafety}</p>
          </div>

          {/* Pros & Limitations */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-bloom-bg border border-bloom-border space-y-1.5">
              <h4 className="font-bold text-bloom-plum text-xs">Advantages:</h4>
              <ul className="space-y-1">
                {product.pros.map((p, idx) => (
                  <li key={idx} className="flex items-start gap-1.5 text-xs text-bloom-dusty">
                    <Check size={13} className="text-emerald-600 shrink-0 mt-0.5" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-3.5 rounded-2xl bg-bloom-bg border border-bloom-border space-y-1.5">
              <h4 className="font-bold text-bloom-plum text-xs">Limitations:</h4>
              <ul className="space-y-1">
                {product.limitations.map((l, idx) => (
                  <li key={idx} className="flex items-start gap-1.5 text-xs text-bloom-dusty">
                    <span className="text-bloom-mauve font-bold shrink-0">•</span>
                    <span>{l}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Trusted Adult Advice */}
          {product.trustedAdultAdvice && (
            <div className="p-4 rounded-2xl bg-bloom-secondary/30 border border-bloom-secondary flex items-start gap-3">
              <HeartHandshake size={20} className="text-bloom-dusty shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs">
                <span className="font-bold text-bloom-plum">Gentle Reminder:</span>
                <p className="text-bloom-dusty">{product.trustedAdultAdvice}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-bloom-bg border-t border-bloom-border flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="btn-primary py-2 px-6 text-xs rounded-xl shadow-none"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};

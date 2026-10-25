import React, { useState } from 'react';

interface ProductImageProps {
  src: string;
  alt: string;
  type: string; // 'pad' | 'cloth-pad' | 'liner' | 'underwear' | 'tampon' | 'cup'
  className?: string;
}

export const ProductImageWithFallback: React.FC<ProductImageProps> = ({
  src,
  alt,
  type,
  className = 'w-full h-48 object-cover rounded-2xl'
}) => {
  const [imageFailed, setImageFailed] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  if (imageFailed) {
    return <FallbackProductIllustration type={type} alt={alt} />;
  }

  return (
    <div className="relative w-full h-48 overflow-hidden rounded-2xl bg-bloom-light border border-bloom-border flex items-center justify-center">
      {!imageLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-bloom-light animate-pulse">
          <span className="text-xs text-bloom-dusty font-semibold">Loading product image...</span>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`${className} transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setImageLoaded(true)}
        onError={() => setImageFailed(true)}
      />
    </div>
  );
};

export const FallbackProductIllustration: React.FC<{ type: string; alt?: string }> = ({ type, alt }) => {
  return (
    <div
      className="w-full h-48 rounded-2xl bg-gradient-to-b from-[#FAF6FC] to-[#EFE6F3] border border-bloom-border flex flex-col items-center justify-center p-4 select-none relative overflow-hidden"
      role="img"
      aria-label={alt || 'Product illustration'}
    >
      <div className="w-28 h-28 flex items-center justify-center">
        {type === 'pad' && (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
            {/* Pad body */}
            <rect x="35" y="15" width="30" height="70" rx="15" fill="#FFFFFF" stroke="#B48AB8" strokeWidth="2.5" />
            {/* Embossed channel lines */}
            <path d="M42 30 Q50 35 58 30" stroke="#D7C4E8" strokeWidth="2" fill="none" />
            <path d="M42 70 Q50 65 58 70" stroke="#D7C4E8" strokeWidth="2" fill="none" />
            <circle cx="50" cy="50" r="5" fill="#F5EFF8" stroke="#D7C4E8" strokeWidth="1.5" />
            {/* Wings */}
            <path d="M35 40 C20 42 20 58 35 60 Z" fill="#FFFFFF" stroke="#B48AB8" strokeWidth="2" />
            <path d="M65 40 C80 42 80 58 65 60 Z" fill="#FFFFFF" stroke="#B48AB8" strokeWidth="2" />
          </svg>
        )}

        {type === 'cloth-pad' && (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
            {/* Fabric outer with floral dots */}
            <rect x="34" y="16" width="32" height="68" rx="16" fill="#F5EFF8" stroke="#765477" strokeWidth="2.5" />
            <circle cx="50" cy="35" r="2.5" fill="#B48AB8" />
            <circle cx="44" cy="50" r="2.5" fill="#B48AB8" />
            <circle cx="56" cy="50" r="2.5" fill="#B48AB8" />
            <circle cx="50" cy="65" r="2.5" fill="#B48AB8" />
            {/* Fabric wings with snap button */}
            <path d="M34 40 C18 42 18 58 34 60 Z" fill="#D7C4E8" stroke="#765477" strokeWidth="2" />
            <path d="M66 40 C82 42 82 58 66 60 Z" fill="#D7C4E8" stroke="#765477" strokeWidth="2" />
            <circle cx="26" cy="50" r="3" fill="#FFFFFF" stroke="#765477" strokeWidth="1.5" />
            <circle cx="74" cy="50" r="3" fill="#765477" />
          </svg>
        )}

        {type === 'liner' && (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
            {/* Thin curved pantyliner */}
            <path
              d="M40 18 C35 30 38 45 40 50 C42 55 45 70 40 82 C55 85 62 70 60 50 C58 35 65 20 40 18 Z"
              fill="#FFFFFF"
              stroke="#B48AB8"
              strokeWidth="2"
            />
            <path d="M45 35 Q50 40 55 35" stroke="#E8DCEF" strokeWidth="1.5" fill="none" />
            <path d="M45 65 Q50 60 55 65" stroke="#E8DCEF" strokeWidth="1.5" fill="none" />
          </svg>
        )}

        {type === 'underwear' && (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
            {/* Underwear silhouette */}
            <path
              d="M20 35 L80 35 L70 70 C55 78 45 78 30 70 Z"
              fill="#342C40"
              stroke="#765477"
              strokeWidth="2"
            />
            {/* Elastic waistband in secondary lavender */}
            <rect x="20" y="32" width="60" height="6" rx="2" fill="#D7C4E8" />
            {/* Absorbent leak-barrier layer highlighted */}
            <path d="M42 45 L58 45 L54 68 C50 71 48 71 44 68 Z" fill="#B48AB8" opacity="0.8" />
          </svg>
        )}

        {type === 'tampon' && (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
            {/* Cotton tampon cylinder */}
            <rect x="42" y="20" width="16" height="42" rx="8" fill="#FFFFFF" stroke="#B48AB8" strokeWidth="2.5" />
            {/* Texture grooves */}
            <line x1="46" y1="28" x2="46" y2="52" stroke="#E8DCEF" strokeWidth="1.5" strokeDasharray="2 2" />
            <line x1="50" y1="28" x2="50" y2="52" stroke="#E8DCEF" strokeWidth="1.5" strokeDasharray="2 2" />
            <line x1="54" y1="28" x2="54" y2="52" stroke="#E8DCEF" strokeWidth="1.5" strokeDasharray="2 2" />
            {/* Braided cotton cord */}
            <path d="M50 62 Q52 70 48 76 Q52 82 50 88" stroke="#765477" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          </svg>
        )}

        {type === 'cup' && (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
            {/* Cup rim */}
            <ellipse cx="50" cy="28" rx="18" ry="5" fill="#D7C4E8" stroke="#765477" strokeWidth="2.5" />
            {/* Cup bell body */}
            <path
              d="M32 28 C34 52 42 66 50 72 C58 66 66 52 68 28 Z"
              fill="#B48AB8"
              opacity="0.9"
              stroke="#765477"
              strokeWidth="2.5"
            />
            {/* Measurement suction holes and stem */}
            <circle cx="40" cy="38" r="1.5" fill="#FFFFFF" />
            <circle cx="60" cy="38" r="1.5" fill="#FFFFFF" />
            <rect x="48.5" y="72" width="3" height="15" rx="1.5" fill="#765477" />
          </svg>
        )}
      </div>
      <span className="text-[11px] font-bold text-bloom-dusty tracking-wide uppercase mt-1">
        Authentic Educational Guide
      </span>
    </div>
  );
};

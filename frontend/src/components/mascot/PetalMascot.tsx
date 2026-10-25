import React from 'react';

export type MascotMood = 'happy' | 'waving' | 'celebrating' | 'thinking' | 'soothing' | 'proud';

interface PetalMascotProps {
  mood?: MascotMood;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  speechText?: string;
  imageSrc?: string;
  imageAlt?: string;
}

const moodImageMap: Record<MascotMood, { src: string; alt: string }> = {
  waving: { src: '/illustrations/girl-peace.png', alt: 'Nurtura girl waving hello' },
  happy: { src: '/illustrations/girl-boba.png', alt: 'Nurtura girl with drink' },
  celebrating: { src: '/illustrations/girl-ukulele.png', alt: 'Nurtura girl celebrating with ukulele' },
  thinking: { src: '/illustrations/girl-thinking.png', alt: 'Nurtura girl thinking and learning' },
  soothing: { src: '/illustrations/girl-teddy.png', alt: 'Nurtura girl relaxing with teddy bear' },
  proud: { src: '/illustrations/girl-camera.png', alt: 'Nurtura girl capturing achievements' },
};

export const PetalMascot: React.FC<PetalMascotProps> = ({
  mood = 'happy',
  size = 'md',
  className = '',
  speechText,
  imageSrc,
  imageAlt
}) => {
  const sizeMap = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16 sm:w-20 sm:h-20',
    lg: 'w-24 h-24 sm:w-28 sm:h-28',
    xl: 'w-32 h-32 sm:w-36 sm:h-36'
  };

  const defaultInfo = moodImageMap[mood] || moodImageMap.happy;
  const finalSrc = imageSrc || defaultInfo.src;
  const finalAlt = imageAlt || defaultInfo.alt;

  return (
    <div className={`inline-flex flex-col items-center select-none ${className}`}>
      {speechText && (
        <div className="mb-2 bg-white px-3.5 py-2 rounded-2xl border border-bloom-secondary shadow-bloom text-bloom-plum text-xs sm:text-sm font-semibold max-w-xs text-center relative animate-fade-in">
          {speechText}
          <div className="w-2.5 h-2.5 bg-white border-b border-r border-bloom-secondary transform rotate-45 absolute -bottom-1.5 left-1/2 -translate-x-1/2"></div>
        </div>
      )}

      <div className={`${sizeMap[size]} relative animate-gentle-bounce flex items-center justify-center shrink-0`}>
        <img
          src={finalSrc}
          alt={finalAlt}
          className="w-full h-full object-contain filter drop-shadow-sm"
        />
      </div>
    </div>
  );
};

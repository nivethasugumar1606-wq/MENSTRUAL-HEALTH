import React from 'react';

interface NurturaLogoIconProps {
  size?: number | string;
  className?: string;
}

export const NurturaLogoIcon: React.FC<NurturaLogoIconProps> = ({
  size = 28,
  className = ''
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      aria-label="Nurtura logo"
    >
      {/* Purple circular badge matching reference image */}
      <circle cx="16" cy="16" r="16" fill="#784E82" />

      {/* Elegant crescent moon on left side facing towards the star */}
      <path
        d="M17.5 9.2C13.2 9.2 9.8 12.3 9.8 16.2C9.8 20.1 13.2 23.2 17.5 23.2C18.6 23.2 19.6 22.9 20.5 22.4C16.8 21.6 14.1 19.1 14.1 16.2C14.1 13.3 16.8 10.8 20.5 10C19.6 9.5 18.6 9.2 17.5 9.2Z"
        fill="#FDEEF4"
      />

      {/* 4-pointed sparkle star in the upper right quadrant */}
      <path
        d="M22.8 9.5C22.8 11.2 23.6 12 25.3 12C23.6 12 22.8 12.8 22.8 14.5C22.8 12.8 22 12 20.3 12C22 12 22.8 11.2 22.8 9.5Z"
        fill="#FDEEF4"
      />
    </svg>
  );
};

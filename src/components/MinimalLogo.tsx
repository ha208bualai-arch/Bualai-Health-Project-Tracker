import React, { useState } from 'react';

interface MinimalLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const MinimalLogo: React.FC<MinimalLogoProps> = ({ size = 'md', className = '' }) => {
  const [imgError, setImgError] = useState(false);

  const sizeClasses = {
    sm: 'w-9 h-9 rounded-lg',
    md: 'w-11 h-11 rounded-xl',
    lg: 'w-16 h-16 rounded-2xl',
  }[size];

  const iconSizes = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  }[size];

  return (
    <div
      className={`relative overflow-hidden bg-white p-0.5 border border-emerald-300 shadow-xs flex items-center justify-center shrink-0 transition-transform hover:scale-105 ${sizeClasses} ${className}`}
      title="ตราสัญลักษณ์มินิมอล ระบบติดตามแผนงานโครงการสาธารณสุข บัวลาย"
    >
      {!imgError ? (
        <img
          src="/src/assets/images/minimal_pastel_green_logo_1790848624254.jpg"
          alt="Minimal Pastel Green Plan Logo"
          referrerPolicy="no-referrer"
          className="w-full h-full object-contain rounded-lg"
          onError={() => setImgError(true)}
        />
      ) : (
        /* Pure Minimalist SVG Logo - Deep Emerald & Pastel Mint Green */
        <svg
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`${iconSizes} text-emerald-900`}
        >
          {/* Rounded minimal base */}
          <rect width="40" height="40" rx="10" fill="#064E3B" />
          {/* Pastel mint accent glow */}
          <rect x="3" y="3" width="34" height="34" rx="8" stroke="#A7F3D0" strokeOpacity="0.6" strokeWidth="1.5" />
          {/* Minimalist Health Cross */}
          <path
            d="M20 9V31M9 20H31"
            stroke="#D1FAE5"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          {/* Forward progress timeline node */}
          <circle cx="28" cy="20" r="3.5" fill="#34D399" />
          <circle cx="28" cy="20" r="1.5" fill="#FFFFFF" />
        </svg>
      )}
    </div>
  );
};

import React from 'react';

interface EngineerLogoProps {
  className?: string;
  size?: number;
}

export const EngineerLogo: React.FC<EngineerLogoProps> = ({ className = 'w-10 h-10', size }) => {
  const style = size ? { width: `${size}px`, height: `${size}px` } : undefined;

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-sm shadow-emerald-500/20 text-white ${className}`}
      style={style}
    >
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-[72%] h-[72%]"
      >
        {/* Safety Helmet / Engineer Hard Hat */}
        <path
          d="M10 26C10 18.268 16.268 12 24 12C31.732 12 38 18.268 38 26V28H10V26Z"
          fill="white"
          opacity="0.96"
        />
        {/* Hat Rim / Visor */}
        <path
          d="M7 28C7 26.8954 7.89543 26 9 26H39C40.1046 26 41 26.8954 41 28C41 29.1046 40.1046 30 39 30H9C7.89543 30 7 29.1046 7 28Z"
          fill="white"
        />
        {/* Center Ridge of Hard Hat */}
        <path
          d="M21.5 12.5C21.5 12.5 22.5 11 24 11C25.5 11 26.5 12.5 26.5 12.5V26H21.5V12.5Z"
          fill="#10b981"
        />
        {/* Crossed Drafting Compass / Wrench & Ruler Motif */}
        <path
          d="M16 34L22 40M22 40L23.5 38.5M22 40L20.5 41.5"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M32 34L26 40M26 40L24.5 38.5M26 40L27.5 41.5"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Small Engineer Star / Accent */}
        <circle cx="24" cy="20" r="2.2" fill="#047857" />
      </svg>
    </div>
  );
};

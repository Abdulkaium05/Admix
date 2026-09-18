import React from 'react';

interface DuetLogoProps {
  className?: string;
  size?: number;
}

export const DuetLogo: React.FC<DuetLogoProps> = ({ className = 'w-12 h-12', size }) => {
  const style = size ? { width: `${size}px`, height: `${size}px` } : undefined;

  // Generate 24 gear teeth points for the green cogwheel
  const gearTeeth = [];
  const numTeeth = 24;
  for (let i = 0; i < numTeeth; i++) {
    const angle1 = (i * 360) / numTeeth;
    const angle2 = ((i + 0.5) * 360) / numTeeth;
    gearTeeth.push({ angle1, angle2 });
  }

  return (
    <div className={`relative inline-flex items-center justify-center select-none ${className}`} style={style}>
      <svg
        viewBox="0 0 200 200"
        className="w-full h-full drop-shadow-sm transition-transform duration-300 hover:scale-105"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="duet-red-grid" width="6" height="6" patternUnits="userSpaceOnUse">
            <rect width="6" height="6" fill="#FFFFFF" />
            <path d="M 6 0 L 0 0 0 6" fill="none" stroke="#dc2626" strokeWidth="0.8" opacity="0.85" />
          </pattern>
          <filter id="subtle-shadow" x="-5%" y="-5%" width="110%" height="110%">
            <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.15" />
          </filter>
        </defs>

        {/* Outer Cogwheel Gear */}
        <g id="gear-teeth">
          {gearTeeth.map((tooth, idx) => {
            const rad = (tooth.angle1 * Math.PI) / 180;
            const x = 100 + 94 * Math.cos(rad);
            const y = 100 + 94 * Math.sin(rad);
            return (
              <rect
                key={idx}
                x="93"
                y="6"
                width="14"
                height="16"
                rx="2"
                fill="#059669"
                transform={`rotate(${tooth.angle1} 100 100)`}
              />
            );
          })}
        </g>

        {/* Outer Circular Ring */}
        <circle cx="100" cy="100" r="88" fill="#059669" />
        <circle cx="100" cy="100" r="72" fill="#FFFFFF" />

        {/* Inner Grid Region with Red Mesh */}
        <ellipse cx="100" cy="104" rx="66" ry="46" fill="url(#duet-red-grid)" stroke="#dc2626" strokeWidth="1" />

        {/* Top Arc Banner - প্রযুক্তিই প্রগতি */}
        <path
          d="M 40 76 A 68 68 0 0 1 160 76 L 152 90 A 54 54 0 0 0 48 90 Z"
          fill="#059669"
        />
        <path id="top-text-path" d="M 46 83 A 58 58 0 0 1 154 83" fill="none" />
        <text fill="#FFFFFF" fontSize="11" fontWeight="bold" textAnchor="middle">
          <textPath href="#top-text-path" startOffset="50%">
            প্রযুক্তিই প্রগতি
          </textPath>
        </text>

        {/* Center Top: Open Book */}
        <g id="open-book" transform="translate(76, 52)">
          {/* Book left page */}
          <path
            d="M 2 8 C 12 3, 22 7, 24 9 L 24 25 C 22 23, 12 19, 2 24 Z"
            fill="#FFFFFF"
            stroke="#059669"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          {/* Book right page */}
          <path
            d="M 46 8 C 36 3, 26 7, 24 9 L 24 25 C 26 23, 36 19, 46 24 Z"
            fill="#FFFFFF"
            stroke="#059669"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          {/* Center spine */}
          <line x1="24" y1="9" x2="24" y2="26" stroke="#059669" strokeWidth="2.5" />
          {/* Page lines */}
          <path d="M 7 13 C 13 10, 19 12, 21 14" stroke="#059669" strokeWidth="1" fill="none" />
          <path d="M 7 17 C 13 14, 19 16, 21 18" stroke="#059669" strokeWidth="1" fill="none" />
          <path d="M 41 13 C 35 10, 29 12, 27 14" stroke="#059669" strokeWidth="1" fill="none" />
          <path d="M 41 17 C 35 14, 29 16, 27 18" stroke="#059669" strokeWidth="1" fill="none" />
        </g>

        {/* Middle Left: Sine Wave (Electrical/Frequency) */}
        <g id="sine-wave">
          <line x1="38" y1="120" x2="105" y2="120" stroke="#059669" strokeWidth="1" strokeDasharray="2,2" opacity="0.5" />
          <path
            d="M 38 120 Q 52 104 66 120 T 94 120 T 106 120"
            fill="none"
            stroke="#059669"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
        </g>

        {/* Middle Right: Civil Engineering City Buildings */}
        <g id="city-skyline" fill="#059669">
          {/* Building 1 */}
          <rect x="108" y="112" width="14" height="34" />
          <rect x="111" y="116" width="3" height="4" fill="#FFFFFF" />
          <rect x="116" y="116" width="3" height="4" fill="#FFFFFF" />
          <rect x="111" y="124" width="3" height="4" fill="#FFFFFF" />
          <rect x="116" y="124" width="3" height="4" fill="#FFFFFF" />
          <rect x="111" y="132" width="3" height="4" fill="#FFFFFF" />
          <rect x="116" y="132" width="3" height="4" fill="#FFFFFF" />

          {/* Building 2 (Tallest) */}
          <rect x="126" y="102" width="16" height="44" />
          <rect x="129" y="106" width="3" height="4" fill="#FFFFFF" />
          <rect x="135" y="106" width="3" height="4" fill="#FFFFFF" />
          <rect x="129" y="114" width="3" height="4" fill="#FFFFFF" />
          <rect x="135" y="114" width="3" height="4" fill="#FFFFFF" />
          <rect x="129" y="122" width="3" height="4" fill="#FFFFFF" />
          <rect x="135" y="122" width="3" height="4" fill="#FFFFFF" />
          <rect x="129" y="130" width="3" height="4" fill="#FFFFFF" />
          <rect x="135" y="130" width="3" height="4" fill="#FFFFFF" />

          {/* Building 3 */}
          <rect x="144" y="118" width="12" height="28" />
          <rect x="147" y="122" width="3" height="4" fill="#FFFFFF" />
          <rect x="147" y="129" width="3" height="4" fill="#FFFFFF" />
        </g>

        {/* Bottom Arc Banner - DUET */}
        <path
          d="M 44 146 A 64 64 0 0 0 156 146 L 146 164 A 78 78 0 0 1 54 164 Z"
          fill="#059669"
        />
        <path id="bottom-text-path" d="M 52 160 A 70 70 0 0 0 148 160" fill="none" />
        <text fill="#FFFFFF" fontSize="17" fontWeight="900" letterSpacing="3" textAnchor="middle">
          <textPath href="#bottom-text-path" startOffset="50%">
            DUET
          </textPath>
        </text>
      </svg>
    </div>
  );
};

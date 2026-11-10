import React from 'react';

interface LogoProps {
  className?: string;
  showTagline?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const ResQNetLogo: React.FC<LogoProps> = ({
  className = '',
  showTagline = false,
  size = 'md'
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12'
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Shield + Medical Cross + Location Pin Mark */}
      <div
        className={`${iconSizes[size]} relative rounded-lg bg-[#14243D] border border-[#223552] flex items-center justify-center shadow-md overflow-hidden shrink-0 group`}
      >
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full p-1.5"
        >
          {/* Shield Outline in Navy & Blue */}
          <path
            d="M24 4L8 10V22C8 32.5 15 41.5 24 44C33 41.5 40 32.5 40 22V10L24 4Z"
            fill="#101D33"
            stroke="#3986D8"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {/* Medical Emergency Cross in Red */}
          <path
            d="M21 16H27V21H32V27H27V32H21V27H16V21H21V16Z"
            fill="#E5484D"
          />

          {/* Location Pin Center Target in Soft White */}
          <circle cx="24" cy="24" r="2.5" fill="#F3F6FA" />

          {/* Network Connection Node Accents */}
          <circle cx="16" cy="12" r="1.5" fill="#3986D8" />
          <circle cx="32" cy="12" r="1.5" fill="#3986D8" />
        </svg>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 leading-none">
          <span className={`${textSizes[size]} font-extrabold tracking-tight text-[#F3F6FA]`}>
            RESQ<span className="text-[#E5484D]">NET</span>
          </span>
          <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#14243D] text-[#3986D8] border border-[#223552]">
            SMART CAD
          </span>
        </div>

        {showTagline && (
          <span className="text-[11px] text-[#A7B3C5] font-medium tracking-wide mt-1">
            One Report. One Response. Every Life Matters.
          </span>
        )}
      </div>
    </div>
  );
};

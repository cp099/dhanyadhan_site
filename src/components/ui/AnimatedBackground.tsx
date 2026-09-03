import React from 'react';

export function AnimatedBackground() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none -z-10 overflow-hidden select-none"
    >
      {/* 1. Subtle Ambient Glowing Luminous Orbs */}
      <div className="absolute top-[-10%] left-[-5%] w-[45vw] h-[45vw] max-w-[650px] max-h-[650px] rounded-full bg-gradient-to-br from-[#22c55e]/6 to-[#155e42]/3 blur-3xl animate-drift-slow-1" />
      <div className="absolute top-[35%] right-[-8%] w-[50vw] h-[50vw] max-w-[700px] max-h-[700px] rounded-full bg-gradient-to-bl from-amber-500/4 via-[#155e42]/4 to-transparent blur-3xl animate-drift-slow-2" />
      <div className="absolute bottom-[-10%] left-[20%] w-[40vw] h-[40vw] max-w-[600px] max-h-[600px] rounded-full bg-gradient-to-tr from-[#16a34a]/5 to-transparent blur-3xl animate-drift-slow-3" />

      {/* 2. Full-Screen Minimal Animated SVG Canvas */}
      <svg
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <defs>
          {/* Subtle micro dot grid pattern */}
          <pattern
            id="subtle-dots"
            width="36"
            height="36"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="2" cy="2" r="0.9" fill="#155e42" fillOpacity="0.04" />
          </pattern>

          {/* Gradients for organic waves */}
          <linearGradient id="waveGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#155e42" stopOpacity="0.04" />
            <stop offset="50%" stopColor="#22c55e" stopOpacity="0.07" />
            <stop offset="100%" stopColor="#155e42" stopOpacity="0.03" />
          </linearGradient>

          <linearGradient id="waveGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#155e42" stopOpacity="0.03" />
            <stop offset="50%" stopColor="#ca8a04" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#155e42" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* Base Micro Dots Grid */}
        <rect width="100%" height="100%" fill="url(#subtle-dots)" />

        {/* Wave 1: Gentle Top-Right Topographic Ribbon */}
        <path
          d="M 0,160 Q 350,90 700,180 T 1400,130 T 2100,190"
          fill="none"
          stroke="url(#waveGrad1)"
          strokeWidth="1.5"
          className="animate-wave-slow-1"
        />
        <path
          d="M 0,190 Q 380,120 740,210 T 1440,160 T 2100,220"
          fill="none"
          stroke="url(#waveGrad1)"
          strokeWidth="1"
          strokeDasharray="4 8"
          className="animate-wave-slow-2"
        />

        {/* Wave 2: Middle Organic Contour */}
        <path
          d="M 0,680 Q 420,620 850,710 T 1700,660 T 2400,720"
          fill="none"
          stroke="url(#waveGrad2)"
          strokeWidth="1.2"
          className="animate-wave-slow-2"
        />

        {/* Wave 3: Bottom Flowing Strands */}
        <path
          d="M 0,1200 Q 500,1120 1000,1220 T 2000,1180"
          fill="none"
          stroke="url(#waveGrad1)"
          strokeWidth="1.5"
          className="animate-wave-slow-1"
        />
      </svg>

      {/* 3. Minimal Floating Stylized Grain Silhouettes */}
      {/* Grain 1 - Top Left */}
      <div className="absolute top-[14%] left-[6%] animate-float-grain-1 opacity-40 hover:opacity-70 transition-opacity">
        <svg width="28" height="42" viewBox="0 0 28 42" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M14 2 C22 10, 24 24, 14 40 C4 24, 6 10, 14 2 Z"
            stroke="#155e42"
            strokeWidth="1.2"
            strokeOpacity="0.18"
            fill="#155e42"
            fillOpacity="0.03"
          />
          <path d="M14 8 L14 36" stroke="#155e42" strokeWidth="0.8" strokeOpacity="0.15" />
        </svg>
      </div>

      {/* Grain 2 - Mid Right */}
      <div className="absolute top-[42%] right-[7%] animate-float-grain-2 opacity-35 hover:opacity-70 transition-opacity">
        <svg width="34" height="50" viewBox="0 0 34 50" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M17 2 C27 12, 29 30, 17 48 C5 30, 7 12, 17 2 Z"
            stroke="#ca8a04"
            strokeWidth="1.2"
            strokeOpacity="0.16"
            fill="#ca8a04"
            fillOpacity="0.025"
          />
          <path d="M17 10 L17 42" stroke="#ca8a04" strokeWidth="0.8" strokeOpacity="0.15" />
        </svg>
      </div>

      {/* Grain 3 - Bottom Left */}
      <div className="absolute bottom-[22%] left-[10%] animate-float-grain-3 opacity-40 hover:opacity-70 transition-opacity">
        <svg width="26" height="38" viewBox="0 0 26 38" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M13 2 C20 9, 22 22, 13 36 C4 22, 6 9, 13 2 Z"
            stroke="#155e42"
            strokeWidth="1.2"
            strokeOpacity="0.16"
            fill="#155e42"
            fillOpacity="0.03"
          />
          <path d="M13 7 L13 32" stroke="#155e42" strokeWidth="0.8" strokeOpacity="0.15" />
        </svg>
      </div>

      {/* Grain 4 - Bottom Right */}
      <div className="absolute bottom-[10%] right-[14%] animate-float-grain-1 opacity-35 hover:opacity-70 transition-opacity">
        <svg width="30" height="46" viewBox="0 0 30 46" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M15 2 C24 11, 26 27, 15 44 C4 27, 6 11, 15 2 Z"
            stroke="#16a34a"
            strokeWidth="1.2"
            strokeOpacity="0.16"
            fill="#16a34a"
            fillOpacity="0.03"
          />
          <path d="M15 9 L15 38" stroke="#16a34a" strokeWidth="0.8" strokeOpacity="0.15" />
        </svg>
      </div>
    </div>
  );
}

'use client';

import React from 'react';

export function AnimatedBackground() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
    >
      {/* 1. Ambient Glowing Halos (Warm Emerald & Golden Sun) */}
      <div className="absolute -top-24 -left-24 w-[500px] h-[500px] rounded-full bg-emerald-400/12 blur-3xl animate-pulse-glow" />
      <div className="absolute top-[30%] -right-28 w-[550px] h-[550px] rounded-full bg-amber-400/10 blur-3xl animate-drift-slow-2" />
      <div className="absolute bottom-[10%] left-[15%] w-[450px] h-[450px] rounded-full bg-emerald-500/10 blur-3xl animate-drift-slow-1" />

      {/* 2. Full-Screen Minimal Animated SVG Canvas */}
      <svg
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Architectural micro-grid crosses */}
          <pattern
            id="geo-grid"
            width="60"
            height="60"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="30" cy="30" r="1.2" fill="#155e42" fillOpacity="0.12" />
            <path
              d="M 28 30 L 32 30 M 30 28 L 30 32"
              stroke="#155e42"
              strokeWidth="0.8"
              strokeOpacity="0.08"
            />
          </pattern>

          {/* Gradients for dynamic waves */}
          <linearGradient id="waveEmerald" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#155e42" stopOpacity="0.12" />
            <stop offset="50%" stopColor="#22c55e" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#155e42" stopOpacity="0.1" />
          </linearGradient>

          <linearGradient id="waveGold" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#d97706" stopOpacity="0.1" />
            <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#155e42" stopOpacity="0.08" />
          </linearGradient>
        </defs>

        {/* Base Geo-Grid */}
        <rect width="100%" height="100%" fill="url(#geo-grid)" />

        {/* Wave Ribbon 1 (Top Area - Continuous Flow) */}
        <path
          d="M -100 180 Q 300 80, 700 190 T 1500 140 T 2300 200"
          fill="none"
          stroke="url(#waveEmerald)"
          strokeWidth="2"
          className="animate-wave-slow-1"
        />
        <path
          d="M -100 205 Q 320 105, 720 215 T 1520 165 T 2320 225"
          fill="none"
          stroke="#22c55e"
          strokeWidth="1.5"
          strokeOpacity="0.22"
          strokeDasharray="8 12"
          className="animate-dash-flow"
        />

        {/* Wave Ribbon 2 (Mid Center - Gentle Sway) */}
        <path
          d="M -100 620 Q 450 540, 950 640 T 1850 590 T 2600 650"
          fill="none"
          stroke="url(#waveGold)"
          strokeWidth="2"
          className="animate-wave-slow-2"
        />
        <path
          d="M -100 645 Q 470 565, 970 665 T 1870 615 T 2620 675"
          fill="none"
          stroke="#ca8a04"
          strokeWidth="1.2"
          strokeOpacity="0.2"
          strokeDasharray="6 10"
          className="animate-dash-flow"
        />

        {/* Wave Ribbon 3 (Lower Horizon) */}
        <path
          d="M -100 1100 Q 500 1020, 1100 1120 T 2200 1060"
          fill="none"
          stroke="url(#waveEmerald)"
          strokeWidth="2"
          className="animate-wave-slow-1"
        />
      </svg>

      {/* 3. Clearly Visible Floating Minimalist Grain & Sprout Silhouettes */}
      {/* Grain Motif 1 - Top Left */}
      <div className="absolute top-[12%] left-[4%] animate-sway-slow">
        <svg width="36" height="52" viewBox="0 0 36 52" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M18 2 C28 12, 30 30, 18 50 C6 30, 8 12, 18 2 Z"
            stroke="#155e42"
            strokeWidth="2"
            strokeOpacity="0.3"
            fill="#155e42"
            fillOpacity="0.06"
          />
          <path d="M18 8 L18 44" stroke="#155e42" strokeWidth="1.5" strokeOpacity="0.25" />
          <path d="M18 18 Q25 15, 27 18" stroke="#155e42" strokeWidth="1.2" strokeOpacity="0.25" />
          <path d="M18 26 Q11 23, 9 26" stroke="#155e42" strokeWidth="1.2" strokeOpacity="0.25" />
          <path d="M18 34 Q25 31, 27 34" stroke="#155e42" strokeWidth="1.2" strokeOpacity="0.25" />
        </svg>
      </div>

      {/* Grain Motif 2 - Top Right */}
      <div className="absolute top-[18%] right-[5%] animate-float-grain-2">
        <svg width="40" height="58" viewBox="0 0 40 58" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M20 2 C32 14, 34 35, 20 56 C6 35, 8 14, 20 2 Z"
            stroke="#ca8a04"
            strokeWidth="2"
            strokeOpacity="0.3"
            fill="#ca8a04"
            fillOpacity="0.05"
          />
          <path d="M20 10 L20 48" stroke="#ca8a04" strokeWidth="1.5" strokeOpacity="0.25" />
          <path d="M20 20 Q28 17, 30 20" stroke="#ca8a04" strokeWidth="1.2" strokeOpacity="0.25" />
          <path d="M20 30 Q12 27, 10 30" stroke="#ca8a04" strokeWidth="1.2" strokeOpacity="0.25" />
        </svg>
      </div>

      {/* Grain Motif 3 - Center Left */}
      <div className="absolute top-[48%] left-[2%] animate-float-grain-1">
        <svg width="32" height="48" viewBox="0 0 32 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M16 2 C25 11, 27 28, 16 46 C5 28, 7 11, 16 2 Z"
            stroke="#16a34a"
            strokeWidth="2"
            strokeOpacity="0.3"
            fill="#16a34a"
            fillOpacity="0.06"
          />
          <path d="M16 8 L16 40" stroke="#16a34a" strokeWidth="1.2" strokeOpacity="0.25" />
        </svg>
      </div>

      {/* Grain Motif 4 - Lower Right */}
      <div className="absolute bottom-[24%] right-[3%] animate-sway-slow">
        <svg width="44" height="64" viewBox="0 0 44 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M22 2 C35 15, 37 38, 22 62 C7 38, 9 15, 22 2 Z"
            stroke="#155e42"
            strokeWidth="2.2"
            strokeOpacity="0.32"
            fill="#155e42"
            fillOpacity="0.06"
          />
          <path d="M22 10 L22 54" stroke="#155e42" strokeWidth="1.5" strokeOpacity="0.25" />
          <path d="M22 22 Q31 19, 33 22" stroke="#155e42" strokeWidth="1.2" strokeOpacity="0.25" />
          <path d="M22 34 Q13 31, 11 34" stroke="#155e42" strokeWidth="1.2" strokeOpacity="0.25" />
          <path d="M22 46 Q31 43, 33 46" stroke="#155e42" strokeWidth="1.2" strokeOpacity="0.25" />
        </svg>
      </div>

      {/* Grain Motif 5 - Bottom Center Left */}
      <div className="absolute bottom-[8%] left-[8%] animate-float-grain-3">
        <svg width="30" height="44" viewBox="0 0 30 44" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M15 2 C24 10, 26 26, 15 42 C4 26, 6 10, 15 2 Z"
            stroke="#ca8a04"
            strokeWidth="1.8"
            strokeOpacity="0.28"
            fill="#ca8a04"
            fillOpacity="0.05"
          />
          <path d="M15 7 L15 36" stroke="#ca8a04" strokeWidth="1.2" strokeOpacity="0.22" />
        </svg>
      </div>
    </div>
  );
}

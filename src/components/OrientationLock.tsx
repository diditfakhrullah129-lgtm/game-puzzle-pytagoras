/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';

interface OrientationLockProps {
  onToggleVirtualLandscape?: (enabled: boolean) => void;
  isVirtualLandscape?: boolean;
}

export const OrientationLock: React.FC<OrientationLockProps> = ({
  onToggleVirtualLandscape,
  isVirtualLandscape = false,
}) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const [lockStatusMessage, setLockStatusMessage] = useState<string | null>(null);

  const requestFullscreenAndLandscape = async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
      
      // Try screen.orientation lock if supported by modern mobile browsers
      const screenAny = window.screen as unknown as {
        orientation?: {
          lock?: (orientation: string) => Promise<void>;
        };
      };

      if (screenAny.orientation?.lock) {
        await screenAny.orientation.lock('landscape');
        setLockStatusMessage('Mode landscape berhasil dikunci!');
      } else {
        setLockStatusMessage('Silakan miringkan ponsel Anda ke posisi horizontal.');
      }
    } catch {
      setLockStatusMessage('Putar HP Anda ke posisi mendatar (Auto-rotate).');
    }

    setTimeout(() => setLockStatusMessage(null), 3500);
  };

  return (
    <>
      {/* Fullscreen Overlay triggered strictly by CSS Media Query when in Portrait Mode on screens <= 1024px */}
      <div
        className={`orientation-lock-overlay ${isDismissed ? 'dismissed' : ''} fixed inset-0 z-[9999] bg-slate-950/95 backdrop-blur-xl flex-col items-center justify-center p-6 text-center text-white select-none`}
        role="alertdialog"
        aria-label="Peringatan Orientasi Layar"
      >
        {/* Decorative background glows */}
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-sm w-full bg-slate-900/90 border-2 border-amber-400/50 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-amber-500/10 flex flex-col items-center">
          
          {/* Animated 3D Phone Icon Rotating */}
          <div className="relative w-32 h-32 mb-6 flex items-center justify-center">
            {/* Pulsing circular guideline ring */}
            <div className="absolute inset-0 rounded-full border-2 border-dashed border-cyan-400/40 animate-pulse-ring" />
            
            {/* Rotating Arrow Indicator */}
            <svg
              className="absolute inset-0 w-full h-full text-amber-400 opacity-60"
              viewBox="0 0 100 100"
            >
              <path
                d="M 20,50 A 30,30 0 0,1 80,50"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeDasharray="4,4"
              />
              <polygon points="80,45 86,52 76,55" fill="currentColor" />
            </svg>

            {/* Rotating Smartphone Device Frame */}
            <div className="relative animate-rotate-device">
              <div className="w-16 h-28 bg-gradient-to-b from-slate-700 to-slate-900 rounded-2xl p-1.5 shadow-xl border border-slate-600 flex flex-col items-center justify-between">
                {/* Speaker pill */}
                <div className="w-4 h-1 bg-slate-500 rounded-full mb-1" />
                
                {/* Screen showing Pythagoras triangle */}
                <div className="w-full flex-1 bg-gradient-to-br from-indigo-950 to-blue-900 rounded-lg flex items-center justify-center overflow-hidden border border-cyan-500/30">
                  <svg className="w-9 h-9" viewBox="0 0 40 40">
                    <polygon points="8,32 32,32 32,8" fill="#3b82f6" fillOpacity="0.4" stroke="#60a5fa" strokeWidth="2" />
                    <line x1="8" y1="32" x2="32" y2="8" stroke="#f59e0b" strokeWidth="2.5" />
                  </svg>
                </div>
                
                {/* Home Indicator */}
                <div className="w-5 h-1 bg-slate-500 rounded-full mt-1" />
              </div>
            </div>
          </div>

          {/* Heading */}
          <h2 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-200 to-yellow-400 mb-2 tracking-wide uppercase">
            Putar ke Mode Landscape
          </h2>

          {/* Subtitle / Explanation */}
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
            Aplikasi <strong className="text-amber-300">Pythagoras Adventure</strong> dirancang khusus dalam posisi horizontal (mendatar) agar seluruh kolom geometri dan puzzle dapat dimainkan secara optimal tanpa terpotong.
          </p>

          {/* Action Buttons */}
          <div className="w-full space-y-2.5">
            {/* Primary: Fullscreen & Orientation Lock */}
            <button
              onClick={requestFullscreenAndLandscape}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 text-slate-950 font-bold text-sm tracking-wide shadow-lg shadow-amber-500/30 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 border border-yellow-200 cursor-pointer"
            >
              <svg className="w-5 h-5 text-slate-950" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
              <span>Layar Penuh & Kunci Landscape</span>
            </button>

            {/* Secondary: Virtual Landscape Rotation for phones with locked auto-rotate */}
            {onToggleVirtualLandscape && (
              <button
                onClick={() => onToggleVirtualLandscape(!isVirtualLandscape)}
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-600/60 hover:bg-indigo-600 text-indigo-100 font-semibold text-xs border border-indigo-400/40 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <svg className="w-4 h-4 text-cyan-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>
                  {isVirtualLandscape ? 'Kembalikan Tampilan Normal' : 'Putar Layar Virtual (Rotasi 90°)'}
                </span>
              </button>
            )}

            {/* Dismiss / Continue in Portrait */}
            <button
              onClick={() => setIsDismissed(true)}
              className="w-full py-2 px-3 text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer underline underline-offset-4"
            >
              Tetap Lanjutkan (Dalam Posisi Tegak)
            </button>
          </div>

          {lockStatusMessage && (
            <div className="mt-3 text-xs text-cyan-300 font-medium animate-pulse">
              {lockStatusMessage}
            </div>
          )}

          {/* Watermark Requirement */}
          <div className="mt-5 pt-3 border-t border-slate-800 w-full flex items-center justify-center text-[10px] text-slate-400 tracking-wider uppercase font-semibold">
            👑 Made In Didit Fakhrullah
          </div>
        </div>
      </div>

      {/* Floating Re-Open Badge if user dismissed it while still in portrait */}
      {isDismissed && (
        <div className="orientation-lock-mini fixed bottom-3 left-3 z-[9990] flex items-center gap-1.5 bg-slate-900/90 border border-amber-400/60 px-2.5 py-1.5 rounded-full shadow-lg text-[11px] text-amber-300 backdrop-blur-md cursor-pointer hover:bg-slate-800 transition-all"
             onClick={() => setIsDismissed(false)}
             title="Mode Landscape Direkomendasikan"
        >
          <svg className="w-3.5 h-3.5 text-amber-400 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span className="font-bold">Mode Landscape</span>
        </div>
      )}
    </>
  );
};

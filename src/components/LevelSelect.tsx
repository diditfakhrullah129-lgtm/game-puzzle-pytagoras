/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { LevelData, LevelProgress } from '../types/game';
import { TactileButton } from './TactileButton';

interface LevelSelectProps {
  levels: LevelData[];
  progress: Record<number, LevelProgress>;
  onSelectLevel: (levelId: number) => void;
  onHome: () => void;
}

// Compact titles for clean display on all screens without excessive height
const SHORT_TITLES: Record<number, string> = {
  1: 'Bukti Bhaskara',
  2: 'Aljabar Persegi Luar',
  3: 'Trapesium Garfield',
  4: 'Dekomposisi a² & b²',
  5: 'Kincir Angin Euclid',
  6: 'MoMath Puzzler',
};

export const LevelSelect: React.FC<LevelSelectProps> = ({
  levels,
  progress,
  onSelectLevel,
  onHome,
}) => {
  // Calculate total stars earned
  const totalStars = Object.values(progress).reduce((acc, p) => acc + (p.stars || 0), 0);
  const totalCompleted = Object.values(progress).filter((p) => p.completed).length;

  return (
    <div className="relative w-full h-[100dvh] max-h-screen overflow-hidden flex flex-col justify-between p-2.5 sm:p-4 md:p-5 bg-radial from-slate-800 via-slate-900 to-slate-950 text-slate-100 select-none">
      {/* Top Header Bar - Ultra-compact, responsive */}
      <header className="flex items-center justify-between max-w-5xl mx-auto w-full flex-shrink-0 mb-1.5 sm:mb-2">
        <TactileButton
          iconSrc="/assets/icons/home.png"
          iconAlt="Menu Utama"
          label="Menu"
          variant="neutral"
          size="sm"
          onClick={onHome}
        />

        <div className="text-center flex-1 mx-2">
          <div className="flex items-center justify-center gap-2">
            <h2 className="text-lg sm:text-2xl md:text-3xl font-black text-amber-400 drop-shadow uppercase tracking-wide">
              Pilih Tantangan
            </h2>
            <span className="hidden sm:inline-block text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
              {totalCompleted}/{levels.length} Selesai
            </span>
          </div>
          <p className="text-[10px] sm:text-xs text-slate-400">
            Pilih level pembuktian teorema geometri Pythagoras
          </p>
        </div>

        {/* Right Info: Total Stars Badge */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 border border-amber-500/40 px-2.5 py-1 rounded-xl shadow-md">
          <img src="/assets/icons/star.png" alt="Bintang" className="w-4 h-4 object-contain drop-shadow" />
          <span className="text-xs sm:text-sm font-black text-amber-300">
            {totalStars}/18
          </span>
        </div>
      </header>

      {/* Levels Grid - Compact 3 columns x 2 rows, fits screen without scrolling */}
      <main className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-2.5 md:gap-3 max-w-5xl mx-auto w-full flex-1 min-h-0 items-stretch content-center">
        {levels.map((lvl) => {
          const prog = progress[lvl.id] || { unlocked: lvl.id === 1 || lvl.id === 6, completed: false, stars: 0, bestTime: 0 };
          const isUnlocked = prog.unlocked;
          const shortTitle = SHORT_TITLES[lvl.id] || lvl.title.replace(/^Tingkat\s*\d+:\s*/i, '');

          return (
            <div
              key={lvl.id}
              onClick={() => isUnlocked && onSelectLevel(lvl.id)}
              className={`relative rounded-2xl p-2 sm:p-2.5 border-2 transition-all duration-150 flex flex-col justify-between ${
                isUnlocked
                  ? 'bg-gradient-to-b from-slate-800 to-slate-850 border-amber-500/50 shadow-[0_4px_0_#0f172a] hover:-translate-y-0.5 hover:border-amber-400 hover:shadow-[0_6px_0_#0f172a] cursor-pointer'
                  : 'bg-slate-900/50 border-slate-700/50 opacity-60 cursor-not-allowed shadow-none'
              }`}
            >
              {/* Header: Level Icon, Title, and Difficulty */}
              <div className="flex items-center justify-between gap-1.5">
                <div className="flex items-center gap-2 min-w-0">
                  <img
                    src={lvl.id <= 5 ? `/assets/icons/level_${lvl.id}.png` : '/assets/icons/trophy.png'}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/assets/icons/trophy.png';
                    }}
                    alt={`Level ${lvl.id}`}
                    className="w-7 h-7 sm:w-8 sm:h-8 object-contain drop-shadow flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] sm:text-xs font-black text-amber-400 uppercase tracking-wide">
                        Lvl {lvl.id}
                      </span>
                      {lvl.id === 6 && (
                        <span className="text-[8px] font-black px-1 rounded bg-rose-500/30 text-rose-300 border border-rose-500/50 animate-pulse">
                          MoMath NY
                        </span>
                      )}
                    </div>
                    <h3 className="text-xs sm:text-sm font-black text-white truncate leading-tight">
                      {shortTitle}
                    </h3>
                  </div>
                </div>

                <span
                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase border flex-shrink-0 ${
                    lvl.difficulty === 'Mudah'
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-600/80'
                      : lvl.difficulty === 'Sedang'
                      ? 'bg-sky-950/80 text-sky-300 border-sky-600/80'
                      : lvl.difficulty === 'Tantangan'
                      ? 'bg-amber-950/80 text-amber-300 border-amber-600/80'
                      : 'bg-purple-950/80 text-purple-300 border-purple-600/80'
                  }`}
                >
                  {lvl.difficulty}
                </span>
              </div>

              {/* Concept / Formula Badge (1 compact line) */}
              <div className="my-1 sm:my-1.5 py-1 px-2 bg-slate-900/90 rounded-lg border border-slate-700/60 flex items-center justify-between text-[10px] sm:text-[11px]">
                <span className="font-mono font-bold text-amber-300 truncate">
                  {lvl.concept}
                </span>
              </div>

              {/* Footer: Stars & Play Action */}
              <div className="flex items-center justify-between pt-1 border-t border-slate-700/50">
                {/* 3 Stars display */}
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3].map((starIdx) => (
                    <img
                      key={starIdx}
                      src="/assets/icons/star.png"
                      alt="Star"
                      className={`w-3.5 h-3.5 sm:w-4 sm:h-4 object-contain transition-opacity ${
                        starIdx <= prog.stars ? 'opacity-100 drop-shadow' : 'opacity-25 grayscale'
                      }`}
                    />
                  ))}
                </div>

                {isUnlocked ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectLevel(lvl.id);
                    }}
                    className={`px-2.5 py-1 rounded-lg font-bold text-[10px] sm:text-xs flex items-center gap-1 cursor-pointer transition-all active:scale-95 border ${
                      prog.completed
                        ? 'bg-gradient-to-b from-sky-400 to-blue-600 text-white border-blue-400 shadow-sm'
                        : 'bg-gradient-to-b from-amber-300 to-amber-500 text-amber-950 border-amber-300 shadow-sm'
                    }`}
                  >
                    <img
                      src={prog.completed ? '/assets/icons/retry.png' : '/assets/icons/play.png'}
                      alt="Play"
                      className="w-3 h-3 object-contain"
                    />
                    <span>{prog.completed ? 'Ulangi' : 'Main'}</span>
                  </button>
                ) : (
                  <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                    🔒 Terkunci
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </main>

      {/* Footer Watermark Bar */}
      <footer className="text-center pt-1 flex-shrink-0 flex items-center justify-center gap-2 text-[10px] sm:text-xs font-semibold text-slate-400 border-t border-slate-800/80">
        <span>Pythagoras Adventure</span>
        <span>•</span>
        <span className="text-amber-400 font-bold">👑 Made In Didit Fakhrullah</span>
      </footer>
    </div>
  );
};

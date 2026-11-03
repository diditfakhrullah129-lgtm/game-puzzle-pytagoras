import React from 'react';
import { TactileButton } from './TactileButton';
import { LevelProgress } from '../types/game';

interface MainMenuProps {
  onPlay: () => void;
  onLearn: () => void;
  onHelp: () => void;
  onSettings: () => void;
  progress: Record<number, LevelProgress>;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  onPlay,
  onLearn,
  onHelp,
  onSettings,
  progress,
}) => {
  const totalStars = Object.values(progress).reduce((acc, p) => acc + p.stars, 0);
  const completedLevels = Object.values(progress).filter((p) => p.completed).length;
  const totalLevels = 6;
  const maxStars = totalLevels * 3;

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between p-6 md:p-10 bg-radial from-slate-800 via-slate-900 to-slate-950 overflow-hidden text-slate-100 select-none">
      {/* Decorative Floating 3D Geometric Illustrations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-35">
        <img
          src="/assets/geometry/shape_right_triangle.png"
          alt="Segitiga Siku-Siku"
          className="absolute -top-6 -left-6 w-44 md:w-56 object-contain animate-pulse"
        />
        <img
          src="/assets/geometry/shape_square.png"
          alt="Persegi"
          className="absolute top-1/4 -right-10 w-40 md:w-52 object-contain"
        />
        <img
          src="/assets/geometry/shape_trapezoid.png"
          alt="Trapesium"
          className="absolute -bottom-10 -left-6 w-48 md:w-64 object-contain"
        />
        <img
          src="/assets/geometry/shape_parallelogram.png"
          alt="Jajargenjang"
          className="absolute -bottom-8 -right-8 w-44 md:w-56 object-contain"
        />
      </div>

      {/* Top Header: Stats Badges (Trophy & Stars) */}
      <header className="relative z-10 w-full max-w-4xl flex items-center justify-between">
        <div className="flex items-center gap-3 bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-2xl border-2 border-amber-500/40 shadow-xl">
          <img src="/assets/icons/trophy.png" alt="Piala" className="w-8 h-8 object-contain drop-shadow" />
          <div className="text-left leading-tight">
            <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">Prestasi</span>
            <span className="text-sm font-black text-white">{completedLevels} / {totalLevels} Level Selesai</span>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-2xl border-2 border-amber-500/40 shadow-xl">
          <img src="/assets/icons/star.png" alt="Bintang" className="w-8 h-8 object-contain drop-shadow" />
          <div className="text-left leading-tight">
            <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">Bintang</span>
            <span className="text-sm font-black text-amber-300">{totalStars} / {maxStars} Bintang</span>
          </div>
        </div>
      </header>

      {/* Center Hero: 3D CGI Title Lockup & Mascot */}
      <main className="relative z-10 flex flex-col items-center justify-center my-auto text-center max-w-2xl">
        {/* Animated Badge Container */}
        <div className="relative mb-4">
          <div className="inline-flex items-center justify-center p-3 rounded-3xl bg-gradient-to-b from-amber-400 via-amber-500 to-amber-600 shadow-[0_8px_0_#b45309] border-4 border-amber-200">
            <img
              src="/assets/icons/star.png"
              alt="Pythagoras Icon"
              className="w-16 h-16 md:w-20 md:h-20 object-contain drop-shadow-[0_4px_6px_rgba(0,0,0,0.4)]"
            />
          </div>
        </div>

        <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-amber-400 to-amber-500 drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)] tracking-tight">
          PYTHAGORAS ADVENTURE
        </h1>

        <p className="mt-2 text-sm md:text-lg text-slate-300 font-medium max-w-lg leading-relaxed">
          Petualangan pembuktian geometri klasik: pasang puzzle kuadrat sisi siku-siku membuktikan <strong className="text-amber-400 font-mono">a² + b² = c²</strong>!
        </p>

        {/* Big 3D Play Button */}
        <div className="mt-8 w-full max-w-sm">
          <TactileButton
            iconSrc="/assets/icons/play.png"
            iconAlt="Mulai Bermain"
            label="MULAI PETUALANGAN"
            variant="primary"
            size="lg"
            className="w-full text-xl py-4 shadow-[0_8px_0_#b45309] hover:scale-105 active:translate-y-1 transition-all"
            onClick={onPlay}
          />
        </div>

        {/* Secondary Menu Navigation Buttons */}
        <div className="mt-5 grid grid-cols-3 gap-3 w-full max-w-md">
          <TactileButton
            iconSrc="/assets/icons/learn.png"
            iconAlt="Belajar Materi"
            label="Materi"
            variant="secondary"
            size="md"
            onClick={onLearn}
          />
          <TactileButton
            iconSrc="/assets/icons/help.png"
            iconAlt="Petunjuk"
            label="Petunjuk"
            variant="purple"
            size="md"
            onClick={onHelp}
          />
          <TactileButton
            iconSrc="/assets/icons/settings.png"
            iconAlt="Pengaturan"
            label="Setelan"
            variant="neutral"
            size="md"
            onClick={onSettings}
          />
        </div>
      </main>

      {/* Footer Info */}
      <footer className="relative z-10 flex flex-col items-center gap-1.5 text-center text-xs text-slate-400 pb-2">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-slate-900/90 rounded-full border border-amber-500/40 text-amber-300 font-black text-xs shadow-lg tracking-wide">
          <span>👑 Made In Didit Fakhrullah</span>
        </div>
        <span className="text-[10px] text-slate-500">Pythagoras Adventure • Game Interaktif Pembuktian Teorema Geometri</span>
      </footer>
    </div>
  );
};

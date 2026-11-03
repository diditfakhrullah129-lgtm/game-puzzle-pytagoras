import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { LevelData } from '../types/game';
import { TactileButton } from './TactileButton';

interface VictoryModalProps {
  level: LevelData;
  stars: number;
  timeSpent: number;
  onRetry: () => void;
  onNext: () => void;
  onHome: () => void;
  hasNextLevel: boolean;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  level,
  stars,
  timeSpent,
  onRetry,
  onNext,
  onHome,
  hasNextLevel,
}) => {
  useEffect(() => {
    // Fire celebratory confetti bursts
    const count = 200;
    const defaults = { origin: { y: 0.7 } };

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    fire(0.25, { spread: 26, startVelocity: 55 });
    fire(0.2, { spread: 60 });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    fire(0.1, { spread: 120, startVelocity: 45 });
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md select-none">
      <div className="bg-slate-850 border-4 border-amber-400 rounded-3xl w-full max-w-lg shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden text-center p-6 md:p-8 space-y-6 animate-in zoom-in-90 duration-200 text-slate-100">
        {/* Trophy Hero Icon */}
        <div className="relative inline-block mx-auto">
          <div className="absolute -inset-4 bg-amber-500/20 rounded-full blur-xl animate-pulse" />
          <img
            src="/assets/icons/trophy.png"
            alt="Piala Penghargaan"
            className="w-24 h-24 object-contain relative z-10 drop-shadow-[0_8px_16px_rgba(245,158,11,0.5)]"
          />
        </div>

        {/* Victory Heading */}
        <div className="space-y-1">
          <span className="text-xs font-black tracking-widest text-amber-400 uppercase">
            PEMBUKTIAN BERHASIL!
          </span>
          <h2 className="text-2xl md:text-3xl font-black text-white">{level.title}</h2>
        </div>

        {/* Stars Earned */}
        <div className="flex items-center justify-center gap-2">
          {[1, 2, 3].map((starIndex) => (
            <img
              key={starIndex}
              src="/assets/icons/star.png"
              alt="Bintang"
              className={`w-10 h-10 object-contain transition-all duration-300 ${
                starIndex <= stars
                  ? 'scale-110 drop-shadow-[0_4px_8px_rgba(245,158,11,0.8)]'
                  : 'opacity-25 grayscale scale-90'
              }`}
            />
          ))}
        </div>

        {/* Math Explanation Card */}
        <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-700 space-y-2 text-left">
          <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wide">
            Kesimpulan Matematis:
          </div>
          <p className="text-xs text-slate-200 leading-relaxed font-mono">
            {level.mathExplanation}
          </p>
          <div className="pt-2 border-t border-slate-800 flex justify-between text-xs text-slate-400">
            <span>Waktu Penyelesaian:</span>
            <strong className="text-amber-300 font-mono">
              {Math.floor(timeSpent / 60)} menit {timeSpent % 60} detik
            </strong>
          </div>
        </div>

        {/* Navigation Buttons: Retry, Next, Home */}
        <div className="grid grid-cols-3 gap-3 pt-2">
          <TactileButton
            iconSrc="/assets/icons/retry.png"
            iconAlt="Ulangi"
            label="Ulangi"
            variant="neutral"
            size="md"
            onClick={onRetry}
          />
          <TactileButton
            iconSrc="/assets/icons/home.png"
            iconAlt="Menu"
            label="Menu"
            variant="neutral"
            size="md"
            onClick={onHome}
          />
          {hasNextLevel ? (
            <TactileButton
              iconSrc="/assets/icons/next.png"
              iconAlt="Lanjut"
              label="Lanjut"
              variant="primary"
              size="md"
              onClick={onNext}
            />
          ) : (
            <TactileButton
              iconSrc="/assets/icons/trophy.png"
              iconAlt="Selesai"
              label="Tamat!"
              variant="success"
              size="md"
              onClick={onHome}
            />
          )}
        </div>

        {/* Watermark */}
        <div className="pt-2 text-center">
          <span className="text-[11px] font-bold text-amber-400/80 tracking-wider">
            👑 Made In Didit Fakhrullah
          </span>
        </div>
      </div>
    </div>
  );
};

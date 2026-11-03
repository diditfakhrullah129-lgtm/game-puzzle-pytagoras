/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';

interface ProofTutorialOverlayProps {
  levelId: number;
  activeStageIndex: number;
  stageCompleted: Record<number, boolean>;
  onSelectStage?: (stageIndex: number) => void;
  hasStages: boolean;
  className?: string;
}

const TUTORIAL_STEPS = [
  {
    step: 1,
    key: 'a2',
    symbol: 'a²',
    area: '9 cm²',
    title: 'Langkah 1: Isi Kolom a²',
    subtitle: 'Sisi Siku-Siku a (3×3)',
    desc: 'Letakkan 1 keping persegi kuning ke Kolom a² (luas 9 cm²) hingga posisinya sejajar dan pas.',
    color: 'amber',
    bgBadge: 'bg-amber-500/20 text-amber-300 border-amber-500/60',
    activeGlow: 'ring-2 ring-amber-400 shadow-amber-500/30',
  },
  {
    step: 2,
    key: 'b2',
    symbol: 'b²',
    area: '16 cm²',
    title: 'Langkah 2: Isi Kolom b²',
    subtitle: 'Sisi Siku-Siku b (4×4)',
    desc: 'Susun 4 puing keping merah ke Kolom b² (luas 16 cm²) hingga tertutup rapat tanpa rongga sedikitpun.',
    color: 'red',
    bgBadge: 'bg-rose-500/20 text-rose-300 border-rose-500/60',
    activeGlow: 'ring-2 ring-rose-400 shadow-rose-500/30',
  },
  {
    step: 3,
    key: 'c2',
    symbol: 'c²',
    area: '25 cm²',
    title: 'Langkah 3: Gabung ke Kolom c²',
    subtitle: 'Hipotenusa c² = a² + b²',
    desc: 'Gabungkan keping persegi a² di tengah dan 4 keping b² di sekelilingnya untuk memenuhi Kolom c² (25 cm²). Terbukti a² + b² = c²!',
    color: 'cyan',
    bgBadge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/60',
    activeGlow: 'ring-2 ring-cyan-400 shadow-cyan-500/30',
  },
];

export const ProofTutorialOverlay: React.FC<ProofTutorialOverlayProps> = ({
  levelId,
  activeStageIndex,
  stageCompleted,
  onSelectStage,
  hasStages,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [inspectedStep, setInspectedStep] = useState<number>(activeStageIndex);

  // Sync inspected step with active stage if user hasn't explicitly selected another
  const currentStepIndex = Math.min(Math.max(activeStageIndex, 0), TUTORIAL_STEPS.length - 1);
  const activeStepData = TUTORIAL_STEPS[inspectedStep ?? currentStepIndex];

  // For non-stage levels (Levels 1-5), show single proof guidance
  if (!hasStages) {
    return (
      <div className={`bg-slate-900/90 border border-cyan-500/40 rounded-xl p-2 shadow-sm text-xs select-none ${className}`}>
        <div className="flex items-center gap-1.5 font-bold text-cyan-300">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>Panduan Pembuktian:</span>
        </div>
        <p className="text-[11px] text-slate-300 mt-1 leading-snug">
          Tutup bingkai target <strong>c²</strong> dengan seluruh keping untuk membuktikan teorema Pythagoras!
        </p>
      </div>
    );
  }

  return (
    <div className={`w-full bg-slate-900/95 border-2 border-indigo-500/40 rounded-2xl shadow-md p-2.5 text-white select-none transition-all duration-200 ${className}`}>
      {/* Header Bar: Title + Minimize/Expand toggle */}
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="w-5 h-5 rounded-lg bg-indigo-500/30 border border-indigo-400 flex items-center justify-center text-[10px] font-black text-indigo-300 flex-shrink-0">
            💡
          </span>
          <div className="min-w-0">
            <h4 className="text-xs font-black text-amber-300 truncate leading-tight">
              Alur Pembuktian
            </h4>
            <p className="text-[9px] text-slate-400 truncate">
              Zona: <span className="text-amber-300 font-mono">a²</span> ➔ <span className="text-rose-400 font-mono">b²</span> ➔ <span className="text-cyan-300 font-mono">c²</span>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors flex-shrink-0"
          title={isExpanded ? 'Kecilkan Panduan' : 'Buka Panduan'}
        >
          <span>{isExpanded ? 'Ciutkan' : 'Buka'}</span>
          <svg
            className={`w-3 h-3 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* 3 Step Pills Sequence (a² + b² = c²) */}
      <div className="flex items-center justify-between gap-1 py-1">
        {TUTORIAL_STEPS.map((s, idx) => {
          const isCompleted = !!stageCompleted[idx];
          const isCurrent = activeStageIndex === idx;

          return (
            <React.Fragment key={s.key}>
              {idx > 0 && (
                <span className="text-[10px] font-black text-slate-500 flex-shrink-0">
                  {idx === 1 ? '+' : '='}
                </span>
              )}
              <button
                type="button"
                onClick={() => {
                  setInspectedStep(idx);
                  if (onSelectStage) {
                    onSelectStage(idx);
                  }
                }}
                className={`flex-1 py-1 px-1 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center relative ${
                  isCurrent
                    ? `${s.bgBadge} ${s.activeGlow} scale-102`
                    : isCompleted
                    ? 'bg-emerald-950/70 border-emerald-500/70 text-emerald-300'
                    : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:bg-slate-750'
                }`}
              >
                {/* Step status indicator */}
                <div className="flex items-center gap-0.5">
                  <span className="text-[9px] font-black">
                    {isCompleted ? '✓' : idx + 1}
                  </span>
                  <span className="font-black text-[11px] font-mono leading-none">
                    {s.symbol}
                  </span>
                </div>
                <span className="text-[8px] font-semibold opacity-85 leading-none mt-0.5">
                  {s.area}
                </span>

                {isCurrent && (
                  <span className="absolute -bottom-1 w-1.5 h-1.5 bg-amber-400 rounded-full animate-ping pointer-events-none" />
                )}
              </button>
            </React.Fragment>
          );
        })}
      </div>

      {/* Expanded Details Card */}
      {isExpanded && activeStepData && (
        <div className="mt-1.5 pt-1.5 border-t border-slate-800 text-[10.5px] leading-tight">
          <div className="flex items-center justify-between font-bold text-amber-300 mb-0.5">
            <span className="text-[11px]">{activeStepData.title}</span>
            <span className="text-[9px] text-slate-400 font-mono">
              {activeStepData.subtitle}
            </span>
          </div>
          <p className="text-slate-300 text-[10px] leading-relaxed">
            {activeStepData.desc}
          </p>
        </div>
      )}
    </div>
  );
};

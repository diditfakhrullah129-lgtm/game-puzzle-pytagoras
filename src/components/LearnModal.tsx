import React, { useState } from 'react';
import { GEOMETRY_SHAPES, ShapeInfo } from '../data/learningContent';
import { TactileButton } from './TactileButton';

interface LearnModalProps {
  onBack: () => void;
}

export const LearnModal: React.FC<LearnModalProps> = ({ onBack }) => {
  const [selectedShape, setSelectedShape] = useState<ShapeInfo>(GEOMETRY_SHAPES[0]);
  const [valA, setValA] = useState<number>(selectedShape.exampleData.defaultA);
  const [valB, setValB] = useState<number>(selectedShape.exampleData.defaultB);
  const [valC, setValC] = useState<number>(selectedShape.exampleData.defaultC || 3);
  const [activeTab, setActiveTab] = useState<'shapes' | 'pythagoras'>('shapes');

  // Interactive Pythagoras Playground state
  const [pythA, setPythA] = useState<number>(3);
  const [pythB, setPythB] = useState<number>(4);
  const pythC = Math.sqrt(pythA * pythA + pythB * pythB);

  const handleSelectShape = (shape: ShapeInfo) => {
    setSelectedShape(shape);
    setValA(shape.exampleData.defaultA);
    setValB(shape.exampleData.defaultB);
    setValC(shape.exampleData.defaultC || 3);
  };

  const calculatedArea = selectedShape.exampleData.calcArea(valA, valB, valC);

  return (
    <div className="relative w-full h-full flex flex-col p-4 md:p-8 bg-radial from-slate-800 via-slate-900 to-slate-950 overflow-y-auto text-slate-100 select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between max-w-5xl mx-auto w-full mb-6">
        <TactileButton
          iconSrc="/assets/icons/back.png"
          iconAlt="Kembali"
          label="Kembali"
          variant="neutral"
          size="sm"
          onClick={onBack}
        />

        <div className="flex items-center gap-2">
          <img src="/assets/icons/learn.png" alt="Belajar" className="w-8 h-8 object-contain" />
          <h2 className="text-xl md:text-2xl font-black text-amber-400">ENSIKLOPEDIA & MATERI PYTHAGORAS</h2>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-700">
          <button
            onClick={() => setActiveTab('shapes')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'shapes' ? 'bg-amber-500 text-amber-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            Bentuk Geometri
          </button>
          <button
            onClick={() => setActiveTab('pythagoras')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'pythagoras' ? 'bg-amber-500 text-amber-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            Teorema a²+b²=c²
          </button>
        </div>
      </div>

      {activeTab === 'shapes' ? (
        /* Section 1: 6 Geometry Shapes Showcase */
        <div className="max-w-5xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6 my-auto">
          {/* Left: Shape selector buttons with image icons */}
          <div className="lg:col-span-4 flex flex-col gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
              Pilih Bangun Datar
            </span>
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
              {GEOMETRY_SHAPES.map((shape) => {
                const isSelected = selectedShape.id === shape.id;
                return (
                  <button
                    key={shape.id}
                    onClick={() => handleSelectShape(shape)}
                    className={`flex items-center gap-3 p-3 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-400 text-white shadow-lg'
                        : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    <img
                      src={shape.image}
                      alt={shape.name}
                      className="w-12 h-10 object-contain rounded-lg bg-slate-950/60 p-1 border border-slate-700"
                    />
                    <div className="min-w-0">
                      <span className="text-xs font-bold block truncate">{shape.name}</span>
                      <span className="text-[10px] text-amber-400/90 font-mono block truncate">
                        {shape.areaFormula}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Shape Detail Card & Interactive Simulator */}
          <div className="lg:col-span-8 bg-slate-850 p-6 rounded-3xl border-2 border-slate-700 shadow-2xl flex flex-col justify-between gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* Shape Illustration Visual */}
              <div className="bg-slate-900 p-4 rounded-2xl border border-slate-700 flex flex-col items-center justify-center text-center">
                <img
                  src={selectedShape.image}
                  alt={selectedShape.name}
                  className="w-full max-w-[280px] h-44 object-contain filter drop-shadow-lg"
                />
                <span className="mt-2 text-xs text-amber-300 font-mono font-bold">
                  {selectedShape.areaFormula}
                </span>
              </div>

              {/* Description & Math Properties */}
              <div className="space-y-3">
                <h3 className="text-xl font-black text-amber-400">{selectedShape.name}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{selectedShape.description}</p>

                <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-700/60 text-xs space-y-1">
                  <div className="text-emerald-400 font-bold font-mono">Rumus Luas: {selectedShape.areaFormula}</div>
                  <div className="text-sky-400 font-bold font-mono">Rumus Keliling: {selectedShape.perimeterFormula}</div>
                </div>

                <ul className="text-[11px] text-slate-300 space-y-1 list-disc list-inside">
                  {selectedShape.properties.map((prop, idx) => (
                    <li key={idx}>{prop}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Interactive Calculator Section */}
            <div className="bg-slate-900 p-4 rounded-2xl border border-amber-500/40">
              <span className="text-xs font-black text-amber-400 uppercase tracking-wider block mb-3">
                Kalkulator Interaktif Luas Geometri
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                <div>
                  <label className="text-[11px] text-slate-300 block mb-1 font-bold">
                    {selectedShape.exampleData.labelA}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={valA}
                    onChange={(e) => setValA(Number(e.target.value) || 1)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-sm font-mono text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-300 block mb-1 font-bold">
                    {selectedShape.exampleData.labelB}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={valB}
                    onChange={(e) => setValB(Number(e.target.value) || 1)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-sm font-mono text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                {selectedShape.exampleData.labelC && (
                  <div>
                    <label className="text-[11px] text-slate-300 block mb-1 font-bold">
                      {selectedShape.exampleData.labelC}
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={valC}
                      onChange={(e) => setValC(Number(e.target.value) || 1)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-sm font-mono text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                )}
              </div>

              {/* Calculated Area Display */}
              <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400">Hasil Perhitungan Luas:</span>
                <span className="text-lg font-black text-emerald-400 font-mono">
                  {calculatedArea.toFixed(2)} cm²
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Section 2: Interactive Pythagoras Theorem Visualizer */
        <div className="max-w-4xl mx-auto w-full bg-slate-850 p-6 md:p-8 rounded-3xl border-2 border-slate-700 shadow-2xl space-y-6 my-auto">
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-black text-amber-400">SIMULASI TEOREMA PYTHAGORAS</h3>
            <p className="text-sm text-slate-300 max-w-xl mx-auto">
              Pada setiap segitiga siku-siku, luas bujur sangkar pada sisi miring (<strong className="text-sky-400">c²</strong>)
              sama dengan jumlah luas bujur sangkar pada kedua sisi tegaknya (<strong className="text-amber-400">a²</strong> +{' '}
              <strong className="text-emerald-400">b²</strong>).
            </p>
          </div>

          {/* Interactive Sliders for a and b */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-900 p-4 rounded-2xl border border-slate-700">
            <div>
              <div className="flex justify-between text-xs font-bold text-amber-400 mb-1">
                <span>Panjang Sisi Alas (a)</span>
                <span className="font-mono">{pythA} cm (a² = {pythA ** 2})</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={pythA}
                onChange={(e) => setPythA(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-emerald-400 mb-1">
                <span>Panjang Sisi Tinggi (b)</span>
                <span className="font-mono">{pythB} cm (b² = {pythB ** 2})</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={pythB}
                onChange={(e) => setPythB(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Formula Breakdown Card */}
          <div className="bg-slate-950 p-5 rounded-2xl border border-amber-500/40 text-center font-mono space-y-2">
            <div className="text-2xl md:text-3xl font-black text-amber-400">
              a² + b² = c²
            </div>
            <div className="text-base md:text-lg text-slate-300">
              <span className="text-amber-400">{pythA}² ({pythA ** 2})</span> +{' '}
              <span className="text-emerald-400">{pythB}² ({pythB ** 2})</span> ={' '}
              <span className="text-sky-400 font-black">{pythA ** 2 + pythB ** 2} cm²</span>
            </div>
            <div className="text-xs text-slate-400 font-sans">
              Panjang Hipotenusa c = √({pythA ** 2 + pythB ** 2}) ={' '}
              <strong className="text-sky-300 font-mono text-sm">{pythC.toFixed(2)} cm</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

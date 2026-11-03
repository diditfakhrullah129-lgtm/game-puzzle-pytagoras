import React, { useState, useRef } from 'react';
import { Point } from '../types/game';

interface RulerOverlayProps {
  active: boolean;
  onClose: () => void;
  scale: number; // pixels per cm (e.g. 36)
}

export const RulerOverlay: React.FC<RulerOverlayProps> = ({ active, onClose, scale }) => {
  const [startPoint, setStartPoint] = useState<Point | null>({ x: 80, y: 160 });
  const [endPoint, setEndPoint] = useState<Point | null>({ x: 260, y: 160 });
  const [isDragging, setIsDragging] = useState<'start' | 'end' | 'both' | null>(null);
  const dragOffsetRef = useRef<Point>({ x: 0, y: 0 });

  if (!active) return null;

  const dx = endPoint && startPoint ? (endPoint.x - startPoint.x) / scale : 0;
  const dy = endPoint && startPoint ? (endPoint.y - startPoint.y) / scale : 0;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.round((Math.atan2(endPoint ? endPoint.y - (startPoint?.y || 0) : 0, endPoint ? endPoint.x - (startPoint?.x || 0) : 0) * 180) / Math.PI);

  const handlePointerDown = (type: 'start' | 'end' | 'both', e: React.PointerEvent) => {
    e.stopPropagation();
    setIsDragging(type);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    if (type === 'both' && startPoint) {
      dragOffsetRef.current = {
        x: e.clientX - startPoint.x,
        y: e.clientY - startPoint.y,
      };
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !startPoint || !endPoint) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const curX = Math.round((e.clientX - rect.left) / 6) * 6; // snap to subtle subgrid
    const curY = Math.round((e.clientY - rect.top) / 6) * 6;

    if (isDragging === 'start') {
      setStartPoint({ x: curX, y: curY });
    } else if (isDragging === 'end') {
      setEndPoint({ x: curX, y: curY });
    } else if (isDragging === 'both') {
      const lengthX = endPoint.x - startPoint.x;
      const lengthY = endPoint.y - startPoint.y;
      setStartPoint({ x: curX, y: curY });
      setEndPoint({ x: curX + lengthX, y: curY + lengthY });
    }
  };

  const handlePointerUp = () => {
    setIsDragging(null);
  };

  return (
    <div
      className="absolute inset-0 pointer-events-auto z-20 overflow-hidden cursor-crosshair select-none"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* Top Floating Ruler Info Badge */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-amber-500/95 backdrop-blur-md text-amber-950 font-black px-4 py-1.5 rounded-full border-2 border-amber-300 shadow-xl flex items-center gap-3 text-xs md:text-sm">
        <img src="/assets/icons/ruler.png" alt="Ruler" className="w-5 h-5 object-contain" />
        <span>MODE PENGGARIS: Tarik ujung pin untuk mengukur panjang & sudut</span>
        <span className="bg-amber-900 text-amber-100 px-2 py-0.5 rounded-md font-mono font-bold">
          {distance.toFixed(1)} cm
        </span>
        <button
          onClick={onClose}
          className="ml-2 bg-amber-700 hover:bg-amber-800 text-white w-5 h-5 rounded-full flex items-center justify-center font-bold text-xs cursor-pointer"
        >
          ✕
        </button>
      </div>

      {/* SVG Canvas for Measurement Graphic */}
      <svg className="w-full h-full">
        <defs>
          <linearGradient id="rulerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
        </defs>

        {startPoint && endPoint && (
          <g>
            {/* Right Triangle decomposition for Pythagoras visualization */}
            {Math.abs(dx) > 0.2 && Math.abs(dy) > 0.2 && (
              <g opacity="0.4" strokeDasharray="4 4" stroke="#d97706" strokeWidth="2">
                <line x1={startPoint.x} y1={startPoint.y} x2={endPoint.x} y2={startPoint.y} />
                <line x1={endPoint.x} y1={startPoint.y} x2={endPoint.x} y2={endPoint.y} />
                {/* Math readout along legs */}
                <text x={(startPoint.x + endPoint.x) / 2} y={startPoint.y - 8} fill="#92400e" fontSize="12" fontWeight="bold" textAnchor="middle">
                  a = {Math.abs(dx).toFixed(1)} cm
                </text>
                <text x={endPoint.x + 8} y={(startPoint.y + endPoint.y) / 2} fill="#92400e" fontSize="12" fontWeight="bold" dominantBaseline="middle">
                  b = {Math.abs(dy).toFixed(1)} cm
                </text>
              </g>
            )}

            {/* Main Hypotenuse / Distance Line */}
            <line
              x1={startPoint.x}
              y1={startPoint.y}
              x2={endPoint.x}
              y2={endPoint.y}
              stroke="url(#rulerGrad)"
              strokeWidth="6"
              strokeLinecap="round"
              className="drop-shadow-md cursor-grab"
              onPointerDown={(e) => handlePointerDown('both', e)}
            />

            {/* Ruler ticks along the line */}
            {Array.from({ length: Math.floor(distance) + 1 }).map((_, i) => {
              const ratio = distance > 0 ? i / distance : 0;
              const px = startPoint.x + (endPoint.x - startPoint.x) * ratio;
              const py = startPoint.y + (endPoint.y - startPoint.y) * ratio;
              return (
                <circle
                  key={i}
                  cx={px}
                  cy={py}
                  r="3"
                  fill="#ffffff"
                  stroke="#92400e"
                  strokeWidth="1.5"
                />
              );
            })}

            {/* Midpoint Distance Badge */}
            <g transform={`translate(${(startPoint.x + endPoint.x) / 2}, ${(startPoint.y + endPoint.y) / 2})`}>
              <rect x="-48" y="-14" width="96" height="28" rx="8" fill="#1e293b" stroke="#f59e0b" strokeWidth="2" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.3))" />
              <text x="0" y="4" fill="#fbbf24" fontSize="13" fontWeight="900" textAnchor="middle">
                {distance.toFixed(1)} cm ({angle}°)
              </text>
            </g>

            {/* Pin Start Handle */}
            <g
              transform={`translate(${startPoint.x}, ${startPoint.y})`}
              className="cursor-pointer hover:scale-125 transition-transform"
              onPointerDown={(e) => handlePointerDown('start', e)}
            >
              <circle r="14" fill="#f59e0b" stroke="#ffffff" strokeWidth="3" filter="drop-shadow(0 3px 4px rgba(0,0,0,0.4))" />
              <circle r="5" fill="#78350f" />
            </g>

            {/* Pin End Handle */}
            <g
              transform={`translate(${endPoint.x}, ${endPoint.y})`}
              className="cursor-pointer hover:scale-125 transition-transform"
              onPointerDown={(e) => handlePointerDown('end', e)}
            >
              <circle r="14" fill="#10b981" stroke="#ffffff" strokeWidth="3" filter="drop-shadow(0 3px 4px rgba(0,0,0,0.4))" />
              <circle r="5" fill="#064e3b" />
            </g>
          </g>
        )}
      </svg>
    </div>
  );
};

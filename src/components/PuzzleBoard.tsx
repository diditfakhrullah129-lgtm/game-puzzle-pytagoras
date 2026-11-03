import React, { useState, useEffect, useRef } from 'react';
import { LevelData, PuzzlePiece, Point, GameSettings } from '../types/game';
import { TactileButton } from './TactileButton';
import { RulerOverlay } from './RulerOverlay';
import { ProofTutorialOverlay } from './ProofTutorialOverlay';
import { soundEngine } from '../utils/audio';

interface PuzzleBoardProps {
  level: LevelData;
  settings: GameSettings;
  onUpdateSettings: (s: Partial<GameSettings>) => void;
  onBack: () => void;
  onHome: () => void;
  onOpenSettings: () => void;
  onLevelComplete: (levelId: number, stars: number, timeSpent: number) => void;
  onNextLevel?: () => void;
  hasNextLevel: boolean;
}

// Compute centroid of polygon
function getCentroid(pts: Point[]): Point {
  const n = pts.length;
  if (n === 0) return { x: 0, y: 0 };
  const sumX = pts.reduce((acc, p) => acc + p.x, 0);
  const sumY = pts.reduce((acc, p) => acc + p.y, 0);
  return { x: Math.round(sumX / n), y: Math.round(sumY / n) };
}

export const PuzzleBoard: React.FC<PuzzleBoardProps> = ({
  level,
  settings,
  onUpdateSettings,
  onBack,
  onHome,
  onOpenSettings,
  onLevelComplete,
  onNextLevel,
  hasNextLevel,
}) => {
  // Stage management for multi-stage levels (such as Level 6 MoMath)
  const [activeStageIndex, setActiveStageIndex] = useState<number>(0);
  const [stageCompleted, setStageCompleted] = useState<Record<number, boolean>>({});
  const [stageSuccessBanner, setStageSuccessBanner] = useState<boolean>(false);

  // Mobile portrait orientation detection
  const [isPortrait, setIsPortrait] = useState<boolean>(false);
  const [dismissRotatePrompt, setDismissRotatePrompt] = useState<boolean>(false);

  useEffect(() => {
    const checkOrientation = () => {
      const portrait = window.innerHeight > window.innerWidth && window.innerWidth < 768;
      setIsPortrait(portrait);
    };
    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);
    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  const hasStages = !!(level.stages && level.stages.length > 0);
  const currentStage = hasStages && level.stages ? level.stages[activeStageIndex] : null;

  // Active target zone definition
  const activeTargetZone = currentStage
    ? {
        name: currentStage.targetName,
        vertices: currentStage.targetVertices,
        targetArea: currentStage.targetArea,
        formula: currentStage.formula,
        description: currentStage.subtitle,
      }
    : level.targetZone;

  const [pieces, setPieces] = useState<PuzzlePiece[]>([]);
  const [selectedPieceId, setSelectedPieceId] = useState<string | null>(null);
  const [isRulerActive, setIsRulerActive] = useState<boolean>(false);
  const [showAreaOverlay, setShowAreaOverlay] = useState<boolean>(true);
  const [showHintGuide, setShowHintGuide] = useState<boolean>(false);
  const [isSolutionPreview, setIsSolutionPreview] = useState<boolean>(false);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [validationMessage, setValidationMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Dragging piece state
  const [draggingPieceId, setDraggingPieceId] = useState<string | null>(null);
  // Manual free-rotation dragging state
  const [rotatingPieceId, setRotatingPieceId] = useState<string | null>(null);

  const dragStartRef = useRef<{ mouseX: number; mouseY: number; pieceX: number; pieceY: number }>({
    mouseX: 0,
    mouseY: 0,
    pieceX: 0,
    pieceY: 0,
  });
  const lastTapRef = useRef<{ pieceId: string; time: number }>({ pieceId: '', time: 0 });
  const boardRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Initialize level
  useEffect(() => {
    setActiveStageIndex(0);
    setStageCompleted({});
    setStageSuccessBanner(false);
    resetToStage(0);
    setElapsedTime(0);
    setIsCompleted(false);
    setIsSolutionPreview(false);
    setShowHintGuide(false);
    setValidationMessage(null);
  }, [level.id]);

  // Timer
  useEffect(() => {
    if (isCompleted) return;
    const timer = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isCompleted]);

  // Base canvas target origin offsets
  const baseTargetOrigin = { x: 100, y: 35 };

  // Offset for active stage in Level 6:
  const getStageTargetOrigin = (stageIdx: number) => {
    const stageOffset =
      level.id === 6
        ? stageIdx === 0
          ? { x: -135, y: 35 }
          : stageIdx === 1
          ? { x: 210, y: 20 }
          : { x: 0, y: 0 }
        : { x: 0, y: 0 };
    return {
      x: baseTargetOrigin.x + stageOffset.x,
      y: baseTargetOrigin.y + stageOffset.y,
    };
  };

  // Dedicated Tray Placement & Scramble Angles
  const SCRAMBLE_ANGLES = [45, 90, 135, 180, 225, 270, 315];

  const getScrambledPiecesInTray = (
    rawPieces: PuzzlePiece[],
    targetOrigin: { x: number; y: number }
  ): PuzzlePiece[] => {
    const n = rawPieces.length;
    // Shuffle slot positions so pieces are randomly scattered across the tray
    const slotIndices = Array.from({ length: n }, (_, i) => i);
    for (let i = slotIndices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [slotIndices[i], slotIndices[j]] = [slotIndices[j], slotIndices[i]];
    }

    const step = 500 / (n + 1);

    return rawPieces.map((piece, idx) => {
      const slotIdx = slotIndices[idx];
      // Position inside the dedicated bottom tray (y: 235 to 390, spacious and reachable)
      const canvasX = Math.round(-60 + step * (slotIdx + 1) - 35);
      const canvasY = 285;

      // Coordinate relative to targetOrigin
      const relX = canvasX - targetOrigin.x;
      const relY = canvasY - targetOrigin.y;

      // Scramble rotation so pieces are not pre-aligned
      const candidateAngles = SCRAMBLE_ANGLES.filter(
        (a) => Math.abs(a - piece.targetRotation) > 15 && Math.abs(a - piece.targetRotation) < 345
      );
      const chosenAngle =
        candidateAngles.length > 0
          ? candidateAngles[Math.floor(Math.random() * candidateAngles.length)]
          : (piece.targetRotation + 90) % 360;

      return {
        ...piece,
        x: relX,
        y: relY,
        rotation: chosenAngle,
      };
    });
  };

  // Reset pieces for a specific stage or level (default to placing in tray with scrambled rotations)
  const resetToStage = (stageIdx: number, scramble = true) => {
    const rawPieces = hasStages && level.stages ? level.stages[stageIdx].pieces : level.pieces;
    const origin = getStageTargetOrigin(stageIdx);

    const initialized = scramble
      ? getScrambledPiecesInTray(rawPieces, origin)
      : rawPieces.map((p) => ({
          ...p,
          x: p.initialX,
          y: p.initialY,
          rotation: p.rotation || 0,
        }));

    setPieces(initialized);
    setSelectedPieceId(null);
    setRotatingPieceId(null);
    setValidationMessage(null);
    setIsSolutionPreview(false);
    setStageSuccessBanner(false);
  };

  const resetToInitial = () => {
    resetToStage(activeStageIndex, true);
  };

  // Shuffle pieces in the tray with new randomized positions and rotations
  const handleShufflePieces = () => {
    soundEngine.rotate();
    resetToStage(activeStageIndex, true);
    setValidationMessage({
      text: 'Puing puzzle berhasil diacak di dalam wadah! Putar & sesuaikan kepingannya.',
      type: 'info',
    });
  };

  // Switch stage in Level 6
  const handleSwitchStage = (idx: number) => {
    setActiveStageIndex(idx);
    resetToStage(idx);
    soundEngine.click();
  };

  const getPointsString = (vertices: Point[]): string => {
    return vertices.map((p) => `${p.x},${p.y}`).join(' ');
  };

  // Check if a piece is currently snapped inside the target frame
  const isPieceSnapped = (piece: PuzzlePiece): boolean => {
    const dist = Math.hypot(piece.x - piece.targetX, piece.y - piece.targetY);
    const normalizedRot = ((piece.rotation % 360) + 360) % 360;
    const targetRot = ((piece.targetRotation % 360) + 360) % 360;
    const rotDiff = Math.abs(normalizedRot - targetRot);

    // Soft rotation tolerance: +-15 degrees for free rotation, or 90 deg symmetry for squares
    const isRotValid =
      piece.type === 'square'
        ? rotDiff % 90 <= 15 || rotDiff % 90 >= 75
        : rotDiff <= 15 || rotDiff >= 345;

    return dist < settings.snapTolerance && isRotValid;
  };

  // Manual angle setter (from slider or dial)
  const handleSetPieceRotation = (pieceId: string, angle: number) => {
    const normalized = Math.round(((angle % 360) + 360) % 360);
    setPieces((prev) =>
      prev.map((p) => {
        if (p.id !== pieceId) return p;
        return { ...p, rotation: normalized };
      })
    );
  };

  // Fine-tuning angle increment/decrement
  const handleAdjustPieceRotation = (pieceId: string, delta: number) => {
    soundEngine.rotate();
    setPieces((prev) =>
      prev.map((p) => {
        if (p.id !== pieceId) return p;
        const normalized = Math.round((((p.rotation + delta) % 360) + 360) % 360);
        return { ...p, rotation: normalized };
      })
    );
  };

  // Quick 90 deg step rotate
  const handleRotatePiece90 = (pieceId: string) => {
    soundEngine.rotate();
    handleAdjustPieceRotation(pieceId, 90);
  };

  // Active target origin for current stage
  const currentTargetOrigin = getStageTargetOrigin(activeStageIndex);

  // Pointer drag events for SVG pieces with touch-action: none
  const handlePointerDown = (pieceId: string, e: React.PointerEvent) => {
    e.stopPropagation();
    if (isSolutionPreview) setIsSolutionPreview(false);

    // Double tap / double click detection to step-rotate
    const now = Date.now();
    if (lastTapRef.current.pieceId === pieceId && now - lastTapRef.current.time < 320) {
      handleAdjustPieceRotation(pieceId, 45);
      lastTapRef.current = { pieceId: '', time: 0 };
      return;
    }
    lastTapRef.current = { pieceId, time: now };

    setDraggingPieceId(pieceId);
    setSelectedPieceId(pieceId);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    const piece = pieces.find((p) => p.id === pieceId);
    if (piece) {
      dragStartRef.current = {
        mouseX: e.clientX,
        mouseY: e.clientY,
        pieceX: piece.x,
        pieceY: piece.y,
      };
    }
  };

  // Drag on-canvas rotation handle knob
  const handleRotationHandlePointerDown = (pieceId: string, e: React.PointerEvent) => {
    e.stopPropagation();
    setRotatingPieceId(pieceId);
    setSelectedPieceId(pieceId);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    // 1. Handle on-canvas rotation handle dragging
    if (rotatingPieceId && svgRef.current) {
      const piece = pieces.find((p) => p.id === rotatingPieceId);
      if (piece) {
        const svgRect = svgRef.current.getBoundingClientRect();
        // Convert client point to SVG viewBox coordinates (-90 10 590 355)
        const svgX = ((e.clientX - svgRect.left) / svgRect.width) * 590 - 90;
        const svgY = ((e.clientY - svgRect.top) / svgRect.height) * 355 + 10;
        const centroid = getCentroid(piece.vertices);
        const pieceCenterX = currentTargetOrigin.x + piece.x + centroid.x;
        const pieceCenterY = currentTargetOrigin.y + piece.y + centroid.y;
        const rad = Math.atan2(svgY - pieceCenterY, svgX - pieceCenterX);
        let deg = Math.round((rad * 180) / Math.PI) + 90; // +90 because handle sits above
        deg = ((deg % 360) + 360) % 360;
        handleSetPieceRotation(rotatingPieceId, deg);
      }
      return;
    }

    // 2. Handle piece displacement dragging
    if (!draggingPieceId) return;

    const deltaX = e.clientX - dragStartRef.current.mouseX;
    const deltaY = e.clientY - dragStartRef.current.mouseY;

    setPieces((prev) =>
      prev.map((p) => {
        if (p.id !== draggingPieceId) return p;

        let nextX = dragStartRef.current.pieceX + deltaX;
        let nextY = dragStartRef.current.pieceY + deltaY;

        // Auto snap magnetism when hovering close to target position
        const distToTarget = Math.hypot(nextX - p.targetX, nextY - p.targetY);
        const normalizedRot = ((p.rotation % 360) + 360) % 360;
        const targetRot = ((p.targetRotation % 360) + 360) % 360;
        const rotDiff = Math.abs(normalizedRot - targetRot);
        const isRotValid =
          p.type === 'square'
            ? rotDiff % 90 <= 15 || rotDiff % 90 >= 75
            : rotDiff <= 15 || rotDiff >= 345;

        if (distToTarget < settings.snapTolerance && isRotValid) {
          nextX = p.targetX;
          nextY = p.targetY;
        }

        return { ...p, x: nextX, y: nextY };
      })
    );
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (rotatingPieceId) {
      setRotatingPieceId(null);
    }

    if (draggingPieceId) {
      const currentPiece = pieces.find((p) => p.id === draggingPieceId);
      if (currentPiece) {
        const distToTarget = Math.hypot(currentPiece.x - currentPiece.targetX, currentPiece.y - currentPiece.targetY);
        const normalizedRot = ((currentPiece.rotation % 360) + 360) % 360;
        const targetRot = ((currentPiece.targetRotation % 360) + 360) % 360;
        const rotDiff = Math.abs(normalizedRot - targetRot);
        const isRotValid =
          currentPiece.type === 'square'
            ? rotDiff % 90 <= 15 || rotDiff % 90 >= 75
            : rotDiff <= 15 || rotDiff >= 345;

        if (distToTarget < settings.snapTolerance && isRotValid) {
          soundEngine.snap();
          setPieces((prev) =>
            prev.map((p) =>
              p.id === draggingPieceId ? { ...p, x: p.targetX, y: p.targetY } : p
            )
          );
        }
      }
      setDraggingPieceId(null);
    }
  };

  // Validation function
  const handleCheckSolution = () => {
    const allSnapped = pieces.every((p) => isPieceSnapped(p));

    if (allSnapped) {
      soundEngine.victory();
      setStageCompleted((prev) => ({ ...prev, [activeStageIndex]: true }));

      if (hasStages && activeStageIndex < (level.stages?.length || 1) - 1) {
        // Current stage completed! Show the big prominent unmissable next stage banner!
        setStageSuccessBanner(true);
      } else {
        // Final completion!
        setIsCompleted(true);
        const starsEarned = elapsedTime < 60 ? 3 : elapsedTime < 120 ? 2 : 1;
        setValidationMessage({
          text: hasStages
            ? 'LUAR BIASA! Seluruh tahap pembuktian selesai utuh tanpa celah! Teorema Pythagoras c² = a² + b² (25 = 9 + 16) terbukti nyata!'
            : `SEMPURNA! Seluruh keping pas dan menutup segi empat tanpa celah! ${level.concept}.`,
          type: 'success',
        });
        onLevelComplete(level.id, starsEarned, elapsedTime);
      }
    } else {
      soundEngine.error();
      const snappedCount = pieces.filter((p) => isPieceSnapped(p)).length;
      setValidationMessage({
        text: `Belum menutup utuh: ${snappedCount} dari ${pieces.length} keping berada di posisi tepat. Gunakan tombol Rotasi Manual untuk menyesuaikan sudut keping hingga pas tanpa celah!`,
        type: 'error',
      });
    }
  };

  // Advance to next stage button handler
  const handleProceedNextStage = () => {
    setStageSuccessBanner(false);
    if (hasStages && activeStageIndex < (level.stages?.length || 1) - 1) {
      handleSwitchStage(activeStageIndex + 1);
    }
  };

  // Show Solution (kunci jawaban)
  const handleShowSolution = () => {
    soundEngine.hint();
    setIsSolutionPreview(true);
    setPieces((prev) =>
      prev.map((p) => ({
        ...p,
        x: p.targetX,
        y: p.targetY,
        rotation: p.targetRotation,
      }))
    );
  };

  // Hint button
  const handleHint = () => {
    soundEngine.hint();
    setShowHintGuide((prev) => !prev);
    setValidationMessage({
      text: currentStage ? currentStage.hint : level.hint,
      type: 'info',
    });
  };

  const selectedPiece = pieces.find((p) => p.id === selectedPieceId);

  // Calculate current placed area inside target
  const placedArea = pieces
    .filter((p) => isPieceSnapped(p))
    .reduce((sum, p) => sum + p.area, 0);

  return (
    <div className="relative w-full h-[100dvh] max-h-screen flex flex-col bg-slate-950 select-none overflow-hidden text-slate-100">
      {/* Mobile Landscape Orientation Helper Overlay */}
      {isPortrait && !dismissRotatePrompt && (
        <div className="absolute inset-x-2 top-12 z-50 p-3 bg-amber-950/95 border-2 border-amber-400 rounded-2xl shadow-2xl flex items-center justify-between gap-3 text-xs text-amber-200 animate-in fade-in">
          <div className="flex items-center gap-2">
            <span className="text-xl">🔄</span>
            <div>
              <strong className="block text-white font-black">Mode Mendatar (Landscape) Disarankan</strong>
              <span>Putar layar HP Anda ke posisi landscape agar seluruh arena dan tombol pas di layar.</span>
            </div>
          </div>
          <button
            onClick={() => setDismissRotatePrompt(true)}
            className="px-2.5 py-1 bg-amber-500 text-slate-950 font-black rounded-lg text-[11px]"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Slim Professional Top Bar (Fixed 44px height, zero overflow) */}
      <header className="h-11 px-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-2 shrink-0 z-30">
        {/* Left: Home & Back */}
        <div className="flex items-center gap-1.5">
          <TactileButton
            iconSrc="/assets/icons/home.png"
            iconAlt="Menu Utama"
            label="Menu"
            variant="neutral"
            size="sm"
            className="py-1 px-2.5 text-xs"
            onClick={onHome}
          />
          <TactileButton
            iconSrc="/assets/icons/back.png"
            iconAlt="Pilih Level"
            label="Level"
            variant="neutral"
            size="sm"
            className="py-1 px-2.5 text-xs"
            onClick={onBack}
          />

          <span className="hidden sm:inline-block text-xs font-black text-amber-400 ml-1">
            Level {level.id}: {level.title.split(':')[1] || level.title}
          </span>
        </div>

        {/* Center: Stage Navigation Stepper or Concept Badge */}
        {hasStages && level.stages ? (
          <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-700">
            {level.stages.map((stg, sIdx) => {
              const isCurr = sIdx === activeStageIndex;
              const isDone = stageCompleted[sIdx];
              return (
                <button
                  key={stg.id}
                  onClick={() => handleSwitchStage(sIdx)}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all flex items-center gap-1 ${
                    isCurr
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : isDone
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-600'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>{stg.title.split(':')[0]}</span>
                  {isDone && <span className="text-emerald-400 font-black">✓</span>}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex items-center gap-1.5 bg-slate-950 px-2 py-0.5 rounded-md border border-slate-700 text-xs font-mono">
            <span className="text-amber-400 font-bold">{level.concept}</span>
            <span className="text-slate-400 text-[11px]">
              ({placedArea}/{activeTargetZone.targetArea} cm²)
            </span>
          </div>
        )}

        {/* Right: Watermark & Settings */}
        <div className="flex items-center gap-2">
          {/* USER WATERMARK */}
          <div className="hidden sm:flex items-center gap-1 px-2.5 py-0.5 bg-amber-500/15 border border-amber-500/40 rounded-full text-amber-300 font-black text-[11px] shadow-sm">
            <span>👑 Made In Didit Fakhrullah</span>
          </div>

          <TactileButton
            iconSrc={settings.soundEnabled ? '/assets/icons/sound_on.png' : '/assets/icons/sound_off.png'}
            iconAlt="Suara"
            variant="neutral"
            size="icon-sm"
            className="w-7 h-7"
            onClick={() => {
              const next = !settings.soundEnabled;
              soundEngine.setEnabled(next);
              onUpdateSettings({ soundEnabled: next });
            }}
          />
          <TactileButton
            iconSrc="/assets/icons/settings.png"
            iconAlt="Pengaturan"
            variant="neutral"
            size="icon-sm"
            className="w-7 h-7"
            onClick={onOpenSettings}
          />
        </div>
      </header>

      {/* Main Game Screen (Strictly fits in 100dvh, ZERO SCROLLING) */}
      <main
        ref={boardRef}
        className="relative flex-1 min-h-0 w-full flex flex-col md:flex-row overflow-hidden bg-slate-950"
      >
        {/* Measuring Ruler Overlay */}
        <RulerOverlay active={isRulerActive} onClose={() => setIsRulerActive(false)} scale={36} />

        {/* BIG PROMINENT NEXT STAGE MODAL (Appears right in front of user when stage succeeds) */}
        {stageSuccessBanner && (
          <div className="absolute inset-0 z-40 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in zoom-in-95">
            <div className="bg-gradient-to-b from-slate-850 to-slate-900 border-3 border-emerald-400 p-6 rounded-3xl max-w-sm w-full text-center shadow-[0_15px_45px_rgba(16,185,129,0.4)] space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center shadow-lg">
                <img src="/assets/icons/check.png" alt="Berhasil" className="w-10 h-10 object-contain drop-shadow" />
              </div>
              <div>
                <span className="text-xs font-black tracking-widest text-emerald-400 uppercase block">
                  TAHAP {activeStageIndex + 1} SELESAI DENGAN TEPAT!
                </span>
                <h3 className="text-lg font-black text-white mt-1">
                  {currentStage?.title || 'Tahap Selesai'}
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {currentStage?.explanation || 'Semua keping pas dan menutup rata tanpa celah!'}
                </p>
              </div>

              {/* UNMISSABLE CALL TO ACTION FOR NEXT STAGE */}
              <button
                onClick={handleProceedNextStage}
                autoFocus
                className="w-full py-3 px-4 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-black text-sm rounded-xl shadow-[0_5px_0_#b45309] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 animate-pulse cursor-pointer"
              >
                <span>LANJUT KE TAHAP {activeStageIndex + 2}</span>
                <img src="/assets/icons/next.png" alt="Lanjut" className="w-4 h-4 object-contain" />
              </button>
            </div>
          </div>
        )}

        {/* Section 1: SVG Puzzle Arena with Vertical Scroll to view all pieces */}
        <section
          aria-label="Arena Puzzle Geometri"
          className="flex-1 min-h-0 min-w-0 relative flex flex-col items-center overflow-y-auto overflow-x-hidden p-2 sm:p-3 scroll-smooth"
        >
          {/* Subtle Grid */}
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage:
                'linear-gradient(to right, #38bdf8 1px, transparent 1px), linear-gradient(to bottom, #38bdf8 1px, transparent 1px)',
              backgroundSize: '36px 36px',
            }}
          />

          {/* Canvas Watermark in corner */}
          <div className="absolute bottom-1 right-2 pointer-events-none z-10 text-[10px] font-bold text-amber-400/40 select-none">
            Made In Didit Fakhrullah
          </div>

          {/* SVG Canvas - Vertically scrollable with generous height so all pieces in tray are visible */}
          <svg
            ref={svgRef}
            className="w-full max-w-4xl min-h-[460px] sm:min-h-[500px] select-none block shrink-0"
            viewBox="-90 0 590 425"
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          >
            <defs>
              <pattern id="targetGrid" width="36" height="36" patternUnits="userSpaceOnUse">
                <rect width="36" height="36" fill="#0b1329" fillOpacity="0.9" />
                <path d="M 36 0 L 0 0 0 36" fill="none" stroke="#1e293b" strokeWidth="1" strokeDasharray="3 3" />
              </pattern>

              <filter id="pieceShadow" x="-20%" y="-20%" width="150%" height="150%">
                <feDropShadow dx="2" dy="5" stdDeviation="4" floodColor="#000000" floodOpacity="0.6" />
              </filter>
              <filter id="activeGlow" x="-25%" y="-25%" width="160%" height="160%">
                <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#38bdf8" floodOpacity="0.9" />
              </filter>
              <filter id="goldGlow" x="-25%" y="-25%" width="160%" height="160%">
                <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#f59e0b" floodOpacity="0.9" />
              </filter>
            </defs>

            {/* In Level 6: Render Background Frames for all 3 columns (a², c², b²) with Sequential Step Tutorial Flow */}
            {level.id === 6 && (
              <g className="pointer-events-none select-none">
                {/* Proof Flow Connectors: a² + b² = c² */}
                <g className="opacity-70">
                  {/* Arc a² to c² */}
                  <path
                    d={`M ${baseTargetOrigin.x - 27} ${baseTargetOrigin.y + 85} Q ${baseTargetOrigin.x - 12} ${baseTargetOrigin.y + 70} ${baseTargetOrigin.x} ${baseTargetOrigin.y + 85}`}
                    fill="none"
                    stroke="#facc15"
                    strokeWidth="2"
                    strokeDasharray="4 3"
                  />
                  {/* Plus Badge */}
                  <circle cx={baseTargetOrigin.x - 14} cy={baseTargetOrigin.y + 70} r="9" fill="#0f172a" stroke="#facc15" strokeWidth="1.5" />
                  <text x={baseTargetOrigin.x - 14} y={baseTargetOrigin.y + 74} fill="#facc15" fontSize="12" fontWeight="900" textAnchor="middle">+</text>

                  {/* Arc b² to c² */}
                  <path
                    d={`M ${baseTargetOrigin.x + 210} ${baseTargetOrigin.y + 85} Q ${baseTargetOrigin.x + 195} ${baseTargetOrigin.y + 70} ${baseTargetOrigin.x + 180} ${baseTargetOrigin.y + 85}`}
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="2"
                    strokeDasharray="4 3"
                  />
                  {/* Equals Badge */}
                  <circle cx={baseTargetOrigin.x + 195} cy={baseTargetOrigin.y + 70} r="9" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
                  <text x={baseTargetOrigin.x + 195} y={baseTargetOrigin.y + 74} fill="#38bdf8" fontSize="11" fontWeight="900" textAnchor="middle">=</text>
                </g>

                {/* Kolom a² (Left Column: 3x3 = 9 cm²) - LANGKAH 1 */}
                <g transform={`translate(${baseTargetOrigin.x - 135}, ${baseTargetOrigin.y + 35})`}>
                  {/* Step 1 Sequential Badge */}
                  <g transform={`translate(${1.5 * 36}, -22)`}>
                    <circle
                      r="10"
                      fill={activeStageIndex === 0 ? '#facc15' : '#1e293b'}
                      stroke="#facc15"
                      strokeWidth="1.5"
                    />
                    <text y="3.5" fill={activeStageIndex === 0 ? '#0f172a' : '#facc15'} fontSize="10" fontWeight="900" textAnchor="middle">
                      {stageCompleted[0] ? '✓' : '1'}
                    </text>
                  </g>

                  <rect
                    width={3 * 36}
                    height={3 * 36}
                    rx="6"
                    fill="#0f172a"
                    fillOpacity="0.75"
                    stroke={activeStageIndex === 0 ? '#facc15' : '#713f12'}
                    strokeWidth={activeStageIndex === 0 ? '3' : '1.5'}
                    strokeDasharray={activeStageIndex === 0 ? 'none' : '4 3'}
                    filter={activeStageIndex === 0 ? 'url(#goldGlow)' : undefined}
                  />
                  <text x={1.5 * 36} y="-8" fill="#facc15" fontSize="10" fontWeight="800" textAnchor="middle">
                    Kolom a² (9 cm²)
                  </text>
                  <text x={1.5 * 36} y={1.5 * 36 + 4} fill="#facc15" opacity="0.3" fontSize="15" fontWeight="900" fontFamily="monospace" textAnchor="middle">
                    3 × 3
                  </text>
                  {stageCompleted[0] && (
                    <text x={1.5 * 36} y={1.5 * 36 + 22} fill="#10b981" fontSize="10" fontWeight="900" textAnchor="middle">
                      ✓ SELESAI
                    </text>
                  )}
                </g>

                {/* Kolom c² (Center Column: 5x5 = 25 cm²) - LANGKAH 3 */}
                <g transform={`translate(${baseTargetOrigin.x}, ${baseTargetOrigin.y})`}>
                  {/* Step 3 Sequential Badge */}
                  <g transform={`translate(${2.5 * 36}, -24)`}>
                    <circle
                      r="11"
                      fill={activeStageIndex === 2 ? '#38bdf8' : '#1e293b'}
                      stroke="#38bdf8"
                      strokeWidth="1.5"
                    />
                    <text y="4" fill={activeStageIndex === 2 ? '#0f172a' : '#38bdf8'} fontSize="11" fontWeight="900" textAnchor="middle">
                      {stageCompleted[2] ? '✓' : '3'}
                    </text>
                  </g>

                  <text x={2.5 * 36} y="-10" fill="#38bdf8" fontSize="11" fontWeight="900" textAnchor="middle">
                    Kolom c² = a² + b² (25 cm²)
                  </text>
                  {activeStageIndex !== 2 && (
                    <rect
                      width={5 * 36}
                      height={5 * 36}
                      rx="6"
                      fill="#0f172a"
                      fillOpacity="0.5"
                      stroke="#0369a1"
                      strokeWidth="1.5"
                      strokeDasharray="6 4"
                    />
                  )}
                </g>

                {/* Kolom b² (Right Column: 4x4 = 16 cm²) - LANGKAH 2 */}
                <g transform={`translate(${baseTargetOrigin.x + 210}, ${baseTargetOrigin.y + 20})`}>
                  {/* Step 2 Sequential Badge */}
                  <g transform={`translate(${2 * 36}, -22)`}>
                    <circle
                      r="10"
                      fill={activeStageIndex === 1 ? '#f87171' : '#1e293b'}
                      stroke="#f87171"
                      strokeWidth="1.5"
                    />
                    <text y="3.5" fill={activeStageIndex === 1 ? '#0f172a' : '#f87171'} fontSize="10" fontWeight="900" textAnchor="middle">
                      {stageCompleted[1] ? '✓' : '2'}
                    </text>
                  </g>

                  <rect
                    width={4 * 36}
                    height={4 * 36}
                    rx="6"
                    fill="#0f172a"
                    fillOpacity="0.75"
                    stroke={activeStageIndex === 1 ? '#ef4444' : '#881337'}
                    strokeWidth={activeStageIndex === 1 ? '3' : '1.5'}
                    strokeDasharray={activeStageIndex === 1 ? 'none' : '4 3'}
                    filter={activeStageIndex === 1 ? 'url(#activeGlow)' : undefined}
                  />
                  <text x={2 * 36} y="-8" fill="#f87171" fontSize="10" fontWeight="800" textAnchor="middle">
                    Kolom b² (16 cm²)
                  </text>
                  <text x={2 * 36} y={2 * 36 + 4} fill="#f87171" opacity="0.3" fontSize="15" fontWeight="900" fontFamily="monospace" textAnchor="middle">
                    4 Puing
                  </text>
                  {stageCompleted[1] && (
                    <text x={2 * 36} y={2 * 36 + 22} fill="#10b981" fontSize="10" fontWeight="900" textAnchor="middle">
                      ✓ SELESAI
                    </text>
                  )}
                </g>
              </g>
            )}

            {/* Active Target Area Outline */}
            <g transform={`translate(${currentTargetOrigin.x}, ${currentTargetOrigin.y})`}>
              <polygon
                points={getPointsString(activeTargetZone.vertices)}
                fill="url(#targetGrid)"
                stroke="#38bdf8"
                strokeWidth="3"
                strokeDasharray="8 5"
                strokeLinejoin="round"
              />

              {(() => {
                const targetCentroid = getCentroid(activeTargetZone.vertices);
                return (
                  <text
                    x={targetCentroid.x}
                    y={targetCentroid.y}
                    fill="#38bdf8"
                    opacity="0.22"
                    fontSize="24"
                    fontWeight="900"
                    fontFamily="monospace"
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    {activeTargetZone.targetArea} cm²
                  </text>
                );
              })()}

              {/* Hint Ghost outlines when hint is clicked */}
              {showHintGuide && (
                <g opacity="0.45">
                  {pieces.map((p) => {
                    const c = getCentroid(p.vertices);
                    return (
                      <polygon
                        key={`hint_${p.id}`}
                        points={getPointsString(p.vertices)}
                        transform={`translate(${p.targetX}, ${p.targetY}) rotate(${p.targetRotation}, ${c.x}, ${c.y})`}
                        fill="none"
                        stroke="#fbbf24"
                        strokeWidth="2.5"
                        strokeDasharray="5 3"
                        strokeLinejoin="round"
                      />
                    );
                  })}
                </g>
              )}
            </g>

            {/* DEDICATED PUZZLE PIECE TRAY (Wadah Puing Puzzle Khusus) */}
            <g className="select-none pointer-events-none">
              {/* Outer Tray Box Container */}
              <rect
                x="-75"
                y="235"
                width="550"
                height="155"
                rx="16"
                fill="#0b1329"
                fillOpacity="0.9"
                stroke="#38bdf8"
                strokeWidth="2"
                strokeDasharray="6 4"
              />

              {/* Tray Header Title Pill */}
              <g transform="translate(200, 252)">
                <rect x="-150" y="-12" width="300" height="22" rx="11" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.2" />
                <text y="2" fill="#38bdf8" fontSize="10.5" fontWeight="900" textAnchor="middle" dominantBaseline="middle">
                  📦 WADAH PUING PUZZLE • Ambil keping dari sini
                </text>
              </g>

              {/* Individual Piece Slots / Pedestals in Tray */}
              {Array.from({ length: pieces.length }, (_, sIdx) => {
                const step = 500 / (pieces.length + 1);
                const slotX = Math.round(-60 + step * (sIdx + 1) - 35);
                const slotY = 285;
                return (
                  <g key={`slot_${sIdx}`} transform={`translate(${slotX}, ${slotY})`}>
                    <rect
                      x="-25"
                      y="-15"
                      width="76"
                      height="76"
                      rx="12"
                      fill="#1e293b"
                      fillOpacity="0.45"
                      stroke="#475569"
                      strokeWidth="1.2"
                      strokeDasharray="3 3"
                    />
                    <text y="75" fill="#64748b" fontSize="9" fontWeight="800" textAnchor="middle">
                      Puing {sIdx + 1}
                    </text>
                  </g>
                );
              })}
            </g>

            {/* Interactive Puzzle Pieces */}
            {pieces.map((piece) => {
              const isSelected = selectedPieceId === piece.id;
              const snapped = isPieceSnapped(piece);
              const centroid = getCentroid(piece.vertices);
              const handleRadius = 55;

              return (
                <g
                  key={piece.id}
                  transform={`translate(${currentTargetOrigin.x + piece.x}, ${currentTargetOrigin.y + piece.y}) rotate(${piece.rotation}, ${centroid.x}, ${centroid.y})`}
                  className="cursor-grab active:cursor-grabbing select-none transition-transform duration-75"
                  style={{ touchAction: 'none' }}
                  onPointerDown={(e) => handlePointerDown(piece.id, e)}
                  onDoubleClick={() => handleAdjustPieceRotation(piece.id, 45)}
                  filter={isSelected ? 'url(#activeGlow)' : 'url(#pieceShadow)'}
                >
                  {/* Main Polygon Shape */}
                  <polygon
                    points={getPointsString(piece.vertices)}
                    fill={piece.color}
                    stroke={isSelected ? '#ffffff' : piece.borderColor}
                    strokeWidth={isSelected ? '3' : '2'}
                    strokeLinejoin="round"
                  />

                  {/* Bevel edge */}
                  <polygon
                    points={getPointsString(piece.vertices)}
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="1.2"
                    strokeOpacity="0.45"
                    strokeLinejoin="round"
                  />

                  {/* Math Area Badge positioned at CENTROID of shape */}
                  {showAreaOverlay && (
                    <g transform={`translate(${centroid.x}, ${centroid.y})`} className="pointer-events-none select-none">
                      <rect
                        x="-20"
                        y="-10"
                        width="40"
                        height="20"
                        rx="5"
                        fill="#0b1120"
                        fillOpacity="0.88"
                        stroke="#ffffff"
                        strokeWidth="1"
                      />
                      <text
                        x="0"
                        y="3"
                        fill="#ffffff"
                        fontSize="9.5"
                        fontWeight="800"
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        {piece.area} cm²
                      </text>
                    </g>
                  )}

                  {/* Snapped Checkmark indicator */}
                  {snapped && (
                    <g transform={`translate(${centroid.x}, ${centroid.y - 16})`} className="pointer-events-none">
                      <circle r="7" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />
                      <path d="M -3 0 l 2 2 l 4 -4" fill="none" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </g>
                  )}

                  {/* INTERACTIVE MANUAL ROTATION HANDLE (Shown when piece is selected) */}
                  {isSelected && (
                    <g className="select-none">
                      <circle
                        cx={centroid.x}
                        cy={centroid.y}
                        r={handleRadius}
                        fill="none"
                        stroke="#f59e0b"
                        strokeWidth="1.5"
                        strokeDasharray="4 3"
                        opacity="0.6"
                        pointerEvents="none"
                      />
                      <line
                        x1={centroid.x}
                        y1={centroid.y}
                        x2={centroid.x}
                        y2={centroid.y - handleRadius}
                        stroke="#f59e0b"
                        strokeWidth="1.5"
                        strokeDasharray="2 2"
                        pointerEvents="none"
                      />
                      {/* Knob (Drag to rotate freely to any angle) */}
                      <g
                        transform={`translate(${centroid.x}, ${centroid.y - handleRadius})`}
                        className="cursor-grab active:cursor-grabbing hover:scale-125 transition-transform"
                        onPointerDown={(e) => handleRotationHandlePointerDown(piece.id, e)}
                      >
                        <circle r="13" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" filter="url(#goldGlow)" />
                        <path
                          d="M -4.5 -1 a 4.5 4.5 0 1 1 8 3.5 l 1.5 -1 l -0.8 3 l -3 -0.8 l 1.5 -1"
                          fill="#ffffff"
                        />
                        <rect
                          x="-18"
                          y="-24"
                          width="36"
                          height="16"
                          rx="4"
                          fill="#0f172a"
                          stroke="#f59e0b"
                          strokeWidth="1"
                          pointerEvents="none"
                        />
                        <text
                          x="0"
                          y="-13"
                          fill="#facc15"
                          fontSize="9"
                          fontWeight="900"
                          fontFamily="monospace"
                          textAnchor="middle"
                          pointerEvents="none"
                        >
                          {piece.rotation}°
                        </text>
                      </g>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Gentle Scroll Down Indicator */}
          <div className="py-1 px-3 mt-1.5 mb-2 rounded-full bg-slate-900/90 border border-slate-700/70 text-[10.5px] text-slate-300 font-semibold flex items-center gap-1.5 shadow-md shrink-0 select-none">
            <span className="text-amber-400 font-black animate-bounce text-xs">↓</span>
            <span>Gulir ke bawah untuk mengambil puing di wadah puzzle</span>
          </div>
        </section>

        {/* Section 2: Compact Professional Side Dock (Zero obstruction to puzzle board) */}
        <aside
          aria-label="Panel Aksi Permainan"
          className="w-full md:w-68 lg:w-76 bg-slate-900/95 border-t md:border-t-0 md:border-l border-slate-800 p-2.5 flex flex-col justify-between gap-2 shrink-0 z-20 overflow-y-auto"
        >
          {/* Top of Sidebar: Proof Tutorial Sequence & Selected Piece Controls */}
          <div className="space-y-2">
            {/* Interactive Proof Sequence Tutorial Guide (Positioned in sidebar so it never blocks the board!) */}
            <ProofTutorialOverlay
              levelId={level.id}
              activeStageIndex={activeStageIndex}
              stageCompleted={stageCompleted}
              onSelectStage={handleSwitchStage}
              hasStages={hasStages}
            />

            {/* Selected Piece Info & Rotation Controls */}
            <div
              className={`p-2.5 rounded-xl border transition-all ${
                selectedPiece
                  ? 'bg-slate-850 border-amber-400 shadow-md'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400'
              }`}
            >
              {selectedPiece ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-black text-white">{selectedPiece.name}</h4>
                      <span className="text-[10px] text-slate-400">{selectedPiece.dimensionsText}</span>
                    </div>
                    <span className="text-[11px] font-mono font-black text-amber-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
                      {selectedPiece.rotation}°
                    </span>
                  </div>

                  {/* Continuous Slider for smooth free rotation */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400">Putar:</span>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      step="1"
                      value={selectedPiece.rotation}
                      onChange={(e) => handleSetPieceRotation(selectedPiece.id, Number(e.target.value))}
                      className="flex-1 accent-amber-500 cursor-pointer h-1.5 bg-slate-800 rounded"
                    />
                  </div>

                  {/* Step Buttons */}
                  <div className="grid grid-cols-4 gap-1">
                    <button
                      onClick={() => handleAdjustPieceRotation(selectedPiece.id, -15)}
                      className="py-1 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 text-[10px] font-mono font-bold rounded border border-slate-700"
                    >
                      -15°
                    </button>
                    <button
                      onClick={() => handleAdjustPieceRotation(selectedPiece.id, 15)}
                      className="py-1 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 text-[10px] font-mono font-bold rounded border border-slate-700"
                    >
                      +15°
                    </button>
                    <button
                      onClick={() => handleSetPieceRotation(selectedPiece.id, 0)}
                      className="py-1 bg-slate-800 hover:bg-slate-700 active:scale-95 text-amber-300 text-[10px] font-bold rounded border border-amber-500/40"
                    >
                      0° Sejajar
                    </button>
                    <button
                      onClick={() => handleRotatePiece90(selectedPiece.id)}
                      className="py-1 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 text-[10px] font-black rounded border border-amber-300"
                    >
                      +90°
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-2 text-[11px] text-slate-400">
                  <span>Ketuk kepingan di arena untuk memutar & mengaturnya</span>
                </div>
              )}
            </div>

            {/* Validation Feedback Message */}
            {validationMessage && (
              <div
                className={`p-2 rounded-xl border text-[11px] font-medium leading-tight flex items-start gap-1.5 shadow ${
                  validationMessage.type === 'success'
                    ? 'bg-emerald-950/90 border-emerald-500 text-emerald-200'
                    : validationMessage.type === 'error'
                    ? 'bg-rose-950/90 border-rose-500 text-rose-200'
                    : 'bg-amber-950/90 border-amber-500 text-amber-200'
                }`}
              >
                <img
                  src={
                    validationMessage.type === 'success'
                      ? '/assets/icons/check.png'
                      : validationMessage.type === 'error'
                      ? '/assets/icons/retry.png'
                      : '/assets/icons/hint.png'
                  }
                  alt="Status"
                  className="w-4 h-4 object-contain flex-shrink-0 mt-0.5"
                />
                <div className="flex-1">{validationMessage.text}</div>
              </div>
            )}
          </div>

          {/* Bottom Actions Cluster (Primary Check Button + Supporting Tools) */}
          <div className="space-y-1.5 pt-1 border-t border-slate-800">
            {/* Primary Action Button: CHECK */}
            <TactileButton
              iconSrc="/assets/icons/check.png"
              iconAlt="Periksa Susunan"
              label="Periksa Susunan"
              variant="success"
              size="md"
              className="w-full text-sm py-2.5 shadow-md"
              onClick={handleCheckSolution}
            />

            {/* Compact Tool Row: Hint, Solution, Shuffle, Reset, Ruler */}
            <div className="grid grid-cols-5 gap-1">
              <TactileButton
                iconSrc="/assets/icons/hint.png"
                iconAlt="Petunjuk"
                label="Petunjuk"
                variant="neutral"
                size="sm"
                className="py-1 px-0.5 text-[10px]"
                onClick={handleHint}
              />
              <TactileButton
                iconSrc="/assets/icons/solution.png"
                iconAlt="Kunci"
                label="Kunci"
                variant="neutral"
                size="sm"
                className="py-1 px-0.5 text-[10px]"
                onClick={handleShowSolution}
              />
              <TactileButton
                iconSrc="/assets/icons/retry.png"
                iconAlt="Acak Puing"
                label="Acak"
                variant="secondary"
                size="sm"
                className="py-1 px-0.5 text-[10px]"
                onClick={handleShufflePieces}
              />
              <TactileButton
                iconSrc="/assets/icons/reset.png"
                iconAlt="Reset"
                label="Reset"
                variant="danger"
                size="sm"
                className="py-1 px-0.5 text-[10px]"
                onClick={resetToInitial}
              />
              <TactileButton
                iconSrc="/assets/icons/ruler.png"
                iconAlt="Ukur"
                label="Ukur"
                variant={isRulerActive ? 'primary' : 'neutral'}
                active={isRulerActive}
                size="sm"
                className="py-1 px-0.5 text-[10px]"
                onClick={() => setIsRulerActive((prev) => !prev)}
              />
            </div>

            {/* Next Level CTA if Completed */}
            {isCompleted && hasNextLevel && onNextLevel && (
              <TactileButton
                iconSrc="/assets/icons/next.png"
                iconAlt="Lanjut Level"
                label="Lanjut Level Berikutnya"
                variant="primary"
                size="sm"
                className="w-full py-2 animate-bounce"
                onClick={onNextLevel}
              />
            )}
          </div>
        </aside>
      </main>
    </div>
  );
};

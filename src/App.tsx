/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Screen, LevelProgress, GameSettings } from './types/game';
import { LEVELS } from './data/levels';
import { MainMenu } from './components/MainMenu';
import { LevelSelect } from './components/LevelSelect';
import { PuzzleBoard } from './components/PuzzleBoard';
import { LearnModal } from './components/LearnModal';
import { HelpModal } from './components/HelpModal';
import { SettingsModal } from './components/SettingsModal';
import { VictoryModal } from './components/VictoryModal';
import { OrientationLock } from './components/OrientationLock';
import { soundEngine } from './utils/audio';

const STORAGE_PROGRESS_KEY = 'pythagoras_adventure_progress_v1';
const STORAGE_SETTINGS_KEY = 'pythagoras_adventure_settings_v1';

const defaultSettings: GameSettings = {
  soundEnabled: true,
  showMathGrid: true,
  snapTolerance: 30,
};

const defaultProgress: Record<number, LevelProgress> = {
  1: { unlocked: true, completed: false, stars: 0, bestTime: 0 },
  2: { unlocked: false, completed: false, stars: 0, bestTime: 0 },
  3: { unlocked: false, completed: false, stars: 0, bestTime: 0 },
  4: { unlocked: false, completed: false, stars: 0, bestTime: 0 },
  5: { unlocked: false, completed: false, stars: 0, bestTime: 0 },
  6: { unlocked: true, completed: false, stars: 0, bestTime: 0 },
};

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('menu');
  const [currentLevelId, setCurrentLevelId] = useState<number>(1);
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [victoryData, setVictoryData] = useState<{ levelId: number; stars: number; timeSpent: number } | null>(null);
  const [isVirtualLandscape, setIsVirtualLandscape] = useState<boolean>(false);

  // Settings State
  const [settings, setSettings] = useState<GameSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_SETTINGS_KEY);
      return saved ? JSON.parse(saved) : defaultSettings;
    } catch {
      return defaultSettings;
    }
  });

  // Progress State
  const [progress, setProgress] = useState<Record<number, LevelProgress>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PROGRESS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...defaultProgress,
          ...parsed,
          // Guarantee level 1 and level 6 are unlocked so user can play new MoMath challenge directly
          1: { ...defaultProgress[1], ...parsed[1], unlocked: true },
          6: parsed[6] || defaultProgress[6],
        };
      }
      return defaultProgress;
    } catch {
      return defaultProgress;
    }
  });

  // Sync sound engine
  useEffect(() => {
    soundEngine.setEnabled(settings.soundEnabled);
  }, [settings.soundEnabled]);

  // Persist settings
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(settings));
    } catch {}
  }, [settings]);

  // Persist progress
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_PROGRESS_KEY, JSON.stringify(progress));
    } catch {}
  }, [progress]);

  const updateSettings = (updated: Partial<GameSettings>) => {
    setSettings((prev) => ({ ...prev, ...updated }));
  };

  const handleResetProgress = () => {
    setProgress(defaultProgress);
    try {
      localStorage.removeItem(STORAGE_PROGRESS_KEY);
    } catch {}
  };

  const handleLevelComplete = (levelId: number, stars: number, timeSpent: number) => {
    setProgress((prev) => {
      const current = prev[levelId] || { unlocked: true, completed: false, stars: 0, bestTime: 0 };
      const nextId = levelId + 1;
      const updated = {
        ...prev,
        [levelId]: {
          unlocked: true,
          completed: true,
          stars: Math.max(current.stars, stars),
          bestTime: current.bestTime > 0 ? Math.min(current.bestTime, timeSpent) : timeSpent,
        },
      };

      // Unlock next level if exists
      if (nextId <= LEVELS.length) {
        updated[nextId] = {
          ...(prev[nextId] || { unlocked: false, completed: false, stars: 0, bestTime: 0 }),
          unlocked: true,
        };
      }

      return updated;
    });

    setVictoryData({ levelId, stars, timeSpent });
  };

  const handleStartLevel = (levelId: number) => {
    setCurrentLevelId(levelId);
    setVictoryData(null);
    setCurrentScreen('game');
  };

  const handleNextLevel = () => {
    const nextId = currentLevelId + 1;
    if (nextId <= LEVELS.length) {
      setCurrentLevelId(nextId);
      setVictoryData(null);
    } else {
      setVictoryData(null);
      setCurrentScreen('level-select');
    }
  };

  const currentLevelData = LEVELS.find((l) => l.id === currentLevelId) || LEVELS[0];

  return (
    <div className={`w-full h-[100dvh] max-h-screen overflow-hidden bg-slate-950 font-sans select-none flex flex-col ${isVirtualLandscape ? 'force-virtual-landscape' : ''}`}>
      {/* Forced Landscape Warning & Orientation Controller (CSS Media Query Driven) */}
      <OrientationLock
        onToggleVirtualLandscape={(enabled) => setIsVirtualLandscape(enabled)}
        isVirtualLandscape={isVirtualLandscape}
      />

      {/* Active Screen */}
      {currentScreen === 'menu' && (
        <MainMenu
          onPlay={() => setCurrentScreen('level-select')}
          onLearn={() => setCurrentScreen('learn')}
          onHelp={() => setShowHelpModal(true)}
          onSettings={() => setShowSettingsModal(true)}
          progress={progress}
        />
      )}

      {currentScreen === 'level-select' && (
        <LevelSelect
          levels={LEVELS}
          progress={progress}
          onSelectLevel={handleStartLevel}
          onHome={() => setCurrentScreen('menu')}
        />
      )}

      {currentScreen === 'game' && (
        <PuzzleBoard
          level={currentLevelData}
          settings={settings}
          onUpdateSettings={updateSettings}
          onBack={() => setCurrentScreen('level-select')}
          onHome={() => setCurrentScreen('menu')}
          onOpenSettings={() => setShowSettingsModal(true)}
          onLevelComplete={handleLevelComplete}
          onNextLevel={handleNextLevel}
          hasNextLevel={currentLevelId < LEVELS.length}
        />
      )}

      {currentScreen === 'learn' && (
        <LearnModal onBack={() => setCurrentScreen('menu')} />
      )}

      {/* Global Modals */}
      {showHelpModal && <HelpModal onClose={() => setShowHelpModal(false)} />}

      {showSettingsModal && (
        <SettingsModal
          settings={settings}
          onUpdateSettings={updateSettings}
          onResetProgress={handleResetProgress}
          onClose={() => setShowSettingsModal(false)}
        />
      )}

      {victoryData && (
        <VictoryModal
          level={currentLevelData}
          stars={victoryData.stars}
          timeSpent={victoryData.timeSpent}
          onRetry={() => {
            setVictoryData(null);
          }}
          onNext={handleNextLevel}
          onHome={() => {
            setVictoryData(null);
            setCurrentScreen('menu');
          }}
          hasNextLevel={currentLevelId < LEVELS.length}
        />
      )}
    </div>
  );
}

import React from 'react';
import { GameSettings } from '../types/game';
import { TactileButton } from './TactileButton';
import { soundEngine } from '../utils/audio';

interface SettingsModalProps {
  settings: GameSettings;
  onUpdateSettings: (s: Partial<GameSettings>) => void;
  onResetProgress: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onResetProgress,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none">
      <div className="bg-slate-850 border-2 border-amber-500/60 rounded-3xl w-full max-w-md flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-900">
          <div className="flex items-center gap-2">
            <img src="/assets/icons/settings.png" alt="Pengaturan" className="w-7 h-7 object-contain" />
            <h3 className="text-lg font-black text-amber-400">PENGATURAN GAME</h3>
          </div>

          <TactileButton
            iconSrc="/assets/icons/close.png"
            iconAlt="Tutup"
            variant="neutral"
            size="icon-sm"
            onClick={onClose}
          />
        </div>

        {/* Settings Body */}
        <div className="p-6 space-y-6">
          {/* Sound Setting */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900 border border-slate-700">
            <div className="flex items-center gap-3">
              <img
                src={settings.soundEnabled ? '/assets/icons/sound_on.png' : '/assets/icons/sound_off.png'}
                alt="Suara"
                className="w-8 h-8 object-contain"
              />
              <div>
                <span className="text-sm font-bold block">Efek Suara Prosedural</span>
                <span className="text-xs text-slate-400">Audio feedback klik, putar, dan snap</span>
              </div>
            </div>

            <TactileButton
              label={settings.soundEnabled ? 'AKTIF' : 'MATI'}
              variant={settings.soundEnabled ? 'success' : 'danger'}
              size="sm"
              onClick={() => {
                const next = !settings.soundEnabled;
                soundEngine.setEnabled(next);
                onUpdateSettings({ soundEnabled: next });
              }}
            />
          </div>

          {/* Snap Magnetism Sensitivity */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-700 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold">Sensitivitas Magnet Snapping</span>
              <span className="text-xs font-mono font-bold text-amber-400">{settings.snapTolerance} px</span>
            </div>
            <p className="text-xs text-slate-400">
              Jarak toleransi kepingan menempel otomatis ke posisi target teorema.
            </p>
            <input
              type="range"
              min="16"
              max="48"
              step="4"
              value={settings.snapTolerance}
              onChange={(e) => onUpdateSettings({ snapTolerance: Number(e.target.value) })}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          {/* Reset Progress Section */}
          <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-900/60 space-y-3">
            <div>
              <span className="text-sm font-bold text-rose-300 block">Reset Progres Permainan</span>
              <span className="text-xs text-rose-400/80">
                Menghapus seluruh bintang dan mengunci kembali level 2–5.
              </span>
            </div>
            <TactileButton
              iconSrc="/assets/icons/reset.png"
              iconAlt="Reset Progres"
              label="Reset Seluruh Progres"
              variant="danger"
              size="sm"
              className="w-full"
              onClick={() => {
                if (window.confirm('Apakah Anda yakin ingin mengulang seluruh progres permainan?')) {
                  onResetProgress();
                  onClose();
                }
              }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700 bg-slate-900 flex justify-end">
          <TactileButton
            label="Simpan & Tutup"
            variant="primary"
            size="md"
            onClick={onClose}
          />
        </div>
      </div>
    </div>
  );
};

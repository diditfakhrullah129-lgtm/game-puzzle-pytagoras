import React from 'react';
import { TactileButton } from './TactileButton';

interface HelpModalProps {
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ onClose }) => {
  const iconGuides = [
    {
      category: 'Menu Utama & Navigasi',
      items: [
        { icon: '/assets/icons/play.png', name: 'Mulai Bermain', desc: 'Membuka level petualangan puzzle pembuktian Pythagoras.' },
        { icon: '/assets/icons/home.png', name: 'Menu Utama', desc: 'Kembali ke layar judul utama kapan saja.' },
        { icon: '/assets/icons/learn.png', name: 'Belajar Materi', desc: 'Ensiklopedia bentuk geometri dan simulasi interaktif Pythagoras.' },
        { icon: '/assets/icons/help.png', name: 'Petunjuk', desc: 'Membuka panduan cara bermain dan daftar fungsi ikon.' },
        { icon: '/assets/icons/settings.png', name: 'Pengaturan', desc: 'Mengatur suara SFX, sensitivitas magnet, dan reset progres.' },
        { icon: '/assets/icons/back.png', name: 'Kembali', desc: 'Kembali ke halaman sebelumnya.' },
      ],
    },
    {
      category: 'Tombol Aksi Permainan',
      items: [
        { icon: '/assets/icons/check.png', name: 'Periksa Jawaban', desc: 'Memvalidasi susunan kepingan geometri di dalam bingkai target secara matematis.' },
        { icon: '/assets/icons/hint.png', name: 'Petunjuk (Hint)', desc: 'Menampilkan garis bantu ghost dan tips penataan langkah berikutnya.' },
        { icon: '/assets/icons/solution.png', name: 'Kunci Jawaban', desc: 'Menampilkan susunan kepingan yang telah terbukti benar.' },
        { icon: '/assets/icons/reset.png', name: 'Reset Puzzle', desc: 'Mengembalikan seluruh kepingan geometri ke posisi awal di luar bingkai.' },
        { icon: '/assets/icons/retry.png', name: 'Ulangi / Putar', desc: 'Memutar kepingan 90 derajat atau mengulang tantangan level.' },
        { icon: '/assets/icons/next.png', name: 'Lanjut Level', desc: 'Melanjutkan petualangan ke level tantangan berikutnya saat menang.' },
      ],
    },
    {
      category: 'Alat Pengukuran & Bantuan',
      items: [
        { icon: '/assets/icons/ruler.png', name: 'Penggaris Interaktif', desc: 'Mistar ukur digital untuk mengukur panjang sisi (cm) dan sudut kemiringan.' },
        { icon: '/assets/icons/area.png', name: 'Informasi Luas', desc: 'Menampilkan/menyembunyikan label luas (cm²) dan dimensi matematika setiap bentuk.' },
        { icon: '/assets/icons/drag_hand.png', name: 'Petunjuk Geser', desc: 'Indikator interaktif: klik & tarik kepingan dengan mouse atau sentuhan jari.' },
        { icon: '/assets/icons/sound_on.png', name: 'Suara Aktif / Nonaktif', desc: 'Menghidupkan atau mematikan efek suara synth prosedural permainan.' },
        { icon: '/assets/icons/trophy.png', name: 'Piala & Bintang', desc: 'Penghargaan atas penyelesaian level berdasarkan kecepatan dan efisiensi.' },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none">
      <div className="bg-slate-850 border-2 border-amber-500/60 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-slate-700 bg-slate-900">
          <div className="flex items-center gap-3">
            <img src="/assets/icons/help.png" alt="Petunjuk" className="w-8 h-8 object-contain" />
            <h3 className="text-xl font-black text-amber-400">PANDUAN & DAFTAR FUNGSI IKON</h3>
          </div>

          <TactileButton
            iconSrc="/assets/icons/close.png"
            iconAlt="Tutup"
            variant="neutral"
            size="icon-sm"
            onClick={onClose}
          />
        </div>

        {/* Content body */}
        <div className="p-4 md:p-6 overflow-y-auto space-y-6 text-slate-200">
          {/* Quick rules banner */}
          <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-700 flex items-center gap-4">
            <img src="/assets/icons/drag_hand.png" alt="Drag" className="w-10 h-10 object-contain flex-shrink-0" />
            <div className="text-xs space-y-1">
              <span className="font-bold text-amber-300 block text-sm">Cara Bermain Pythagoras Adventure:</span>
              <p className="text-slate-300 leading-relaxed">
                1. Tarik kepingan geometri ke dalam bingkai target di tengah.<br />
                2. Klik tombol <strong>Putar</strong> untuk merotasi bentuk yang dipilih.<br />
                3. Manfaatkan fitur <strong>Penggaris</strong> dan <strong>Info Luas</strong> untuk menghitung ukuran.<br />
                4. Klik <strong>Periksa Jawaban</strong> untuk memvalidasi pembuktian teorema secara matematis!
              </p>
            </div>
          </div>

          {/* Grouped Icon Reference Cards */}
          {iconGuides.map((group, gIdx) => (
            <div key={gIdx} className="space-y-3">
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                {group.category}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {group.items.map((item, iIdx) => (
                  <div
                    key={iIdx}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-slate-900/80 border border-slate-700/60"
                  >
                    <img
                      src={item.icon}
                      alt={item.name}
                      className="w-10 h-10 object-contain flex-shrink-0 p-1 bg-slate-950 rounded-xl border border-slate-800"
                    />
                    <div className="min-w-0">
                      <span className="text-xs font-black text-white block">{item.name}</span>
                      <span className="text-[11px] text-slate-400 block leading-tight">{item.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700 bg-slate-900 flex justify-end">
          <TactileButton
            label="Mengerti & Lanjutkan"
            variant="primary"
            size="md"
            onClick={onClose}
          />
        </div>
      </div>
    </div>
  );
};

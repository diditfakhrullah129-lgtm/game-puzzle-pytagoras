import React from 'react';
import { soundEngine } from '../utils/audio';

export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'purple' | 'neutral' | 'accent';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon-sm' | 'icon-md' | 'icon-lg';

interface TactileButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  iconSrc?: string;
  iconAlt?: string;
  label?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  active?: boolean;
  soundType?: 'click' | 'rotate' | 'hint' | 'snap' | 'error';
  badge?: React.ReactNode;
}

export const TactileButton: React.FC<TactileButtonProps> = ({
  iconSrc,
  iconAlt = 'icon',
  label,
  variant = 'primary',
  size = 'md',
  active = false,
  soundType = 'click',
  badge,
  className = '',
  onClick,
  children,
  disabled,
  ...props
}) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (soundType === 'click') soundEngine.click();
    else if (soundType === 'rotate') soundEngine.rotate();
    else if (soundType === 'hint') soundEngine.hint();
    else if (soundType === 'snap') soundEngine.snap();
    else if (soundType === 'error') soundEngine.error();

    if (onClick) onClick(e);
  };

  const getVariantStyles = (): string => {
    if (disabled) {
      return 'bg-slate-300 text-slate-500 border-slate-400 shadow-[0_3px_0_#94a3b8] cursor-not-allowed opacity-60';
    }

    if (active) {
      return 'bg-gradient-to-b from-amber-400 to-amber-500 text-amber-950 border-amber-600 shadow-[0_2px_0_#b45309] translate-y-1 ring-2 ring-amber-300';
    }

    switch (variant) {
      case 'primary': // Golden Amber (3D CGI Gold)
        return 'bg-gradient-to-b from-amber-300 via-amber-400 to-amber-500 text-amber-950 border-amber-600 shadow-[0_5px_0_#b45309] hover:brightness-105 active:translate-y-1 active:shadow-[0_1px_0_#b45309]';
      case 'secondary': // Blue Royal
        return 'bg-gradient-to-b from-sky-400 via-blue-500 to-blue-600 text-white border-blue-700 shadow-[0_5px_0_#1d4ed8] hover:brightness-105 active:translate-y-1 active:shadow-[0_1px_0_#1d4ed8]';
      case 'success': // Emerald Green
        return 'bg-gradient-to-b from-emerald-400 via-emerald-500 to-emerald-600 text-white border-emerald-700 shadow-[0_5px_0_#047857] hover:brightness-105 active:translate-y-1 active:shadow-[0_1px_0_#047857]';
      case 'danger': // Ruby Red
        return 'bg-gradient-to-b from-rose-400 via-rose-500 to-rose-600 text-white border-rose-700 shadow-[0_5px_0_#be123c] hover:brightness-105 active:translate-y-1 active:shadow-[0_1px_0_#be123c]';
      case 'purple': // Royal Violet
        return 'bg-gradient-to-b from-indigo-400 via-purple-500 to-purple-600 text-white border-purple-700 shadow-[0_5px_0_#6d28d9] hover:brightness-105 active:translate-y-1 active:shadow-[0_1px_0_#6d28d9]';
      case 'accent': // Teal Cyan
        return 'bg-gradient-to-b from-cyan-300 via-teal-400 to-teal-500 text-teal-950 border-teal-700 shadow-[0_5px_0_#0f766e] hover:brightness-105 active:translate-y-1 active:shadow-[0_1px_0_#0f766e]';
      case 'neutral': // Slate / Steel
      default:
        return 'bg-gradient-to-b from-slate-100 via-slate-200 to-slate-300 text-slate-800 border-slate-400 shadow-[0_5px_0_#64748b] hover:brightness-105 active:translate-y-1 active:shadow-[0_1px_0_#64748b]';
    }
  };

  const getSizeStyles = (): { container: string; icon: string; text: string } => {
    switch (size) {
      case 'icon-sm':
        return { container: 'p-2 w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl', icon: 'w-5 h-5', text: 'text-xs' };
      case 'icon-md':
        return { container: 'p-2.5 w-12 h-12 min-w-[48px] min-h-[48px] rounded-2xl', icon: 'w-6 h-6', text: 'text-sm' };
      case 'icon-lg':
        return { container: 'p-3 w-14 h-14 min-w-[56px] min-h-[56px] rounded-2xl', icon: 'w-8 h-8', text: 'text-base' };
      case 'sm':
        return { container: 'px-3.5 py-2.5 min-h-[42px] rounded-xl gap-2 text-xs font-bold', icon: 'w-4 h-4', text: 'text-xs' };
      case 'lg':
        return { container: 'px-6 py-3.5 min-h-[54px] rounded-2xl gap-3 text-lg font-extrabold tracking-wide', icon: 'w-7 h-7', text: 'text-lg' };
      case 'md':
      default:
        return { container: 'px-4 py-2.5 min-h-[46px] rounded-xl gap-2 text-sm font-bold', icon: 'w-5 h-5', text: 'text-sm' };
    }
  };

  const { container, icon, text } = getSizeStyles();

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={handleClick}
      className={`relative inline-flex items-center justify-center border-2 select-none transition-all duration-100 cursor-pointer ${container} ${getVariantStyles()} ${className}`}
      {...props}
    >
      {/* Glossy top bevel highlight */}
      <span className="absolute inset-x-1.5 top-0.5 h-1/3 rounded-t-lg bg-gradient-to-b from-white/40 to-transparent pointer-events-none" />

      {iconSrc && (
        <img
          src={iconSrc}
          alt={iconAlt}
          className={`${icon} object-contain filter drop-shadow-[0_2px_3px_rgba(0,0,0,0.25)] flex-shrink-0 transition-transform hover:scale-105`}
          onError={(e) => {
            // fallback to invisible if asset path issues
            (e.target as HTMLElement).style.opacity = '0.5';
          }}
        />
      )}

      {label && <span className={`${text} leading-none drop-shadow-sm`}>{label}</span>}
      {children}

      {badge && (
        <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white font-black text-[10px] px-1.5 py-0.5 rounded-full shadow-md border border-white">
          {badge}
        </span>
      )}
    </button>
  );
};

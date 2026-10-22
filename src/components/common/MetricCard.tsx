import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

export interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  previousValue?: string | number;
  changePct?: number;
  changeText?: string;
  trend?: 'up' | 'down' | 'neutral';
  isGoodWhenUp?: boolean;
  subtext?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  unit,
  changePct,
  changeText,
  trend,
  isGoodWhenUp = true,
  subtext,
  icon,
  onClick,
  className = '',
}) => {
  const isPositive = trend === 'up';
  const isNegative = trend === 'down';
  const isGood = (isPositive && isGoodWhenUp) || (isNegative && !isGoodWhenUp);

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden bg-white/80 backdrop-blur-md border border-white/80 rounded-2xl p-4.5 shadow-[0_4px_20px_-2px_rgba(27,67,50,0.05),inset_0_1px_1px_rgba(255,255,255,0.9)] transition-all duration-300 flex flex-col justify-between group ${
        onClick ? 'cursor-pointer hover:border-[#52b788]/60 hover:shadow-[0_16px_36px_-6px_rgba(27,67,50,0.12),inset_0_1px_2px_rgba(255,255,255,1)] hover:-translate-y-1 active:scale-[0.99]' : ''
      } ${className}`}
    >
      {/* Subtle specular glass highlight gradient on card top */}
      <div className="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-white/60 to-transparent pointer-events-none rounded-t-2xl" />

      <div className="flex items-center justify-between text-xs text-stone-500 mb-2.5 font-medium relative z-10">
        <span className="truncate tracking-wide font-medium text-stone-700">{label}</span>
        {icon && (
          <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#f0f7f2] via-[#e4f1e8] to-[#c8e4d2]/40 text-[#1b4332] border border-white/80 shadow-[inset_0_2px_4px_rgba(255,255,255,0.8),0_4px_10px_-2px_rgba(27,67,50,0.08)] flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-2">
            {icon}
          </span>
        )}
      </div>


      <div className="flex items-baseline gap-1.5 mb-2.5">
        <span className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0f2319] font-mono tabular-nums">
          {value}
        </span>
        {unit && <span className="text-xs text-stone-400 font-sans font-medium">{unit}</span>}
      </div>

      <div className="flex items-center justify-between gap-1.5 text-[11px] pt-2 border-t border-[#f4f1ea]">
        {trend && (
          <span
            className={`inline-flex items-center gap-0.5 font-mono tabular-nums font-semibold px-2 py-0.5 rounded-full text-[10px] ${
              isGood
                ? 'text-[#1b4332] bg-[#eef6f0] border border-[#cbe5d4]'
                : trend === 'neutral'
                ? 'text-stone-600 bg-stone-100 border border-stone-200'
                : 'text-rose-800 bg-rose-50 border border-rose-200'
            }`}
          >
            {isPositive && <ArrowUpRight className="w-3 h-3 shrink-0" />}
            {isNegative && <ArrowDownRight className="w-3 h-3 shrink-0" />}
            {trend === 'neutral' && <Minus className="w-3 h-3 shrink-0" />}
            {changePct !== undefined ? `${Math.abs(changePct)}%` : ''}
          </span>
        )}

        {(changeText || subtext) && (
          <span className="text-stone-400 truncate text-[11px] ml-auto">
            {changeText || subtext}
          </span>
        )}
      </div>
    </div>
  );
};

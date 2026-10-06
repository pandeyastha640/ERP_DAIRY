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
      className={`bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs transition-all duration-150 flex flex-col justify-between ${
        onClick ? 'cursor-pointer hover:border-emerald-600/40 hover:shadow-sm' : ''
      } ${className}`}
    >
      <div className="flex items-center justify-between text-xs text-slate-500 mb-2 font-medium">
        <span className="truncate">{label}</span>
        {icon && <span className="text-slate-400 shrink-0 ml-1">{icon}</span>}
      </div>

      <div className="flex items-baseline gap-1.5 mb-2">
        <span className="text-2xl font-bold tracking-tight text-slate-900 font-mono tabular-nums">
          {value}
        </span>
        {unit && <span className="text-xs text-slate-500 font-sans font-medium">{unit}</span>}
      </div>

      <div className="flex items-center justify-between gap-1 text-[11px] pt-1 border-t border-slate-100">
        {trend && (
          <span
            className={`inline-flex items-center gap-0.5 font-mono tabular-nums font-semibold px-1.5 py-0.5 rounded text-[10px] ${
              isGood
                ? 'text-emerald-700 bg-emerald-50 border border-emerald-100'
                : trend === 'neutral'
                ? 'text-slate-600 bg-slate-100 border border-slate-200'
                : 'text-rose-700 bg-rose-50 border border-rose-100'
            }`}
          >
            {isPositive && <ArrowUpRight className="w-3 h-3 shrink-0" />}
            {isNegative && <ArrowDownRight className="w-3 h-3 shrink-0" />}
            {trend === 'neutral' && <Minus className="w-3 h-3 shrink-0" />}
            {changePct !== undefined ? `${Math.abs(changePct)}%` : ''}
          </span>
        )}

        {(changeText || subtext) && (
          <span className="text-slate-500 truncate text-[11px] ml-auto">
            {changeText || subtext}
          </span>
        )}
      </div>
    </div>
  );
};

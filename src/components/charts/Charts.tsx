import React, { useState } from 'react';

// ==========================================
// 1. AREA TREND CHART
// ==========================================

export interface AreaPoint {
  label: string;
  value: number;
  secondaryValue?: number;
}

export interface AreaTrendChartProps {
  data: AreaPoint[];
  height?: number;
  primaryColor?: string;
  secondaryColor?: string;
  primaryLabel?: string;
  secondaryLabel?: string;
  unit?: string;
}

export const AreaTrendChart: React.FC<AreaTrendChartProps> = ({
  data,
  height = 180,
  primaryColor = '#1b4332', // Deep forest green
  secondaryColor = '#52b788', // Soft sage green
  primaryLabel = 'Value',
  secondaryLabel,
  unit = 'L',
}) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="h-40 flex items-center justify-center text-xs text-stone-400 font-medium">
        No trend data available
      </div>
    );
  }

  const width = 600;
  const paddingX = 40;
  const paddingY = 24;

  const allValues = data.flatMap((d) => [
    d.value,
    ...(d.secondaryValue !== undefined ? [d.secondaryValue] : []),
  ]);
  const maxValue = Math.max(...allValues, 1) * 1.15;
  const minValue = Math.min(0, Math.min(...allValues));

  const getX = (index: number) => paddingX + (index / (data.length - 1)) * (width - paddingX * 2);
  const getY = (val: number) =>
    height - paddingY - ((val - minValue) / (maxValue - minValue)) * (height - paddingY * 2);

  const primaryPoints = data.map((d, i) => `${getX(i)},${getY(d.value)}`).join(' ');
  const primaryArea = `${getX(0)},${height - paddingY} ${primaryPoints} ${getX(
    data.length - 1
  )},${height - paddingY}`;

  const secondaryPoints =
    secondaryLabel && data[0].secondaryValue !== undefined
      ? data.map((d, i) => `${getX(i)},${getY(d.secondaryValue || 0)}`).join(' ')
      : '';

  return (
    <div className="relative w-full overflow-hidden select-none">
      <div className="flex items-center justify-between text-xs text-stone-500 mb-3 px-1">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full ring-2 ring-forest-500/20" style={{ backgroundColor: primaryColor }} />
            <span className="font-semibold text-stone-800">{primaryLabel}</span>
          </span>
          {secondaryLabel && (
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full ring-2 ring-sage-500/20" style={{ backgroundColor: secondaryColor }} />
              <span className="font-semibold text-stone-800">{secondaryLabel}</span>
            </span>
          )}
        </div>
        {hoverIndex !== null && (
          <div className="text-xs font-mono tabular-nums text-stone-800 bg-[#fdfcfb] border border-[#ede8df] px-2.5 py-1 rounded-xl shadow-xs animate-in fade-in">
            <span className="text-stone-500 mr-1.5 font-sans font-medium">{data[hoverIndex].label}:</span>
            <span style={{ color: primaryColor }} className="font-bold">
              {data[hoverIndex].value.toLocaleString()} {unit}
            </span>
            {secondaryLabel && data[hoverIndex].secondaryValue !== undefined && (
              <span style={{ color: secondaryColor }} className="font-bold ml-2">
                / {data[hoverIndex].secondaryValue?.toLocaleString()} {unit}
              </span>
            )}
          </div>
        )}
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto overflow-visible cursor-crosshair"
        onMouseLeave={() => setHoverIndex(null)}
      >
        <defs>
          <linearGradient id="areaGradientPrimary" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={primaryColor} stopOpacity="0.22" />
            <stop offset="100%" stopColor={primaryColor} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Horizontal gridlines */}
        {[0, 0.33, 0.66, 1].map((pct, i) => {
          const y = paddingY + pct * (height - paddingY * 2);
          const gridVal = Math.round(maxValue - pct * (maxValue - minValue));
          return (
            <g key={i}>
              <line
                x1={paddingX}
                y1={y}
                x2={width - paddingX}
                y2={y}
                stroke="#ede8df"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
              <text
                x={paddingX - 8}
                y={y + 3.5}
                fill="#a8a29e"
                fontSize="10"
                textAnchor="end"
                fontFamily="var(--font-mono)"
                fontWeight="500"
              >
                {gridVal >= 1000 ? `${(gridVal / 1000).toFixed(1)}k` : gridVal}
              </text>
            </g>
          );
        })}

        {/* Primary Area & Line */}
        <polygon points={primaryArea} fill="url(#areaGradientPrimary)" />
        <polyline
          fill="none"
          stroke={primaryColor}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={primaryPoints}
        />

        {/* Secondary Line if present */}
        {secondaryPoints && (
          <polyline
            fill="none"
            stroke={secondaryColor}
            strokeWidth="2"
            strokeDasharray="4 4"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={secondaryPoints}
          />
        )}

        {/* X Axis Labels */}
        {data.map((d, i) => (
          <text
            key={i}
            x={getX(i)}
            y={height - 6}
            fill="#64748b"
            fontSize="10"
            textAnchor="middle"
            fontFamily="var(--font-sans)"
          >
            {d.label}
          </text>
        ))}

        {/* Hover interaction points */}
        {data.map((d, i) => (
          <g key={i} className="group" onMouseEnter={() => setHoverIndex(i)}>
            <rect
              x={getX(i) - width / data.length / 2}
              y={0}
              width={width / data.length}
              height={height}
              fill="transparent"
            />
            {hoverIndex === i && (
              <>
                <line
                  x1={getX(i)}
                  y1={paddingY}
                  x2={getX(i)}
                  y2={height - paddingY}
                  stroke="#94a3b8"
                  strokeWidth="1"
                  strokeDasharray="2 2"
                />
                <circle
                  cx={getX(i)}
                  cy={getY(d.value)}
                  r="4.5"
                  fill="#ffffff"
                  stroke={primaryColor}
                  strokeWidth="2.5"
                />
              </>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
};

// ==========================================
// 2. BAR COMPARISON CHART
// ==========================================

export interface BarComparisonItem {
  label: string;
  valueA: number;
  valueB: number;
}

export interface BarComparisonChartProps {
  data: BarComparisonItem[];
  labelA: string;
  labelB: string;
  colorA?: string;
  colorB?: string;
  unit?: string;
  height?: number;
}

export const BarComparisonChart: React.FC<BarComparisonChartProps> = ({
  data,
  labelA,
  labelB,
  colorA = '#1b4332', // Forest green
  colorB = '#52b788', // Soft sage green
  unit = 'L',
  height = 190,
}) => {
  const maxVal = Math.max(...data.flatMap((d) => [d.valueA, d.valueB]), 10) * 1.15;
  const width = 600;
  const paddingX = 45;
  const paddingY = 25;
  const plotWidth = width - paddingX * 2;
  const plotHeight = height - paddingY * 2;
  const groupWidth = plotWidth / data.length;
  const barWidth = Math.min(22, (groupWidth - 14) / 2);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-xs text-stone-500 mb-3 px-1">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full ring-2 ring-forest-500/20" style={{ backgroundColor: colorA }} />
            <span className="font-semibold text-stone-800">{labelA}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full ring-2 ring-sage-500/20" style={{ backgroundColor: colorB }} />
            <span className="font-semibold text-stone-800">{labelB}</span>
          </span>
        </div>
        <span className="text-xs font-mono text-stone-400 bg-cream-100 px-2 py-0.5 rounded-md border border-[#ede8df]">
          Unit: {unit}
        </span>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
        {/* Horizontal gridlines */}
        {[0, 0.5, 1].map((pct, i) => {
          const y = paddingY + pct * plotHeight;
          const val = Math.round(maxVal - pct * maxVal);
          return (
            <g key={i}>
              <line
                x1={paddingX}
                y1={y}
                x2={width - paddingX}
                y2={y}
                stroke="#ede8df"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
              <text
                x={paddingX - 8}
                y={y + 3.5}
                fill="#a8a29e"
                fontSize="10"
                textAnchor="end"
                fontFamily="var(--font-mono)"
                fontWeight="500"
              >
                {val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}
              </text>
            </g>
          );
        })}

        {/* Bars */}
        {data.map((d, i) => {
          const groupCenter = paddingX + i * groupWidth + groupWidth / 2;
          const heightA = (d.valueA / maxVal) * plotHeight;
          const heightB = (d.valueB / maxVal) * plotHeight;
          const yA = height - paddingY - heightA;
          const yB = height - paddingY - heightB;

          return (
            <g key={i} className="group">
              {/* Bar A */}
              <rect
                x={groupCenter - barWidth - 2}
                y={yA}
                width={barWidth}
                height={heightA}
                fill={colorA}
                rx="3"
                className="transition-all duration-200 hover:opacity-85 hover:brightness-110 cursor-pointer"
              >
                <title>{`${d.label} - ${labelA}: ${d.valueA.toLocaleString()} ${unit}`}</title>
              </rect>
              {/* Bar B */}
              <rect
                x={groupCenter + 2}
                y={yB}
                width={barWidth}
                height={heightB}
                fill={colorB}
                rx="3"
                className="transition-all duration-200 hover:opacity-85 hover:brightness-110 cursor-pointer"
              >
                <title>{`${d.label} - ${labelB}: ${d.valueB.toLocaleString()} ${unit}`}</title>
              </rect>

              {/* Label */}
              <text
                x={groupCenter}
                y={height - 6}
                fill="#78716c"
                fontSize="10"
                textAnchor="middle"
                fontFamily="var(--font-sans)"
                fontWeight="500"
              >
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

// ==========================================
// 3. DONUT BREAKDOWN CHART
// ==========================================

export interface DonutSlice {
  label: string;
  value: number;
  color: string;
}

export interface DonutChartProps {
  slices: DonutSlice[];
  size?: number;
  centerLabel?: string;
  centerValue?: string;
}

export const DonutChart: React.FC<DonutChartProps> = ({
  slices,
  size = 160,
  centerLabel,
  centerValue,
}) => {
  const total = slices.reduce((acc, s) => acc + s.value, 0) || 1;
  const radius = 60;
  const strokeWidth = 22;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6 justify-center">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full -rotate-90">
          {slices.map((slice, i) => {
            const percent = slice.value / total;
            const strokeDasharray = `${percent * circumference} ${circumference}`;
            const strokeDashoffset = -accumulatedPercent * circumference;
            accumulatedPercent += percent;

            return (
              <circle
                key={i}
                cx={center}
                cy={center}
                r={radius}
                fill="transparent"
                stroke={slice.color}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-300 hover:opacity-80 cursor-pointer"
              />
            );
          })}
        </svg>

        {(centerLabel || centerValue) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
            {centerValue && (
              <span className="text-base font-bold text-forest-950 font-mono tabular-nums">
                {centerValue}
              </span>
            )}
            {centerLabel && (
              <span className="text-[11px] text-stone-500 max-w-[80px] leading-tight mt-0.5 font-medium">
                {centerLabel}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-2 text-xs w-full max-w-xs">
        {slices.map((slice, i) => {
          const pct = ((slice.value / total) * 100).toFixed(1);
          return (
            <div key={i} className="flex items-center justify-between gap-3 text-stone-700 bg-[#fdfcfb] px-2.5 py-1.5 rounded-lg border border-[#ede8df]/70">
              <div className="flex items-center gap-2 truncate">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0 ring-2 ring-stone-200"
                  style={{ backgroundColor: slice.color }}
                />
                <span className="truncate text-xs font-semibold text-stone-800">{slice.label}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0 font-mono tabular-nums text-right">
                <span className="text-stone-400 text-[11px]">{pct}%</span>
                <span className="font-bold text-forest-900">
                  ₹{slice.value >= 1000 ? `${(slice.value / 1000).toFixed(1)}k` : slice.value}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ==========================================
// 4. MINI SPARKLINE FOR TABLES
// ==========================================

export const MiniSparkline: React.FC<{
  points: number[];
  color?: string;
  width?: number;
  height?: number;
}> = ({ points, color = '#1b4332', width = 70, height = 20 }) => {
  if (!points || points.length < 2) return <span className="text-xs text-stone-400 font-mono">-</span>;

  const min = Math.min(...points);
  const max = Math.max(...points) || 1;
  const range = max - min || 1;

  const path = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * (width - 4) + 2;
      const y = height - 2 - ((p - min) / range) * (height - 4);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={path}
      />
    </svg>
  );
};

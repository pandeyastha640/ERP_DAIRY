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
  is3D?: boolean;
}

export const AreaTrendChart: React.FC<AreaTrendChartProps> = ({
  data,
  height = 190,
  primaryColor = '#10b981', // Vibrant emerald
  secondaryColor = '#f59e0b', // Glowing amber
  primaryLabel = 'Value',
  secondaryLabel,
  unit = 'L',
  is3D = true,
}) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const chartId = React.useId ? React.useId().replace(/:/g, '') : 'area3d';

  if (!data || data.length === 0) {
    return (
      <div className="h-40 flex items-center justify-center text-xs text-stone-400 font-medium">
        No trend data available
      </div>
    );
  }

  const width = 600;
  const paddingX = 40;
  const paddingY = 26;

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
  const primaryRibbonPoints = data
    .map((d, i) => `${getX(i)},${getY(d.value) + 2.5}`)
    .join(' ');
  const primaryArea = `${getX(0)},${height - paddingY} ${primaryPoints} ${getX(
    data.length - 1
  )},${height - paddingY}`;

  const hasSecondary = secondaryLabel && data[0]?.secondaryValue !== undefined;
  const secondaryPoints = hasSecondary
    ? data.map((d, i) => `${getX(i)},${getY(d.secondaryValue || 0)}`).join(' ')
    : '';
  const secondaryRibbonPoints = hasSecondary
    ? data.map((d, i) => `${getX(i)},${getY(d.secondaryValue || 0) + 2.5}`).join(' ')
    : '';

  return (
    <div className="relative w-full overflow-hidden select-none">
      {/* Chart Legend & Live Tooltip */}
      <div className="flex items-center justify-between text-xs text-stone-600 mb-3 px-1">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 font-medium">
            <span
              className="w-3 h-3 rounded-full shadow-xs ring-2 ring-emerald-500/20"
              style={{
                background: is3D
                  ? 'radial-gradient(circle at 35% 35%, #6ee7b7, #10b981 60%, #047857 100%)'
                  : primaryColor,
              }}
            />
            <span className="font-semibold text-stone-800">{primaryLabel}</span>
          </span>
          {hasSecondary && (
            <span className="flex items-center gap-1.5 font-medium">
              <span
                className="w-3 h-3 rounded-full shadow-xs ring-2 ring-amber-500/20"
                style={{
                  background: is3D
                    ? 'radial-gradient(circle at 35% 35%, #fde68a, #f59e0b 60%, #b45309 100%)'
                    : secondaryColor,
                }}
              />
              <span className="font-semibold text-stone-800">{secondaryLabel}</span>
            </span>
          )}
        </div>

        {hoverIndex !== null && (
          <div className="text-xs font-mono tabular-nums text-stone-800 bg-[#fdfcfb] border border-[#ede8df] px-3 py-1 rounded-xl shadow-xs flex items-center gap-2">
            <span className="text-stone-500 font-sans font-semibold">
              {data[hoverIndex].label}:
            </span>
            <span className="text-emerald-700 font-bold">
              {data[hoverIndex].value.toLocaleString()} {unit}
            </span>
            {hasSecondary && (
              <>
                <span className="text-stone-300">|</span>
                <span className="text-amber-700 font-bold">
                  {data[hoverIndex].secondaryValue?.toLocaleString()} {unit}
                </span>
              </>
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
          {/* Volumetric 3D Area Gradient */}
          <linearGradient id={`area3DGrad_${chartId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.38" />
            <stop offset="50%" stopColor="#059669" stopOpacity="0.14" />
            <stop offset="100%" stopColor="#047857" stopOpacity="0.0" />
          </linearGradient>

          {/* Glowing Line Stroke Gradient */}
          <linearGradient id={`line3DGrad_${chartId}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#059669" />
            <stop offset="50%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#34d399" />
          </linearGradient>

          <linearGradient id={`line3DAmberGrad_${chartId}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#d97706" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#fbbf24" />
          </linearGradient>

          {/* 3D Glow Filter */}
          <filter id={`neonGlow_${chartId}`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2.5" stdDeviation="3.5" floodColor="#10b981" floodOpacity="0.3" />
          </filter>

          <filter id={`amberGlow_${chartId}`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2.5" stdDeviation="3" floodColor="#f59e0b" floodOpacity="0.3" />
          </filter>

          {/* 3D Spherical Node Radial Gradient */}
          <radialGradient id={`nodeSpherePrimary_${chartId}`} cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="35%" stopColor="#34d399" />
            <stop offset="70%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#047857" />
          </radialGradient>

          <radialGradient id={`nodeSphereSecondary_${chartId}`} cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="35%" stopColor="#fde68a" />
            <stop offset="70%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#b45309" />
          </radialGradient>
        </defs>

        {/* 3D Isometric Floor Gridlines */}
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
                strokeDasharray={pct === 1 ? 'none' : '4 4'}
                strokeWidth={pct === 1 ? '1.5' : '1'}
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

        {/* 3D Volumetric Area Fill */}
        <polygon points={primaryArea} fill={`url(#area3DGrad_${chartId})`} />

        {/* 3D Ribbon Shadow Extrusion (Primary) */}
        {is3D && (
          <polyline
            fill="none"
            stroke="#064e3b"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.35"
            points={primaryRibbonPoints}
          />
        )}

        {/* Glowing Primary Line */}
        <polyline
          fill="none"
          stroke={`url(#line3DGrad_${chartId})`}
          strokeWidth={is3D ? '3' : '2.5'}
          strokeLinecap="round"
          strokeLinejoin="round"
          filter={is3D ? `url(#neonGlow_${chartId})` : undefined}
          points={primaryPoints}
        />

        {/* Secondary Ribbon & Line (if present) */}
        {hasSecondary && (
          <>
            {is3D && (
              <polyline
                fill="none"
                stroke="#78350f"
                strokeWidth="3"
                strokeDasharray="4 4"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.3"
                points={secondaryRibbonPoints}
              />
            )}
            <polyline
              fill="none"
              stroke={`url(#line3DAmberGrad_${chartId})`}
              strokeWidth="2.5"
              strokeDasharray="4 4"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter={is3D ? `url(#amberGlow_${chartId})` : undefined}
              points={secondaryPoints}
            />
          </>
        )}

        {/* X Axis Labels */}
        {data.map((d, i) => (
          <text
            key={i}
            x={getX(i)}
            y={height - 6}
            fill="#78716c"
            fontSize="10"
            textAnchor="middle"
            fontFamily="var(--font-sans)"
            fontWeight="500"
          >
            {d.label}
          </text>
        ))}

        {/* Hover interaction points & 3D Spherical Nodes */}
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
                {/* Luminous Light Beam */}
                <line
                  x1={getX(i)}
                  y1={paddingY}
                  x2={getX(i)}
                  y2={height - paddingY}
                  stroke="#10b981"
                  strokeWidth="1.5"
                  strokeDasharray="2 2"
                  opacity="0.7"
                />
                {/* 3D Primary Spherical Node */}
                <circle
                  cx={getX(i)}
                  cy={getY(d.value)}
                  r="6.5"
                  fill={`url(#nodeSpherePrimary_${chartId})`}
                  stroke="#ffffff"
                  strokeWidth="2"
                  className="filter drop-shadow"
                />
                {/* 3D Secondary Spherical Node */}
                {hasSecondary && d.secondaryValue !== undefined && (
                  <circle
                    cx={getX(i)}
                    cy={getY(d.secondaryValue)}
                    r="5.5"
                    fill={`url(#nodeSphereSecondary_${chartId})`}
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    className="filter drop-shadow"
                  />
                )}
              </>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
};

// ==========================================
// 2. 3D VOLUMETRIC ISOMETRIC BAR COMPARISON CHART
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
  is3D?: boolean;
}

export const BarComparisonChart: React.FC<BarComparisonChartProps> = ({
  data,
  labelA,
  labelB,
  colorA = '#10b981', // Radiant emerald
  colorB = '#f59e0b', // Radiant amber/gold
  unit = 'L',
  height = 195,
  is3D = true,
}) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const chartId = React.useId ? React.useId().replace(/:/g, '') : 'bar3d';

  const maxVal = Math.max(...data.flatMap((d) => [d.valueA, d.valueB]), 10) * 1.15;
  const width = 600;
  const paddingX = 45;
  const paddingY = 28;
  const plotWidth = width - paddingX * 2;
  const plotHeight = height - paddingY * 2;
  const groupWidth = plotWidth / data.length;
  const barWidth = Math.min(22, (groupWidth - 16) / 2);

  // 3D Isometric Extrusion Offsets
  const dx = is3D ? 5 : 0;
  const dy = is3D ? -4.5 : 0;

  return (
    <div className="w-full relative select-none">
      {/* Legend & Hover Info Banner */}
      <div className="flex items-center justify-between text-xs text-stone-600 mb-3 px-1">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 font-medium">
            <span
              className="w-3 h-3 rounded-md shadow-xs ring-2 ring-emerald-500/20"
              style={{
                background: is3D
                  ? 'linear-gradient(135deg, #34d399 0%, #10b981 50%, #047857 100%)'
                  : colorA,
              }}
            />
            <span className="font-semibold text-stone-800">{labelA}</span>
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <span
              className="w-3 h-3 rounded-md shadow-xs ring-2 ring-amber-500/20"
              style={{
                background: is3D
                  ? 'linear-gradient(135deg, #fde68a 0%, #f59e0b 50%, #b45309 100%)'
                  : colorB,
              }}
            />
            <span className="font-semibold text-stone-800">{labelB}</span>
          </span>
        </div>

        {hoverIndex !== null ? (
          <div className="text-xs font-mono tabular-nums text-stone-800 bg-[#fdfcfb] border border-[#ede8df] px-3 py-1 rounded-xl shadow-xs flex items-center gap-2">
            <span className="text-stone-500 font-sans font-semibold">
              {data[hoverIndex].label}:
            </span>
            <span className="text-emerald-700 font-bold">
              {data[hoverIndex].valueA.toLocaleString()} {unit}
            </span>
            <span className="text-stone-300">|</span>
            <span className="text-amber-700 font-bold">
              {data[hoverIndex].valueB.toLocaleString()} {unit}
            </span>
          </div>
        ) : (
          <span className="text-xs font-mono text-stone-400 bg-cream-100 px-2 py-0.5 rounded-md border border-[#ede8df]">
            Unit: {unit} · 3D Volumetric
          </span>
        )}
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto overflow-visible"
        onMouseLeave={() => setHoverIndex(null)}
      >
        <defs>
          {/* Ground Shadow Filter */}
          <filter id={`barGroundShadow_${chartId}`} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" />
          </filter>

          {/* Specular White Top-to-Bottom Shine */}
          <linearGradient id={`specularShine_${chartId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.75" />
            <stop offset="40%" stopColor="#ffffff" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
          </linearGradient>

          {/* BAR A: Vibrant Emerald 3D Facets */}
          <linearGradient id={`gradFrontA_${chartId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="35%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#047857" />
          </linearGradient>
          <linearGradient id={`gradTopA_${chartId}`} x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="#6ee7b7" />
            <stop offset="100%" stopColor="#a7f3d0" />
          </linearGradient>
          <linearGradient id={`gradSideA_${chartId}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#065f46" />
            <stop offset="100%" stopColor="#022c22" />
          </linearGradient>

          {/* BAR B: Radiant Amber/Gold 3D Facets */}
          <linearGradient id={`gradFrontB_${chartId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="35%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#b45309" />
          </linearGradient>
          <linearGradient id={`gradTopB_${chartId}`} x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="#fde68a" />
            <stop offset="100%" stopColor="#fef08a" />
          </linearGradient>
          <linearGradient id={`gradSideB_${chartId}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#92400e" />
            <stop offset="100%" stopColor="#78350f" />
          </linearGradient>
        </defs>

        {/* Horizontal Perspective Gridlines */}
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
                strokeDasharray={pct === 1 ? 'none' : '4 4'}
                strokeWidth={pct === 1 ? '1.5' : '1'}
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

        {/* 3D Volumetric Columns */}
        {data.map((d, i) => {
          const groupCenter = paddingX + i * groupWidth + groupWidth / 2;
          const heightA = Math.max(0, (d.valueA / maxVal) * plotHeight);
          const heightB = Math.max(0, (d.valueB / maxVal) * plotHeight);
          const yA = height - paddingY - heightA;
          const yB = height - paddingY - heightB;
          const xA = groupCenter - barWidth - 3;
          const xB = groupCenter + 3;

          const isHovered = hoverIndex === i;

          return (
            <g
              key={i}
              className="cursor-pointer transition-transform duration-200"
              onMouseEnter={() => setHoverIndex(i)}
            >
              {/* Invisible interactive hover hit box */}
              <rect
                x={groupCenter - groupWidth / 2}
                y={0}
                width={groupWidth}
                height={height}
                fill="transparent"
              />

              {/* BAR A (Stream A - Emerald) */}
              {heightA > 0 && (
                <g className={isHovered ? 'filter drop-shadow-md' : ''}>
                  {/* Ground Shadow */}
                  {is3D && (
                    <ellipse
                      cx={xA + barWidth / 2 + dx / 2}
                      cy={height - paddingY + 3}
                      rx={barWidth / 2 + 2}
                      ry={2.5}
                      fill="rgba(15,35,25,0.22)"
                      filter={`url(#barGroundShadow_${chartId})`}
                    />
                  )}

                  {/* 3D Right Side Extrusion Facet */}
                  {is3D && (
                    <polygon
                      points={`${xA + barWidth},${yA} ${xA + barWidth + dx},${yA + dy} ${
                        xA + barWidth + dx
                      },${yA + heightA + dy} ${xA + barWidth},${yA + heightA}`}
                      fill={`url(#gradSideA_${chartId})`}
                    />
                  )}

                  {/* Front Face */}
                  <rect
                    x={xA}
                    y={yA}
                    width={barWidth}
                    height={heightA}
                    fill={`url(#gradFrontA_${chartId})`}
                    rx={is3D ? 1 : 3}
                  />

                  {/* Specular Highlight Streak */}
                  {is3D && (
                    <rect
                      x={xA + 1.5}
                      y={yA + 1}
                      width={Math.max(2, barWidth * 0.2)}
                      height={Math.max(0, heightA - 2)}
                      fill={`url(#specularShine_${chartId})`}
                      rx="1"
                    />
                  )}

                  {/* 3D Top Cap (Perspective from above) */}
                  {is3D && (
                    <polygon
                      points={`${xA},${yA} ${xA + dx},${yA + dy} ${xA + barWidth + dx},${
                        yA + dy
                      } ${xA + barWidth},${yA}`}
                      fill={`url(#gradTopA_${chartId})`}
                      stroke="rgba(255,255,255,0.5)"
                      strokeWidth="0.5"
                    />
                  )}
                </g>
              )}

              {/* BAR B (Stream B - Amber/Gold) */}
              {heightB > 0 && (
                <g className={isHovered ? 'filter drop-shadow-md' : ''}>
                  {/* Ground Shadow */}
                  {is3D && (
                    <ellipse
                      cx={xB + barWidth / 2 + dx / 2}
                      cy={height - paddingY + 3}
                      rx={barWidth / 2 + 2}
                      ry={2.5}
                      fill="rgba(15,35,25,0.22)"
                      filter={`url(#barGroundShadow_${chartId})`}
                    />
                  )}

                  {/* 3D Right Side Extrusion Facet */}
                  {is3D && (
                    <polygon
                      points={`${xB + barWidth},${yB} ${xB + barWidth + dx},${yB + dy} ${
                        xB + barWidth + dx
                      },${yB + heightB + dy} ${xB + barWidth},${yB + heightB}`}
                      fill={`url(#gradSideB_${chartId})`}
                    />
                  )}

                  {/* Front Face */}
                  <rect
                    x={xB}
                    y={yB}
                    width={barWidth}
                    height={heightB}
                    fill={`url(#gradFrontB_${chartId})`}
                    rx={is3D ? 1 : 3}
                  />

                  {/* Specular Highlight Streak */}
                  {is3D && (
                    <rect
                      x={xB + 1.5}
                      y={yB + 1}
                      width={Math.max(2, barWidth * 0.2)}
                      height={Math.max(0, heightB - 2)}
                      fill={`url(#specularShine_${chartId})`}
                      rx="1"
                    />
                  )}

                  {/* 3D Top Cap */}
                  {is3D && (
                    <polygon
                      points={`${xB},${yB} ${xB + dx},${yB + dy} ${xB + barWidth + dx},${
                        yB + dy
                      } ${xB + barWidth},${yB}`}
                      fill={`url(#gradTopB_${chartId})`}
                      stroke="rgba(255,255,255,0.5)"
                      strokeWidth="0.5"
                    />
                  )}
                </g>
              )}

              {/* X Axis Date Label */}
              <text
                x={groupCenter}
                y={height - 6}
                fill={isHovered ? '#1b4332' : '#78716c'}
                fontSize="10"
                textAnchor="middle"
                fontFamily="var(--font-sans)"
                fontWeight={isHovered ? '700' : '500'}
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

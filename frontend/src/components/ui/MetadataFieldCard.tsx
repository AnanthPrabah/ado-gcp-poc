import React from 'react';

interface MetadataFieldCardProps {
  label: string;
  value: string;
  variant?: 'grid-card' | 'row-item';
  status?: 'waiting' | 'scanning' | 'complete';
  confidence?: number;
  isColor?: boolean;
}

export const getColorHex = (colorName: string): string => {
  const lower = colorName.toLowerCase().trim();
  if (lower.includes('red') || lower === '187') return '#E31837';
  if (lower.includes('black')) return '#000000';
  if (lower.includes('teal') || lower === '319') return '#00A896';
  if (lower.includes('grey') || lower.includes('gray')) return '#808080';
  if (lower.includes('orange') || lower.includes('orangeade')) return '#FF6600';
  if (lower.includes('gold') || lower.includes('yellow')) return '#FFD700';
  if (lower.includes('white')) return '#FFFFFF';
  if (lower.includes('blue') || lower.includes('royal')) return '#0047AB';
  if (lower.includes('navy')) return '#000080';
  if (lower.includes('green')) return '#008000';
  if (lower.includes('purple')) return '#800080';
  if (lower.includes('brown')) return '#8B4513';
  if (lower.includes('maroon') || lower.includes('cardinal')) return '#800000';
  if (lower.includes('pink')) return '#FFC0CB';
  if (lower.includes('cream') || lower.includes('off-white') || lower.includes('snow')) return '#FFFDD0';
  
  if (/^#[0-9a-f]{3,6}$/i.test(lower)) {
    return colorName;
  }
  return '#E2E8F0'; // Default Slate 200
};

export default function MetadataFieldCard({
  label,
  value,
  variant = 'grid-card',
  status = 'complete',
  confidence = 100,
  isColor = false
}: MetadataFieldCardProps) {
  const isWaiting = status === 'waiting';
  const isScanning = status === 'scanning';

  // Variant 1: Key-Value Row Item (Inside Ingestion Analysis Modal)
  if (variant === 'row-item') {
    return (
      <div className="flex justify-between items-center text-[12px] py-1.5 border-b border-slate-100/30 dark:border-white/[0.02] last:border-b-0">
        <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase">{label}</span>
        <div className="flex items-center gap-2.5">
          {isWaiting ? (
            <>
              {isColor && <div className="h-2.5 w-2.5 rounded-full bg-slate-200/50 dark:bg-white/5 animate-pulse" />}
              <div className="w-24 h-4 bg-slate-200/60 dark:bg-white/5 animate-pulse rounded" />
            </>
          ) : isScanning ? (
            <>
              {isColor && <div className="h-2.5 w-2.5 rounded-full bg-[#2563EB]/20 dark:bg-white/10 animate-pulse" />}
              <div className="w-24 h-4 bg-[#2563EB]/10 dark:bg-white/10 animate-pulse rounded border border-[#2563EB]/25" />
            </>
          ) : (
            <>
              {isColor && (
                <span 
                  className="h-2.5 w-2.5 rounded-full border border-black/10 dark:border-white/10 shadow-sm animate-in zoom-in duration-300" 
                  style={{ backgroundColor: getColorHex(value) }} 
                />
              )}
              <span className="font-semibold text-slate-900 dark:text-white animate-in fade-in duration-300">
                {value}
              </span>
            </>
          )}
        </div>
      </div>
    );
  }

  // Variant 2: Bordered Grid Card (Inside Ingestion Review Page Tab)
  return (
    <div className="group cursor-default p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-[#F8FAFC] dark:bg-bg-elevated hover:bg-slate-100/50 dark:hover:bg-white/[0.04] hover:border-slate-300 dark:hover:border-white/20 flex flex-col justify-between min-h-[64px] transition-premium">
      <div className="flex items-start justify-between gap-1 w-full">
        <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider truncate max-w-[70%]">{label}</span>
        {confidence !== undefined && (
          <span className="text-[8px] font-mono font-bold text-emerald-500 bg-emerald-500/5 border border-emerald-500/10 px-1.5 py-0.5 rounded shrink-0">{confidence}%</span>
        )}
      </div>
      <div className="flex items-center gap-2 mt-2 w-full min-w-0">
        {isColor && (
          <div className="h-3 w-3 rounded-full border border-slate-200 dark:border-white/10 shrink-0" style={{ backgroundColor: getColorHex(value) }} />
        )}
        <span 
          className="text-[12px] font-bold text-slate-900 dark:text-white tracking-tight truncate" 
          title={value}
        >
          {value}
        </span>
      </div>
    </div>
  );
}

import React from 'react';

interface SprocketTrackHorizontalProps {
  filmStockLabel: string;
  count?: number;
  isBottom?: boolean;
}

export const SprocketTrackHorizontal: React.FC<SprocketTrackHorizontalProps> = ({
  filmStockLabel,
  count = 24,
  isBottom = false,
}) => {
  return (
    <div className="w-full bg-[#0a0a0a] py-1.5 px-4 flex items-center justify-between overflow-hidden border-y border-neutral-900 select-none">
      <div className="flex items-center gap-6 shrink-0 font-mono text-[9px] tracking-widest text-amber-500/70 uppercase">
        <span>SAFETY FILM</span>
        <span>•</span>
        <span>{filmStockLabel}</span>
        <span>•</span>
        <span>DX CODE 5219</span>
      </div>

      {/* Repeating Sprocket Holes */}
      <div className="flex items-center gap-3.5 mx-4 overflow-hidden">
        {Array.from({ length: count }).map((_, idx) => (
          <div
            key={idx}
            className="w-3.5 h-4.5 bg-[#030303] rounded-[3px] border border-neutral-800/80 shadow-[inset_0_1px_2px_rgba(0,0,0,0.9)] shrink-0 flex items-center justify-center"
          >
            <div className="w-2.5 h-3.5 bg-neutral-950/80 rounded-[2px]" />
          </div>
        ))}
      </div>

      <div className="flex items-center gap-6 shrink-0 font-mono text-[9px] tracking-widest text-amber-500/70 uppercase">
        <span>{isBottom ? 'EASTMAN' : 'KODAK'}</span>
        <span>▶▶</span>
        <span>35mm EXP</span>
      </div>
    </div>
  );
};

interface SprocketTrackVerticalProps {
  count?: number;
  side: 'left' | 'right';
  currentStock: string;
}

export const SprocketTrackVertical: React.FC<SprocketTrackVerticalProps> = ({
  count = 18,
  side,
  currentStock,
}) => {
  return (
    <div className={`w-10 bg-[#080808] border-neutral-800 flex flex-col items-center justify-between py-6 shrink-0 select-none ${
      side === 'left' ? 'border-r' : 'border-l'
    }`}>
      <div className="rotate-90 origin-center text-[8px] font-mono tracking-widest text-amber-500/60 uppercase whitespace-nowrap mb-6">
        {side === 'left' ? currentStock : 'SAFETY FILM • 35mm'}
      </div>

      <div className="flex flex-col items-center gap-4 my-auto">
        {Array.from({ length: count }).map((_, idx) => (
          <div
            key={idx}
            className="w-4.5 h-3 bg-[#030303] rounded-[3px] border border-neutral-800/90 shadow-[inset_0_1px_2px_rgba(0,0,0,0.9)] shrink-0 flex items-center justify-center"
          >
            <div className="w-3.5 h-2 bg-neutral-950/90 rounded-[2px]" />
          </div>
        ))}
      </div>

      <div className="rotate-90 origin-center text-[8px] font-mono tracking-widest text-amber-500/60 uppercase whitespace-nowrap mt-6">
        {side === 'left' ? '▶ 400TX' : 'DX CODE'}
      </div>
    </div>
  );
};

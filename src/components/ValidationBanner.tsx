import React from 'react';
import { AlertTriangle, Wrench, CheckCircle2, Info } from 'lucide-react';
import { ValidationState } from '../types';

interface ValidationBannerProps {
  validation: ValidationState;
  onAutoFix: () => void;
  onJumpToError?: (line: number) => void;
}

export const ValidationBanner: React.FC<ValidationBannerProps> = ({
  validation,
  onAutoFix,
  onJumpToError,
}) => {
  if (validation.isValid) {
    return null; // Keep high density layout clean; valid status is displayed in the footer status bar
  }

  return (
    <div className="px-3.5 py-1.5 bg-[#1F1315] border-b border-[#4D2428] text-rose-300 text-xs select-none shrink-0 animate-in slide-in-from-top-1 duration-150">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
          <span className="font-semibold text-rose-300 font-mono text-[11px]">SYNTAX ERROR:</span>
          <span className="font-mono text-rose-200 bg-rose-950/80 px-1.5 py-0.2 rounded text-[11px] border border-rose-900/60">
            {validation.error}
          </span>
          {validation.line !== null && (
            <span className="px-1.5 py-0.2 rounded bg-rose-950/80 text-rose-300 font-mono text-[11px] border border-rose-900/60">
              Ln {validation.line}{validation.column ? `, Col ${validation.column}` : ''}
            </span>
          )}
          {validation.suggestion && (
            <span className="text-[11px] text-rose-300/80 font-mono hidden md:inline">
              — {validation.suggestion}
            </span>
          )}
        </div>

        {validation.autoFixable && (
          <button
            id="autofix-json-btn"
            onClick={onAutoFix}
            className="flex items-center gap-1 px-2.5 py-0.5 rounded bg-[#D19A66]/20 text-[#D19A66] hover:bg-[#D19A66]/30 border border-[#D19A66]/50 font-semibold text-[11px] font-mono transition-all shrink-0 active:scale-95"
          >
            <Wrench className="w-3 h-3" />
            <span>Auto-Repair Syntax</span>
          </button>
        )}
      </div>
    </div>
  );
};

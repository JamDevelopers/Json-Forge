import React from 'react';
import { 
  Code2, 
  FileJson, 
  FileCode2, 
  Layers, 
  Sparkles,
  History,
  Trash2,
  ChevronRight,
  Braces
} from 'lucide-react';
import { OutputMode, SamplePreset } from '../types';
import { SAMPLE_PRESETS } from '../utils/samples';

interface SidebarProps {
  currentMode: OutputMode;
  onSelectMode: (mode: OutputMode) => void;
  onLoadSample: (sample: SamplePreset) => void;
  activeSampleId?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentMode,
  onSelectMode,
  onLoadSample,
  activeSampleId,
}) => {
  const targets: { id: OutputMode; label: string; sub: string; dotColor: string }[] = [
    { id: 'typescript', label: 'TypeScript Interface', sub: 'TS 5.x / Types', dotColor: 'bg-blue-400' },
    { id: 'dart', label: 'Dart Model', sub: 'Null-Safe / fromJson', dotColor: 'bg-sky-400' },
    { id: 'csharp', label: 'C# POCO / Model', sub: 'Record & Class', dotColor: 'bg-purple-400' },
    { id: 'php', label: 'PHP 8.x Class', sub: 'Constructor Promotion', dotColor: 'bg-indigo-400' },
    { id: 'formatted', label: 'JSON Formatter', sub: 'Beautify & Indent', dotColor: 'bg-emerald-400' },
    { id: 'minified', label: 'JSON Minifier', sub: 'Compress & Strip', dotColor: 'bg-cyan-400' },
    { id: 'tree', label: 'JSON Tree Inspector', sub: 'Collapsible Nodes', dotColor: 'bg-amber-400' },
  ];

  return (
    <aside className="w-56 shrink-0 border-r border-[#2D3139] bg-[#0F1218] flex flex-col select-none hidden md:flex">
      {/* Navigation Targets */}
      <div className="p-3">
        <div className="flex items-center justify-between mb-2.5 px-1">
          <p className="text-[10px] uppercase tracking-widest text-[#5C6370] font-bold">
            Conversion Targets
          </p>
        </div>

        <nav className="space-y-1">
          {targets.map((target) => {
            const isActive = currentMode === target.id;
            return (
              <button
                key={target.id}
                id={`sidebar-target-${target.id}`}
                onClick={() => onSelectMode(target.id)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-xs transition-all text-left ${
                  isActive
                    ? 'bg-indigo-950/40 text-indigo-300 font-medium border-l-2 border-indigo-500 pl-2'
                    : 'text-[#8E9299] hover:bg-[#1A1D23] hover:text-[#E0E0E0]'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isActive ? 'bg-indigo-400 shadow-sm shadow-indigo-400/50' : 'bg-[#2D3139]'}`} />
                  <span className="truncate">{target.label}</span>
                </div>
                {isActive && <ChevronRight className="w-3 h-3 text-indigo-400 shrink-0" />}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Preset Samples / History Section */}
      <div className="mt-auto p-3 border-t border-[#2D3139] bg-[#0C0F14]">
        <div className="flex items-center justify-between text-[10px] font-semibold text-[#5C6370] mb-2 px-1">
          <span className="tracking-wider flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#5C6370]" /> PRESET SAMPLES
          </span>
        </div>

        <div className="space-y-1">
          {SAMPLE_PRESETS.map((sample) => {
            const isSelected = activeSampleId === sample.id;
            return (
              <button
                key={sample.id}
                id={`sidebar-sample-${sample.id}`}
                onClick={() => onLoadSample(sample)}
                className={`w-full text-left px-2 py-1.5 rounded text-[11px] font-mono transition-colors flex items-center justify-between group ${
                  isSelected 
                    ? 'bg-[#1A1D23] text-indigo-300 border border-[#2D3139]' 
                    : 'text-[#8E9299] hover:bg-[#1A1D23] hover:text-[#E0E0E0]'
                }`}
              >
                <span className="truncate">{sample.name}</span>
                <span className="text-[9px] px-1 py-0.2 rounded bg-[#151921] text-[#5C6370] group-hover:text-[#8E9299] border border-[#2D3139]">
                  {sample.category}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
};

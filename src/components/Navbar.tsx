import React from 'react';
import { 
  Code2, 
  FileJson, 
  Sparkles, 
  BarChart3, 
  Upload, 
  Trash2, 
  FileCode2,
  Layers,
  ChevronDown,
  Wrench
} from 'lucide-react';
import { OutputMode, SamplePreset } from '../types';
import { SAMPLE_PRESETS } from '../utils/samples';

interface NavbarProps {
  currentMode: OutputMode;
  onSelectMode: (mode: OutputMode) => void;
  onLoadSample: (sample: SamplePreset) => void;
  onUploadFile: (content: string) => void;
  onClear: () => void;
  onOpenStats: () => void;
  isValid: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentMode,
  onSelectMode,
  onLoadSample,
  onUploadFile,
  onClear,
  onOpenStats,
  isValid,
}) => {
  const [sampleMenuOpen, setSampleMenuOpen] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) onUploadFile(text);
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const primaryModes: { id: OutputMode; label: string }[] = [
    { id: 'formatted', label: 'Formatter' },
    { id: 'minified', label: 'Minifier' },
    { id: 'tree', label: 'Tree View' },
  ];

  const modelModes: { id: OutputMode; label: string }[] = [
    { id: 'typescript', label: 'TypeScript' },
    { id: 'dart', label: 'Dart' },
    { id: 'csharp', label: 'C#' },
    { id: 'php', label: 'PHP' },
  ];

  return (
    <header className="flex items-center justify-between px-4 py-2.5 border-b border-[#2D3139] bg-[#151921] text-[#E0E0E0] select-none z-30 shrink-0">
      {/* Logo & Title */}
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 bg-indigo-600 rounded flex items-center justify-center font-bold text-white text-xs shadow-sm font-mono">
          {'{ }'}
        </div>
        <div className="flex items-baseline gap-1.5">
          <h1 className="text-sm sm:text-base font-semibold tracking-tight text-[#E0E0E0]">
            JSON.Forge
          </h1>
          <span className="text-[#8E9299] font-mono text-[11px]">v2.4.0</span>
        </div>
      </div>

      {/* Center Tools / Mode Selector for Mobile & Quick Bar */}
      <div className="flex items-center gap-2">
        {/* Core Utility Pills */}
        <div className="flex bg-[#1A1D23] rounded-md p-0.5 border border-[#2D3139]">
          {primaryModes.map((item) => {
            const isActive = currentMode === item.id;
            return (
              <button
                key={item.id}
                id={`nav-btn-${item.id}`}
                onClick={() => onSelectMode(item.id)}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                  isActive
                    ? 'bg-[#2D3139] text-white shadow-sm font-semibold'
                    : 'text-[#8E9299] hover:text-white'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Model Generator Quick Switcher (Mobile/Compact) */}
        <div className="flex md:hidden bg-[#1A1D23] rounded-md p-0.5 border border-[#2D3139]">
          {modelModes.map((item) => {
            const isActive = currentMode === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectMode(item.id)}
                className={`px-2 py-1 text-[11px] font-mono rounded transition-colors ${
                  isActive
                    ? 'bg-indigo-600 text-white font-semibold'
                    : 'text-[#8E9299] hover:text-white'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2">
        {/* Samples Dropdown */}
        <div className="relative">
          <button
            id="samples-dropdown-btn"
            onClick={() => setSampleMenuOpen(!sampleMenuOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium bg-[#1A1D23] hover:bg-[#2D3139] text-[#E0E0E0] border border-[#2D3139] transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#D19A66]" />
            <span className="hidden sm:inline">Presets</span>
            <ChevronDown className="w-3 h-3 text-[#8E9299]" />
          </button>

          {sampleMenuOpen && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setSampleMenuOpen(false)} 
              />
              <div className="absolute right-0 mt-1.5 w-60 rounded-md bg-[#151921] border border-[#2D3139] shadow-2xl p-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-2 py-1 text-[10px] font-bold text-[#5C6370] uppercase tracking-wider">
                  Preset JSON Schemas
                </div>
                {SAMPLE_PRESETS.map((sample) => (
                  <button
                    key={sample.id}
                    onClick={() => {
                      onLoadSample(sample);
                      setSampleMenuOpen(false);
                    }}
                    className="w-full text-left px-2 py-1.5 rounded hover:bg-[#1A1D23] transition-colors flex flex-col gap-0.5 text-xs group"
                  >
                    <div className="flex items-center justify-between text-[#E0E0E0] group-hover:text-white font-medium">
                      <span>{sample.name}</span>
                      <span className="text-[9px] px-1 py-0.2 rounded bg-[#0A0C10] group-hover:bg-[#2D3139] text-[#8E9299] font-mono border border-[#2D3139]">
                        {sample.category}
                      </span>
                    </div>
                    <p className="text-[10px] text-[#8E9299] leading-tight truncate">
                      {sample.description}
                    </p>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Upload File Button */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".json,.txt"
          className="hidden"
        />
        <button
          id="upload-file-btn"
          onClick={() => fileInputRef.current?.click()}
          title="Upload JSON File"
          className="p-1.5 rounded bg-[#1A1D23] hover:bg-[#2D3139] text-[#8E9299] hover:text-white border border-[#2D3139] transition-colors"
        >
          <Upload className="w-3.5 h-3.5" />
        </button>

        {/* Stats Payload Inspector */}
        <button
          id="stats-btn"
          onClick={onOpenStats}
          title="Inspect Payload Metrics"
          className="p-1.5 rounded bg-[#1A1D23] hover:bg-[#2D3139] text-[#8E9299] hover:text-indigo-400 border border-[#2D3139] transition-colors"
        >
          <BarChart3 className="w-3.5 h-3.5" />
        </button>

        {/* Clear Button */}
        <button
          id="clear-btn"
          onClick={onClear}
          title="Clear Editor"
          className="p-1.5 rounded bg-[#1A1D23] hover:bg-rose-950/80 text-[#8E9299] hover:text-rose-400 border border-[#2D3139] transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>

        {/* Quick Model Action Button */}
        <button
          onClick={() => onSelectMode(currentMode === 'typescript' ? 'dart' : 'typescript')}
          className="hidden lg:flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1 rounded text-xs font-semibold shadow-sm transition-colors"
        >
          <span>Generate Models</span>
        </button>
      </div>
    </header>
  );
};

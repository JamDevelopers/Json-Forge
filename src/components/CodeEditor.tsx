import React from 'react';
import { 
  Copy, 
  Check, 
  Wrench, 
  Sparkles, 
  Minimize2, 
  ClipboardPaste, 
  Trash2,
  FileCode
} from 'lucide-react';
import { ValidationState } from '../types';

interface CodeEditorProps {
  value: string;
  onChange: (val: string) => void;
  validation: ValidationState;
  onFormat: () => void;
  onMinify: () => void;
  onAutoFix: () => void;
  onClear: () => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  onChange,
  validation,
  onFormat,
  onMinify,
  onAutoFix,
  onClear,
}) => {
  const [copied, setCopied] = React.useState(false);
  const [isDragging, setIsDragging] = React.useState(false);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = React.useRef<HTMLDivElement>(null);

  // Sync scroll between textarea and line numbers
  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handlePaste = async () => {
    try {
      const clipText = await navigator.clipboard.readText();
      if (clipText) onChange(clipText);
    } catch {
      // Fallback if permission blocked
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      const newValue = value.substring(0, start) + '  ' + value.substring(end);
      onChange(newValue);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
        }
      }, 0);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) onChange(text);
      };
      reader.readAsText(file);
    }
  };

  const lines = value.split('\n');
  const lineCount = lines.length;

  return (
    <section 
      className="flex flex-col h-full bg-[#0A0C10] border-r border-[#2D3139] relative group overflow-hidden"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Editor Top Bar - High Density style */}
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-[#151921] border-b border-[#2D3139] text-[#E0E0E0] select-none shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-indigo-400 uppercase tracking-wider font-semibold">
            Input JSON
          </span>
          <span className="text-[10px] text-[#5C6370] font-mono">
            ({lineCount} {lineCount === 1 ? 'line' : 'lines'}, {value.length} chars)
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            id="paste-btn"
            onClick={handlePaste}
            title="Paste from clipboard"
            className="text-[10px] font-mono px-2 py-0.5 bg-[#2D3139] hover:bg-[#3D424D] rounded text-[#E0E0E0] transition-colors"
          >
            Paste
          </button>

          <button
            id="format-btn"
            onClick={onFormat}
            title="Format JSON"
            className="text-[10px] font-mono px-2 py-0.5 bg-[#2D3139] hover:bg-[#3D424D] rounded text-[#E0E0E0] transition-colors flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3 text-indigo-400" />
            <span>Format</span>
          </button>

          <button
            id="minify-btn"
            onClick={onMinify}
            title="Minify JSON"
            className="text-[10px] font-mono px-2 py-0.5 bg-[#2D3139] hover:bg-[#3D424D] rounded text-[#E0E0E0] transition-colors"
          >
            Minify
          </button>

          {validation.autoFixable && (
            <button
              id="fix-btn"
              onClick={onAutoFix}
              title="Auto-Fix syntax errors"
              className="text-[10px] font-mono px-2 py-0.5 bg-[#D19A66]/20 text-[#D19A66] hover:bg-[#D19A66]/30 border border-[#D19A66]/40 rounded font-semibold transition-colors flex items-center gap-1"
            >
              <Wrench className="w-3 h-3" />
              <span>Auto-Fix</span>
            </button>
          )}

          <button
            id="copy-raw-btn"
            onClick={handleCopy}
            title="Copy Raw JSON"
            className="p-1 rounded bg-[#2D3139] hover:bg-[#3D424D] text-[#8E9299] hover:text-white transition-colors"
          >
            {copied ? <Check className="w-3 h-3 text-[#98C379]" /> : <Copy className="w-3 h-3" />}
          </button>

          <button
            id="clear-editor-btn"
            onClick={onClear}
            title="Clear"
            className="p-1 rounded bg-[#2D3139] hover:bg-rose-900/60 text-[#8E9299] hover:text-rose-300 transition-colors"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Editor Main Canvas with Line Numbers */}
      <div className="relative flex-1 flex overflow-hidden font-mono text-xs leading-relaxed bg-[#0A0C10]">
        {/* Line Numbers Column */}
        <div
          ref={lineNumbersRef}
          aria-hidden="true"
          className="select-none py-3 px-2.5 text-right text-[#5C6370] bg-[#0A0C10] border-r border-[#2D3139] overflow-hidden shrink-0 font-mono text-[11px] w-11"
        >
          {Array.from({ length: Math.max(1, lineCount) }).map((_, i) => {
            const lineNum = i + 1;
            const isErrorLine = validation.line === lineNum;
            return (
              <div
                key={lineNum}
                className={`${
                  isErrorLine
                    ? 'text-rose-400 font-bold bg-rose-950/80 -mx-2.5 px-2.5 rounded'
                    : ''
                }`}
              >
                {lineNum}
              </div>
            );
          })}
        </div>

        {/* Text Area */}
        <textarea
          id="json-input-editor"
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onScroll={handleScroll}
          onKeyDown={handleKeyDown}
          placeholder='{ "status": "success", "data": { ... } }'
          spellCheck={false}
          className="flex-1 w-full h-full p-3 bg-transparent text-[#E0E0E0] placeholder-[#5C6370] resize-none outline-none font-mono text-xs leading-relaxed selection:bg-indigo-600/40"
        />

        {/* Drag & Drop Overlay */}
        {isDragging && (
          <div className="absolute inset-0 bg-[#0F1218]/90 border-2 border-dashed border-indigo-500 flex flex-col items-center justify-center text-indigo-300 z-20 backdrop-blur-sm">
            <FileCode className="w-10 h-10 mb-2 animate-bounce text-indigo-400" />
            <span className="font-semibold text-sm">Drop JSON file here</span>
            <span className="text-xs text-[#8E9299]">Supports .json, .txt</span>
          </div>
        )}
      </div>
    </section>
  );
};

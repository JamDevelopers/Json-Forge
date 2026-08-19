import React from 'react';
import { 
  Copy, 
  Check, 
  Download, 
  WrapText, 
  Settings, 
  FileCode,
  AlertCircle
} from 'lucide-react';
import { OutputMode } from '../types';

interface OutputViewerProps {
  content: string;
  mode: OutputMode;
  isValid: boolean;
  onToggleSettings?: () => void;
  showSettings?: boolean;
}

export const OutputViewer: React.FC<OutputViewerProps> = ({
  content,
  mode,
  isValid,
  onToggleSettings,
  showSettings,
}) => {
  const [copied, setCopied] = React.useState(false);
  const [wordWrap, setWordWrap] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleDownload = () => {
    let filename = 'generated_model';
    let mimeType = 'text/plain';

    switch (mode) {
      case 'formatted':
        filename = 'formatted.json';
        mimeType = 'application/json';
        break;
      case 'minified':
        filename = 'data.min.json';
        mimeType = 'application/json';
        break;
      case 'dart':
        filename = 'model.dart';
        mimeType = 'text/x-dart';
        break;
      case 'typescript':
        filename = 'types.ts';
        mimeType = 'text/typescript';
        break;
      case 'php':
        filename = 'Model.php';
        mimeType = 'text/x-php';
        break;
      case 'csharp':
        filename = 'Model.cs';
        mimeType = 'text/x-csharp';
        break;
      default:
        filename = 'output.txt';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getLanguageDetails = () => {
    switch (mode) {
      case 'formatted': return { title: 'Formatted JSON', color: 'text-indigo-400', ext: '.json' };
      case 'minified': return { title: 'Minified JSON', color: 'text-cyan-400', ext: '.min.json' };
      case 'dart': return { title: 'Generated Dart Model', color: 'text-sky-400', ext: '.dart' };
      case 'typescript': return { title: 'Generated TypeScript Interface', color: 'text-emerald-400', ext: '.ts' };
      case 'php': return { title: 'Generated PHP Class', color: 'text-indigo-400', ext: '.php' };
      case 'csharp': return { title: 'Generated C# POCO Model', color: 'text-purple-400', ext: '.cs' };
      default: return { title: 'Generated Output', color: 'text-[#E0E0E0]', ext: '.txt' };
    }
  };

  const langDetails = getLanguageDetails();
  const lines = content.split('\n');
  const lineCount = lines.length;

  return (
    <section className="flex flex-col h-full bg-[#0A0C10] overflow-hidden">
      {/* Header - High Density */}
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-[#151921] border-b border-[#2D3139] text-[#E0E0E0] select-none shrink-0">
        <div className="flex items-center gap-2">
          <span className={`text-[11px] font-mono ${langDetails.color} uppercase tracking-wider font-semibold`}>
            {langDetails.title}
          </span>
          <span className="text-[10px] px-1 py-0.2 rounded bg-[#1A1D23] font-mono text-[#8E9299] border border-[#2D3139]">
            {langDetails.ext}
          </span>
          <span className="text-[10px] text-[#5C6370] font-mono hidden sm:inline">
            ({lineCount} lines)
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          {onToggleSettings && (
            <button
              id="toggle-settings-btn"
              onClick={onToggleSettings}
              title="Generator Settings"
              className={`text-[10px] font-mono px-2 py-0.5 rounded border transition-colors flex items-center gap-1 ${
                showSettings
                  ? 'bg-indigo-950/60 text-indigo-300 border-indigo-700 font-semibold'
                  : 'bg-[#2D3139] hover:bg-[#3D424D] text-[#8E9299] hover:text-[#E0E0E0] border-[#2D3139]'
              }`}
            >
              <Settings className="w-3 h-3" />
              <span>Options</span>
            </button>
          )}

          <button
            id="toggle-wrap-btn"
            onClick={() => setWordWrap(!wordWrap)}
            title="Toggle Word Wrap"
            className={`p-1 rounded text-xs transition-colors ${
              wordWrap
                ? 'bg-[#3D424D] text-white'
                : 'bg-[#2D3139] hover:bg-[#3D424D] text-[#8E9299] hover:text-[#E0E0E0]'
            }`}
          >
            <WrapText className="w-3 h-3" />
          </button>

          <button
            id="copy-output-btn"
            onClick={handleCopy}
            title="Copy Output"
            className="text-[10px] font-mono px-2.5 py-0.5 bg-emerald-600/20 text-emerald-400 border border-emerald-600/30 hover:bg-emerald-600/30 rounded font-semibold transition-colors flex items-center gap-1"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copy Output</span>
              </>
            )}
          </button>

          <button
            id="download-output-btn"
            onClick={handleDownload}
            title="Download File"
            className="text-[10px] font-mono px-2 py-0.5 bg-[#2D3139] hover:bg-[#3D424D] text-[#E0E0E0] rounded transition-colors flex items-center gap-1"
          >
            <Download className="w-3 h-3" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* Code Display Area */}
      {!isValid && (
        <div className="bg-rose-950/60 border-b border-rose-800/40 px-3 py-1 text-rose-300 text-[11px] font-mono flex items-center gap-2 shrink-0">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-400" />
          <span>Note: Input JSON contains syntax errors. Output generated with best-effort repair.</span>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden font-mono text-xs leading-relaxed bg-[#0A0C10]">
        {/* Line Numbers */}
        <div
          aria-hidden="true"
          className="select-none py-3 px-2.5 text-right text-[#5C6370] bg-[#0A0C10] border-r border-[#2D3139] overflow-hidden shrink-0 font-mono text-[11px] w-11"
        >
          {Array.from({ length: Math.max(1, lineCount) }).map((_, i) => (
            <div key={i + 1}>{i + 1}</div>
          ))}
        </div>

        {/* Code Content */}
        <pre
          id="output-code-block"
          className={`flex-1 p-3 overflow-auto text-[#ABB2BF] font-mono select-text bg-[#0A0C10] ${
            wordWrap ? 'whitespace-pre-wrap break-all' : 'whitespace-pre'
          }`}
        >
          <code>{content}</code>
        </pre>
      </div>
    </section>
  );
};

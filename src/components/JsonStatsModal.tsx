import React from 'react';
import { X, BarChart2, HardDrive, Layers, Hash } from 'lucide-react';
import { JsonStats } from '../types';

interface JsonStatsModalProps {
  stats: JsonStats | null;
  isOpen: boolean;
  onClose: () => void;
}

export const JsonStatsModal: React.FC<JsonStatsModalProps> = ({ stats, isOpen, onClose }) => {
  if (!isOpen || !stats) return null;

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const totalTypes = 
    stats.typesCount.strings +
    stats.typesCount.numbers +
    stats.typesCount.booleans +
    stats.typesCount.objects +
    stats.typesCount.arrays +
    stats.typesCount.nulls;

  const getTypePercent = (count: number) => {
    if (!totalTypes) return 0;
    return Math.round((count / totalTypes) * 100);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-100">
      <div 
        className="w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 bg-zinc-900/80">
          <div className="flex items-center gap-2 text-zinc-100 font-semibold">
            <BarChart2 className="w-5 h-5 text-indigo-400" />
            <span>JSON Payload Metrics & Statistics</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 space-y-5 overflow-y-auto max-h-[80vh]">
          {/* Size & Savings Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800">
              <div className="flex items-center gap-1.5 text-zinc-400 text-xs mb-1">
                <HardDrive className="w-3.5 h-3.5 text-indigo-400" />
                <span>Raw Size</span>
              </div>
              <div className="text-lg font-bold font-mono text-zinc-100">
                {formatBytes(stats.rawBytes)}
              </div>
              <div className="text-[11px] text-zinc-500 font-mono mt-0.5">
                {stats.charactersCount} characters
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800">
              <div className="flex items-center gap-1.5 text-zinc-400 text-xs mb-1">
                <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
                <span>Minified Size</span>
              </div>
              <div className="text-lg font-bold font-mono text-cyan-400">
                {formatBytes(stats.minifiedBytes)}
              </div>
              <div className="text-[11px] text-emerald-400 font-medium mt-0.5">
                -{stats.savingsPercentage}% space saved
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800">
              <div className="flex items-center gap-1.5 text-zinc-400 text-xs mb-1">
                <Layers className="w-3.5 h-3.5 text-purple-400" />
                <span>Max Depth</span>
              </div>
              <div className="text-lg font-bold font-mono text-purple-400">
                {stats.maxDepth} levels
              </div>
              <div className="text-[11px] text-zinc-500 font-mono mt-0.5">
                {stats.totalKeys} total keys
              </div>
            </div>
          </div>

          {/* Type Distribution */}
          <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800">
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-300 mb-3">
              <div className="flex items-center gap-1.5">
                <Hash className="w-4 h-4 text-amber-400" />
                <span>Data Types Breakdown ({totalTypes} total nodes)</span>
              </div>
            </div>

            {/* Visual Distribution Bar */}
            <div className="h-2.5 w-full rounded-full overflow-hidden flex mb-4 bg-zinc-800">
              <div style={{ width: `${getTypePercent(stats.typesCount.strings)}%` }} className="bg-emerald-500" title="Strings" />
              <div style={{ width: `${getTypePercent(stats.typesCount.numbers)}%` }} className="bg-sky-500" title="Numbers" />
              <div style={{ width: `${getTypePercent(stats.typesCount.booleans)}%` }} className="bg-amber-500" title="Booleans" />
              <div style={{ width: `${getTypePercent(stats.typesCount.objects)}%` }} className="bg-indigo-500" title="Objects" />
              <div style={{ width: `${getTypePercent(stats.typesCount.arrays)}%` }} className="bg-purple-500" title="Arrays" />
              <div style={{ width: `${getTypePercent(stats.typesCount.nulls)}%` }} className="bg-zinc-600" title="Nulls" />
            </div>

            {/* Grid of types */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs font-mono">
              <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-900 border border-zinc-800">
                <span className="flex items-center gap-1.5 text-zinc-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> Strings
                </span>
                <span className="font-semibold text-zinc-200">{stats.typesCount.strings}</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-900 border border-zinc-800">
                <span className="flex items-center gap-1.5 text-zinc-400">
                  <span className="w-2 h-2 rounded-full bg-sky-500" /> Numbers
                </span>
                <span className="font-semibold text-zinc-200">{stats.typesCount.numbers}</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-900 border border-zinc-800">
                <span className="flex items-center gap-1.5 text-zinc-400">
                  <span className="w-2 h-2 rounded-full bg-amber-500" /> Booleans
                </span>
                <span className="font-semibold text-zinc-200">{stats.typesCount.booleans}</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-900 border border-zinc-800">
                <span className="flex items-center gap-1.5 text-zinc-400">
                  <span className="w-2 h-2 rounded-full bg-indigo-500" /> Objects
                </span>
                <span className="font-semibold text-zinc-200">{stats.typesCount.objects}</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-900 border border-zinc-800">
                <span className="flex items-center gap-1.5 text-zinc-400">
                  <span className="w-2 h-2 rounded-full bg-purple-500" /> Arrays
                </span>
                <span className="font-semibold text-zinc-200">{stats.typesCount.arrays}</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-900 border border-zinc-800">
                <span className="flex items-center gap-1.5 text-zinc-400">
                  <span className="w-2 h-2 rounded-full bg-zinc-500" /> Nulls
                </span>
                <span className="font-semibold text-zinc-200">{stats.typesCount.nulls}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-zinc-800 bg-zinc-900/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

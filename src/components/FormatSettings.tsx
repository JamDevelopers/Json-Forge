import React from 'react';
import { FormatOptions } from '../types';
import { SlidersHorizontal } from 'lucide-react';

interface FormatSettingsProps {
  options: FormatOptions;
  onChange: (options: FormatOptions) => void;
}

export const FormatSettings: React.FC<FormatSettingsProps> = ({ options, onChange }) => {
  return (
    <div className="bg-zinc-900/90 border-b border-zinc-800 p-3 text-xs">
      <div className="flex items-center gap-1.5 font-semibold text-zinc-300 mb-2">
        <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" />
        <span>Formatter Configuration</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        <div>
          <label className="text-zinc-400 block mb-1">Indentation</label>
          <select
            value={options.indent}
            onChange={(e) => onChange({ ...options, indent: e.target.value === 'tab' ? 'tab' : Number(e.target.value) as any })}
            className="w-full px-2.5 py-1 bg-zinc-950 border border-zinc-750 rounded text-zinc-200 focus:outline-none focus:border-indigo-500 font-mono"
          >
            <option value={2}>2 Spaces</option>
            <option value={4}>4 Spaces</option>
            <option value="tab">1 Tab</option>
          </select>
        </div>

        <div>
          <label className="text-zinc-400 block mb-1">Sort Object Keys</label>
          <select
            value={options.sortKeys}
            onChange={(e) => onChange({ ...options, sortKeys: e.target.value as any })}
            className="w-full px-2.5 py-1 bg-zinc-950 border border-zinc-750 rounded text-zinc-200 focus:outline-none focus:border-indigo-500 font-mono"
          >
            <option value="none">Preserve Original Order</option>
            <option value="asc">Alphabetical (A → Z)</option>
            <option value="desc">Reverse (Z → A)</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5 justify-center">
          <label className="flex items-center gap-2 cursor-pointer text-zinc-300">
            <input
              type="checkbox"
              checked={options.removeNulls}
              onChange={(e) => onChange({ ...options, removeNulls: e.target.checked })}
              className="rounded bg-zinc-950 border-zinc-700 text-indigo-500 focus:ring-0"
            />
            <span>Strip Null/Undefined Values</span>
          </label>
        </div>

        <div className="flex flex-col gap-1.5 justify-center">
          <label className="flex items-center gap-2 cursor-pointer text-zinc-300">
            <input
              type="checkbox"
              checked={options.unescapeStrings}
              onChange={(e) => onChange({ ...options, unescapeStrings: e.target.checked })}
              className="rounded bg-zinc-950 border-zinc-700 text-indigo-500 focus:ring-0"
            />
            <span>Unescape Unicode Sequences</span>
          </label>
        </div>
      </div>
    </div>
  );
};

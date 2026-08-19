import React from 'react';
import { PhpGeneratorOptions } from '../types';
import { Settings2 } from 'lucide-react';

interface PhpSettingsProps {
  options: PhpGeneratorOptions;
  onChange: (options: PhpGeneratorOptions) => void;
}

export const PhpSettings: React.FC<PhpSettingsProps> = ({ options, onChange }) => {
  return (
    <div className="bg-zinc-900/90 border-b border-zinc-800 p-3 text-xs">
      <div className="flex items-center gap-1.5 font-semibold text-zinc-300 mb-2">
        <Settings2 className="w-3.5 h-3.5 text-indigo-400" />
        <span>PHP Class Options</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        <div className="flex flex-col gap-2">
          <div>
            <label className="text-zinc-400 block mb-1">Root Class Name</label>
            <input
              id="php-root-name"
              type="text"
              value={options.rootClassName}
              onChange={(e) => onChange({ ...options, rootClassName: e.target.value })}
              className="w-full px-2.5 py-1 bg-zinc-950 border border-zinc-750 rounded text-zinc-200 focus:outline-none focus:border-indigo-500 font-mono"
              placeholder="RootModel"
            />
          </div>
          <div>
            <label className="text-zinc-400 block mb-1">PHP Version Target</label>
            <select
              value={options.phpVersion}
              onChange={(e) => onChange({ ...options, phpVersion: e.target.value as any })}
              className="w-full px-2.5 py-1 bg-zinc-950 border border-zinc-750 rounded text-zinc-200 focus:outline-none focus:border-indigo-500 font-mono"
            >
              <option value="8.0+">PHP 8.0+ (Constructor Promotion)</option>
              <option value="8.2+">PHP 8.2+ (Readonly classes)</option>
              <option value="7.4">PHP 7.4 (Typed Properties)</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-1.5 justify-center">
          <label className="flex items-center gap-2 cursor-pointer text-zinc-300">
            <input
              type="checkbox"
              checked={options.useConstructorPromotion}
              onChange={(e) => onChange({ ...options, useConstructorPromotion: e.target.checked })}
              className="rounded bg-zinc-950 border-zinc-700 text-indigo-500 focus:ring-0"
            />
            <span>Constructor Promotion</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-zinc-300">
            <input
              type="checkbox"
              checked={options.typedProperties}
              onChange={(e) => onChange({ ...options, typedProperties: e.target.checked })}
              className="rounded bg-zinc-950 border-zinc-700 text-indigo-500 focus:ring-0"
            />
            <span>Strict Property Types</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-zinc-300">
            <input
              type="checkbox"
              checked={options.readonlyProperties}
              onChange={(e) => onChange({ ...options, readonlyProperties: e.target.checked })}
              className="rounded bg-zinc-950 border-zinc-700 text-indigo-500 focus:ring-0"
            />
            <span>Readonly Modifier</span>
          </label>
        </div>

        <div className="flex flex-col gap-1.5 justify-center">
          <label className="flex items-center gap-2 cursor-pointer text-zinc-300">
            <input
              type="checkbox"
              checked={options.includeFromArray}
              onChange={(e) => onChange({ ...options, includeFromArray: e.target.checked })}
              className="rounded bg-zinc-950 border-zinc-700 text-indigo-500 focus:ring-0"
            />
            <span>fromArray() & fromJson()</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-zinc-300">
            <input
              type="checkbox"
              checked={options.includeJsonSerialize}
              onChange={(e) => onChange({ ...options, includeJsonSerialize: e.target.checked })}
              className="rounded bg-zinc-950 border-zinc-700 text-indigo-500 focus:ring-0"
            />
            <span>JsonSerializable (jsonSerialize)</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-zinc-300">
            <input
              type="checkbox"
              checked={options.includeDocBlocks}
              onChange={(e) => onChange({ ...options, includeDocBlocks: e.target.checked })}
              className="rounded bg-zinc-950 border-zinc-700 text-indigo-500 focus:ring-0"
            />
            <span>Include DocBlocks (@var)</span>
          </label>
        </div>

        <div>
          <label className="text-zinc-400 block mb-1">Namespace (Optional)</label>
          <input
            id="php-namespace"
            type="text"
            value={options.namespace || ''}
            onChange={(e) => onChange({ ...options, namespace: e.target.value })}
            className="w-full px-2.5 py-1 bg-zinc-950 border border-zinc-750 rounded text-zinc-200 focus:outline-none focus:border-indigo-500 font-mono"
            placeholder="App\Models"
          />
        </div>
      </div>
    </div>
  );
};

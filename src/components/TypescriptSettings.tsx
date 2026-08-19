import React from 'react';
import { TypescriptGeneratorOptions } from '../types';
import { Settings2 } from 'lucide-react';

interface TypescriptSettingsProps {
  options: TypescriptGeneratorOptions;
  onChange: (options: TypescriptGeneratorOptions) => void;
}

export const TypescriptSettings: React.FC<TypescriptSettingsProps> = ({ options, onChange }) => {
  return (
    <div className="bg-[#151921] border-b border-[#2D3139] px-4 py-2.5 text-xs select-none shrink-0 font-mono">
      <div className="flex items-center gap-1.5 font-semibold text-[#E0E0E0] mb-2 text-[11px] uppercase tracking-wider">
        <Settings2 className="w-3 h-3 text-emerald-400" />
        <span>TypeScript Configuration</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        <div>
          <label className="text-[#8E9299] block mb-1 text-[11px]">Root Interface Name</label>
          <input
            id="ts-root-name"
            type="text"
            value={options.rootInterfaceName}
            onChange={(e) => onChange({ ...options, rootInterfaceName: e.target.value })}
            className="w-full px-2 py-0.5 bg-[#0A0C10] border border-[#2D3139] rounded text-[#E0E0E0] focus:outline-none focus:border-emerald-500 font-mono text-xs"
            placeholder="RootObject"
          />
        </div>

        <div className="flex flex-col gap-1 justify-center">
          <label className="flex items-center gap-2 cursor-pointer text-[#E0E0E0] text-[11px]">
            <input
              type="checkbox"
              checked={options.useTypeAlias}
              onChange={(e) => onChange({ ...options, useTypeAlias: e.target.checked })}
              className="rounded bg-[#0A0C10] border-[#2D3139] text-emerald-500 focus:ring-0"
            />
            <span>Use "type" instead of "interface"</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-[#E0E0E0] text-[11px]">
            <input
              type="checkbox"
              checked={options.exportTypes}
              onChange={(e) => onChange({ ...options, exportTypes: e.target.checked })}
              className="rounded bg-[#0A0C10] border-[#2D3139] text-emerald-500 focus:ring-0"
            />
            <span>Add "export" keyword</span>
          </label>
        </div>

        <div className="flex flex-col gap-1 justify-center">
          <label className="flex items-center gap-2 cursor-pointer text-[#E0E0E0] text-[11px]">
            <input
              type="checkbox"
              checked={options.optionalFields}
              onChange={(e) => onChange({ ...options, optionalFields: e.target.checked })}
              className="rounded bg-[#0A0C10] border-[#2D3139] text-emerald-500 focus:ring-0"
            />
            <span>All Fields Optional (?)</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-[#E0E0E0] text-[11px]">
            <input
              type="checkbox"
              checked={options.readonlyFields}
              onChange={(e) => onChange({ ...options, readonlyFields: e.target.checked })}
              className="rounded bg-[#0A0C10] border-[#2D3139] text-emerald-500 focus:ring-0"
            />
            <span>Make Fields readonly</span>
          </label>
        </div>

        <div className="flex flex-col gap-1 justify-center">
          <label className="flex items-center gap-2 cursor-pointer text-[#E0E0E0] text-[11px]">
            <input
              type="checkbox"
              checked={options.avoidAny}
              onChange={(e) => onChange({ ...options, avoidAny: e.target.checked })}
              className="rounded bg-[#0A0C10] border-[#2D3139] text-emerald-500 focus:ring-0"
            />
            <span>Avoid "any" (use unknown)</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-[#E0E0E0] text-[11px]">
            <input
              type="checkbox"
              checked={options.includeJsDoc}
              onChange={(e) => onChange({ ...options, includeJsDoc: e.target.checked })}
              className="rounded bg-[#0A0C10] border-[#2D3139] text-emerald-500 focus:ring-0"
            />
            <span>Include JSDoc annotations</span>
          </label>
        </div>
      </div>
    </div>
  );
};

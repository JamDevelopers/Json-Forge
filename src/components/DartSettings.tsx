import React from 'react';
import { DartGeneratorOptions } from '../types';
import { Settings2 } from 'lucide-react';

interface DartSettingsProps {
  options: DartGeneratorOptions;
  onChange: (options: DartGeneratorOptions) => void;
}

export const DartSettings: React.FC<DartSettingsProps> = ({ options, onChange }) => {
  return (
    <div className="bg-[#151921] border-b border-[#2D3139] px-4 py-2.5 text-xs select-none shrink-0 font-mono">
      <div className="flex items-center gap-1.5 font-semibold text-[#E0E0E0] mb-2 text-[11px] uppercase tracking-wider">
        <Settings2 className="w-3 h-3 text-sky-400" />
        <span>Dart Model Configuration</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        <div>
          <label className="text-[#8E9299] block mb-1 text-[11px]">Root Class Name</label>
          <input
            id="dart-root-name"
            type="text"
            value={options.rootClassName}
            onChange={(e) => onChange({ ...options, rootClassName: e.target.value })}
            className="w-full px-2 py-0.5 bg-[#0A0C10] border border-[#2D3139] rounded text-[#E0E0E0] focus:outline-none focus:border-sky-500 font-mono text-xs"
            placeholder="RootModel"
          />
        </div>

        <div className="flex flex-col gap-1 justify-center">
          <label className="flex items-center gap-2 cursor-pointer text-[#E0E0E0] text-[11px]">
            <input
              type="checkbox"
              checked={options.nullSafe}
              onChange={(e) => onChange({ ...options, nullSafe: e.target.checked })}
              className="rounded bg-[#0A0C10] border-[#2D3139] text-sky-500 focus:ring-0"
            />
            <span>Null-Safety (?)</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-[#E0E0E0] text-[11px]">
            <input
              type="checkbox"
              checked={options.includeFromJson}
              onChange={(e) => onChange({ ...options, includeFromJson: e.target.checked })}
              className="rounded bg-[#0A0C10] border-[#2D3139] text-sky-500 focus:ring-0"
            />
            <span>factory fromJson()</span>
          </label>
        </div>

        <div className="flex flex-col gap-1 justify-center">
          <label className="flex items-center gap-2 cursor-pointer text-[#E0E0E0] text-[11px]">
            <input
              type="checkbox"
              checked={options.includeToJson}
              onChange={(e) => onChange({ ...options, includeToJson: e.target.checked })}
              className="rounded bg-[#0A0C10] border-[#2D3139] text-sky-500 focus:ring-0"
            />
            <span>Map toJson()</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-[#E0E0E0] text-[11px]">
            <input
              type="checkbox"
              checked={options.includeCopyWith}
              onChange={(e) => onChange({ ...options, includeCopyWith: e.target.checked })}
              className="rounded bg-[#0A0C10] border-[#2D3139] text-sky-500 focus:ring-0"
            />
            <span>copyWith() Method</span>
          </label>
        </div>

        <div className="flex flex-col gap-1 justify-center">
          <label className="flex items-center gap-2 cursor-pointer text-[#E0E0E0] text-[11px]">
            <input
              type="checkbox"
              checked={options.camelCaseProperties}
              onChange={(e) => onChange({ ...options, camelCaseProperties: e.target.checked })}
              className="rounded bg-[#0A0C10] border-[#2D3139] text-sky-500 focus:ring-0"
            />
            <span>camelCase Fields</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-[#E0E0E0] text-[11px]">
            <input
              type="checkbox"
              checked={options.equatable}
              onChange={(e) => onChange({ ...options, equatable: e.target.checked })}
              className="rounded bg-[#0A0C10] border-[#2D3139] text-sky-500 focus:ring-0"
            />
            <span>Equatable (props)</span>
          </label>
        </div>
      </div>
    </div>
  );
};

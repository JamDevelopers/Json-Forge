import React from 'react';
import { CsharpGeneratorOptions } from '../types';
import { Settings2 } from 'lucide-react';

interface CsharpSettingsProps {
  options: CsharpGeneratorOptions;
  onChange: (options: CsharpGeneratorOptions) => void;
}

export const CsharpSettings: React.FC<CsharpSettingsProps> = ({ options, onChange }) => {
  return (
    <div className="bg-zinc-900/90 border-b border-zinc-800 p-3 text-xs">
      <div className="flex items-center gap-1.5 font-semibold text-zinc-300 mb-2">
        <Settings2 className="w-3.5 h-3.5 text-purple-400" />
        <span>C# Model Options</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        <div className="flex flex-col gap-2">
          <div>
            <label className="text-zinc-400 block mb-1">Root Class Name</label>
            <input
              id="csharp-root-name"
              type="text"
              value={options.rootClassName}
              onChange={(e) => onChange({ ...options, rootClassName: e.target.value })}
              className="w-full px-2.5 py-1 bg-zinc-950 border border-zinc-750 rounded text-zinc-200 focus:outline-none focus:border-purple-500 font-mono"
              placeholder="RootModel"
            />
          </div>
          <div>
            <label className="text-zinc-400 block mb-1">Model Type</label>
            <select
              value={options.modelType}
              onChange={(e) => onChange({ ...options, modelType: e.target.value as any })}
              className="w-full px-2.5 py-1 bg-zinc-950 border border-zinc-750 rounded text-zinc-200 focus:outline-none focus:border-purple-500 font-mono"
            >
              <option value="class">public class</option>
              <option value="record">public record (C# 9+)</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div>
            <label className="text-zinc-400 block mb-1">JSON Serializer Attributes</label>
            <select
              value={options.serializer}
              onChange={(e) => onChange({ ...options, serializer: e.target.value as any })}
              className="w-full px-2.5 py-1 bg-zinc-950 border border-zinc-750 rounded text-zinc-200 focus:outline-none focus:border-purple-500 font-mono"
            >
              <option value="System.Text.Json">[JsonPropertyName("...")]</option>
              <option value="Newtonsoft.Json">[JsonProperty("...")]</option>
              <option value="None">None (Plain Properties)</option>
            </select>
          </div>
          <div>
            <label className="text-zinc-400 block mb-1">Property Accessor</label>
            <select
              value={options.propertyAccessor}
              onChange={(e) => onChange({ ...options, propertyAccessor: e.target.value as any })}
              className="w-full px-2.5 py-1 bg-zinc-950 border border-zinc-750 rounded text-zinc-200 focus:outline-none focus:border-purple-500 font-mono"
            >
              <option value="{ get; set; }">{'{ get; set; }'}</option>
              <option value="{ get; init; }">{'{ get; init; }'}</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-1.5 justify-center">
          <label className="flex items-center gap-2 cursor-pointer text-zinc-300">
            <input
              type="checkbox"
              checked={options.nullableReferenceTypes}
              onChange={(e) => onChange({ ...options, nullableReferenceTypes: e.target.checked })}
              className="rounded bg-zinc-950 border-zinc-700 text-purple-500 focus:ring-0"
            />
            <span>Nullable Types (#nullable enable)</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-zinc-300">
            <input
              type="checkbox"
              checked={options.usePascalCase}
              onChange={(e) => onChange({ ...options, usePascalCase: e.target.checked })}
              className="rounded bg-zinc-950 border-zinc-700 text-purple-500 focus:ring-0"
            />
            <span>PascalCase Properties</span>
          </label>
        </div>

        <div>
          <label className="text-zinc-400 block mb-1">Namespace (Optional)</label>
          <input
            id="csharp-namespace"
            type="text"
            value={options.namespace || ''}
            onChange={(e) => onChange({ ...options, namespace: e.target.value })}
            className="w-full px-2.5 py-1 bg-zinc-950 border border-zinc-750 rounded text-zinc-200 focus:outline-none focus:border-purple-500 font-mono"
            placeholder="MyApplication.Models"
          />
        </div>
      </div>
    </div>
  );
};

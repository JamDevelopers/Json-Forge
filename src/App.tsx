import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  OutputMode, 
  ValidationState, 
  DartGeneratorOptions, 
  TypescriptGeneratorOptions, 
  PhpGeneratorOptions, 
  CsharpGeneratorOptions, 
  FormatOptions, 
  SamplePreset 
} from './types';
import { 
  validateJson, 
  autoFixJson, 
  formatJson, 
  minifyJson, 
  calculateJsonStats 
} from './utils/jsonValidator';
import { generateDartModel } from './utils/generators/dartGenerator';
import { generateTypescript } from './utils/generators/typescriptGenerator';
import { generatePhpClass } from './utils/generators/phpGenerator';
import { generateCsharpModel } from './utils/generators/csharpGenerator';
import { SAMPLE_PRESETS } from './utils/samples';
import { Navbar } from './components/Navbar';
import { ValidationBanner } from './components/ValidationBanner';
import { CodeEditor } from './components/CodeEditor';
import { TreeView } from './components/TreeView';
import { OutputViewer } from './components/OutputViewer';
import { DartSettings } from './components/DartSettings';
import { TypescriptSettings } from './components/TypescriptSettings';
import { PhpSettings } from './components/PhpSettings';
import { CsharpSettings } from './components/CsharpSettings';
import { FormatSettings } from './components/FormatSettings';
import { JsonStatsModal } from './components/JsonStatsModal';
import { SplitSquareVertical, Columns, Eye } from 'lucide-react';

export default function App() {
  const [inputJson, setInputJson] = useState<string>(SAMPLE_PRESETS[0].json);
  const [outputMode, setOutputMode] = useState<OutputMode>('formatted');
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [isStatsOpen, setIsStatsOpen] = useState<boolean>(false);
  const [viewLayout, setViewLayout] = useState<'split' | 'input' | 'output'>('split');

  // Generator Options State
  const [formatOptions, setFormatOptions] = useState<FormatOptions>({
    indent: 2,
    sortKeys: 'none',
    removeNulls: false,
    unescapeStrings: false,
  });

  const [dartOptions, setDartOptions] = useState<DartGeneratorOptions>({
    rootClassName: 'OrderModel',
    nullSafe: true,
    includeFromJson: true,
    includeToJson: true,
    includeCopyWith: true,
    includeToString: true,
    camelCaseProperties: true,
    useJsonSerializable: false,
    equatable: false,
  });

  const [tsOptions, setTsOptions] = useState<TypescriptGeneratorOptions>({
    rootInterfaceName: 'OrderPayload',
    useTypeAlias: false,
    optionalFields: false,
    readonlyFields: false,
    exportTypes: true,
    includeJsDoc: true,
    avoidAny: true,
  });

  const [phpOptions, setPhpOptions] = useState<PhpGeneratorOptions>({
    rootClassName: 'OrderModel',
    phpVersion: '8.0+',
    useConstructorPromotion: true,
    typedProperties: true,
    includeJsonSerialize: true,
    includeFromArray: true,
    includeDocBlocks: true,
    readonlyProperties: false,
    namespace: 'App\\Models',
  });

  const [csharpOptions, setCsharpOptions] = useState<CsharpGeneratorOptions>({
    rootClassName: 'OrderModel',
    modelType: 'class',
    serializer: 'System.Text.Json',
    nullableReferenceTypes: true,
    propertyAccessor: '{ get; set; }',
    usePascalCase: true,
    namespace: 'Ecommerce.Models',
  });

  // Real-time Validation
  const validation: ValidationState = useMemo(() => {
    return validateJson(inputJson);
  }, [inputJson]);

  // Statistics calculation
  const stats = useMemo(() => {
    return calculateJsonStats(inputJson);
  }, [inputJson]);

  // Parsed Object for Tree View
  const parsedData = useMemo(() => {
    try {
      return JSON.parse(inputJson);
    } catch {
      return undefined;
    }
  }, [inputJson]);

  // Handle Formatter Quick Action
  const handleFormat = useCallback(() => {
    if (!validation.isValid) {
      const fixedResult = autoFixJson(inputJson);
      if (fixedResult.success) {
        const formatted = formatJson(fixedResult.fixed, formatOptions);
        setInputJson(formatted);
      }
      return;
    }
    const formatted = formatJson(inputJson, formatOptions);
    setInputJson(formatted);
  }, [inputJson, validation.isValid, formatOptions]);

  // Handle Minifier Quick Action
  const handleMinify = useCallback(() => {
    if (!validation.isValid) {
      const fixedResult = autoFixJson(inputJson);
      if (fixedResult.success) {
        const minified = minifyJson(fixedResult.fixed);
        setInputJson(minified);
      }
      return;
    }
    const minified = minifyJson(inputJson);
    setInputJson(minified);
  }, [inputJson, validation.isValid]);

  // Handle Auto-Fix
  const handleAutoFix = useCallback(() => {
    const res = autoFixJson(inputJson);
    setInputJson(res.fixed);
  }, [inputJson]);

  // Load Preset Sample
  const handleLoadSample = (sample: SamplePreset) => {
    setInputJson(sample.json);
    // Update root class names dynamically based on sample category
    if (sample.id === 'user-profile') {
      setDartOptions(prev => ({ ...prev, rootClassName: 'UserProfile' }));
      setTsOptions(prev => ({ ...prev, rootInterfaceName: 'UserProfile' }));
      setPhpOptions(prev => ({ ...prev, rootClassName: 'UserProfile' }));
      setCsharpOptions(prev => ({ ...prev, rootClassName: 'UserProfile' }));
    } else if (sample.id === 'weather-api') {
      setDartOptions(prev => ({ ...prev, rootClassName: 'WeatherResponse' }));
      setTsOptions(prev => ({ ...prev, rootInterfaceName: 'WeatherResponse' }));
      setPhpOptions(prev => ({ ...prev, rootClassName: 'WeatherResponse' }));
      setCsharpOptions(prev => ({ ...prev, rootClassName: 'WeatherResponse' }));
    } else {
      setDartOptions(prev => ({ ...prev, rootClassName: 'OrderModel' }));
      setTsOptions(prev => ({ ...prev, rootInterfaceName: 'OrderPayload' }));
      setPhpOptions(prev => ({ ...prev, rootClassName: 'OrderModel' }));
      setCsharpOptions(prev => ({ ...prev, rootClassName: 'OrderModel' }));
    }
  };

  // Generate Output Code based on selected mode
  const outputCode = useMemo(() => {
    if (!inputJson.trim()) return '';

    // If invalid JSON, attempt a clean fallback representation
    let targetJson = inputJson;
    if (!validation.isValid) {
      const fixAttempt = autoFixJson(inputJson);
      if (fixAttempt.success) {
        targetJson = fixAttempt.fixed;
      }
    }

    switch (outputMode) {
      case 'formatted':
        try {
          return formatJson(targetJson, formatOptions);
        } catch {
          return targetJson;
        }

      case 'minified':
        try {
          return minifyJson(targetJson);
        } catch {
          return targetJson;
        }

      case 'dart':
        return generateDartModel(targetJson, dartOptions);

      case 'typescript':
        return generateTypescript(targetJson, tsOptions);

      case 'php':
        return generatePhpClass(targetJson, phpOptions);

      case 'csharp':
        return generateCsharpModel(targetJson, csharpOptions);

      case 'tree':
        return '';

      default:
        return '';
    }
  }, [
    inputJson,
    outputMode,
    validation.isValid,
    formatOptions,
    dartOptions,
    tsOptions,
    phpOptions,
    csharpOptions,
  ]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-zinc-950 text-zinc-100 font-sans">
      {/* Top Navbar */}
      <Navbar
        currentMode={outputMode}
        onSelectMode={(mode) => setOutputMode(mode)}
        onLoadSample={handleLoadSample}
        onUploadFile={(content) => setInputJson(content)}
        onClear={() => setInputJson('')}
        onOpenStats={() => setIsStatsOpen(true)}
        isValid={validation.isValid}
      />

      {/* Validation Diagnostic Banner (only shown if invalid) */}
      {!validation.isValid && (
        <ValidationBanner
          validation={validation}
          onAutoFix={handleAutoFix}
        />
      )}

      {/* Sub-header / Settings Drawers depending on Mode */}
      {showSettings && outputMode === 'formatted' && (
        <FormatSettings options={formatOptions} onChange={setFormatOptions} />
      )}
      {showSettings && outputMode === 'dart' && (
        <DartSettings options={dartOptions} onChange={setDartOptions} />
      )}
      {showSettings && outputMode === 'typescript' && (
        <TypescriptSettings options={tsOptions} onChange={setTsOptions} />
      )}
      {showSettings && outputMode === 'php' && (
        <PhpSettings options={phpOptions} onChange={setPhpOptions} />
      )}
      {showSettings && outputMode === 'csharp' && (
        <CsharpSettings options={csharpOptions} onChange={setCsharpOptions} />
      )}

      {/* Main Dual-Pane Workspace */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Left Pane: Code Editor */}
        <div
          className={`h-full overflow-hidden transition-all duration-150 ${
            viewLayout === 'split'
              ? 'w-full md:w-1/2'
              : viewLayout === 'input'
              ? 'w-full'
              : 'hidden'
          }`}
        >
          <CodeEditor
            value={inputJson}
            onChange={setInputJson}
            validation={validation}
            onFormat={handleFormat}
            onMinify={handleMinify}
            onAutoFix={handleAutoFix}
            onClear={() => setInputJson('')}
          />
        </div>

        {/* Right Pane: Generator / Tree / Formatter Output */}
        <div
          className={`h-full overflow-hidden transition-all duration-150 ${
            viewLayout === 'split'
              ? 'w-full md:w-1/2'
              : viewLayout === 'output'
              ? 'w-full'
              : 'hidden'
          }`}
        >
          {outputMode === 'tree' ? (
            <TreeView data={parsedData} rawJson={inputJson} />
          ) : (
            <OutputViewer
              content={outputCode}
              mode={outputMode}
              isValid={validation.isValid}
              showSettings={showSettings}
              onToggleSettings={() => setShowSettings(!showSettings)}
            />
          )}
        </div>

        {/* Floating Layout Toggle Controls (Bottom Center) */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 hidden md:flex items-center gap-1 p-1 bg-zinc-900/90 border border-zinc-800 rounded-xl shadow-xl backdrop-blur-md text-xs">
          <button
            onClick={() => setViewLayout('input')}
            title="Focus Input Only"
            className={`px-2 py-1 rounded-lg transition-colors ${
              viewLayout === 'input' ? 'bg-zinc-800 text-white font-medium' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Input Only
          </button>
          <button
            onClick={() => setViewLayout('split')}
            title="Split Side-by-Side View"
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors ${
              viewLayout === 'split' ? 'bg-zinc-800 text-white font-semibold' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Split View</span>
          </button>
          <button
            onClick={() => setViewLayout('output')}
            title="Focus Output Only"
            className={`px-2 py-1 rounded-lg transition-colors ${
              viewLayout === 'output' ? 'bg-zinc-800 text-white font-medium' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Output Only
          </button>
        </div>
      </main>

      {/* JSON Payload Stats Modal */}
      <JsonStatsModal
        stats={stats}
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
      />
    </div>
  );
}

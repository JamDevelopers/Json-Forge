export type OutputMode = 
  | 'formatted' 
  | 'minified' 
  | 'tree' 
  | 'dart' 
  | 'typescript' 
  | 'php' 
  | 'csharp';

export interface ValidationState {
  isValid: boolean;
  error: string | null;
  line: number | null;
  column: number | null;
  position: number | null;
  suggestion?: string;
  autoFixable?: boolean;
}

export interface JsonStats {
  rawBytes: number;
  formattedBytes: number;
  minifiedBytes: number;
  savingsPercentage: number;
  linesCount: number;
  charactersCount: number;
  totalKeys: number;
  maxDepth: number;
  typesCount: {
    objects: number;
    arrays: number;
    strings: number;
    numbers: number;
    booleans: number;
    nulls: number;
  };
}

export interface DartGeneratorOptions {
  rootClassName: string;
  nullSafe: boolean;
  includeFromJson: boolean;
  includeToJson: boolean;
  includeCopyWith: boolean;
  includeToString: boolean;
  camelCaseProperties: boolean;
  useJsonSerializable: boolean;
  equatable: boolean;
}

export interface TypescriptGeneratorOptions {
  rootInterfaceName: string;
  useTypeAlias: boolean; // false for interface, true for type
  optionalFields: boolean;
  readonlyFields: boolean;
  exportTypes: boolean;
  includeJsDoc: boolean;
  avoidAny: boolean;
}

export interface PhpGeneratorOptions {
  rootClassName: string;
  phpVersion: '8.0+' | '8.2+' | '7.4';
  useConstructorPromotion: boolean;
  typedProperties: boolean;
  includeJsonSerialize: boolean;
  includeFromArray: boolean;
  includeDocBlocks: boolean;
  readonlyProperties: boolean;
  namespace?: string;
}

export interface CsharpGeneratorOptions {
  rootClassName: string;
  modelType: 'record' | 'class';
  serializer: 'System.Text.Json' | 'Newtonsoft.Json' | 'None';
  nullableReferenceTypes: boolean;
  propertyAccessor: '{ get; set; }' | '{ get; init; }';
  usePascalCase: boolean;
  namespace?: string;
}

export interface FormatOptions {
  indent: 2 | 4 | 'tab';
  sortKeys: 'none' | 'asc' | 'desc';
  removeNulls: boolean;
  unescapeStrings: boolean;
}

export interface SamplePreset {
  id: string;
  name: string;
  category: 'API' | 'E-Commerce' | 'Config' | 'Tests' | 'Mobile';
  description: string;
  json: string;
}

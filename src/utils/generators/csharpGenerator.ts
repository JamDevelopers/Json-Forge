import { CsharpGeneratorOptions } from '../../types';

interface CsharpClass {
  name: string;
  fields: {
    jsonKey: string;
    propName: string;
    type: string;
    isNullable: boolean;
    isClass: boolean;
    isClassList: boolean;
    listItemClass?: string;
  }[];
}

export function generateCsharpModel(rawJson: string, options: CsharpGeneratorOptions): string {
  if (!rawJson.trim()) return '// Paste valid JSON to generate C# models';

  let parsed: any;
  try {
    parsed = JSON.parse(rawJson);
  } catch (e: any) {
    return `// Invalid JSON: ${e.message}`;
  }

  const classes: CsharpClass[] = [];
  const rootName = sanitizeCsharpName(options.rootClassName || 'RootModel');

  if (Array.isArray(parsed)) {
    if (parsed.length > 0 && typeof parsed[0] === 'object' && parsed[0] !== null) {
      extractCsharpClasses(parsed[0], rootName, classes, options);
    } else {
      const primType = getCsharpPrimitiveType(parsed[0]);
      return `// JSON is a primitive array: List<${primType}>`;
    }
  } else if (typeof parsed === 'object' && parsed !== null) {
    extractCsharpClasses(parsed, rootName, classes, options);
  } else {
    return `// JSON root is not an object: ${typeof parsed}`;
  }

  const imports: string[] = ['using System;', 'using System.Collections.Generic;'];
  if (options.serializer === 'System.Text.Json') {
    imports.push('using System.Text.Json.Serialization;');
  } else if (options.serializer === 'Newtonsoft.Json') {
    imports.push('using Newtonsoft.Json;');
  }

  const classBlocks = classes.map(cls => formatCsharpClass(cls, options));
  let code = imports.join('\n') + '\n\n';

  if (options.nullableReferenceTypes) {
    code = '#nullable enable\n' + code;
  }

  if (options.namespace && options.namespace.trim()) {
    code += `namespace ${options.namespace.trim()}\n{\n`;
    code += classBlocks.map(b => indentBlock(b, 4)).join('\n\n') + '\n}';
  } else {
    code += classBlocks.join('\n\n');
  }

  return code;
}

function extractCsharpClasses(
  obj: Record<string, any>,
  className: string,
  classes: CsharpClass[],
  options: CsharpGeneratorOptions
) {
  if (classes.some(c => c.name === className)) return;

  const current: CsharpClass = {
    name: className,
    fields: [],
  };
  classes.push(current);

  for (const [key, val] of Object.entries(obj)) {
    const propName = options.usePascalCase ? toPascalCase(key) : sanitizeIdentifier(key);
    let type = 'object';
    let isClass = false;
    let isClassList = false;
    let listItemClass: string | undefined = undefined;
    const isNullable = val === null || options.nullableReferenceTypes;

    if (val === null) {
      type = 'object';
    } else if (typeof val === 'string') {
      type = 'string';
    } else if (typeof val === 'number') {
      type = Number.isInteger(val) ? 'int' : 'double';
    } else if (typeof val === 'boolean') {
      type = 'bool';
    } else if (Array.isArray(val)) {
      if (val.length > 0 && typeof val[0] === 'object' && val[0] !== null) {
        const subName = sanitizeCsharpName(toSingular(key) || `${className}Item`);
        isClassList = true;
        listItemClass = subName;
        type = `List<${subName}>`;
        extractCsharpClasses(val[0], subName, classes, options);
      } else if (val.length > 0) {
        const prim = getCsharpPrimitiveType(val[0]);
        type = `List<${prim}>`;
      } else {
        type = 'List<object>';
      }
    } else if (typeof val === 'object') {
      const subName = sanitizeCsharpName(key);
      type = subName;
      isClass = true;
      extractCsharpClasses(val, subName, classes, options);
    }

    current.fields.push({
      jsonKey: key,
      propName,
      type,
      isNullable,
      isClass,
      isClassList,
      listItemClass,
    });
  }
}

function formatCsharpClass(cls: CsharpClass, options: CsharpGeneratorOptions): string {
  const lines: string[] = [];
  const keyword = options.modelType === 'record' ? 'record' : 'class';

  lines.push(`public ${keyword} ${cls.name}`);
  lines.push('{');

  for (const f of cls.fields) {
    if (options.serializer === 'System.Text.Json') {
      lines.push(`    [JsonPropertyName("${f.jsonKey}")]`);
    } else if (options.serializer === 'Newtonsoft.Json') {
      lines.push(`    [JsonProperty("${f.jsonKey}")]`);
    }

    const nullSuffix = options.nullableReferenceTypes && f.type !== 'object' && !f.type.endsWith('?')
      ? '?'
      : '';

    lines.push(`    public ${f.type}${nullSuffix} ${f.propName} ${options.propertyAccessor}`);
    lines.push('');
  }

  // Remove trailing empty line inside class
  if (lines[lines.length - 1] === '') {
    lines.pop();
  }

  lines.push('}');
  return lines.join('\n');
}

function getCsharpPrimitiveType(val: any): string {
  if (typeof val === 'string') return 'string';
  if (typeof val === 'number') return Number.isInteger(val) ? 'int' : 'double';
  if (typeof val === 'boolean') return 'bool';
  return 'object';
}

function sanitizeCsharpName(name: string): string {
  const clean = name.replace(/[^a-zA-Z0-9_]/g, '');
  if (!clean) return 'CsharpModel';
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}

function sanitizeIdentifier(name: string): string {
  let clean = name.replace(/[^a-zA-Z0-9_]/g, '_');
  if (/^[0-9]/.test(clean)) clean = `@_${clean}`;
  return clean;
}

function toPascalCase(str: string): string {
  return str
    .replace(/[-_ ]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
    .replace(/^[a-z]/, c => c.toUpperCase());
}

function toSingular(str: string): string {
  if (str.endsWith('ies')) return str.slice(0, -3) + 'y';
  if (str.endsWith('es') && !str.endsWith('ses')) return str.slice(0, -2);
  if (str.endsWith('s') && !str.endsWith('ss')) return str.slice(0, -1);
  return str;
}

function indentBlock(text: string, spaces: number): string {
  const pad = ' '.repeat(spaces);
  return text
    .split('\n')
    .map(line => (line.trim() ? pad + line : line))
    .join('\n');
}

import { TypescriptGeneratorOptions } from '../../types';

interface TSInterface {
  name: string;
  isRoot: boolean;
  fields: {
    key: string;
    safeKey: string;
    type: string;
    isOptional: boolean;
    comment?: string;
  }[];
}

export function generateTypescript(rawJson: string, options: TypescriptGeneratorOptions): string {
  if (!rawJson.trim()) return '// Paste valid JSON to generate TypeScript interfaces';

  let parsed: any;
  try {
    parsed = JSON.parse(rawJson);
  } catch (e: any) {
    return `// Invalid JSON: ${e.message}`;
  }

  const interfaces: TSInterface[] = [];
  const rootName = sanitizeTypeName(options.rootInterfaceName || 'RootObject');

  if (Array.isArray(parsed)) {
    if (parsed.length > 0 && typeof parsed[0] === 'object' && parsed[0] !== null) {
      extractInterfaces(parsed[0], rootName, interfaces, options, true);
    } else {
      const elemType = getTSType(parsed[0]);
      const prefix = options.exportTypes ? 'export ' : '';
      return `${prefix}type ${rootName} = ${elemType}[];\n`;
    }
  } else if (typeof parsed === 'object' && parsed !== null) {
    extractInterfaces(parsed, rootName, interfaces, options, true);
  } else {
    const primType = getTSType(parsed);
    const prefix = options.exportTypes ? 'export ' : '';
    return `${prefix}type ${rootName} = ${primType};\n`;
  }

  const codeBlocks = interfaces.map(iface => formatTSInterface(iface, options));
  return codeBlocks.join('\n\n');
}

function extractInterfaces(
  obj: Record<string, any>,
  typeName: string,
  interfaces: TSInterface[],
  options: TypescriptGeneratorOptions,
  isRoot = false
) {
  if (interfaces.some(i => i.name === typeName)) return;

  const current: TSInterface = {
    name: typeName,
    isRoot,
    fields: [],
  };
  interfaces.push(current);

  for (const [key, val] of Object.entries(obj)) {
    const safeKey = isValidIdentifier(key) ? key : JSON.stringify(key);
    let type = 'unknown';

    if (val === null) {
      type = options.avoidAny ? 'null' : 'any';
    } else if (typeof val === 'string') {
      type = 'string';
    } else if (typeof val === 'number') {
      type = 'number';
    } else if (typeof val === 'boolean') {
      type = 'boolean';
    } else if (Array.isArray(val)) {
      if (val.length === 0) {
        type = options.avoidAny ? 'unknown[]' : 'any[]';
      } else {
        const typesSet = new Set<string>();
        for (const item of val) {
          if (typeof item === 'object' && item !== null) {
            const subName = sanitizeTypeName(toSingular(key) || `${typeName}Item`);
            extractInterfaces(item, subName, interfaces, options);
            typesSet.add(subName);
          } else {
            typesSet.add(getTSType(item));
          }
        }
        const unionType = Array.from(typesSet).join(' | ');
        type = typesSet.size > 1 ? `(${unionType})[]` : `${unionType}[]`;
      }
    } else if (typeof val === 'object') {
      const subName = sanitizeTypeName(key);
      extractInterfaces(val, subName, interfaces, options);
      type = subName;
    }

    current.fields.push({
      key,
      safeKey,
      type,
      isOptional: options.optionalFields || val === null,
    });
  }
}

function formatTSInterface(iface: TSInterface, options: TypescriptGeneratorOptions): string {
  const prefix = options.exportTypes ? 'export ' : '';
  const lines: string[] = [];

  if (options.includeJsDoc) {
    lines.push('/**');
    lines.push(` * ${iface.isRoot ? 'Root object structure' : `${iface.name} representation`}`);
    lines.push(' */');
  }

  if (options.useTypeAlias) {
    lines.push(`${prefix}type ${iface.name} = {`);
  } else {
    lines.push(`${prefix}interface ${iface.name} {`);
  }

  for (const f of iface.fields) {
    const readonly = options.readonlyFields ? 'readonly ' : '';
    const optional = f.isOptional ? '?' : '';
    lines.push(`  ${readonly}${f.safeKey}${optional}: ${f.type};`);
  }

  lines.push(options.useTypeAlias ? '};' : '}');
  return lines.join('\n');
}

function getTSType(val: any): string {
  if (val === null) return 'null';
  if (typeof val === 'string') return 'string';
  if (typeof val === 'number') return 'number';
  if (typeof val === 'boolean') return 'boolean';
  return 'unknown';
}

function isValidIdentifier(name: string): boolean {
  return /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(name);
}

function sanitizeTypeName(name: string): string {
  const clean = name.replace(/[^a-zA-Z0-9_]/g, '');
  if (!clean) return 'TypeModel';
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}

function toSingular(str: string): string {
  if (str.endsWith('ies')) return str.slice(0, -3) + 'y';
  if (str.endsWith('es') && !str.endsWith('ses')) return str.slice(0, -2);
  if (str.endsWith('s') && !str.endsWith('ss')) return str.slice(0, -1);
  return str;
}

import { PhpGeneratorOptions } from '../../types';

interface PhpClass {
  name: string;
  fields: {
    jsonKey: string;
    propName: string;
    type: string;
    docType: string;
    isNullable: boolean;
    isClass: boolean;
    isClassArray: boolean;
    arrayItemClass?: string;
  }[];
}

export function generatePhpClass(rawJson: string, options: PhpGeneratorOptions): string {
  if (!rawJson.trim()) return '// Paste valid JSON to generate PHP classes';

  let parsed: any;
  try {
    parsed = JSON.parse(rawJson);
  } catch (e: any) {
    return `// Invalid JSON: ${e.message}`;
  }

  const classes: PhpClass[] = [];
  const rootName = sanitizePhpName(options.rootClassName || 'RootModel');

  if (Array.isArray(parsed)) {
    if (parsed.length > 0 && typeof parsed[0] === 'object' && parsed[0] !== null) {
      extractPhpClasses(parsed[0], rootName, classes, options);
    } else {
      return `// JSON is a primitive array: array<${typeof parsed[0]}>`;
    }
  } else if (typeof parsed === 'object' && parsed !== null) {
    extractPhpClasses(parsed, rootName, classes, options);
  } else {
    return `// JSON root is not an object: ${typeof parsed}`;
  }

  const classBlocks = classes.map(cls => formatPhpClass(cls, options));
  
  const headerParts = ['<?php', 'declare(strict_types=1);'];
  if (options.namespace && options.namespace.trim()) {
    headerParts.push(`\nnamespace ${options.namespace.trim()};`);
  }
  if (options.includeJsonSerialize) {
    headerParts.push(`\nuse JsonSerializable;`);
  }

  return headerParts.join('\n') + '\n\n' + classBlocks.join('\n\n');
}

function extractPhpClasses(
  obj: Record<string, any>,
  className: string,
  classes: PhpClass[],
  options: PhpGeneratorOptions
) {
  if (classes.some(c => c.name === className)) return;

  const current: PhpClass = {
    name: className,
    fields: [],
  };
  classes.push(current);

  for (const [key, val] of Object.entries(obj)) {
    const propName = toCamelCase(key);
    let type = 'mixed';
    let docType = 'mixed';
    let isClass = false;
    let isClassArray = false;
    let arrayItemClass: string | undefined = undefined;
    const isNullable = val === null;

    if (val === null) {
      type = 'mixed';
      docType = 'mixed';
    } else if (typeof val === 'string') {
      type = 'string';
      docType = 'string';
    } else if (typeof val === 'number') {
      type = Number.isInteger(val) ? 'int' : 'float';
      docType = type;
    } else if (typeof val === 'boolean') {
      type = 'bool';
      docType = 'bool';
    } else if (Array.isArray(val)) {
      type = 'array';
      if (val.length > 0 && typeof val[0] === 'object' && val[0] !== null) {
        const subName = sanitizePhpName(toSingular(key) || `${className}Item`);
        isClassArray = true;
        arrayItemClass = subName;
        docType = `${subName}[]`;
        extractPhpClasses(val[0], subName, classes, options);
      } else if (val.length > 0) {
        docType = `${typeof val[0]}[]`;
      } else {
        docType = 'array';
      }
    } else if (typeof val === 'object') {
      const subName = sanitizePhpName(key);
      type = subName;
      docType = subName;
      isClass = true;
      extractPhpClasses(val, subName, classes, options);
    }

    current.fields.push({
      jsonKey: key,
      propName,
      type,
      docType,
      isNullable,
      isClass,
      isClassArray,
      arrayItemClass,
    });
  }
}

function formatPhpClass(cls: PhpClass, options: PhpGeneratorOptions): string {
  const lines: string[] = [];
  const isPhp8 = options.phpVersion === '8.0+' || options.phpVersion === '8.2+';
  const isPhp82 = options.phpVersion === '8.2+';

  const classModifier = isPhp82 && options.readonlyProperties ? 'readonly ' : '';
  const implementsClause = options.includeJsonSerialize ? ' implements JsonSerializable' : '';

  lines.push(`${classModifier}class ${cls.name}${implementsClause}`);
  lines.push('{');

  if (isPhp8 && options.useConstructorPromotion) {
    // Constructor Property Promotion
    lines.push('    public function __construct(');
    cls.fields.forEach((f, idx) => {
      const isLast = idx === cls.fields.length - 1;
      const nullablePrefix = f.isNullable && f.type !== 'mixed' ? '?' : '';
      const typeHint = options.typedProperties && f.type !== 'mixed' ? `${nullablePrefix}${f.type} ` : '';
      const readonlyMod = !isPhp82 && options.readonlyProperties ? 'readonly ' : '';
      const defaultVal = f.isNullable ? ' = null' : '';
      lines.push(`        public ${readonlyMod}${typeHint}$${f.propName}${defaultVal}${isLast ? '' : ','}`);
    });
    lines.push('    ) {}');
  } else {
    // Traditional Properties
    for (const f of cls.fields) {
      if (options.includeDocBlocks && f.docType) {
        lines.push(`    /** @var ${f.docType}${f.isNullable ? '|null' : ''} */`);
      }
      const nullablePrefix = f.isNullable && f.type !== 'mixed' ? '?' : '';
      const typeHint = options.typedProperties && f.type !== 'mixed' ? `${nullablePrefix}${f.type} ` : '';
      lines.push(`    public ${typeHint}$${f.propName};`);
    }

    lines.push('');
    lines.push('    public function __construct(');
    cls.fields.forEach((f, idx) => {
      const isLast = idx === cls.fields.length - 1;
      const nullablePrefix = f.isNullable && f.type !== 'mixed' ? '?' : '';
      const typeHint = options.typedProperties && f.type !== 'mixed' ? `${nullablePrefix}${f.type} ` : '';
      const defaultVal = f.isNullable ? ' = null' : '';
      lines.push(`        ${typeHint}$${f.propName}${defaultVal}${isLast ? '' : ','}`);
    });
    lines.push('    ) {');
    for (const f of cls.fields) {
      lines.push(`        $this->${f.propName} = $${f.propName};`);
    }
    lines.push('    }');
  }

  // fromArray factory
  if (options.includeFromArray) {
    lines.push('');
    lines.push(`    public static function fromArray(array $data): self`);
    lines.push('    {');
    lines.push(`        return new self(`);
    cls.fields.forEach((f, idx) => {
      const isLast = idx === cls.fields.length - 1;
      if (f.isClass) {
        lines.push(
          `            isset($data['${f.jsonKey}']) && is_array($data['${f.jsonKey}'])` +
          `\n                ? ${f.type}::fromArray($data['${f.jsonKey}'])` +
          `\n                : null${isLast ? '' : ','}`
        );
      } else if (f.isClassArray && f.arrayItemClass) {
        lines.push(
          `            isset($data['${f.jsonKey}']) && is_array($data['${f.jsonKey}'])` +
          `\n                ? array_map(fn(array $item) => ${f.arrayItemClass}::fromArray($item), $data['${f.jsonKey}'])` +
          `\n                : []${isLast ? '' : ','}`
        );
      } else {
        lines.push(`            $data['${f.jsonKey}'] ?? null${isLast ? '' : ','}`);
      }
    });
    lines.push('        );');
    lines.push('    }');

    // fromJson helper
    lines.push('');
    lines.push(`    public static function fromJson(string $json): self`);
    lines.push('    {');
    lines.push(`        $data = json_decode($json, true);`);
    lines.push(`        if (!is_array($data)) {`);
    lines.push(`            throw new \\InvalidArgumentException('Invalid JSON payload');`);
    lines.push(`        }`);
    lines.push(`        return self::fromArray($data);`);
    lines.push('    }');
  }

  // toArray
  lines.push('');
  lines.push('    public function toArray(): array');
  lines.push('    {');
  lines.push('        return [');
  for (const f of cls.fields) {
    if (f.isClass) {
      lines.push(`            '${f.jsonKey}' => $this->${f.propName}?->toArray(),`);
    } else if (f.isClassArray) {
      lines.push(`            '${f.jsonKey}' => array_map(fn($item) => $item->toArray(), $this->${f.propName} ?? []),`);
    } else {
      lines.push(`            '${f.jsonKey}' => $this->${f.propName},`);
    }
  }
  lines.push('        ];');
  lines.push('    }');

  // jsonSerialize
  if (options.includeJsonSerialize) {
    lines.push('');
    lines.push('    public function jsonSerialize(): mixed');
    lines.push('    {');
    lines.push('        return $this->toArray();');
    lines.push('    }');
  }

  lines.push('}');
  return lines.join('\n');
}

function sanitizePhpName(name: string): string {
  const clean = name.replace(/[^a-zA-Z0-9_]/g, '');
  if (!clean) return 'PhpModel';
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}

function toCamelCase(str: string): string {
  return str
    .replace(/[-_ ]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
    .replace(/^[A-Z]/, c => c.toLowerCase());
}

function toSingular(str: string): string {
  if (str.endsWith('ies')) return str.slice(0, -3) + 'y';
  if (str.endsWith('es') && !str.endsWith('ses')) return str.slice(0, -2);
  if (str.endsWith('s') && !str.endsWith('ss')) return str.slice(0, -1);
  return str;
}

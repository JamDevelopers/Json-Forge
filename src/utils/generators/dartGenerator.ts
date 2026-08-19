import { DartGeneratorOptions } from '../../types';

interface ClassDefinition {
  name: string;
  fields: {
    jsonKey: string;
    dartName: string;
    type: string;
    isNullable: boolean;
    isCustomClass: boolean;
    isList: boolean;
    listElementType?: string;
    isPrimitiveList?: boolean;
  }[];
}

export function generateDartModel(rawJson: string, options: DartGeneratorOptions): string {
  if (!rawJson.trim()) return '// Paste valid JSON to generate Dart models';

  let parsed: any;
  try {
    parsed = JSON.parse(rawJson);
  } catch (e: any) {
    return `// Invalid JSON: ${e.message}`;
  }

  const classes: ClassDefinition[] = [];
  const rootName = sanitizeClassName(options.rootClassName || 'RootModel');

  if (Array.isArray(parsed)) {
    if (parsed.length > 0 && typeof parsed[0] === 'object' && parsed[0] !== null) {
      extractClasses(parsed[0], rootName, classes, options);
    } else {
      return `// JSON is a primitive array: List<${getDartPrimitiveType(parsed[0])}>`;
    }
  } else if (typeof parsed === 'object' && parsed !== null) {
    extractClasses(parsed, rootName, classes, options);
  } else {
    return `// JSON root is not an object or array: ${typeof parsed}`;
  }

  // Generate code for all extracted classes (starting with root, then sub-models)
  const codeBlocks = classes.map(cls => formatDartClass(cls, options));

  const header = options.equatable
    ? `import 'package:equatable/equatable.dart';\n\n`
    : '';

  return header + codeBlocks.join('\n\n');
}

function extractClasses(
  obj: Record<string, any>,
  className: string,
  classes: ClassDefinition[],
  options: DartGeneratorOptions
) {
  // Avoid duplicate classes
  if (classes.some(c => c.name === className)) return;

  const currentClass: ClassDefinition = {
    name: className,
    fields: [],
  };
  classes.push(currentClass);

  for (const [key, value] of Object.entries(obj)) {
    const dartName = options.camelCaseProperties ? toCamelCase(key) : sanitizeIdentifier(key);
    let type = 'dynamic';
    let isCustomClass = false;
    let isList = false;
    let listElementType: string | undefined = undefined;
    let isPrimitiveList = false;
    const isNullable = value === null || options.nullSafe;

    if (value === null) {
      type = 'dynamic';
    } else if (typeof value === 'string') {
      type = 'String';
    } else if (typeof value === 'number') {
      type = Number.isInteger(value) ? 'int' : 'double';
    } else if (typeof value === 'boolean') {
      type = 'bool';
    } else if (Array.isArray(value)) {
      isList = true;
      if (value.length > 0) {
        const firstItem = value[0];
        if (typeof firstItem === 'object' && firstItem !== null) {
          const subClassName = sanitizeClassName(toSingular(key) || `${className}Item`);
          listElementType = subClassName;
          type = `List<${subClassName}>`;
          isCustomClass = true;
          extractClasses(firstItem, subClassName, classes, options);
        } else {
          const primType = getDartPrimitiveType(firstItem);
          listElementType = primType;
          type = `List<${primType}>`;
          isPrimitiveList = true;
        }
      } else {
        type = 'List<dynamic>';
      }
    } else if (typeof value === 'object') {
      const subClassName = sanitizeClassName(key);
      type = subClassName;
      isCustomClass = true;
      extractClasses(value, subClassName, classes, options);
    }

    currentClass.fields.push({
      jsonKey: key,
      dartName,
      type,
      isNullable,
      isCustomClass,
      isList,
      listElementType,
      isPrimitiveList,
    });
  }
}

function formatDartClass(cls: ClassDefinition, options: DartGeneratorOptions): string {
  const nullSuffix = options.nullSafe ? '?' : '';
  const lines: string[] = [];

  const extendsClause = options.equatable ? ' extends Equatable' : '';
  lines.push(`class ${cls.name}${extendsClause} {`);

  // Fields
  for (const f of cls.fields) {
    const fieldType = options.nullSafe && f.type !== 'dynamic' && !f.type.endsWith('?')
      ? `${f.type}?`
      : f.type;
    lines.push(`  final ${fieldType} ${f.dartName};`);
  }
  lines.push('');

  // Constructor
  lines.push(`  const ${cls.name}({`);
  for (const f of cls.fields) {
    lines.push(`    this.${f.dartName},`);
  }
  lines.push('  });');
  lines.push('');

  // fromJson
  if (options.includeFromJson) {
    lines.push(`  factory ${cls.name}.fromJson(Map<String, dynamic> json) {`);
    lines.push(`    return ${cls.name}(`);
    for (const f of cls.fields) {
      if (f.isCustomClass && f.isList && f.listElementType) {
        lines.push(
          `      ${f.dartName}: json['${f.jsonKey}'] != null` +
          `\n          ? (json['${f.jsonKey}'] as List<dynamic>)` +
          `\n              .map((e) => ${f.listElementType}.fromJson(e as Map<String, dynamic>))` +
          `\n              .toList()` +
          `\n          : null,`
        );
      } else if (f.isCustomClass) {
        lines.push(
          `      ${f.dartName}: json['${f.jsonKey}'] != null` +
          `\n          ? ${f.type}.fromJson(json['${f.jsonKey}'] as Map<String, dynamic>)` +
          `\n          : null,`
        );
      } else if (f.isPrimitiveList && f.listElementType) {
        lines.push(
          `      ${f.dartName}: json['${f.jsonKey}'] != null` +
          `\n          ? List<${f.listElementType}>.from(json['${f.jsonKey}'])` +
          `\n          : null,`
        );
      } else if (f.type === 'double') {
        lines.push(`      ${f.dartName}: (json['${f.jsonKey}'] as num?)?.toDouble(),`);
      } else if (f.type === 'int') {
        lines.push(`      ${f.dartName}: json['${f.jsonKey}'] as int?,`);
      } else if (f.type === 'String') {
        lines.push(`      ${f.dartName}: json['${f.jsonKey}'] as String?,`);
      } else if (f.type === 'bool') {
        lines.push(`      ${f.dartName}: json['${f.jsonKey}'] as bool?,`);
      } else {
        lines.push(`      ${f.dartName}: json['${f.jsonKey}'],`);
      }
    }
    lines.push('    );');
    lines.push('  }');
    lines.push('');
  }

  // toJson
  if (options.includeToJson) {
    lines.push('  Map<String, dynamic> toJson() {');
    lines.push('    final Map<String, dynamic> data = <String, dynamic>{};');
    for (const f of cls.fields) {
      if (f.isCustomClass && f.isList) {
        lines.push(`    if (${f.dartName} != null) {`);
        lines.push(`      data['${f.jsonKey}'] = ${f.dartName}!.map((v) => v.toJson()).toList();`);
        lines.push(`    }`);
      } else if (f.isCustomClass) {
        lines.push(`    if (${f.dartName} != null) {`);
        lines.push(`      data['${f.jsonKey}'] = ${f.dartName}!.toJson();`);
        lines.push(`    }`);
      } else {
        lines.push(`    data['${f.jsonKey}'] = ${f.dartName};`);
      }
    }
    lines.push('    return data;');
    lines.push('  }');
    lines.push('');
  }

  // copyWith
  if (options.includeCopyWith) {
    lines.push(`  ${cls.name} copyWith({`);
    for (const f of cls.fields) {
      const type = f.type !== 'dynamic' && !f.type.endsWith('?') ? `${f.type}?` : f.type;
      lines.push(`    ${type} ${f.dartName},`);
    }
    lines.push('  }) {');
    lines.push(`    return ${cls.name}(`);
    for (const f of cls.fields) {
      lines.push(`      ${f.dartName}: ${f.dartName} ?? this.${f.dartName},`);
    }
    lines.push('    );');
    lines.push('  }');
    lines.push('');
  }

  // Equatable props or toString
  if (options.equatable) {
    lines.push('  @override');
    lines.push('  List<Object?> get props => [');
    for (const f of cls.fields) {
      lines.push(`        ${f.dartName},`);
    }
    lines.push('      ];');
  } else if (options.includeToString) {
    lines.push('  @override');
    lines.push('  String toString() {');
    const fieldStrings = cls.fields.map(f => `${f.dartName}: \$${f.dartName}`).join(', ');
    lines.push(`    return '${cls.name}(${fieldStrings})';`);
    lines.push('  }');
  }

  lines.push('}');
  return lines.join('\n');
}

function getDartPrimitiveType(val: any): string {
  if (typeof val === 'string') return 'String';
  if (typeof val === 'number') return Number.isInteger(val) ? 'int' : 'double';
  if (typeof val === 'boolean') return 'bool';
  return 'dynamic';
}

function sanitizeClassName(name: string): string {
  const clean = name.replace(/[^a-zA-Z0-9_]/g, '');
  if (!clean) return 'Model';
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}

function sanitizeIdentifier(name: string): string {
  let clean = name.replace(/[^a-zA-Z0-9_]/g, '_');
  if (/^[0-9]/.test(clean)) clean = `_${clean}`;
  return clean;
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

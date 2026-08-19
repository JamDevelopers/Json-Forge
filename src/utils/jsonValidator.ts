import { ValidationState, JsonStats, FormatOptions } from '../types';

/**
 * Parses JSON and locates precise line and column if an error occurs.
 */
export function validateJson(rawText: string): ValidationState {
  if (!rawText.trim()) {
    return {
      isValid: true,
      error: null,
      line: null,
      column: null,
      position: null,
    };
  }

  try {
    JSON.parse(rawText);
    return {
      isValid: true,
      error: null,
      line: null,
      column: null,
      position: null,
    };
  } catch (err: any) {
    const errorMsg = err.message || 'Invalid JSON';
    
    // Extract position from message if available (e.g., "Unexpected token ' in JSON at position 23")
    let position: number | null = null;
    const posMatch = errorMsg.match(/position\s+(\d+)/i);
    if (posMatch) {
      position = parseInt(posMatch[1], 10);
    }

    // Extract line/column if provided directly by parser (e.g., "line 2 column 5")
    let line: number | null = null;
    let column: number | null = null;
    const lineColMatch = errorMsg.match(/line\s+(\d+)\s+column\s+(\d+)/i);
    if (lineColMatch) {
      line = parseInt(lineColMatch[1], 10);
      column = parseInt(lineColMatch[2], 10);
    } else if (position !== null) {
      // Calculate line and column from position
      const lines = rawText.slice(0, position).split('\n');
      line = lines.length;
      column = lines[lines.length - 1].length + 1;
    }

    // Check if auto-fixable
    const fixable = canAutoFix(rawText);

    return {
      isValid: false,
      error: errorMsg,
      line,
      column,
      position,
      suggestion: getDiagnosticSuggestion(errorMsg, rawText, position),
      autoFixable: fixable,
    };
  }
}

/**
 * Checks if common syntax errors (trailing commas, single quotes, unquoted keys, Python literals) exist.
 */
function canAutoFix(text: string): boolean {
  // Check for trailing commas
  if (/,\s*[}\]]/.test(text)) return true;
  // Check for single quotes
  if (/'[^']*'/.test(text)) return true;
  // Check for unquoted keys
  if (/([{,]\s*)([a-zA-Z0-9_$]+)\s*:/m.test(text)) return true;
  // Check for Python literals (True, False, None)
  if (/\b(True|False|None)\b/.test(text)) return true;
  return false;
}

/**
 * Provides a helpful diagnostic tip based on the error
 */
function getDiagnosticSuggestion(msg: string, text: string, pos: number | null): string {
  if (/trailing comma|extra comma/i.test(msg) || (/,\s*[}\]]/.test(text))) {
    return 'Detected trailing comma before closing bracket/brace. Click "Auto-Fix" to remove it.';
  }
  if (msg.includes("'") || /'[^']*'/.test(text)) {
    return 'JSON strictly requires double quotes (") for strings and keys instead of single quotes (\').';
  }
  if (/unexpected token/i.test(msg) && /([{,]\s*)([a-zA-Z0-9_$]+)\s*:/.test(text)) {
    return 'Object keys must be wrapped in double quotes (e.g. "key": value).';
  }
  if (/\b(True|False|None)\b/.test(text)) {
    return 'Python literals detected (True/False/None). Use lowercase true, false, or null in JSON.';
  }
  if (pos !== null && pos >= text.length - 1) {
    return 'Unclosed object or array. Check for missing closing } or ].';
  }
  return 'Check for missing commas between key-value pairs or mismatched brackets.';
}

/**
 * Auto-repairs malformed JSON / JS Object literals / Python dicts into valid JSON.
 */
export function autoFixJson(rawText: string): { fixed: string; success: boolean; changes: string[] } {
  const changes: string[] = [];
  let text = rawText.trim();

  if (!text) {
    return { fixed: '{}', success: true, changes: ['Empty input converted to empty object'] };
  }

  // 1. Replace Python boolean/null literals
  if (/\b(True|False|None)\b/.test(text)) {
    text = text
      .replace(/\bTrue\b/g, 'true')
      .replace(/\bFalse\b/g, 'false')
      .replace(/\bNone\b/g, 'null');
    changes.push('Replaced Python literals (True/False/None) with true/false/null');
  }

  // 2. Replace undefined with null
  if (/\bundefined\b/.test(text)) {
    text = text.replace(/\bundefined\b/g, 'null');
    changes.push('Replaced "undefined" with "null"');
  }

  // 3. Remove single-line JS comments (// ...) and multi-line comments (/* ... */)
  if (/\/\/.*|\/\*[\s\S]*?\*\//.test(text)) {
    text = text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
    changes.push('Removed JavaScript comments');
  }

  // 4. Convert single-quoted keys and strings to double quotes, taking care of escaping
  // We can use a regex tokenizer for string literals
  text = text.replace(/'((?:\\.|[^'])*)'/g, (_, content) => {
    // Escape unescaped double quotes inside
    const escaped = content.replace(/"/g, '\\"').replace(/\\'/g, "'");
    return `"${escaped}"`;
  });

  // 5. Quote unquoted keys (e.g. { foo: "bar", $baz_1: 123 })
  text = text.replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$-]*)\s*:/g, (match, prefix, key) => {
    return `${prefix}"${key}":`;
  });

  // 6. Remove trailing commas in objects and arrays
  text = text.replace(/,(\s*[}\]])/g, '$1');

  // 7. Check if balanced brackets/braces
  let openBrace = 0;
  let openBracket = 0;
  let inString = false;
  let isEscaped = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (isEscaped) {
      isEscaped = false;
      continue;
    }
    if (char === '\\') {
      isEscaped = true;
      continue;
    }
    if (char === '"') {
      inString = !inString;
      continue;
    }
    if (!inString) {
      if (char === '{') openBrace++;
      else if (char === '}') openBrace = Math.max(0, openBrace - 1);
      else if (char === '[') openBracket++;
      else if (char === ']') openBracket = Math.max(0, openBracket - 1);
    }
  }

  // Append missing closing brackets if needed
  if (openBrace > 0 || openBracket > 0) {
    for (let i = 0; i < openBracket; i++) text += '\n]';
    for (let i = 0; i < openBrace; i++) text += '\n}';
    changes.push('Appended missing closing braces/brackets');
  }

  // Final validation check
  try {
    const parsed = JSON.parse(text);
    const formatted = JSON.stringify(parsed, null, 2);
    changes.push('Validated & formatted into standard RFC 8259 JSON');
    return { fixed: formatted, success: true, changes };
  } catch (err: any) {
    // If still failing, attempt fallback via Function constructor (evaluating JS literal safely)
    try {
      const evalSafe = new Function(`"use strict"; return (${rawText});`)();
      const formatted = JSON.stringify(evalSafe, null, 2);
      return {
        fixed: formatted,
        success: true,
        changes: ['Parsed as JavaScript Object Literal and converted to valid JSON'],
      };
    } catch {
      return { fixed: text, success: false, changes: ['Auto-fix could not resolve all syntax errors'] };
    }
  }
}

/**
 * Formats JSON with options (indent, sort keys, remove nulls, unescape strings)
 */
export function formatJson(rawText: string, options: FormatOptions): string {
  if (!rawText.trim()) return '';
  const parsed = JSON.parse(rawText);

  let processed = parsed;
  if (options.removeNulls) {
    processed = removeNullValues(processed);
  }
  if (options.sortKeys !== 'none') {
    processed = sortObjectKeys(processed, options.sortKeys === 'asc');
  }

  const indentStr = options.indent === 'tab' ? '\t' : options.indent;
  let result = JSON.stringify(processed, null, indentStr);

  if (options.unescapeStrings) {
    // Unescape unicode and slashes if desired
    result = result.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => 
      String.fromCharCode(parseInt(hex, 16))
    );
  }

  return result;
}

/**
 * Minifies JSON into a single tight line.
 */
export function minifyJson(rawText: string): string {
  if (!rawText.trim()) return '';
  const parsed = JSON.parse(rawText);
  return JSON.stringify(parsed);
}

/**
 * Sorts object keys recursively
 */
function sortObjectKeys(obj: any, ascending = true): any {
  if (Array.isArray(obj)) {
    return obj.map(item => sortObjectKeys(item, ascending));
  }
  if (obj !== null && typeof obj === 'object') {
    const keys = Object.keys(obj).sort((a, b) => {
      return ascending ? a.localeCompare(b) : b.localeCompare(a);
    });
    const sorted: Record<string, any> = {};
    for (const key of keys) {
      sorted[key] = sortObjectKeys(obj[key], ascending);
    }
    return sorted;
  }
  return obj;
}

/**
 * Recursively removes null and undefined values
 */
function removeNullValues(obj: any): any {
  if (Array.isArray(obj)) {
    return obj
      .filter(item => item !== null && item !== undefined)
      .map(removeNullValues);
  }
  if (obj !== null && typeof obj === 'object') {
    const clean: Record<string, any> = {};
    for (const [key, val] of Object.entries(obj)) {
      if (val !== null && val !== undefined) {
        clean[key] = removeNullValues(val);
      }
    }
    return clean;
  }
  return obj;
}

/**
 * Computes payload metrics and deep structure statistics
 */
export function calculateJsonStats(rawText: string): JsonStats | null {
  if (!rawText.trim()) return null;

  try {
    const parsed = JSON.parse(rawText);
    const rawBytes = new Blob([rawText]).size;
    const formattedText = JSON.stringify(parsed, null, 2);
    const formattedBytes = new Blob([formattedText]).size;
    const minifiedText = JSON.stringify(parsed);
    const minifiedBytes = new Blob([minifiedText]).size;

    const savingsPercentage = rawBytes > 0 
      ? Math.max(0, Math.round(((rawBytes - minifiedBytes) / rawBytes) * 100))
      : 0;

    let totalKeys = 0;
    let maxDepth = 0;
    const typesCount = {
      objects: 0,
      arrays: 0,
      strings: 0,
      numbers: 0,
      booleans: 0,
      nulls: 0,
    };

    function traverse(node: any, currentDepth: number) {
      if (currentDepth > maxDepth) maxDepth = currentDepth;

      if (node === null) {
        typesCount.nulls++;
      } else if (Array.isArray(node)) {
        typesCount.arrays++;
        for (const item of node) {
          traverse(item, currentDepth + 1);
        }
      } else if (typeof node === 'object') {
        typesCount.objects++;
        const keys = Object.keys(node);
        totalKeys += keys.length;
        for (const key of keys) {
          traverse(node[key], currentDepth + 1);
        }
      } else if (typeof node === 'string') {
        typesCount.strings++;
      } else if (typeof node === 'number') {
        typesCount.numbers++;
      } else if (typeof node === 'boolean') {
        typesCount.booleans++;
      }
    }

    traverse(parsed, 1);

    return {
      rawBytes,
      formattedBytes,
      minifiedBytes,
      savingsPercentage,
      linesCount: rawText.split('\n').length,
      charactersCount: rawText.length,
      totalKeys,
      maxDepth,
      typesCount,
    };
  } catch {
    return null;
  }
}

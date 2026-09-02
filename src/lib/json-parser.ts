import { jsonrepair } from "jsonrepair";

export interface JsonParseResult {
  valid: boolean;
  data: unknown;
  error?: {
    message: string;
    line?: number;
    column?: number;
    snippet?: string;
  };
}

export interface JsonStats {
  byteSize: number;
  formattedSize: string;
  charCount: number;
  lineCount: number;
  totalKeys: number;
  maxDepth: number;
  objectCount: number;
  arrayCount: number;
  primitiveCount: number;
  nullCount: number;
}

/**
 * Parses JSON safely and extracts line/column info on failure
 */
export function parseJson(raw: string): JsonParseResult {
  if (!raw || raw.trim() === "") {
    return { valid: true, data: null };
  }

  try {
    const data = JSON.parse(raw);
    return { valid: true, data };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    
    // Extract line and column numbers from standard JSON parse error messages
    let line: number | undefined;
    let column: number | undefined;
    let snippet: string | undefined;

    const lineColMatch = message.match(/line (\d+) column (\d+)/i);
    const posMatch = message.match(/position (\d+)/i);

    if (lineColMatch) {
      line = parseInt(lineColMatch[1], 10);
      column = parseInt(lineColMatch[2], 10);
    } else if (posMatch) {
      const position = parseInt(posMatch[1], 10);
      const lines = raw.slice(0, position).split("\n");
      line = lines.length;
      column = lines[lines.length - 1].length + 1;
    }

    if (line !== undefined) {
      const rawLines = raw.split("\n");
      const targetLine = rawLines[line - 1] || "";
      snippet = targetLine.trim();
    }

    return {
      valid: false,
      data: null,
      error: {
        message: cleanErrorMessage(message),
        line,
        column,
        snippet,
      },
    };
  }
}

function cleanErrorMessage(msg: string): string {
  return msg.replace(/^JSON\.parse:\s*/i, "").replace(/^SyntaxError:\s*/i, "");
}

/**
 * Repairs malformed JSON using jsonrepair
 */
export function repairJsonString(raw: string): { success: boolean; repaired: string; error?: string } {
  try {
    const repaired = jsonrepair(raw);
    return { success: true, repaired };
  } catch (err) {
    return {
      success: false,
      repaired: raw,
      error: err instanceof Error ? err.message : "Failed to repair JSON",
    };
  }
}

/**
 * Formats JSON with customizable indentation
 */
export function formatJson(data: unknown, indent: number | string = 2): string {
  try {
    return JSON.stringify(data, null, indent);
  } catch {
    return String(data);
  }
}

/**
 * Minifies JSON string or object
 */
export function minifyJson(input: unknown): string {
  try {
    if (typeof input === "string") {
      const parsed = JSON.parse(input);
      return JSON.stringify(parsed);
    }
    return JSON.stringify(input);
  } catch {
    return typeof input === "string" ? input.replace(/\s+/g, "") : String(input);
  }
}

/**
 * Recursively sorts keys of an object in alphabetical or reverse order
 */
export function sortJsonKeys(data: unknown, order: "asc" | "desc" = "asc"): unknown {
  if (data === null || typeof data !== "object") {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => sortJsonKeys(item, order));
  }

  const keys = Object.keys(data as Record<string, unknown>);
  keys.sort((a, b) => {
    return order === "asc" ? a.localeCompare(b) : b.localeCompare(a);
  });

  const sortedObj: Record<string, unknown> = {};
  for (const key of keys) {
    sortedObj[key] = sortJsonKeys((data as Record<string, unknown>)[key], order);
  }

  return sortedObj;
}

/**
 * Removes null and undefined fields recursively
 */
export function removeNullValues(data: unknown): unknown {
  if (data === null || data === undefined) return undefined;
  if (typeof data !== "object") return data;

  if (Array.isArray(data)) {
    return data
      .map((item) => removeNullValues(item))
      .filter((item) => item !== undefined && item !== null);
  }

  const cleaned: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(data as Record<string, unknown>)) {
    if (val !== null && val !== undefined) {
      const cleanedVal = removeNullValues(val);
      if (cleanedVal !== undefined) {
        cleaned[key] = cleanedVal;
      }
    }
  }
  return cleaned;
}

/**
 * Convert all object keys case (camelCase, snake_case, kebab-case, PascalCase)
 */
export function transformKeysCase(
  data: unknown,
  format: "camel" | "snake" | "kebab" | "pascal"
): unknown {
  if (data === null || typeof data !== "object") return data;
  if (Array.isArray(data)) return data.map((item) => transformKeysCase(item, format));

  const transformed: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(data as Record<string, unknown>)) {
    let newKey = key;
    const words = key
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/[_-]+/g, " ")
      .trim()
      .split(/\s+/);

    if (format === "camel") {
      newKey = words
        .map((w, idx) => (idx === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()))
        .join("");
    } else if (format === "snake") {
      newKey = words.map((w) => w.toLowerCase()).join("_");
    } else if (format === "kebab") {
      newKey = words.map((w) => w.toLowerCase()).join("-");
    } else if (format === "pascal") {
      newKey = words.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join("");
    }

    transformed[newKey] = transformKeysCase(val, format);
  }
  return transformed;
}

/**
 * Flattens nested JSON into dot-notation map
 */
export function flattenJson(data: unknown, prefix = ""): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  function recurse(cur: unknown, prop: string) {
    if (cur === null || cur === undefined) {
      result[prop] = cur;
    } else if (Array.isArray(cur)) {
      if (cur.length === 0) {
        result[prop] = [];
      } else {
        cur.forEach((item, index) => {
          recurse(item, prop ? `${prop}[${index}]` : `[${index}]`);
        });
      }
    } else if (typeof cur === "object") {
      const keys = Object.keys(cur as Record<string, unknown>);
      if (keys.length === 0) {
        result[prop] = {};
      } else {
        keys.forEach((key) => {
          recurse(
            (cur as Record<string, unknown>)[key],
            prop ? `${prop}.${key}` : key
          );
        });
      }
    } else {
      result[prop] = cur;
    }
  }

  recurse(data, prefix);
  return result;
}

/**
 * Computes deep structural statistics of the JSON
 */
export function calculateJsonStats(data: unknown, rawText?: string): JsonStats {
  let totalKeys = 0;
  let maxDepth = 0;
  let objectCount = 0;
  let arrayCount = 0;
  let primitiveCount = 0;
  let nullCount = 0;

  function traverse(node: unknown, depth: number) {
    if (depth > maxDepth) maxDepth = depth;

    if (node === null) {
      nullCount++;
      return;
    }

    if (Array.isArray(node)) {
      arrayCount++;
      for (const item of node) {
        traverse(item, depth + 1);
      }
    } else if (typeof node === "object") {
      objectCount++;
      const keys = Object.keys(node as Record<string, unknown>);
      totalKeys += keys.length;
      for (const key of keys) {
        traverse((node as Record<string, unknown>)[key], depth + 1);
      }
    } else {
      primitiveCount++;
    }
  }

  traverse(data, 0);

  const text = rawText !== undefined ? rawText : JSON.stringify(data, null, 2) || "";
  const byteSize = new Blob([text]).size;
  const lineCount = text ? text.split("\n").length : 0;
  const charCount = text ? text.length : 0;

  let formattedSize = `${byteSize} B`;
  if (byteSize >= 1024 * 1024) {
    formattedSize = `${(byteSize / (1024 * 1024)).toFixed(2)} MB`;
  } else if (byteSize >= 1024) {
    formattedSize = `${(byteSize / 1024).toFixed(1)} KB`;
  }

  return {
    byteSize,
    formattedSize,
    charCount,
    lineCount,
    totalKeys,
    maxDepth,
    objectCount,
    arrayCount,
    primitiveCount,
    nullCount,
  };
}

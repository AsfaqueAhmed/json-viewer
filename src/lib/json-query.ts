import { JSONPath } from "jsonpath-plus";

export type QueryEngine = "jsonpath" | "javascript";

export interface QueryRecipe {
  id: string;
  name: string;
  engine: QueryEngine;
  query: string;
  description: string;
}

export interface QueryResult {
  success: boolean;
  data: unknown;
  executionTimeMs: number;
  resultCount?: number;
  error?: string;
}

export const QUERY_RECIPES: QueryRecipe[] = [
  {
    id: "jp-all-keys",
    name: "JSONPath: Extract All Names / IDs",
    engine: "jsonpath",
    query: "$..name",
    description: "Recursively extract all values for the key 'name' anywhere in the document.",
  },
  {
    id: "jp-first-level",
    name: "JSONPath: First 3 Array Items",
    engine: "jsonpath",
    query: "$[0:3]",
    description: "Slice the first 3 elements of a root array.",
  },
  {
    id: "jp-nested-users",
    name: "JSONPath: Filter Array Where Verified is True",
    engine: "jsonpath",
    query: "$.data.users[?(@.profile.verified === true)]",
    description: "Extract verified users using conditional filter expression.",
  },
  {
    id: "js-filter-price",
    name: "JS: Filter Products by Price > 500",
    engine: "javascript",
    query: `// Filter items where price exceeds $500
(data) => {
  const items = Array.isArray(data) ? data : data?.data?.users || [];
  return items.filter(item => (item.price || item.rating || 0) > 4);
}`,
    description: "Filter items using standard JavaScript array filter.",
  },
  {
    id: "js-pluck",
    name: "JS: Pluck Specific Fields (Name & Email)",
    engine: "javascript",
    query: `// Pluck id, username and email into a clean simplified table
(data) => {
  const list = data?.data?.users || (Array.isArray(data) ? data : []);
  return list.map(item => ({
    id: item.id,
    name: item.username || item.title || item.name,
    email: item.email || item.category,
  }));
}`,
    description: "Map and pick only the fields you need.",
  },
  {
    id: "js-aggregate-sum",
    name: "JS: Aggregate Sum & Average",
    engine: "javascript",
    query: `// Compute total sum and average of prices
(data) => {
  const items = Array.isArray(data) ? data : [];
  const prices = items.map(i => i.price).filter(p => typeof p === 'number');
  const sum = prices.reduce((acc, val) => acc + val, 0);
  return {
    count: prices.length,
    totalSum: Number(sum.toFixed(2)),
    averagePrice: prices.length ? Number((sum / prices.length).toFixed(2)) : 0,
    min: Math.min(...prices),
    max: Math.max(...prices),
  };
}`,
    description: "Compute metrics, totals, averages, min, and max.",
  },
  {
    id: "js-group-by",
    name: "JS: Group Array by Category/Field",
    engine: "javascript",
    query: `// Group items by category or role
(data) => {
  const items = Array.isArray(data) ? data : [];
  return items.reduce((acc, item) => {
    const key = item.category || item.brand || 'Uncategorized';
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});
}`,
    description: "Group an array of objects by any property.",
  },
];

/**
 * Executes a JSONPath query against input data
 */
export function executeJsonPath(data: unknown, path: string): QueryResult {
  const start = performance.now();
  try {
    if (!path || path.trim() === "") {
      return { success: true, data, executionTimeMs: 0 };
    }

    const result = JSONPath({
      path: path.trim(),
      json: data as object | unknown[],
      wrap: true,
    });

    const executionTimeMs = Number((performance.now() - start).toFixed(2));
    const resultCount = Array.isArray(result) ? result.length : 1;

    return {
      success: true,
      data: result.length === 1 ? result[0] : result,
      executionTimeMs,
      resultCount,
    };
  } catch (err) {
    return {
      success: false,
      data: null,
      executionTimeMs: Number((performance.now() - start).toFixed(2)),
      error: err instanceof Error ? err.message : "JSONPath evaluation error",
    };
  }
}

/**
 * Executes a JavaScript transformation safely
 */
export function executeJavaScriptQuery(data: unknown, code: string): QueryResult {
  const start = performance.now();
  try {
    const trimmed = code.trim();
    let fn: (d: unknown) => unknown;

    if (trimmed.startsWith("(") || trimmed.startsWith("function") || trimmed.includes("=>")) {
      // Evaluate function expression
      fn = (new Function(`"use strict"; return (${trimmed})`)()) as (d: unknown) => unknown;
    } else {
      // Evaluate function body
      fn = (new Function("data", `"use strict"; ${trimmed}`)) as (d: unknown) => unknown;
    }

    const result = fn(data);
    const executionTimeMs = Number((performance.now() - start).toFixed(2));
    const resultCount = Array.isArray(result) ? result.length : (result && typeof result === "object" ? Object.keys(result).length : 1);

    return {
      success: true,
      data: result,
      executionTimeMs,
      resultCount,
    };
  } catch (err) {
    return {
      success: false,
      data: null,
      executionTimeMs: Number((performance.now() - start).toFixed(2)),
      error: err instanceof Error ? err.message : "JavaScript execution error",
    };
  }
}

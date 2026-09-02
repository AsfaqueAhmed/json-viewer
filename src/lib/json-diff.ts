export type DiffType = "added" | "removed" | "modified" | "type_changed" | "unchanged";

export interface DiffItem {
  id: string;
  path: string;
  type: DiffType;
  leftValue?: unknown;
  rightValue?: unknown;
  leftType?: string;
  rightType?: string;
  depth: number;
}

export interface DiffSummary {
  added: number;
  removed: number;
  modified: number;
  typeChanged: number;
  totalDiffs: number;
  identical: boolean;
}

export interface DiffResult {
  diffs: DiffItem[];
  summary: DiffSummary;
}

function getType(val: unknown): string {
  if (val === null) return "null";
  if (Array.isArray(val)) return "array";
  return typeof val;
}

/**
 * Deeply compares two JSON structures and generates fine-grained semantic diffs
 */
export function computeJsonDiff(
  left: unknown,
  right: unknown,
  options: { ignoreKeyOrder?: boolean } = { ignoreKeyOrder: true }
): DiffResult {
  const diffs: DiffItem[] = [];
  let addedCount = 0;
  let removedCount = 0;
  let modifiedCount = 0;
  let typeChangedCount = 0;

  let counter = 0;
  function getUniqueId() {
    return `diff_${++counter}`;
  }

  function compareNodes(lVal: unknown, rVal: unknown, currentPath: string, depth: number) {
    const lType = getType(lVal);
    const rType = getType(rVal);

    if (lVal === undefined && rVal !== undefined) {
      diffs.push({
        id: getUniqueId(),
        path: currentPath,
        type: "added",
        rightValue: rVal,
        rightType: rType,
        depth,
      });
      addedCount++;
      return;
    }

    if (lVal !== undefined && rVal === undefined) {
      diffs.push({
        id: getUniqueId(),
        path: currentPath,
        type: "removed",
        leftValue: lVal,
        leftType: lType,
        depth,
      });
      removedCount++;
      return;
    }

    if (lType !== rType) {
      diffs.push({
        id: getUniqueId(),
        path: currentPath,
        type: "type_changed",
        leftValue: lVal,
        rightValue: rVal,
        leftType: lType,
        rightType: rType,
        depth,
      });
      typeChangedCount++;
      return;
    }

    // Both are objects
    if (lType === "object" && lVal !== null && rVal !== null) {
      const lObj = lVal as Record<string, unknown>;
      const rObj = rVal as Record<string, unknown>;

      const lKeys = Object.keys(lObj);
      const rKeys = Object.keys(rObj);
      const allKeys = Array.from(new Set([...lKeys, ...rKeys]));

      if (options.ignoreKeyOrder) {
        allKeys.sort();
      }

      for (const key of allKeys) {
        const nextPath = currentPath ? `${currentPath}.${key}` : key;
        compareNodes(lObj[key], rObj[key], nextPath, depth + 1);
      }
      return;
    }

    // Both are arrays
    if (lType === "array") {
      const lArr = lVal as unknown[];
      const rArr = rVal as unknown[];
      const maxLen = Math.max(lArr.length, rArr.length);

      for (let i = 0; i < maxLen; i++) {
        const nextPath = `${currentPath}[${i}]`;
        compareNodes(lArr[i], rArr[i], nextPath, depth + 1);
      }
      return;
    }

    // Primitives
    if (lVal !== rVal) {
      diffs.push({
        id: getUniqueId(),
        path: currentPath,
        type: "modified",
        leftValue: lVal,
        rightValue: rVal,
        leftType: lType,
        rightType: rType,
        depth,
      });
      modifiedCount++;
    }
  }

  compareNodes(left, right, "root", 0);

  const totalDiffs = addedCount + removedCount + modifiedCount + typeChangedCount;

  return {
    diffs,
    summary: {
      added: addedCount,
      removed: removedCount,
      modified: modifiedCount,
      typeChanged: typeChangedCount,
      totalDiffs,
      identical: totalDiffs === 0,
    },
  };
}

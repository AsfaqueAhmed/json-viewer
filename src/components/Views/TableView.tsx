"use client";

import React, { useState, useMemo } from "react";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Download,
  Search,
  Table as TableIcon,
  Copy,
  Check,
} from "lucide-react";
import { flattenJson } from "@/lib/json-parser";
import Papa from "papaparse";

interface TableViewProps {
  data: unknown;
}

export const TableView: React.FC<TableViewProps> = ({ data }) => {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [filterQuery, setFilterQuery] = useState("");
  const [copiedCell, setCopiedCell] = useState<string | null>(null);

  // Extract array of records. Compiler can't stably type this memo's varying
  // return shapes, so optimization is skipped; behavior is unaffected.
  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const arrayResult = useMemo(() => {
    if (Array.isArray(data)) {
      return { records: data, arraySourcePath: "root" };
    }

    if (data && typeof data === "object") {
      // Find first nested array
      const obj = data as Record<string, unknown>;
      for (const [key, val] of Object.entries(obj)) {
        if (Array.isArray(val) && val.length > 0) {
          return { records: val, arraySourcePath: key };
        }
        if (val && typeof val === "object") {
          for (const [nestedK, nestedV] of Object.entries(val as Record<string, unknown>)) {
            if (Array.isArray(nestedV) && nestedV.length > 0) {
              return { records: nestedV, arraySourcePath: `${key}.${nestedK}` };
            }
          }
        }
      }

      // If no array found, turn top-level object key-values into rows
      const keyValRows = Object.entries(obj).map(([k, v]) => ({
        property: k,
        type: v === null ? "null" : Array.isArray(v) ? `array[${v.length}]` : typeof v,
        value: typeof v === "object" ? JSON.stringify(v) : String(v),
      }));
      return { records: keyValRows, arraySourcePath: "object_properties" };
    }

    return { records: [], arraySourcePath: "none" };
  }, [data]);
  const { records, arraySourcePath } = arrayResult;

  // Flatten records for tabular presentation
  const flatRows = useMemo<Record<string, unknown>[]>(() => {
    return records.map((item) => {
      if (typeof item === "object" && item !== null) {
        return flattenJson(item);
      }
      return { value: item };
    });
  }, [records]);

  // Collect all unique column headers
  const columns = useMemo(() => {
    const headerSet = new Set<string>();
    flatRows.forEach((row) => {
      Object.keys(row).forEach((k) => headerSet.add(k));
    });
    return Array.from(headerSet);
  }, [flatRows]);

  // Filter and sort records
  const filteredRows = useMemo(() => {
    let result = [...flatRows];

    if (filterQuery.trim()) {
      const q = filterQuery.toLowerCase();
      result = result.filter((row) =>
        Object.values(row).some((val) =>
          String(val).toLowerCase().includes(q)
        )
      );
    }

    if (sortColumn) {
      result.sort((a, b) => {
        const valA = a[sortColumn];
        const valB = b[sortColumn];

        if (valA === valB) return 0;
        if (valA === undefined || valA === null) return 1;
        if (valB === undefined || valB === null) return -1;

        if (typeof valA === "number" && typeof valB === "number") {
          return sortDirection === "asc" ? valA - valB : valB - valA;
        }

        const strA = String(valA);
        const strB = String(valB);
        return sortDirection === "asc"
          ? strA.localeCompare(strB)
          : strB.localeCompare(strA);
      });
    }

    return result;
  }, [flatRows, filterQuery, sortColumn, sortDirection]);

  const handleSort = (col: string) => {
    if (sortColumn === col) {
      if (sortDirection === "asc") setSortDirection("desc");
      else {
        setSortColumn(null);
        setSortDirection("asc");
      }
    } else {
      setSortColumn(col);
      setSortDirection("asc");
    }
  };

  const handleCopyCell = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCell(id);
    setTimeout(() => setCopiedCell(null), 1500);
  };

  const handleExportCsv = () => {
    const csv = Papa.unparse(filteredRows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `table_export_${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!records.length) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-[var(--text-muted)] gap-2 p-6">
        <TableIcon size={36} className="opacity-40" />
        <p className="text-sm font-medium">No tabular dataset detected in this JSON.</p>
        <p className="text-xs">Provide a JSON array of objects or an object containing array items.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[var(--bg-primary)]">
      {/* Table Toolbar */}
      <div
        className="h-9 flex items-center justify-between border-b text-xs select-none flex-shrink-0"
        style={{
          backgroundColor: "var(--bg-secondary)",
          borderColor: "var(--border-subtle)",
          paddingLeft: "12px",
          paddingRight: "12px",
        }}
      >
        <div className="flex items-center gap-2">
          <span className="font-semibold text-[var(--text-primary)]">
            Table Source: <code className="text-[var(--json-key)] font-mono">{arraySourcePath}</code>
          </span>
          <span className="text-[var(--text-muted)] font-mono text-[11px]">
            ({filteredRows.length} of {flatRows.length} rows, {columns.length} columns)
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Search within table */}
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded border bg-[var(--bg-input)] border-[var(--border-color)]">
            <Search size={12} className="text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search table rows..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="bg-transparent border-none text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none w-36 font-mono"
            />
          </div>

          <div className="h-4 w-[1px] bg-[var(--border-color)] opacity-70 flex-shrink-0 self-center" />

          {/* Export CSV */}
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-1 text-xs rounded-md hover:bg-[var(--bg-hover)] text-[var(--text-primary)] transition-all font-medium"
          >
            <Download size={13} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse font-mono text-xs">
          <thead
            className="sticky top-0 z-10 select-none shadow-sm"
            style={{ backgroundColor: "var(--bg-secondary)" }}
          >
            <tr className="border-b" style={{ borderColor: "var(--border-color)" }}>
              <th className="px-3 py-2 text-[var(--text-muted)] w-10 text-center border-r border-[var(--border-subtle)]">
                #
              </th>
              {columns.map((col) => (
                <th
                  key={col}
                  onClick={() => handleSort(col)}
                  className="px-3 py-2 font-semibold text-[var(--text-primary)] hover:text-[var(--text-primary)] cursor-pointer hover:bg-[var(--bg-hover)] border-r border-[var(--border-subtle)] transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate max-w-[180px]">{col}</span>
                    {sortColumn === col ? (
                      sortDirection === "asc" ? (
                        <ArrowUp size={12} className="text-[var(--accent-primary)] flex-shrink-0" />
                      ) : (
                        <ArrowDown size={12} className="text-[var(--accent-primary)] flex-shrink-0" />
                      )
                    ) : (
                      <ArrowUpDown size={11} className="text-[var(--text-muted)] opacity-40 flex-shrink-0" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row, rowIdx) => (
              <tr
                key={rowIdx}
                className="border-b hover:bg-[var(--bg-hover)] transition-colors"
                style={{ borderColor: "var(--border-subtle)" }}
              >
                <td className="px-3 py-1.5 text-center text-[var(--text-muted)] text-[11px] border-r border-[var(--border-subtle)]">
                  {rowIdx + 1}
                </td>
                {columns.map((col) => {
                  const val = row[col];
                  const cellId = `${rowIdx}-${col}`;
                  const isNull = val === null || val === undefined;
                  const isBool = typeof val === "boolean";
                  const isNum = typeof val === "number";

                  return (
                    <td
                      key={col}
                      className="px-3 py-1.5 max-w-[220px] truncate border-r border-[var(--border-subtle)] relative group"
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span
                          className={`truncate ${
                            isNull
                              ? "text-[var(--json-null)] italic"
                              : isBool
                              ? "text-[var(--json-boolean)] font-semibold"
                              : isNum
                              ? "text-[var(--json-number)]"
                              : "text-[var(--text-primary)]"
                          }`}
                        >
                          {isNull ? "null" : String(val)}
                        </span>

                        <button
                          onClick={() => handleCopyCell(cellId, isNull ? "null" : String(val))}
                          title="Copy cell value"
                          className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-[var(--bg-active)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-opacity"
                        >
                          {copiedCell === cellId ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                        </button>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

import YAML from "yaml";
import Papa from "papaparse";
import { XMLBuilder, XMLParser } from "fast-xml-parser";
import { flattenJson } from "./json-parser";

export type DataFormat = "yaml" | "csv" | "xml" | "base64" | "querystring" | "markdown";

/**
 * Converts JSON to YAML
 */
export function jsonToYaml(data: unknown): string {
  try {
    return YAML.stringify(data, { indent: 2 });
  } catch (err) {
    return `# YAML Conversion Error: ${err instanceof Error ? err.message : String(err)}`;
  }
}

/**
 * Converts YAML to JSON string
 */
export function yamlToJson(yamlStr: string): string {
  try {
    const parsed = YAML.parse(yamlStr);
    return JSON.stringify(parsed, null, 2);
  } catch (err) {
    throw new Error(`YAML parsing error: ${err instanceof Error ? err.message : String(err)}`);
  }
}

/**
 * Converts JSON array / object to CSV
 */
export function jsonToCsv(data: unknown): string {
  try {
    const items = Array.isArray(data) ? data : [data];
    // Flatten each item to support nested properties
    const flattened = items.map((item) => (typeof item === "object" && item !== null ? flattenJson(item) : { value: item }));
    return Papa.unparse(flattened);
  } catch (err) {
    return `CSV Conversion Error: ${err instanceof Error ? err.message : String(err)}`;
  }
}

/**
 * Converts CSV to JSON string
 */
export function csvToJson(csvStr: string): string {
  try {
    const parsed = Papa.parse(csvStr, { header: true, dynamicTyping: true, skipEmptyLines: true });
    return JSON.stringify(parsed.data, null, 2);
  } catch (err) {
    throw new Error(`CSV parsing error: ${err instanceof Error ? err.message : String(err)}`);
  }
}

/**
 * Converts JSON to XML
 */
export function jsonToXml(data: unknown, rootTag = "root"): string {
  try {
    const builder = new XMLBuilder({
      format: true,
      indentBy: "  ",
      ignoreAttributes: false,
    });
    const wrapped = typeof data === "object" && data !== null && !Array.isArray(data) ? data : { [rootTag]: data };
    return `<?xml version="1.0" encoding="UTF-8"?>\n` + builder.build(wrapped);
  } catch (err) {
    return `<!-- XML Conversion Error: ${err instanceof Error ? err.message : String(err)} -->`;
  }
}

/**
 * Converts XML to JSON
 */
export function xmlToJson(xmlStr: string): string {
  try {
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
      parseAttributeValue: true,
      parseTagValue: true,
    });
    const parsed = parser.parse(xmlStr);
    return JSON.stringify(parsed, null, 2);
  } catch (err) {
    throw new Error(`XML parsing error: ${err instanceof Error ? err.message : String(err)}`);
  }
}

/**
 * Converts JSON to Base64
 */
export function jsonToBase64(data: unknown): string {
  try {
    const str = typeof data === "string" ? data : JSON.stringify(data);
    return btoa(unescape(encodeURIComponent(str)));
  } catch {
    return "";
  }
}

/**
 * Decodes Base64 to JSON
 */
export function base64ToJson(b64: string): string {
  try {
    const decoded = decodeURIComponent(escape(atob(b64.trim())));
    const parsed = JSON.parse(decoded);
    return JSON.stringify(parsed, null, 2);
  } catch (err) {
    throw new Error(`Base64 decoding error: ${err instanceof Error ? err.message : String(err)}`);
  }
}

/**
 * Converts JSON object to URL Query String
 */
export function jsonToQueryString(data: unknown): string {
  try {
    if (typeof data !== "object" || data === null) return "";
    const flat = flattenJson(data);
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(flat)) {
      if (v !== undefined && v !== null) {
        params.append(k, String(v));
      }
    }
    return params.toString();
  } catch (err) {
    return String(err);
  }
}

/**
 * Converts JSON array of objects to Markdown Table
 */
export function jsonToMarkdownTable(data: unknown): string {
  try {
    const items = Array.isArray(data) ? data : [data];
    if (items.length === 0 || typeof items[0] !== "object" || items[0] === null) {
      return "No tabular data to display.";
    }

    const flatItems = items.map((item) => flattenJson(item));
    const allHeaders = Array.from(
      new Set(flatItems.flatMap((item) => Object.keys(item)))
    );

    const headerRow = `| ${allHeaders.join(" | ")} |`;
    const separatorRow = `| ${allHeaders.map(() => "---").join(" | ")} |`;
    const dataRows = flatItems.map((item) => {
      const cols = allHeaders.map((h) => {
        const val = item[h];
        if (val === null || val === undefined) return "";
        return String(val).replace(/\|/g, "\\|");
      });
      return `| ${cols.join(" | ")} |`;
    });

    return [headerRow, separatorRow, ...dataRows].join("\n");
  } catch (err) {
    return `Markdown conversion error: ${err instanceof Error ? err.message : String(err)}`;
  }
}

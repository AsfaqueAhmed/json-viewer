import Ajv from "ajv";
import addFormats from "ajv-formats";

const ajv = new Ajv({ allErrors: true, verbose: true, strict: false });
addFormats(ajv);

export interface SchemaValidationError {
  instancePath: string;
  schemaPath: string;
  keyword: string;
  message: string;
  params: Record<string, unknown>;
}

export interface ValidationResult {
  valid: boolean;
  errors: SchemaValidationError[];
  errorCount: number;
}

/**
 * Validates a JSON payload against a JSON Schema
 */
export function validateJsonAgainstSchema(data: unknown, schema: unknown): ValidationResult {
  try {
    if (!schema || typeof schema !== "object") {
      return {
        valid: false,
        errors: [{ instancePath: "", schemaPath: "", keyword: "schema", message: "Schema must be a valid JSON object", params: {} }],
        errorCount: 1,
      };
    }

    const validate = ajv.compile(schema as object);
    const valid = validate(data);

    if (valid) {
      return { valid: true, errors: [], errorCount: 0 };
    }

    const errors: SchemaValidationError[] = (validate.errors || []).map((err) => ({
      instancePath: err.instancePath || "/",
      schemaPath: err.schemaPath,
      keyword: err.keyword,
      message: err.message || "Schema validation failed",
      params: (err.params as Record<string, unknown>) || {},
    }));

    return {
      valid: false,
      errors,
      errorCount: errors.length,
    };
  } catch (err) {
    return {
      valid: false,
      errors: [
        {
          instancePath: "",
          schemaPath: "",
          keyword: "compile_error",
          message: err instanceof Error ? err.message : "Failed to compile schema",
          params: {},
        },
      ],
      errorCount: 1,
    };
  }
}

/**
 * Automatically derives a JSON Schema Draft-07 from any JSON payload
 */
export function generateJsonSchema(data: unknown, rootTitle = "GeneratedSchema"): Record<string, unknown> {
  function inferType(val: unknown): Record<string, unknown> {
    if (val === null) {
      return { type: "null" };
    }

    if (Array.isArray(val)) {
      if (val.length === 0) {
        return {
          type: "array",
          items: {},
        };
      }

      // Check if array has elements
      const itemSchemas = val.slice(0, 5).map((item) => inferType(item));
      // If all items have the same type, collapse
      const firstType = itemSchemas[0]?.type;
      const allSameType = itemSchemas.every((s) => s.type === firstType);

      return {
        type: "array",
        items: allSameType ? itemSchemas[0] : { anyOf: itemSchemas },
      };
    }

    if (typeof val === "object") {
      const obj = val as Record<string, unknown>;
      const properties: Record<string, unknown> = {};
      const required: string[] = [];

      for (const [key, value] of Object.entries(obj)) {
        properties[key] = inferType(value);
        if (value !== null && value !== undefined) {
          required.push(key);
        }
      }

      return {
        type: "object",
        properties,
        required: required.length > 0 ? required : undefined,
      };
    }

    if (typeof val === "number") {
      return Number.isInteger(val) ? { type: "integer" } : { type: "number" };
    }

    if (typeof val === "boolean") {
      return { type: "boolean" };
    }

    if (typeof val === "string") {
      const schema: Record<string, unknown> = { type: "string" };

      // Infer formats
      if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(val)) {
        schema.format = "date-time";
      } else if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
        schema.format = "email";
      } else if (/^https?:\/\//.test(val)) {
        schema.format = "uri";
      } else if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(val)) {
        schema.format = "uuid";
      }

      return schema;
    }

    return { type: "string" };
  }

  const base = inferType(data);
  return {
    $schema: "http://json-schema.org/draft-07/schema#",
    title: rootTitle,
    ...base,
  };
}

/**
 * Synthesizes mock sample data conforming to a given JSON Schema
 */
export function generateMockDataFromSchema(schema: unknown): unknown {
  if (!schema || typeof schema !== "object") return {};
  const s = schema as Record<string, unknown>;

  if (s.type === "object" || s.properties) {
    const props = (s.properties as Record<string, unknown>) || {};
    const result: Record<string, unknown> = {};
    for (const [k, propSchema] of Object.entries(props)) {
      result[k] = generateMockDataFromSchema(propSchema);
    }
    return result;
  }

  if (s.type === "array") {
    const itemSchema = s.items || {};
    return [
      generateMockDataFromSchema(itemSchema),
      generateMockDataFromSchema(itemSchema),
    ];
  }

  if (s.type === "integer" || s.type === "number") {
    const min = (s.minimum as number) ?? 1;
    const max = (s.maximum as number) ?? 100;
    const num = Math.floor(Math.random() * (max - min + 1)) + min;
    return s.type === "integer" ? num : Number((num + Math.random()).toFixed(2));
  }

  if (s.type === "boolean") {
    return true;
  }

  if (s.type === "null") {
    return null;
  }

  if (s.type === "string") {
    if (s.enum && Array.isArray(s.enum)) {
      return s.enum[0];
    }
    if (s.format === "email") return "user@example.com";
    if (s.format === "date-time") return new Date().toISOString();
    if (s.format === "uri") return "https://example.com/api";
    if (s.format === "uuid") return "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d";
    return "Sample text";
  }

  return "Sample";
}

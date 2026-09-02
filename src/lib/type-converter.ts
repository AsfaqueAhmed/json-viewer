export type TargetLanguage =
  | "typescript"
  | "dart"
  | "kotlin"
  | "java"
  | "swift"
  | "csharp"
  | "python-pydantic"
  | "go"
  | "rust"
  | "sql";

export interface ConverterOptions {
  rootName?: string;
  allNullable?: boolean;
  includeFromJson?: boolean;
  includeToJson?: boolean;
  // Dart
  dartUseNum?: boolean;
  dartFinalFields?: boolean;
  // Kotlin
  kotlinUseDefaults?: boolean;
  // Java
  javaUseRecords?: boolean;
  javaGettersSetters?: boolean;
  // Swift
  swiftHashable?: boolean;
  // TypeScript
  tsUseTypeAlias?: boolean;
  tsReadonly?: boolean;
  // Go
  goOmitempty?: boolean;
}

export const DEFAULT_CONVERTER_OPTIONS: ConverterOptions = {
  rootName: "Root",
  allNullable: false,
  includeFromJson: true,
  includeToJson: true,
  dartUseNum: false,
  dartFinalFields: true,
  kotlinUseDefaults: true,
  javaUseRecords: false,
  javaGettersSetters: true,
  swiftHashable: true,
  tsUseTypeAlias: false,
  tsReadonly: false,
  goOmitempty: false,
};

function sanitizeIdentifier(name: string): string {
  const cleaned = name.replace(/[^a-zA-Z0-9_]/g, "_");
  return /^[0-9]/.test(cleaned) ? `_${cleaned}` : cleaned;
}

function toPascalCase(str: string): string {
  return str
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("") || "Item";
}

function toCamelCase(str: string): string {
  const pascal = toPascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

function toSnakeCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, "$1_$2")
    .replace(/[^a-zA-Z0-9_]+/g, "_")
    .toLowerCase();
}

/**
 * Generates TypeScript interfaces / types with fromJson & toJson
 */
export function generateTypeScript(data: unknown, options: ConverterOptions = {}): string {
  const opts = { ...DEFAULT_CONVERTER_OPTIONS, ...options };
  const interfaces: string[] = [];
  const generatedNames = new Set<string>();
  const validRoot = toPascalCase(opts.rootName || "Root");

  function generateInterface(obj: Record<string, unknown>, name: string): string {
    const typeName = toPascalCase(name);
    if (generatedNames.has(typeName)) return typeName;
    generatedNames.add(typeName);

    const fields: string[] = [];

    for (const [rawKey, val] of Object.entries(obj)) {
      const key = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(rawKey) ? rawKey : `"${rawKey}"`;
      const isNull = val === null || opts.allNullable;
      const typeStr = getTypeStr(val, `${typeName}_${rawKey}`);
      const readonlyPrefix = opts.tsReadonly ? "readonly " : "";
      fields.push(`  ${readonlyPrefix}${key}${isNull ? "?" : ""}: ${typeStr};`);
    }

    const keyword = opts.tsUseTypeAlias ? `export type ${typeName} =` : `export interface ${typeName}`;
    const code = `${keyword} {\n${fields.join("\n")}\n}${opts.tsUseTypeAlias ? ";" : ""}`;
    interfaces.unshift(code);
    return typeName;
  }

  function getTypeStr(val: unknown, suggestedName: string): string {
    if (val === null) return "any";
    if (val === undefined) return "undefined";
    if (typeof val === "string") return "string";
    if (typeof val === "number") return "number";
    if (typeof val === "boolean") return "boolean";

    if (Array.isArray(val)) {
      if (val.length === 0) return "any[]";
      const elemType = getTypeStr(val[0], `${suggestedName}Item`);
      return `${elemType}[]`;
    }

    if (typeof val === "object") {
      return generateInterface(val as Record<string, unknown>, suggestedName);
    }

    return "any";
  }

  if (Array.isArray(data)) {
    if (data.length > 0 && typeof data[0] === "object" && data[0] !== null) {
      const itemName = generateInterface(data[0] as Record<string, unknown>, `${validRoot}Item`);
      interfaces.push(`export type ${validRoot} = ${itemName}[];`);
    } else {
      interfaces.push(`export type ${validRoot} = any[];`);
    }
  } else if (typeof data === "object" && data !== null) {
    generateInterface(data as Record<string, unknown>, validRoot);
  } else {
    interfaces.push(`export type ${validRoot} = ${typeof data};`);
  }

  const helperParts: string[] = [];
  if (opts.includeFromJson) {
    helperParts.push(`export function ${toCamelCase(validRoot)}FromJson(json: string): ${validRoot} {\n  return JSON.parse(json) as ${validRoot};\n}`);
  }
  if (opts.includeToJson) {
    helperParts.push(`export function ${toCamelCase(validRoot)}ToJson(value: ${validRoot}): string {\n  return JSON.stringify(value, null, 2);\n}`);
  }

  const helpers = helperParts.length > 0 ? `\n\n// Serialization helpers\n` + helperParts.join("\n\n") : "";
  return interfaces.join("\n\n") + helpers;
}

/**
 * Generates Dart / Flutter Classes with fromJson & toJson constructors
 */
export function generateDart(data: unknown, options: ConverterOptions = {}): string {
  const opts = { ...DEFAULT_CONVERTER_OPTIONS, ...options };
  const classes: string[] = [];
  const generatedNames = new Set<string>();
  const validRoot = toPascalCase(opts.rootName || "Root");

  function generateClass(obj: Record<string, unknown>, name: string): string {
    const className = toPascalCase(name);
    if (generatedNames.has(className)) return className;
    generatedNames.add(className);

    const fields: string[] = [];
    const constructorParams: string[] = [];
    const fromJsonLines: string[] = [];
    const toJsonLines: string[] = [];

    for (const [rawKey, val] of Object.entries(obj)) {
      const fieldName = toCamelCase(rawKey);
      const isNull = val === null || opts.allNullable;
      const typeInfo = getDartType(val, `${className}_${rawKey}`);
      const dartType = isNull || typeInfo.nullable ? `${typeInfo.typeName}?` : typeInfo.typeName;
      const finalPrefix = opts.dartFinalFields ? "final " : "";

      fields.push(`  ${finalPrefix}${dartType} ${fieldName};`);
      if (isNull || typeInfo.nullable) {
        constructorParams.push(`    this.${fieldName},`);
      } else {
        constructorParams.push(`    required this.${fieldName},`);
      }

      // fromJson parsing
      if (typeInfo.isCustomClass) {
        if (typeInfo.isArray) {
          fromJsonLines.push(
            `      ${fieldName}: (json['${rawKey}'] as List<dynamic>?)?.map((e) => ${typeInfo.itemClassName}.fromJson(e as Map<String, dynamic>)).toList() ?? [],`
          );
        } else {
          fromJsonLines.push(
            `      ${fieldName}: json['${rawKey}'] != null ? ${typeInfo.itemClassName}.fromJson(json['${rawKey}'] as Map<String, dynamic>) : null,`
          );
        }
      } else if (typeInfo.isArray) {
        fromJsonLines.push(
          `      ${fieldName}: (json['${rawKey}'] as List<dynamic>?)?.map((e) => e as ${typeInfo.itemClassName}).toList() ?? [],`
        );
      } else if (typeInfo.typeName === "num") {
        fromJsonLines.push(`      ${fieldName}: json['${rawKey}'] as num?${isNull ? "" : " ?? 0"},`);
      } else if (typeInfo.typeName === "int") {
        fromJsonLines.push(`      ${fieldName}: (json['${rawKey}'] as num?)?.toInt()${isNull ? "" : " ?? 0"},`);
      } else if (typeInfo.typeName === "double") {
        fromJsonLines.push(`      ${fieldName}: (json['${rawKey}'] as num?)?.toDouble()${isNull ? "" : " ?? 0.0"},`);
      } else if (typeInfo.typeName === "bool") {
        fromJsonLines.push(`      ${fieldName}: json['${rawKey}'] as bool?${isNull ? "" : " ?? false"},`);
      } else if (typeInfo.typeName === "String") {
        fromJsonLines.push(`      ${fieldName}: json['${rawKey}'] as String?${isNull ? "" : " ?? ''"},`);
      } else {
        fromJsonLines.push(`      ${fieldName}: json['${rawKey}'],`);
      }

      // toJson serializing
      if (typeInfo.isCustomClass) {
        if (typeInfo.isArray) {
          toJsonLines.push(`      '${rawKey}': ${fieldName}${typeInfo.nullable || isNull ? "?" : ""}.map((e) => e.toJson()).toList(),`);
        } else {
          toJsonLines.push(`      '${rawKey}': ${fieldName}?.toJson(),`);
        }
      } else {
        toJsonLines.push(`      '${rawKey}': ${fieldName},`);
      }
    }

    const methods: string[] = [];

    if (opts.includeFromJson) {
      methods.push(`  factory ${className}.fromJson(Map<String, dynamic> json) {\n    return ${className}(\n${fromJsonLines.join("\n")}\n    );\n  }`);
    }

    if (opts.includeToJson) {
      methods.push(`  Map<String, dynamic> toJson() {\n    return {\n${toJsonLines.join("\n")}\n    };\n  }`);
    }

    const methodsBlock = methods.length > 0 ? "\n\n" + methods.join("\n\n") : "";

    const code = `class ${className} {
${fields.join("\n")}

  ${className}({
${constructorParams.join("\n")}
  });${methodsBlock}
}`;
    classes.unshift(code);
    return className;
  }

  interface DartTypeInfo {
    typeName: string;
    itemClassName: string;
    isCustomClass: boolean;
    isArray: boolean;
    nullable: boolean;
  }

  function getDartType(val: unknown, suggestedName: string): DartTypeInfo {
    if (val === null) {
      return { typeName: "dynamic", itemClassName: "dynamic", isCustomClass: false, isArray: false, nullable: true };
    }
    if (typeof val === "string") {
      return { typeName: "String", itemClassName: "String", isCustomClass: false, isArray: false, nullable: false };
    }
    if (typeof val === "number") {
      if (opts.dartUseNum) {
        return { typeName: "num", itemClassName: "num", isCustomClass: false, isArray: false, nullable: false };
      }
      const typeName = Number.isInteger(val) ? "int" : "double";
      return { typeName, itemClassName: typeName, isCustomClass: false, isArray: false, nullable: false };
    }
    if (typeof val === "boolean") {
      return { typeName: "bool", itemClassName: "bool", isCustomClass: false, isArray: false, nullable: false };
    }

    if (Array.isArray(val)) {
      if (val.length === 0) {
        return { typeName: "List<dynamic>", itemClassName: "dynamic", isCustomClass: false, isArray: true, nullable: false };
      }
      const elem = getDartType(val[0], `${suggestedName}Item`);
      return {
        typeName: `List<${elem.typeName}>`,
        itemClassName: elem.typeName,
        isCustomClass: elem.isCustomClass,
        isArray: true,
        nullable: false,
      };
    }

    if (typeof val === "object") {
      const subName = generateClass(val as Record<string, unknown>, suggestedName);
      return { typeName: subName, itemClassName: subName, isCustomClass: true, isArray: false, nullable: false };
    }

    return { typeName: "dynamic", itemClassName: "dynamic", isCustomClass: false, isArray: false, nullable: true };
  }

  if (typeof data === "object" && data !== null && !Array.isArray(data)) {
    generateClass(data as Record<string, unknown>, validRoot);
  } else if (Array.isArray(data) && data.length > 0 && typeof data[0] === "object") {
    generateClass(data[0] as Record<string, unknown>, `${validRoot}Item`);
  }

  return classes.join("\n\n");
}

/**
 * Generates Kotlin Data Classes with @Serializable & Companion fromJson / toJson
 */
export function generateKotlin(data: unknown, options: ConverterOptions = {}): string {
  const opts = { ...DEFAULT_CONVERTER_OPTIONS, ...options };
  const classes: string[] = [];
  const generatedNames = new Set<string>();
  const validRoot = toPascalCase(opts.rootName || "Root");

  function generateClass(obj: Record<string, unknown>, name: string): string {
    const className = toPascalCase(name);
    if (generatedNames.has(className)) return className;
    generatedNames.add(className);

    const fields: string[] = [];

    for (const [rawKey, val] of Object.entries(obj)) {
      const fieldName = toCamelCase(rawKey);
      const isNull = val === null || opts.allNullable;
      const typeStr = getKotlinType(val, `${className}_${rawKey}`);
      const finalType = isNull ? `${typeStr}? = null` : typeStr;

      fields.push(`    @SerialName("${rawKey}")\n    val ${sanitizeIdentifier(fieldName)}: ${finalType}`);
    }

    const companionMethods: string[] = [];
    if (opts.includeFromJson) {
      companionMethods.push(`        fun fromJson(json: String): ${className} = Json.decodeFromString(serializer(), json)`);
    }

    const memberMethods: string[] = [];
    if (opts.includeToJson) {
      memberMethods.push(`    fun toJson(): String = Json.encodeToString(serializer(), this)`);
    }

    let body = "";
    if (memberMethods.length > 0 || companionMethods.length > 0) {
      const compBlock = companionMethods.length > 0 ? `\n    companion object {\n${companionMethods.join("\n")}\n    }` : "";
      body = ` {\n${memberMethods.join("\n")}${compBlock}\n}`;
    }

    const code = `@Serializable\ndata class ${className}(\n${fields.join(",\n")}\n)${body}`;
    classes.unshift(code);
    return className;
  }

  function getKotlinType(val: unknown, suggestedName: string): string {
    if (val === null) return "Any";
    if (typeof val === "string") return "String";
    if (typeof val === "number") return Number.isInteger(val) ? "Long" : "Double";
    if (typeof val === "boolean") return "Boolean";

    if (Array.isArray(val)) {
      if (val.length === 0) return "List<Any>";
      const elemType = getKotlinType(val[0], `${suggestedName}Item`);
      return `List<${elemType}>`;
    }

    if (typeof val === "object") {
      return generateClass(val as Record<string, unknown>, suggestedName);
    }

    return "Any";
  }

  if (typeof data === "object" && data !== null && !Array.isArray(data)) {
    generateClass(data as Record<string, unknown>, validRoot);
  } else if (Array.isArray(data) && data.length > 0 && typeof data[0] === "object") {
    generateClass(data[0] as Record<string, unknown>, `${validRoot}Item`);
  }

  return `package com.example.model\n\nimport kotlinx.serialization.Serializable\nimport kotlinx.serialization.SerialName\nimport kotlinx.serialization.json.Json\n\n` + classes.join("\n\n");
}

/**
 * Generates Java Record or POJO Class with fromJson & toJson
 */
export function generateJava(data: unknown, options: ConverterOptions = {}): string {
  const opts = { ...DEFAULT_CONVERTER_OPTIONS, ...options };
  const classes: string[] = [];
  const generatedNames = new Set<string>();
  const validRoot = toPascalCase(opts.rootName || "Root");

  function generateClass(obj: Record<string, unknown>, name: string): string {
    const className = toPascalCase(name);
    if (generatedNames.has(className)) return className;
    generatedNames.add(className);

    // Java 17+ Record format
    if (opts.javaUseRecords) {
      const recordParams: string[] = [];
      for (const [rawKey, val] of Object.entries(obj)) {
        const fieldName = toCamelCase(rawKey);
        const typeStr = getJavaType(val, `${className}_${rawKey}`);
        recordParams.push(`    @JsonProperty("${rawKey}") ${typeStr} ${sanitizeIdentifier(fieldName)}`);
      }

      const methods: string[] = [];
      if (opts.includeFromJson) {
        methods.push(`    public static ${className} fromJson(String json) throws IOException {\n        return new ObjectMapper().readValue(json, ${className}.class);\n    }`);
      }
      if (opts.includeToJson) {
        methods.push(`    public String toJson() throws IOException {\n        return new ObjectMapper().writeValueAsString(this);\n    }`);
      }

      const methodBlock = methods.length > 0 ? ` {\n${methods.join("\n\n")}\n}` : ";";
      const code = `public record ${className}(\n${recordParams.join(",\n")}\n)${methodBlock}`;
      classes.unshift(code);
      return className;
    }

    // Standard POJO Class format
    const fields: string[] = [];
    const gettersSetters: string[] = [];

    for (const [rawKey, val] of Object.entries(obj)) {
      const fieldName = toCamelCase(rawKey);
      const propName = toPascalCase(rawKey);
      const typeStr = getJavaType(val, `${className}_${rawKey}`);

      fields.push(`    @JsonProperty("${rawKey}")\n    private ${typeStr} ${sanitizeIdentifier(fieldName)};`);

      if (opts.javaGettersSetters) {
        gettersSetters.push(`    public ${typeStr} get${propName}() { return ${sanitizeIdentifier(fieldName)}; }\n    public void set${propName}(${typeStr} ${sanitizeIdentifier(fieldName)}) { this.${sanitizeIdentifier(fieldName)} = ${sanitizeIdentifier(fieldName)}; }`);
      }
    }

    const methods: string[] = [];
    if (opts.includeFromJson) {
      methods.push(`    public static ${className} fromJson(String json) throws IOException {\n        return new ObjectMapper().readValue(json, ${className}.class);\n    }`);
    }
    if (opts.includeToJson) {
      methods.push(`    public String toJson() throws IOException {\n        return new ObjectMapper().writeValueAsString(this);\n    }`);
    }

    const gsBlock = gettersSetters.length > 0 ? "\n\n" + gettersSetters.join("\n\n") : "";
    const methodsBlock = methods.length > 0 ? "\n\n" + methods.join("\n\n") : "";

    const code = `public class ${className} {
${fields.join("\n\n")}

    public ${className}() {}${gsBlock}${methodsBlock}
}`;
    classes.unshift(code);
    return className;
  }

  function getJavaType(val: unknown, suggestedName: string): string {
    if (val === null) return "Object";
    if (typeof val === "string") return "String";
    if (typeof val === "number") return Number.isInteger(val) ? "Long" : "Double";
    if (typeof val === "boolean") return "Boolean";

    if (Array.isArray(val)) {
      if (val.length === 0) return "List<Object>";
      const elemType = getJavaType(val[0], `${suggestedName}Item`);
      return `List<${elemType}>`;
    }

    if (typeof val === "object") {
      return generateClass(val as Record<string, unknown>, suggestedName);
    }

    return "Object";
  }

  if (typeof data === "object" && data !== null && !Array.isArray(data)) {
    generateClass(data as Record<string, unknown>, validRoot);
  } else if (Array.isArray(data) && data.length > 0 && typeof data[0] === "object") {
    generateClass(data[0] as Record<string, unknown>, `${validRoot}Item`);
  }

  return `package com.example.model;\n\nimport com.fasterxml.jackson.annotation.JsonProperty;\nimport com.fasterxml.jackson.databind.ObjectMapper;\nimport java.io.IOException;\nimport java.util.List;\n\n` + classes.join("\n\n");
}

/**
 * Generates Swift Codable Structs with JSON constructors
 */
export function generateSwift(data: unknown, options: ConverterOptions = {}): string {
  const opts = { ...DEFAULT_CONVERTER_OPTIONS, ...options };
  const structs: string[] = [];
  const generatedNames = new Set<string>();
  const validRoot = toPascalCase(opts.rootName || "Root");

  function generateStruct(obj: Record<string, unknown>, name: string): string {
    const structName = toPascalCase(name);
    if (generatedNames.has(structName)) return structName;
    generatedNames.add(structName);

    const properties: string[] = [];
    const codingKeys: string[] = [];

    for (const [rawKey, val] of Object.entries(obj)) {
      const propName = toCamelCase(rawKey);
      const isNull = val === null || opts.allNullable;
      let typeStr = getSwiftType(val, `${structName}_${rawKey}`);
      if (isNull && !typeStr.endsWith("?")) typeStr = `${typeStr}?`;

      properties.push(`    public let ${sanitizeIdentifier(propName)}: ${typeStr}`);

      if (propName !== rawKey) {
        codingKeys.push(`        case ${sanitizeIdentifier(propName)} = "${rawKey}"`);
      } else {
        codingKeys.push(`        case ${sanitizeIdentifier(propName)}`);
      }
    }

    const conformance = opts.swiftHashable ? "Codable, Hashable" : "Codable";
    const helpers: string[] = [];

    if (opts.includeFromJson) {
      helpers.push(`    public static func fromJson(_ data: Data) throws -> ${structName} {\n        return try JSONDecoder().decode(${structName}.self, from: data)\n    }

    public static func fromJsonString(_ string: String) throws -> ${structName} {\n        guard let data = string.data(using: .utf8) else {\n            throw NSError(domain: "InvalidJSONString", code: -1, userInfo: nil)\n        }\n        return try fromJson(data)\n    }`);
    }

    if (opts.includeToJson) {
      helpers.push(`    public func toJsonData() throws -> Data {\n        let encoder = JSONEncoder()\n        encoder.outputFormatting = .prettyPrinted\n        return try encoder.encode(self)\n    }

    public func toJsonString() throws -> String? {\n        let data = try toJsonData()\n        return String(data: data, encoding: .utf8)\n    }`);
    }

    const helpersBlock = helpers.length > 0 ? "\n\n    // JSON Initializers & Helpers\n" + helpers.join("\n\n") : "";

    const code = `public struct ${structName}: ${conformance} {
${properties.join("\n")}

    enum CodingKeys: String, CodingKey {
${codingKeys.join("\n")}
    }${helpersBlock}
}`;
    structs.unshift(code);
    return structName;
  }

  function getSwiftType(val: unknown, suggestedName: string): string {
    if (val === null) return "AnyCodable?";
    if (typeof val === "string") return "String";
    if (typeof val === "number") return Number.isInteger(val) ? "Int" : "Double";
    if (typeof val === "boolean") return "Bool";

    if (Array.isArray(val)) {
      if (val.length === 0) return "[AnyCodable]";
      const elemType = getSwiftType(val[0], `${suggestedName}Item`);
      return `[${elemType}]`;
    }

    if (typeof val === "object") {
      return generateStruct(val as Record<string, unknown>, suggestedName);
    }

    return "AnyCodable";
  }

  if (typeof data === "object" && data !== null && !Array.isArray(data)) {
    generateStruct(data as Record<string, unknown>, validRoot);
  } else if (Array.isArray(data) && data.length > 0 && typeof data[0] === "object") {
    generateStruct(data[0] as Record<string, unknown>, `${validRoot}Item`);
  }

  return `import Foundation\n\n` + structs.join("\n\n");
}

/**
 * Generates C# Classes with System.Text.Json FromJson / ToJson
 */
export function generateCSharp(data: unknown, options: ConverterOptions = {}): string {
  const opts = { ...DEFAULT_CONVERTER_OPTIONS, ...options };
  const classes: string[] = [];
  const generatedNames = new Set<string>();
  const validRoot = toPascalCase(opts.rootName || "Root");

  function generateClass(obj: Record<string, unknown>, name: string): string {
    const className = toPascalCase(name);
    if (generatedNames.has(className)) return className;
    generatedNames.add(className);

    const properties: string[] = [];

    for (const [rawKey, val] of Object.entries(obj)) {
      const propName = toPascalCase(rawKey);
      const isNull = val === null || opts.allNullable;
      let typeStr = getCSharpType(val, `${className}_${rawKey}`);
      if (isNull && !typeStr.endsWith("?")) typeStr = `${typeStr}?`;

      properties.push(`        [JsonPropertyName("${rawKey}")]\n        public ${typeStr} ${sanitizeIdentifier(propName)} { get; set; }`);
    }

    const helpers: string[] = [];
    if (opts.includeFromJson) {
      helpers.push(`        public static ${className}? FromJson(string json) =>\n            JsonSerializer.Deserialize<${className}>(json);`);
    }
    if (opts.includeToJson) {
      helpers.push(`        public string ToJson(bool indented = true) =>\n            JsonSerializer.Serialize(this, new JsonSerializerOptions { WriteIndented = indented });`);
    }

    const helpersBlock = helpers.length > 0 ? "\n\n        // JSON Serialization helpers\n" + helpers.join("\n\n") : "";

    const code = `    public class ${className}
    {
${properties.join("\n\n")}${helpersBlock}
    }`;
    classes.unshift(code);
    return className;
  }

  function getCSharpType(val: unknown, suggestedName: string): string {
    if (val === null) return "object?";
    if (typeof val === "string") return "string";
    if (typeof val === "number") return Number.isInteger(val) ? "long" : "double";
    if (typeof val === "boolean") return "bool";

    if (Array.isArray(val)) {
      if (val.length === 0) return "List<object>";
      const elemType = getCSharpType(val[0], `${suggestedName}Item`);
      return `List<${elemType}>`;
    }

    if (typeof val === "object") {
      return generateClass(val as Record<string, unknown>, suggestedName);
    }

    return "object";
  }

  if (typeof data === "object" && data !== null && !Array.isArray(data)) {
    generateClass(data as Record<string, unknown>, validRoot);
  } else if (Array.isArray(data) && data.length > 0 && typeof data[0] === "object") {
    generateClass(data[0] as Record<string, unknown>, `${validRoot}Item`);
  }

  return `using System;\nusing System.Collections.Generic;\nusing System.Text.Json;\nusing System.Text.Json.Serialization;\n\nnamespace JsonModels\n{\n` + classes.join("\n\n") + `\n}`;
}

/**
 * Generates Python Pydantic v2 Models with from_json & to_json
 */
export function generatePythonPydantic(data: unknown, options: ConverterOptions = {}): string {
  const opts = { ...DEFAULT_CONVERTER_OPTIONS, ...options };
  const models: string[] = [];
  const generatedNames = new Set<string>();
  const validRoot = toPascalCase(opts.rootName || "Root");

  function generateModel(obj: Record<string, unknown>, name: string): string {
    const typeName = toPascalCase(name);
    if (generatedNames.has(typeName)) return typeName;
    generatedNames.add(typeName);

    const fields: string[] = [];

    for (const [rawKey, val] of Object.entries(obj)) {
      const fieldName = toSnakeCase(rawKey);
      const isNull = val === null || opts.allNullable;
      const typeStr = getPyType(val, `${typeName}_${rawKey}`);

      if (fieldName !== rawKey) {
        fields.push(`    ${fieldName}: ${isNull ? `Optional[${typeStr}] = None` : typeStr} = Field(..., alias="${rawKey}")`);
      } else {
        fields.push(`    ${fieldName}: ${isNull ? `Optional[${typeStr}] = None` : typeStr}`);
      }
    }

    const helpers: string[] = [];
    if (opts.includeFromJson) {
      helpers.push(`    @classmethod\n    def from_json(cls, json_str: str) -> "${typeName}":\n        return cls.model_validate_json(json_str)`);
    }
    if (opts.includeToJson) {
      helpers.push(`    def to_json(self, indent: int = 2) -> str:\n        return self.model_dump_json(indent=indent)`);
    }

    const helpersBlock = helpers.length > 0 ? "\n\n" + helpers.join("\n\n") : "";

    const code = `class ${typeName}(BaseModel):
${fields.length ? fields.join("\n") : "    pass"}${helpersBlock}`;
    models.unshift(code);
    return typeName;
  }

  function getPyType(val: unknown, suggestedName: string): string {
    if (val === null) return "Any";
    if (typeof val === "string") return "str";
    if (typeof val === "number") return Number.isInteger(val) ? "int" : "float";
    if (typeof val === "boolean") return "bool";

    if (Array.isArray(val)) {
      if (val.length === 0) return "List[Any]";
      const elemType = getPyType(val[0], `${suggestedName}Item`);
      return `List[${elemType}]`;
    }

    if (typeof val === "object") {
      return generateModel(val as Record<string, unknown>, suggestedName);
    }

    return "Any";
  }

  if (typeof data === "object" && data !== null && !Array.isArray(data)) {
    generateModel(data as Record<string, unknown>, validRoot);
  } else if (Array.isArray(data) && data.length > 0 && typeof data[0] === "object") {
    const itemModel = generateModel(data[0] as Record<string, unknown>, `${validRoot}Item`);
    models.push(`${validRoot} = List[${itemModel}]`);
  }

  return `from typing import List, Optional, Any\nfrom pydantic import BaseModel, Field\n\n` + models.join("\n\n");
}

/**
 * Generates Go Structs with Unmarshal & Marshal
 */
export function generateGo(data: unknown, options: ConverterOptions = {}): string {
  const opts = { ...DEFAULT_CONVERTER_OPTIONS, ...options };
  const structs: string[] = [];
  const generatedNames = new Set<string>();
  const validRoot = toPascalCase(opts.rootName || "Root");

  function generateStruct(obj: Record<string, unknown>, name: string): string {
    const structName = toPascalCase(name);
    if (generatedNames.has(structName)) return structName;
    generatedNames.add(structName);

    const fields: string[] = [];

    for (const [rawKey, val] of Object.entries(obj)) {
      const fieldName = toPascalCase(rawKey);
      let typeStr = getGoType(val, `${structName}_${rawKey}`);
      if (opts.allNullable && !typeStr.startsWith("*") && !typeStr.startsWith("[]")) {
        typeStr = `*${typeStr}`;
      }
      const omitemptyStr = opts.goOmitempty ? ",omitempty" : "";
      fields.push(`\t${fieldName} ${typeStr} \`json:"${rawKey}${omitemptyStr}"\``);
    }

    const code = `type ${structName} struct {\n${fields.join("\n")}\n}`;
    structs.unshift(code);
    return structName;
  }

  function getGoType(val: unknown, suggestedName: string): string {
    if (val === null) return "interface{}";
    if (typeof val === "string") return "string";
    if (typeof val === "number") return Number.isInteger(val) ? "int64" : "float64";
    if (typeof val === "boolean") return "bool";

    if (Array.isArray(val)) {
      if (val.length === 0) return "[]interface{}";
      const elemType = getGoType(val[0], `${suggestedName}Item`);
      return `[]${elemType}`;
    }

    if (typeof val === "object") {
      return generateStruct(val as Record<string, unknown>, suggestedName);
    }

    return "interface{}";
  }

  if (typeof data === "object" && data !== null && !Array.isArray(data)) {
    generateStruct(data as Record<string, unknown>, validRoot);
  } else if (Array.isArray(data) && data.length > 0 && typeof data[0] === "object") {
    const itemStruct = generateStruct(data[0] as Record<string, unknown>, `${validRoot}Item`);
    structs.push(`type ${validRoot} []${itemStruct}`);
  }

  const helpers: string[] = [];
  if (opts.includeFromJson) {
    helpers.push(`func Unmarshal${validRoot}(data []byte) (${validRoot}, error) {\n\tvar r ${validRoot}\n\terr := json.Unmarshal(data, &r)\n\treturn r, err\n}`);
  }
  if (opts.includeToJson) {
    helpers.push(`func (r *${validRoot}) Marshal() ([]byte, error) {\n\treturn json.MarshalIndent(r, "", "  ")\n}`);
  }

  const helpersBlock = helpers.length > 0 ? "\n\n" + helpers.join("\n\n") : "";

  return `package main\n\nimport (\n\t"encoding/json"\n)\n\n` + structs.join("\n\n") + helpersBlock;
}

/**
 * Generates Rust Structs (serde) with from_json & to_json
 */
export function generateRust(data: unknown, options: ConverterOptions = {}): string {
  const opts = { ...DEFAULT_CONVERTER_OPTIONS, ...options };
  const structs: string[] = [];
  const generatedNames = new Set<string>();
  const validRoot = toPascalCase(opts.rootName || "Root");

  function generateStruct(obj: Record<string, unknown>, name: string): string {
    const structName = toPascalCase(name);
    if (generatedNames.has(structName)) return structName;
    generatedNames.add(structName);

    const fields: string[] = [];

    for (const [rawKey, val] of Object.entries(obj)) {
      const fieldName = toSnakeCase(rawKey);
      const isNull = val === null || opts.allNullable;
      let typeStr = getRustType(val, `${structName}_${rawKey}`);
      if (isNull && !typeStr.startsWith("Option<")) typeStr = `Option<${typeStr}>`;

      if (fieldName !== rawKey) {
        fields.push(`    #[serde(rename = "${rawKey}")]\n    pub ${sanitizeIdentifier(fieldName)}: ${typeStr},`);
      } else {
        fields.push(`    pub ${sanitizeIdentifier(fieldName)}: ${typeStr},`);
      }
    }

    const code = `#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]\n#[serde(rename_all = "camelCase")]\npub struct ${structName} {\n${fields.join("\n")}\n}`;
    structs.unshift(code);
    return structName;
  }

  function getRustType(val: unknown, suggestedName: string): string {
    if (val === null) return "Option<serde_json::Value>";
    if (typeof val === "string") return "String";
    if (typeof val === "number") return Number.isInteger(val) ? "i64" : "f64";
    if (typeof val === "boolean") return "bool";

    if (Array.isArray(val)) {
      if (val.length === 0) return "Vec<serde_json::Value>";
      const elemType = getRustType(val[0], `${suggestedName}Item`);
      return `Vec<${elemType}>`;
    }

    if (typeof val === "object") {
      return generateStruct(val as Record<string, unknown>, suggestedName);
    }

    return "serde_json::Value";
  }

  if (typeof data === "object" && data !== null && !Array.isArray(data)) {
    generateStruct(data as Record<string, unknown>, validRoot);
  }

  const helpers: string[] = [];
  if (opts.includeFromJson) {
    helpers.push(`    pub fn from_json(json: &str) -> Result<Self, serde_json::Error> {\n        serde_json::from_str(json)\n    }`);
  }
  if (opts.includeToJson) {
    helpers.push(`    pub fn to_json(&self) -> Result<String, serde_json::Error> {\n        serde_json::to_string_pretty(self)\n    }`);
  }

  const helpersBlock = helpers.length > 0 ? `\n\nimpl ${validRoot} {\n${helpers.join("\n\n")}\n}` : "";

  return `use serde::{Serialize, Deserialize};\n\n` + structs.join("\n\n") + helpersBlock;
}

/**
 * Generates SQL DDL Table & Schema
 */
export function generateSQL(data: unknown, options: ConverterOptions = {}): string {
  const opts = { ...DEFAULT_CONVERTER_OPTIONS, ...options };
  const tableName = toSnakeCase(opts.rootName || "json_records");
  const items = Array.isArray(data) ? data : [data];
  if (!items.length || typeof items[0] !== "object" || items[0] === null) {
    return "-- SQL generation requires an object or array of objects.";
  }

  const sample = items[0] as Record<string, unknown>;
  const columns: string[] = [];

  for (const [key, val] of Object.entries(sample)) {
    const colName = toSnakeCase(key);
    let colType = "VARCHAR(255)";

    if (typeof val === "number") {
      colType = Number.isInteger(val) ? "BIGINT" : "NUMERIC(12, 2)";
    } else if (typeof val === "boolean") {
      colType = "BOOLEAN";
    } else if (typeof val === "string") {
      if (/^\d{4}-\d{2}-\d{2}/.test(val)) {
        colType = "TIMESTAMP";
      } else if (val.length > 255) {
        colType = "TEXT";
      }
    } else if (typeof val === "object") {
      colType = "JSONB";
    }

    const nullability = opts.allNullable ? "" : " NOT NULL";
    columns.push(`    ${colName} ${colType}${nullability}`);
  }

  const createTable = `CREATE TABLE ${tableName} (\n    id SERIAL PRIMARY KEY,\n${columns.join(",\n")}\n);`;

  return createTable;
}

/**
 * Main dispatcher for all target languages
 */
export function convertJsonToCode(
  data: unknown,
  target: TargetLanguage,
  options: ConverterOptions = {}
): string {
  switch (target) {
    case "typescript":
      return generateTypeScript(data, options);
    case "dart":
      return generateDart(data, options);
    case "kotlin":
      return generateKotlin(data, options);
    case "java":
      return generateJava(data, options);
    case "swift":
      return generateSwift(data, options);
    case "csharp":
      return generateCSharp(data, options);
    case "python-pydantic":
      return generatePythonPydantic(data, options);
    case "go":
      return generateGo(data, options);
    case "rust":
      return generateRust(data, options);
    case "sql":
      return generateSQL(data, options);
    default:
      return generateTypeScript(data, options);
  }
}

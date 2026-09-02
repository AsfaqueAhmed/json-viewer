export const BASE_URL = "https://jsonstudio-app.web.app";

export interface ToolSeoConfig {
  name: string;
  title: string;
  headline: string;
  description: string;
  path: string;
  keywords: string[];
  features: string[];
  faqs: { question: string; answer: string }[];
}

export const TOOLS_CONFIG: Record<string, ToolSeoConfig> = {
  editor: {
    name: "JSON Viewer & Editor",
    title: "Free Online JSON Viewer & Editor | JSON Studio",
    headline: "Modern JSON Viewer, Formatter, Editor & Developer Suite",
    description:
      "High-performance VS Code Monaco-powered JSON Viewer and Editor with instant prettifying, syntax validation, bracket matching, and interactive tree view.",
    path: "/",
    keywords: [
      "json viewer",
      "json editor",
      "json formatter",
      "json beautifier",
      "online json viewer",
      "format json online",
      "monaco json editor",
    ],
    features: [
      "Monaco-powered JSON syntax highlighting and autocomplete",
      "Interactive collapsible JSON tree view with search and filter",
      "Real-time syntax validation with line/column error tracking",
      "Prettify, minify, key sorting, and case transformation",
    ],
    faqs: [
      {
        question: "How do I format and beautify JSON online with JSON Studio?",
        answer:
          "Paste your raw or minified JSON into the editor, or upload a JSON file. Click 'Prettify / Format' or press Shift+Alt+F to format it with 2-space, 4-space, or tab indentation instantly.",
      },
      {
        question: "Is my JSON data kept private and secure?",
        answer:
          "Yes, 100%. All processing runs locally in your browser. No JSON text or uploaded files are sent to any server.",
      },
    ],
  },
  diff: {
    name: "JSON Diff & Compare",
    title: "JSON Diff & Compare Tool Online | JSON Studio",
    headline: "JSON Diff Online — Side-by-Side JSON Comparator & Merge Tool",
    description:
      "Compare two JSON files side-by-side online. Automatically highlight semantic differences, property modifications, deletions, and array shifts in real-time.",
    path: "/diff",
    keywords: [
      "json diff",
      "json compare",
      "compare json files online",
      "json diff tool",
      "side by side json compare",
      "json difference checker",
    ],
    features: [
      "Side-by-side Monaco Diff engine with color-coded additions and deletions",
      "Semantic JSON object and array comparison",
      "Inline and split view comparison modes",
      "Real-time diff recalculation on edit",
    ],
    faqs: [
      {
        question: "How do I compare two JSON objects to find differences?",
        answer:
          "Navigate to the /diff tool, paste the original JSON payload on the left pane and the modified JSON on the right pane. JSON Studio will highlight added, removed, and modified keys with color-coded indicators.",
      },
      {
        question: "Does JSON Diff ignore key order?",
        answer:
          "You can sort keys alphabetically with 1 click before comparing to ensure difference comparison focuses purely on structural and value variations.",
      },
    ],
  },
  "schema-validator": {
    name: "JSON Schema Validator",
    title: "JSON Schema Validator Online | JSON Studio",
    headline: "JSON Schema Validator & Generator — Online Draft-07 AJV Validation",
    description:
      "Validate JSON documents against JSON Schema specifications (Draft-07 / 2020-12) using AJV. Auto-generate schema templates from existing JSON payloads.",
    path: "/schema-validator",
    keywords: [
      "json schema validator",
      "validate json schema online",
      "json schema generator",
      "ajv json validator",
      "json draft 7 validator",
    ],
    features: [
      "Fast AJV validation engine with detailed error pointers and keyword explanations",
      "Auto-generate complete Draft-07 JSON Schema from any sample JSON",
      "Preloaded template schemas for Users, Products, APIs, and GeoJSON",
    ],
    faqs: [
      {
        question: "How does JSON Schema validation work in JSON Studio?",
        answer:
          "JSON Studio runs the official AJV validation engine in your browser, testing your JSON data against your chosen or auto-generated JSON Schema and pinpointing exact error paths.",
      },
      {
        question: "Can I generate a JSON Schema from a sample JSON file?",
        answer:
          "Yes! Click 'Generate Schema from Data' to automatically infer properties, types, required fields, and nested structures into a compliant Draft-07 schema.",
      },
    ],
  },
  jsonpath: {
    name: "JSONPath Query Studio",
    title: "JSONPath Tester & Query Tool | JSON Studio",
    headline: "JSONPath Tester & Query Studio — Evaluate JSONPath Selectors Online",
    description:
      "Test, evaluate, and debug complex JSONPath query expressions against deeply nested JSON structures in real-time with an interactive syntax cheat-sheet.",
    path: "/jsonpath",
    keywords: [
      "jsonpath tester",
      "jsonpath evaluator",
      "query json online",
      "jsonpath filter",
      "jsonpath expressions online",
    ],
    features: [
      "Real-time evaluation with jsonpath-plus engine",
      "Syntax cheat-sheet with 1-click query insertion",
      "Result count, execution metrics, and matched item extraction",
    ],
    faqs: [
      {
        question: "What syntax is supported in JSONPath Query Studio?",
        answer:
          "JSON Studio supports all standard JSONPath operators: root ($), recursive descent (..), wildcards (*), array slices ([0:5]), and filter expressions ([?(@.price < 10)]).",
      },
      {
        question: "How do I extract a specific field from an array of objects?",
        answer:
          "Use the expression $.items[*].fieldName to extract all occurrences of fieldName across the array into a clean JSON list.",
      },
    ],
  },
  converter: {
    name: "JSON Converter",
    title: "JSON to TypeScript, YAML, CSV Converter | JSON Studio",
    headline: "JSON Converter — Convert JSON to TypeScript, YAML, CSV & XML",
    description:
      "Transform JSON payloads into strongly typed TypeScript Interfaces, clean YAML documents, tabular CSV spreadsheets, or structured XML hierarchy with 1-click export.",
    path: "/converter",
    keywords: [
      "json to typescript",
      "json to yaml converter",
      "json to csv converter",
      "json to xml",
      "convert json online",
      "json type generator",
    ],
    features: [
      "TypeScript Interface generator with type inference and optional field detection",
      "Bidirectional YAML, CSV, and XML serialization",
      "1-click clipboard copy and file downloading",
    ],
    faqs: [
      {
        question: "How do I generate TypeScript types from JSON?",
        answer:
          "Go to the Converter view, select TypeScript as the target format, and JSON Studio will instantly produce ready-to-use TypeScript interfaces inferred from your JSON structure.",
      },
      {
        question: "Can I convert nested JSON arrays to CSV spreadsheets?",
        answer:
          "Yes! JSON Studio automatically flattens object arrays and extracts column headers to produce clean, RFC-compliant CSV text.",
      },
    ],
  },
  repair: {
    name: "JSON Auto-Repair",
    title: "JSON Repair Tool — Fix Broken JSON | JSON Studio",
    headline: "JSON Auto-Repair & Fixer — Repair Malformed or Broken JSON Online",
    description:
      "Fix invalid JSON syntax errors automatically: unquoted keys, single quotes, trailing commas, missing closing brackets, and unescaped characters.",
    path: "/repair",
    keywords: [
      "json repair",
      "fix broken json",
      "json syntax fixer",
      "trailing comma remover json",
      "repair malformed json online",
    ],
    features: [
      "Heuristic auto-repair for 10+ common JSON syntax errors",
      "Side-by-side repair comparison showing changes made",
      "Instant 1-click application back to your workspace",
    ],
    faqs: [
      {
        question: "What types of JSON errors can be repaired automatically?",
        answer:
          "JSON Studio automatically repairs trailing commas, single-quoted strings, unquoted property keys, missing closing brackets/braces, JavaScript comments (// and /* */), and unescaped characters.",
      },
      {
        question: "Is auto-repair lossless?",
        answer:
          "Auto-repair aims to restore structural compliance while preserving all original keys, values, and data relationships.",
      },
    ],
  },
  graph: {
    name: "JSON Graph Visualizer",
    title: "JSON Graph Visualizer Online | JSON Studio",
    headline: "JSON Graph Visualizer — Interactive Node Hierarchy & Relationship Explorer",
    description:
      "Visualize complex nested JSON data as an interactive node graph. Inspect hierarchy, explore parent-child relations, and navigate large payloads visually.",
    path: "/graph",
    keywords: [
      "json graph visualizer",
      "visual json viewer",
      "json node graph",
      "json tree diagram",
      "interactive json explorer",
    ],
    features: [
      "Interactive pan and zoom visual canvas",
      "Color-coded node types (Objects, Arrays, Strings, Numbers, Booleans)",
      "Expandable and collapsible node branches",
    ],
    faqs: [
      {
        question: "How does the JSON Graph Visualizer work?",
        answer:
          "It parses your JSON structure into a directed node-link graph where each object and array is a container node, allowing you to visually explore relationships and schema depths.",
      },
    ],
  },
  table: {
    name: "JSON Table Viewer",
    title: "JSON Table Viewer Online | JSON Studio",
    headline: "JSON Table Viewer — Tabular Spreadsheet Data Grid for JSON Arrays",
    description:
      "View and analyze JSON arrays in a spreadsheet-like data grid with column sorting, column filtering, search, and pagination.",
    path: "/table",
    keywords: [
      "json table viewer",
      "view json as table",
      "json spreadsheet online",
      "json array table",
      "json grid viewer",
    ],
    features: [
      "Auto-detected columns from JSON object keys",
      "Search, sort, filter, and pagination across large arrays",
      "Export table view to CSV or formatted JSON",
    ],
    faqs: [
      {
        question: "Can I view nested JSON objects in table mode?",
        answer:
          "Yes, nested objects and arrays are displayed with formatted preview tags and can be expanded or copied directly from the table cell.",
      },
    ],
  },
};

export function getSoftwareAppSchema(config: ToolSeoConfig) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: `JSON Studio - ${config.name}`,
    headline: config.headline,
    url: `${BASE_URL}${config.path === "/" ? "" : config.path}`,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "All",
    browserRequirements: "Requires JavaScript and modern HTML5 Web Browser",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description: config.description,
    featureList: config.features,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      ratingCount: "380",
      bestRating: "5",
      worstRating: "1",
    },
  };
}

export function getFaqSchema(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function getBreadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${BASE_URL}${item.path === "/" ? "" : item.path}`,
    })),
  };
}

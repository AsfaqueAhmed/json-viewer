# ⚡ Modern JSON Studio & Viewer

A high-performance, developer-first JSON workbench built with **Next.js 16**, **Turbopack**, **Monaco Editor**, and **Tailwind CSS**.

![JSON Studio Preview](https://raw.githubusercontent.com/AsfaqueAhmed/json-viewer/main/public/preview.png) *(or screenshot)*

---

## ✨ Features

### 🗂️ Multi-Tab Workspace
- Seamlessly manage multiple JSON files simultaneously with tabs.
- Auto-saves workspace state, tab history, and active content to `localStorage`.
- Real-time file statistics (byte size, node count, depth level, validation status).

### 📝 Monaco Code Editor & Live Search
- Powered by VS Code's Monaco Editor with full JSON schema validation.
- Real-time key/value partial search engine with match counters, navigation (`Enter` / `Shift+Enter`), and live highlight decorations.
- Instant formatting, minification, null/empty stripping, sorting keys, and escaping/unescaping tools.

### 🌳 Visual Explorer & Interactive Tree View
- Collapsible interactive tree hierarchy with deep path tracking (`user.profile.roles[0]`).
- Quick node actions (copy value, copy JSON path, expand/collapse all).
- Color-coded data type badges (`string`, `number`, `boolean`, `object`, `array`, `null`).

### 📊 Table & Grid Data Matrix
- Converts JSON arrays and objects into responsive tabular data.
- Sortable columns, search filter, and CSV/Markdown export.

### 📐 Schema Studio
- Auto-generate JSON Schemas across **Draft 07**, **Draft 2020-12**, and **OpenAPI 3.0**.
- In-browser schema validation against real data with detailed error pointers.

### ⚖️ Monaco Diff & Comparison Engine
- Side-by-side visual diff viewer with Monaco DiffEditor.
- Two-way real-time synchronization between the original diff pane and workspace content.
- Inline change highlights, additions, and deletions.

### 🔄 Multi-Language Type & Format Converter
Convert JSON to strongly-typed models, classes, and serialization code with full `fromJson` and `toJson` constructor support:
- **C#**: `System.Text.Json` POCO classes with `FromJson` and `ToJson`.
- **Dart (Flutter)**: Flutter model classes with `factory Model.fromJson(...)` and `Map<String, dynamic> toJson()`.
- **Go**: Structs with JSON struct tags and `Unmarshal`/`Marshal` methods.
- **Java**: Jackson POJO classes or Java 16+ Records with `ObjectMapper` helpers.
- **Kotlin**: `@Serializable` data classes with `kotlinx.serialization` companion helpers.
- **Python**: Pydantic v2 `BaseModel` schemas with `from_json` and `to_json`.
- **Rust**: `serde` structs with `serde_json` serialization.
- **SQL DDL**: Relational PostgreSQL/MySQL table schemas.
- **Swift**: `Codable` & `Hashable` structs with `JSONDecoder` and `JSONEncoder`.
- **TypeScript**: Typed interfaces or type aliases with custom serializer functions.
- **Formats**: YAML, CSV Table, XML, Markdown Table, Base64, and URL Query String.

### ⚙️ Generation Controls Sidebar
- Make all fields nullable/optional (`?` / `Optional`).
- Include/exclude `fromJson` constructors and `toJson` serializers.
- Dart `num` for numbers, `final` fields, Java Records, TypeScript `readonly`, Go `,omitempty`.

### 🎨 Curated Developer Themes
- Includes 10+ developer themes: **VS Code Dark+**, **One Dark Pro**, **Dracula**, **GitHub Dark**, **Tokyo Night**, **Monokai Pro**, **Synthwave '84**, **Catppuccin Macchiato**, **VS Code Light**, and **GitHub Light**.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18.x or higher
- npm, pnpm, or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/AsfaqueAhmed/json-viewer.git

# Navigate into project directory
cd json-viewer

# Install dependencies
npm install
```

### Running Locally
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production
```bash
npm run build
npm run start
```

---

## 🛠️ Built With
- **[Next.js](https://nextjs.org/)** (App Router & Turbopack)
- **[React](https://react.dev/)**
- **[Monaco Editor](https://microsoft.github.io/monaco-editor/)**
- **[Tailwind CSS](https://tailwindcss.com/)**
- **[Lucide Icons](https://lucide.dev/)**
- **[js-yaml](https://github.com/nodeca/js-yaml)**

---

## 📄 License
MIT License. Free for open-source and commercial use.

"use client";

import React, { useState, useMemo } from "react";
import Editor from "@monaco-editor/react";
import {
  Copy,
  Check,
  Download,
  SlidersHorizontal,
  RotateCcw,
  PanelRightClose,
} from "lucide-react";
import { AppTheme } from "@/types";
import {
  convertJsonToCode,
  TargetLanguage,
  ConverterOptions,
  DEFAULT_CONVERTER_OPTIONS,
} from "@/lib/type-converter";
import {
  jsonToYaml,
  jsonToCsv,
  jsonToXml,
  jsonToBase64,
  jsonToQueryString,
  jsonToMarkdownTable,
  DataFormat,
} from "@/lib/format-converter";

interface ConverterStudioProps {
  data: unknown;
  theme: AppTheme;
}

type ConverterMode = TargetLanguage | DataFormat;

interface SettingCheckboxProps {
  title: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

const SettingCheckbox: React.FC<SettingCheckboxProps> = ({
  title,
  description,
  checked,
  onChange,
  disabled = false,
}) => {
  return (
    <label
      onClick={(e) => {
        e.preventDefault();
        if (!disabled) onChange(!checked);
      }}
      className={`flex items-start justify-between gap-3 px-2.5 py-2 rounded-md transition-colors cursor-pointer select-none ${
        disabled
          ? "opacity-50 cursor-not-allowed"
          : "hover:bg-[var(--bg-hover)]"
      }`}
    >
      <div className="flex flex-col gap-0.5 min-w-0 flex-1">
        <span className="font-medium text-xs text-[var(--text-primary)] leading-snug">{title}</span>
        {description && (
          <span className="text-[11px] text-[var(--text-muted)] leading-relaxed">{description}</span>
        )}
      </div>

      <div
        className={`w-4 h-4 mt-0.5 rounded flex items-center justify-center flex-shrink-0 transition-colors ${
          checked
            ? "bg-[var(--accent-primary)] text-white"
            : "border border-[var(--border-color)] bg-[var(--bg-input)]"
        }`}
      >
        {checked && <Check size={11} strokeWidth={3} />}
      </div>
    </label>
  );
};

export const ConverterStudio: React.FC<ConverterStudioProps> = ({
  data,
  theme,
}) => {
  const [selectedTarget, setSelectedTarget] = useState<ConverterMode>("typescript");
  const [rootTypeName, setRootTypeName] = useState("Root");
  const [copied, setCopied] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [options, setOptions] = useState<ConverterOptions>(DEFAULT_CONVERTER_OPTIONS);

  const targets: { id: ConverterMode; label: string; category: "types" | "formats"; ext: string; lang: string }[] = [
    // Types (Alphabetical)
    { id: "csharp", label: "C#", category: "types", ext: "cs", lang: "csharp" },
    { id: "dart", label: "Dart (Flutter)", category: "types", ext: "dart", lang: "dart" },
    { id: "go", label: "Go", category: "types", ext: "go", lang: "go" },
    { id: "java", label: "Java", category: "types", ext: "java", lang: "java" },
    { id: "kotlin", label: "Kotlin", category: "types", ext: "kt", lang: "kotlin" },
    { id: "python-pydantic", label: "Python", category: "types", ext: "py", lang: "python" },
    { id: "rust", label: "Rust", category: "types", ext: "rs", lang: "rust" },
    { id: "sql", label: "SQL DDL", category: "types", ext: "sql", lang: "sql" },
    { id: "swift", label: "Swift", category: "types", ext: "swift", lang: "swift" },
    { id: "typescript", label: "TypeScript", category: "types", ext: "ts", lang: "typescript" },

    // Formats (Alphabetical)
    { id: "base64", label: "Base64", category: "formats", ext: "txt", lang: "text" },
    { id: "csv", label: "CSV Table", category: "formats", ext: "csv", lang: "text" },
    { id: "markdown", label: "Markdown Table", category: "formats", ext: "md", lang: "markdown" },
    { id: "querystring", label: "URL Query String", category: "formats", ext: "txt", lang: "text" },
    { id: "xml", label: "XML", category: "formats", ext: "xml", lang: "xml" },
    { id: "yaml", label: "YAML", category: "formats", ext: "yaml", lang: "yaml" },
  ];

  const currentTargetConfig = targets.find((t) => t.id === selectedTarget) || targets[0];

  const updateOption = <K extends keyof ConverterOptions>(key: K, value: ConverterOptions[K]) => {
    setOptions((prev) => ({ ...prev, [key]: value }));
  };

  const convertedCode = useMemo(() => {
    if (!data) return "// No input JSON provided to convert";

    const effectiveOptions: ConverterOptions = {
      ...options,
      rootName: rootTypeName.trim() || "Root",
    };

    switch (selectedTarget) {
      case "typescript":
      case "dart":
      case "kotlin":
      case "java":
      case "swift":
      case "csharp":
      case "python-pydantic":
      case "go":
      case "rust":
      case "sql":
        return convertJsonToCode(data, selectedTarget as TargetLanguage, effectiveOptions);
      case "yaml":
        return jsonToYaml(data);
      case "csv":
        return jsonToCsv(data);
      case "xml":
        return jsonToXml(data, rootTypeName.toLowerCase());
      case "base64":
        return jsonToBase64(data);
      case "querystring":
        return jsonToQueryString(data);
      case "markdown":
        return jsonToMarkdownTable(data);
      default:
        return "";
    }
  }, [data, selectedTarget, rootTypeName, options]);

  const handleCopy = () => {
    navigator.clipboard.writeText(convertedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleDownload = () => {
    const blob = new Blob([convertedCode], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${rootTypeName.toLowerCase()}_converted.${currentTargetConfig.ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const monacoTheme = theme === "vscode-light" ? "vs" : "vs-dark";

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[var(--bg-primary)]">
      {/* Target Selector Toolbar */}
      <div
        className="h-10 flex items-center justify-between border-b text-xs select-none flex-shrink-0"
        style={{
          backgroundColor: "var(--bg-secondary)",
          borderColor: "var(--border-subtle)",
          paddingLeft: "12px",
          paddingRight: "12px",
        }}
      >
        {/* Converter Target Tabs */}
        <div className="flex-1 min-w-0 flex items-center gap-1 overflow-x-auto no-scrollbar py-1 pr-2">
          <span className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mr-1 hidden sm:inline flex-shrink-0">
            Types:
          </span>
          {targets
            .filter((t) => t.category === "types")
            .map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTarget(t.id)}
                className={`text-xs rounded-md transition-all font-medium flex-shrink-0 ${
                  selectedTarget === t.id
                    ? "bg-[var(--accent-primary)]/15 text-[var(--accent-primary)] font-semibold border border-[var(--accent-primary)]/40 shadow-xs"
                    : "text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
                }`}
                style={{
                  paddingLeft: "12px",
                  paddingRight: "12px",
                  paddingTop: "5px",
                  paddingBottom: "5px",
                }}
              >
                {t.label}
              </button>
            ))}

          <div className="h-4 w-[1px] bg-[var(--border-color)] opacity-70 self-center mx-1.5 flex-shrink-0" />

          <span className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mr-1 hidden sm:inline flex-shrink-0">
            Formats:
          </span>
          {targets
            .filter((t) => t.category === "formats")
            .map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTarget(t.id)}
                className={`text-xs rounded-md transition-all font-medium flex-shrink-0 ${
                  selectedTarget === t.id
                    ? "bg-[var(--accent-primary)]/15 text-[var(--accent-primary)] font-semibold border border-[var(--accent-primary)]/40 shadow-xs"
                    : "text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
                }`}
                style={{
                  paddingLeft: "12px",
                  paddingRight: "12px",
                  paddingTop: "5px",
                  paddingBottom: "5px",
                }}
              >
                {t.label}
              </button>
            ))}
        </div>

        {/* Separator between tabs and right actions */}
        <div
          className="h-4 w-[1px] bg-[var(--border-color)] opacity-70 self-center flex-shrink-0"
          style={{ marginLeft: "4px", marginRight: "4px" }}
        />

        {/* Right Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {currentTargetConfig.category === "types" && (
            <>
              {/* Toggle Sidebar Button */}
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                title={isSidebarOpen ? "Hide Settings Sidebar" : "Show Settings Sidebar"}
                className={`flex items-center gap-1.5 h-7 rounded-md text-xs font-medium transition-all ${
                  isSidebarOpen
                    ? "bg-[var(--accent-primary)]/15 text-[var(--accent-primary)] font-semibold border border-[var(--accent-primary)]/40 shadow-xs"
                    : "text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
                }`}
                style={{
                  paddingLeft: "10px",
                  paddingRight: "10px",
                }}
              >
                <SlidersHorizontal size={13} className={isSidebarOpen ? "text-[var(--accent-primary)]" : ""} />
                <span className="hidden md:inline">Options</span>
              </button>

              <div className="h-4 w-[1px] bg-[var(--border-color)] opacity-70 self-center mx-1 flex-shrink-0" />
            </>
          )}

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-md hover:bg-[var(--bg-hover)] text-[var(--text-primary)] transition-all flex-shrink-0 font-medium text-xs"
            style={{
              paddingLeft: "11px",
              paddingRight: "11px",
              paddingTop: "5px",
              paddingBottom: "5px",
            }}
          >
            {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 rounded-md hover:bg-[var(--bg-hover)] text-[var(--text-primary)] transition-all flex-shrink-0 font-medium text-xs"
            style={{
              paddingLeft: "11px",
              paddingRight: "11px",
              paddingTop: "5px",
              paddingBottom: "5px",
            }}
          >
            <Download size={13} />
            <span className="hidden sm:inline">.{currentTargetConfig.ext}</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Area (Split between Editor and Settings Sidebar) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left / Center: Monaco Output Editor */}
        <div className="flex-1 relative w-full h-full overflow-hidden">
          <Editor
            height="100%"
            language={currentTargetConfig.lang}
            theme={monacoTheme}
            value={convertedCode}
            options={{
              readOnly: true,
              fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
              fontSize: 13,
              lineHeight: 20,
              minimap: { enabled: true, maxColumn: 80 },
              scrollBeyondLastLine: false,
              automaticLayout: true,
              wordWrap: "on",
            }}
          />
        </div>

        {/* Right Collapsible Sidebar: Settings & Controls (Open by default) */}
        {isSidebarOpen && currentTargetConfig.category === "types" && (
          <div
            className="w-80 flex flex-col h-full border-l bg-[var(--bg-secondary)] overflow-hidden transition-all animate-fade-in flex-shrink-0"
            style={{ borderColor: "var(--border-color)" }}
          >
            {/* Sidebar Header */}
            <div
              className="h-10 border-b text-xs font-semibold text-[var(--text-secondary)] flex items-center justify-between flex-shrink-0"
              style={{
                borderColor: "var(--border-color)",
                backgroundColor: "var(--bg-activity)",
                paddingLeft: "16px",
                paddingRight: "16px",
              }}
            >
              <div className="flex items-center gap-2 text-[var(--text-primary)] font-semibold">
                <SlidersHorizontal size={14} className="text-[var(--accent-primary)]" />
                <span>Generation Options</span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setOptions(DEFAULT_CONVERTER_OPTIONS)}
                  title="Reset all settings to default"
                  className="px-2 py-1 rounded hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--accent-primary)] transition-colors flex items-center gap-1 text-[11px]"
                >
                  <RotateCcw size={11} />
                  <span>Reset</span>
                </button>

                <div className="h-3.5 w-[1px] bg-[var(--border-color)] opacity-60 mx-0.5" />

                <button
                  onClick={() => setIsSidebarOpen(false)}
                  title="Hide Sidebar"
                  className="p-1 rounded hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                >
                  <PanelRightClose size={14} />
                </button>
              </div>
            </div>

            {/* Sidebar Scrollable Body with guaranteed padding & spacing */}
            <div
              className="flex-1 overflow-y-auto text-xs font-sans"
              style={{
                padding: "16px",
              }}
            >
              {/* Section 1: Root Class & Type Configuration */}
              <div style={{ marginBottom: "16px" }}>
                <label
                  className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]"
                  style={{ marginBottom: "8px" }}
                >
                  Root Type / Model Name
                </label>
                <input
                  type="text"
                  value={rootTypeName}
                  onChange={(e) => setRootTypeName(e.target.value)}
                  placeholder="Root"
                  className="w-full h-8 bg-[var(--bg-input)] text-[var(--text-primary)] text-xs rounded-md outline-none border border-[var(--border-color)] focus:border-[var(--accent-primary)] font-mono transition-colors shadow-2xs"
                  style={{ paddingLeft: "10px", paddingRight: "10px" }}
                />
              </div>

              {/* Divider */}
              <div
                style={{
                  height: "1px",
                  backgroundColor: "var(--border-color)",
                  opacity: 0.5,
                  marginTop: "16px",
                  marginBottom: "16px",
                }}
              />

              {/* Section 2: General Model Configuration */}
              <div style={{ marginBottom: "16px" }}>
                <div
                  className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]"
                  style={{ marginBottom: "8px" }}
                >
                  General Properties
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <SettingCheckbox
                    title="All fields nullable"
                    description="Mark all properties as optional with ?"
                    checked={!!options.allNullable}
                    onChange={(val) => updateOption("allNullable", val)}
                  />
                </div>
              </div>

              {/* Divider */}
              <div
                style={{
                  height: "1px",
                  backgroundColor: "var(--border-color)",
                  opacity: 0.5,
                  marginTop: "16px",
                  marginBottom: "16px",
                }}
              />

              {/* Section 3: Serialization Constructors */}
              <div style={{ marginBottom: "16px" }}>
                <div
                  className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]"
                  style={{ marginBottom: "8px" }}
                >
                  Serialization Methods
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <SettingCheckbox
                    title="Include fromJson"
                    description="Generate JSON parsing constructor"
                    checked={options.includeFromJson !== false}
                    onChange={(val) => updateOption("includeFromJson", val)}
                  />

                  <SettingCheckbox
                    title="Include toJson"
                    description="Generate JSON serialization method"
                    checked={options.includeToJson !== false}
                    onChange={(val) => updateOption("includeToJson", val)}
                  />
                </div>
              </div>

              {/* Section 4: Active Language Specific Options */}
              {selectedTarget === "dart" && (
                <>
                  {/* Divider */}
                  <div
                    style={{
                      height: "1px",
                      backgroundColor: "var(--border-color)",
                      opacity: 0.5,
                      marginTop: "16px",
                      marginBottom: "16px",
                    }}
                  />
                  <div style={{ marginBottom: "16px" }}>
                    <div
                      className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5"
                      style={{ marginBottom: "8px" }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      <span>Dart / Flutter</span>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      <SettingCheckbox
                        title="Use num for numbers"
                        description="Accepts both integer and double values safely"
                        checked={!!options.dartUseNum}
                        onChange={(val) => updateOption("dartUseNum", val)}
                      />

                      <SettingCheckbox
                        title="Make fields final"
                        description="Declare immutable class members"
                        checked={options.dartFinalFields !== false}
                        onChange={(val) => updateOption("dartFinalFields", val)}
                      />
                    </div>
                  </div>
                </>
              )}

              {selectedTarget === "java" && (
                <>
                  {/* Divider */}
                  <div
                    style={{
                      height: "1px",
                      backgroundColor: "var(--border-color)",
                      opacity: 0.5,
                      marginTop: "16px",
                      marginBottom: "16px",
                    }}
                  />
                  <div style={{ marginBottom: "16px" }}>
                    <div
                      className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5"
                      style={{ marginBottom: "8px" }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      <span>Java Options</span>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      <SettingCheckbox
                        title="Use Java 16+ Records"
                        description="Compact immutable record classes"
                        checked={!!options.javaUseRecords}
                        onChange={(val) => updateOption("javaUseRecords", val)}
                      />

                      {!options.javaUseRecords && (
                        <SettingCheckbox
                          title="Getters & Setters"
                          description="Standard JavaBean accessor methods"
                          checked={options.javaGettersSetters !== false}
                          onChange={(val) => updateOption("javaGettersSetters", val)}
                        />
                      )}
                    </div>
                  </div>
                </>
              )}

              {selectedTarget === "typescript" && (
                <>
                  {/* Divider */}
                  <div
                    style={{
                      height: "1px",
                      backgroundColor: "var(--border-color)",
                      opacity: 0.5,
                      marginTop: "16px",
                      marginBottom: "16px",
                    }}
                  />
                  <div style={{ marginBottom: "16px" }}>
                    <div
                      className="text-[11px] font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5"
                      style={{ marginBottom: "8px" }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                      <span>TypeScript Options</span>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      <SettingCheckbox
                        title="Use type alias"
                        description="Generate type instead of interface"
                        checked={!!options.tsUseTypeAlias}
                        onChange={(val) => updateOption("tsUseTypeAlias", val)}
                      />

                      <SettingCheckbox
                        title="Readonly properties"
                        description="Prefix properties with readonly modifier"
                        checked={!!options.tsReadonly}
                        onChange={(val) => updateOption("tsReadonly", val)}
                      />
                    </div>
                  </div>
                </>
              )}

              {selectedTarget === "swift" && (
                <>
                  {/* Divider */}
                  <div
                    style={{
                      height: "1px",
                      backgroundColor: "var(--border-color)",
                      opacity: 0.5,
                      marginTop: "16px",
                      marginBottom: "16px",
                    }}
                  />
                  <div style={{ marginBottom: "16px" }}>
                    <div
                      className="text-[11px] font-bold uppercase tracking-wider text-orange-400 flex items-center gap-1.5"
                      style={{ marginBottom: "8px" }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                      <span>Swift Options</span>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      <SettingCheckbox
                        title="Conform to Hashable"
                        description="Include Hashable & Codable protocols"
                        checked={options.swiftHashable !== false}
                        onChange={(val) => updateOption("swiftHashable", val)}
                      />
                    </div>
                  </div>
                </>
              )}

              {selectedTarget === "go" && (
                <>
                  {/* Divider */}
                  <div
                    style={{
                      height: "1px",
                      backgroundColor: "var(--border-color)",
                      opacity: 0.5,
                      marginTop: "16px",
                      marginBottom: "16px",
                    }}
                  />
                  <div style={{ marginBottom: "16px" }}>
                    <div
                      className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5"
                      style={{ marginBottom: "8px" }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      <span>Go Options</span>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      <SettingCheckbox
                        title="Add ,omitempty"
                        description="Include ,omitempty in JSON struct tags"
                        checked={!!options.goOmitempty}
                        onChange={(val) => updateOption("goOmitempty", val)}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

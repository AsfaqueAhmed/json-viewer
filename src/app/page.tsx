"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { ActiveView, AppTheme, DocumentTab } from "@/types";
import { SAMPLE_DATASETS, SampleItem } from "@/lib/sample-data";
import {
  parseJson,
  formatJson,
  minifyJson,
  sortJsonKeys,
  removeNullValues,
  transformKeysCase,
  repairJsonString,
  calculateJsonStats,
} from "@/lib/json-parser";

import { ActivityBar } from "@/components/ActivityBar";
import { Navbar } from "@/components/Navbar";
import { DocumentTabs } from "@/components/DocumentTabs";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { StatusBar } from "@/components/StatusBar";
import { CommandPalette } from "@/components/Modals/CommandPalette";
import { UrlImportModal } from "@/components/Modals/UrlImportModal";
import { ShortcutsModal } from "@/components/Modals/ShortcutsModal";

import { TreeViewer } from "@/components/Views/TreeViewer";
import { EditorView } from "@/components/Views/EditorView";
import { TableView } from "@/components/Views/TableView";
import { DiffViewer } from "@/components/Views/DiffViewer";
import { QueryStudio } from "@/components/Views/QueryStudio";
import { SchemaStudio } from "@/components/Views/SchemaStudio";
import { ConverterStudio } from "@/components/Views/ConverterStudio";
import { GraphViewer } from "@/components/Views/GraphViewer";
import { RepairStudio } from "@/components/Views/RepairStudio";

const STORAGE_KEY_TABS = "json_studio_tabs_v1";
const STORAGE_KEY_THEME = "json_studio_theme_v1";

export default function JsonStudioPage() {
  // Tabs State
  const [tabs, setTabs] = useState<DocumentTab[]>(() => {
    const defaultSample = SAMPLE_DATASETS[0];
    return [
      {
        id: "tab-1",
        title: "api_response.json",
        content: formatJson(defaultSample.data, 2),
        isModified: false,
      },
    ];
  });
  const [activeTabId, setActiveTabId] = useState<string>("tab-1");

  // View & UI State
  const [activeView, setActiveView] = useState<ActiveView>("editor");
  const [isSplitView, setIsSplitView] = useState(false);
  const [theme, setTheme] = useState<AppTheme>("vscode-dark");
  const [indentation, setIndentation] = useState<number | string>(2);
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Modals State
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isUrlImportOpen, setIsUrlImportOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  // Hidden File Input
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Active Tab Document
  const activeTab = useMemo(() => {
    return tabs.find((t) => t.id === activeTabId) || tabs[0];
  }, [tabs, activeTabId]);

  // Sync Theme with HTML element
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem(STORAGE_KEY_THEME, theme);
    } catch {
      // ignore
    }
  }, [theme]);

  // Load Saved Tabs & Theme from LocalStorage on mount.
  // Must run in an effect (not render) since localStorage is unavailable during SSR
  // and reading it during render would cause a hydration mismatch.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem(STORAGE_KEY_THEME) as AppTheme | null;
      if (savedTheme) setTheme(savedTheme);

      const savedTabs = localStorage.getItem(STORAGE_KEY_TABS);
      if (savedTabs) {
        const parsedTabs = JSON.parse(savedTabs) as DocumentTab[];
        if (Array.isArray(parsedTabs) && parsedTabs.length > 0) {
          setTabs(parsedTabs);
          setActiveTabId(parsedTabs[0].id);
        }
      }
    } catch {
      // ignore
    }
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Save Tabs to LocalStorage
  const saveTabsDebounced = useCallback((updatedTabs: DocumentTab[]) => {
    try {
      localStorage.setItem(STORAGE_KEY_TABS, JSON.stringify(updatedTabs));
    } catch {
      // ignore
    }
  }, []);

  // Live JSON Parsing
  const activeContent = activeTab?.content ?? "";
  const parseResult = useMemo(() => {
    return parseJson(activeContent);
  }, [activeContent]);

  // Live Statistics
  const jsonStats = useMemo(() => {
    return calculateJsonStats(parseResult.data, activeContent);
  }, [parseResult.data, activeContent]);

  // Update active tab content
  const handleUpdateActiveContent = useCallback(
    (newContent: string) => {
      setTabs((prev) => {
        const updated = prev.map((t) =>
          t.id === activeTabId
            ? { ...t, content: newContent, isModified: true }
            : t
        );
        saveTabsDebounced(updated);
        return updated;
      });
    },
    [activeTabId, saveTabsDebounced]
  );

  // Update data from Tree / Table inline edits
  const handleUpdateParsedData = useCallback(
    (newData: unknown) => {
      const formatted = formatJson(newData, indentation);
      handleUpdateActiveContent(formatted);
    },
    [indentation, handleUpdateActiveContent]
  );

  // Tab Operations
  const handleAddTab = useCallback(() => {
    setTabs((prev) => {
      const newId = `tab-${Date.now()}`;
      const newTab: DocumentTab = {
        id: newId,
        title: `untitled-${prev.length + 1}.json`,
        content: "{\n  \"message\": \"Hello, JSON Studio!\"\n}",
        isModified: false,
      };
      const updated = [...prev, newTab];
      setActiveTabId(newId);
      saveTabsDebounced(updated);
      return updated;
    });
  }, [saveTabsDebounced]);

  const handleCloseTab = (id: string) => {
    if (tabs.length <= 1) return;
    const idx = tabs.findIndex((t) => t.id === id);
    const updated = tabs.filter((t) => t.id !== id);
    setTabs(updated);
    if (activeTabId === id) {
      const nextActive = updated[Math.max(0, idx - 1)];
      setActiveTabId(nextActive.id);
    }
    saveTabsDebounced(updated);
  };

  const handleRenameTab = (id: string, newTitle: string) => {
    setTabs((prev) => {
      const updated = prev.map((t) =>
        t.id === id ? { ...t, title: newTitle } : t
      );
      saveTabsDebounced(updated);
      return updated;
    });
  };

  // Sample Data Loading
  const handleLoadSample = (sample: SampleItem) => {
    const formatted = typeof sample.data === "string" ? sample.data : formatJson(sample.data, indentation);
    const newId = `tab-${Date.now()}`;
    const newTab: DocumentTab = {
      id: newId,
      title: `${sample.id}.json`,
      content: formatted,
      isModified: false,
    };
    const updated = [...tabs, newTab];
    setTabs(updated);
    setActiveTabId(newId);
    saveTabsDebounced(updated);
  };

  const handleLoadSampleById = (sampleId: string) => {
    const s = SAMPLE_DATASETS.find((item) => item.id === sampleId);
    if (s) handleLoadSample(s);
  };

  // Formatting operations
  const handleFormat = useCallback(() => {
    if (!parseResult.valid) {
      const repaired = repairJsonString(activeTab.content);
      if (repaired.success) {
        const parsed = parseJson(repaired.repaired);
        handleUpdateActiveContent(formatJson(parsed.data, indentation));
      }
      return;
    }
    handleUpdateActiveContent(formatJson(parseResult.data, indentation));
  }, [parseResult, activeTab, indentation, handleUpdateActiveContent]);

  const handleMinify = () => {
    if (parseResult.valid) {
      handleUpdateActiveContent(minifyJson(parseResult.data));
    }
  };

  const handleSortKeys = () => {
    if (parseResult.valid && parseResult.data !== null) {
      const sorted = sortJsonKeys(parseResult.data, "asc");
      handleUpdateActiveContent(formatJson(sorted, indentation));
    }
  };

  const handleAutoRepair = () => {
    const repaired = repairJsonString(activeTab.content);
    if (repaired.success) {
      const p = parseJson(repaired.repaired);
      handleUpdateActiveContent(formatJson(p.data, indentation));
    } else {
      setActiveView("repair");
    }
  };

  const handleTransformKeysCase = (caseType: "camel" | "snake" | "kebab" | "pascal") => {
    if (parseResult.valid && parseResult.data !== null) {
      const transformed = transformKeysCase(parseResult.data, caseType);
      handleUpdateActiveContent(formatJson(transformed, indentation));
    }
  };

  const handleRemoveNulls = () => {
    if (parseResult.valid && parseResult.data !== null) {
      const cleaned = removeNullValues(parseResult.data);
      handleUpdateActiveContent(formatJson(cleaned, indentation));
    }
  };

  const handleClear = () => {
    handleUpdateActiveContent("{\n  \n}");
  };

  const handleCopyAll = () => {
    navigator.clipboard.writeText(activeTab.content);
  };

  const handleDownload = () => {
    const blob = new Blob([activeTab.content], { type: "application/json;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = activeTab.title.endsWith(".json") ? activeTab.title : `${activeTab.title}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // File Upload Handlers
  const handleOpenFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const newId = `tab-${Date.now()}`;
      const newTab: DocumentTab = {
        id: newId,
        title: file.name,
        content: text,
        isModified: false,
      };
      const updated = [...tabs, newTab];
      setTabs(updated);
      setActiveTabId(newId);
      saveTabsDebounced(updated);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // Drag & Drop File onto Workspace
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const newId = `tab-${Date.now()}`;
      const newTab: DocumentTab = {
        id: newId,
        title: file.name,
        content: text,
        isModified: false,
      };
      const updated = [...tabs, newTab];
      setTabs(updated);
      setActiveTabId(newId);
      saveTabsDebounced(updated);
    };
    reader.readAsText(file);
  };

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Command Palette (Cmd+K / Ctrl+K)
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
      // New Tab (Cmd+N / Ctrl+N)
      else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "n" && !e.shiftKey) {
        e.preventDefault();
        handleAddTab();
      }
      // Format (Shift+Alt+F)
      else if (e.shiftKey && e.altKey && e.key.toLowerCase() === "f") {
        e.preventDefault();
        handleFormat();
      }
      // Shortcuts Help (Cmd+/ or Ctrl+/)
      else if ((e.metaKey || e.ctrlKey) && e.key === "/") {
        e.preventDefault();
        setIsShortcutsOpen((prev) => !prev);
      }
      // View switching shortcuts (Alt+1 through Alt+9)
      else if (e.altKey && !e.ctrlKey && !e.metaKey) {
        if (e.key === "1") { e.preventDefault(); setActiveView("tree"); }
        if (e.key === "2") { e.preventDefault(); setActiveView("editor"); }
        if (e.key === "3") { e.preventDefault(); setActiveView("table"); }
        if (e.key === "4") { e.preventDefault(); setActiveView("diff"); }
        if (e.key === "5") { e.preventDefault(); setActiveView("query"); }
        if (e.key === "6") { e.preventDefault(); setActiveView("schema"); }
        if (e.key === "7") { e.preventDefault(); setActiveView("converter"); }
        if (e.key === "8") { e.preventDefault(); setActiveView("graph"); }
        if (e.key === "9") { e.preventDefault(); setActiveView("repair"); }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleAddTab, handleFormat]);

  const handlePasteJson = useCallback((rawText: string, asNewTab = false) => {
    const repaired = repairJsonString(rawText);
    const textToUse = repaired.success ? formatJson(parseJson(repaired.repaired).data, indentation) : rawText;

    if (asNewTab) {
      const newId = `tab-${Date.now()}`;
      const newTab: DocumentTab = {
        id: newId,
        title: `pasted_${tabs.length + 1}.json`,
        content: textToUse,
        isModified: false,
      };
      const updated = [...tabs, newTab];
      setTabs(updated);
      setActiveTabId(newId);
      saveTabsDebounced(updated);
    } else {
      handleUpdateActiveContent(textToUse);
    }
  }, [tabs, indentation, handleUpdateActiveContent, saveTabsDebounced]);

  // Main View Component Renderer
  const renderPrimaryView = () => {
    switch (activeView) {
      case "tree":
        return (
          <TreeViewer
            data={parseResult.data}
            searchQuery={searchQuery}
            onUpdateData={handleUpdateParsedData}
            onSelectPath={setCurrentPath}
          />
        );
      case "editor":
        return (
          <EditorView
            value={activeTab.content}
            onChange={handleUpdateActiveContent}
            theme={theme}
            isValid={parseResult.valid}
            stats={jsonStats}
            onFormat={handleFormat}
            onMinify={handleMinify}
            onSortKeys={handleSortKeys}
            onRepair={handleAutoRepair}
            onTransformKeysCase={handleTransformKeysCase}
            onRemoveNulls={handleRemoveNulls}
          />
        );
      case "table":
        return <TableView data={parseResult.data} />;
      case "diff":
        return (
          <DiffViewer
            currentJsonText={activeTab.content}
            onUpdateJsonText={handleUpdateActiveContent}
            tabs={tabs}
            theme={theme}
          />
        );
      case "query":
        return <QueryStudio data={parseResult.data} theme={theme} />;
      case "schema":
        return (
          <SchemaStudio
            currentJsonText={activeTab.content}
            onUpdateJsonText={handleUpdateActiveContent}
            theme={theme}
          />
        );
      case "converter":
        return <ConverterStudio data={parseResult.data} theme={theme} />;
      case "graph":
        return <GraphViewer data={parseResult.data} />;
      case "repair":
        return (
          <RepairStudio
            currentJsonText={activeTab.content}
            onApplyRepaired={(repaired) => {
              handleUpdateActiveContent(repaired);
              setActiveView("editor");
            }}
            theme={theme}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div
      className="flex flex-col h-screen w-screen overflow-hidden"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json,.txt,.yaml,.yml,.csv,.xml"
        className="hidden"
      />

      {/* Top Navbar */}
      <Navbar
        theme={theme}
        onThemeChange={setTheme}
        onOpenFileUpload={handleOpenFileUpload}
        onOpenUrlImport={() => setIsUrlImportOpen(true)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onPasteJson={handlePasteJson}
        onFormat={handleFormat}
        onRepair={handleAutoRepair}
        onClear={handleClear}
        onCopyAll={handleCopyAll}
        onDownload={handleDownload}
        isSplitView={isSplitView}
        onToggleSplitView={() => setIsSplitView((s) => !s)}
      />

      {/* Middle Layout: Activity Bar (Extends to the left of Document Tabs) + Workspace Views */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Vertical Activity Bar */}
        <ActivityBar
          activeView={activeView}
          onViewChange={setActiveView}
          onOpenShortcuts={() => setIsShortcutsOpen(true)}
          hasErrors={!parseResult.valid}
        />

        {/* Main Work Area */}
        <main className="flex-1 flex flex-col overflow-hidden relative">
          {/* Document Tabs Bar (Rendered to the right of ActivityBar with bottom active indicator) */}
          <DocumentTabs
            tabs={tabs}
            activeTabId={activeTabId}
            onSelectTab={setActiveTabId}
            onCloseTab={handleCloseTab}
            onAddTab={handleAddTab}
            onRenameTab={handleRenameTab}
          />

          {/* Breadcrumbs & Search Toolbar (Only displayed in Tree & JSON Explorer view) */}
          {activeView === "tree" && (
            <Breadcrumbs
              currentPath={currentPath}
              onSelectPath={setCurrentPath}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          )}

          {/* Active Workspaces / Split View Area */}
          <div className="flex-1 flex overflow-hidden">
            {isSplitView ? (
              <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                {/* Left Split: Monaco Editor */}
                <div className="w-full md:w-1/2 h-1/2 md:h-full border-b md:border-b-0 md:border-r border-[var(--border-color)] overflow-hidden">
                  <EditorView
                    value={activeTab.content}
                    onChange={handleUpdateActiveContent}
                    theme={theme}
                    isValid={parseResult.valid}
                    stats={jsonStats}
                    onFormat={handleFormat}
                    onMinify={handleMinify}
                    onSortKeys={handleSortKeys}
                    onRepair={handleAutoRepair}
                    onTransformKeysCase={handleTransformKeysCase}
                    onRemoveNulls={handleRemoveNulls}
                  />
                </div>

                {/* Right Split: Selected Mode View (Tree / Table / Diff / Schema / Converter) */}
                <div className="w-full md:w-1/2 h-1/2 md:h-full overflow-hidden">
                  {renderPrimaryView()}
                </div>
              </div>
            ) : (
              <div className="flex-1 h-full overflow-hidden">
                {renderPrimaryView()}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Bottom Status Bar */}
      <StatusBar
        isValid={parseResult.valid}
        errorMessage={parseResult.error?.message}
        errorLine={parseResult.error?.line}
        errorColumn={parseResult.error?.column}
        stats={jsonStats}
        indentation={indentation}
        onChangeIndentation={(newIndent) => {
          setIndentation(newIndent);
          if (parseResult.valid && parseResult.data !== null) {
            handleUpdateActiveContent(formatJson(parseResult.data, newIndent));
          }
        }}
        onAutoRepair={handleAutoRepair}
        onJumpToError={() => setActiveView("editor")}
      />

      {/* Modals & Dialogs */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onViewChange={setActiveView}
        onThemeChange={setTheme}
        onFormat={handleFormat}
        onMinify={handleMinify}
        onSortKeys={handleSortKeys}
        onRepair={handleAutoRepair}
        onNewTab={handleAddTab}
        onOpenUrlImport={() => setIsUrlImportOpen(true)}
        onCopyAll={handleCopyAll}
        onDownload={handleDownload}
        onLoadSample={handleLoadSampleById}
      />

      <UrlImportModal
        isOpen={isUrlImportOpen}
        onClose={() => setIsUrlImportOpen(false)}
        onImport={(content, title) => {
          const newId = `tab-${Date.now()}`;
          const newTab: DocumentTab = {
            id: newId,
            title: title || `imported_${Date.now()}.json`,
            content,
            isModified: false,
          };
          const updated = [...tabs, newTab];
          setTabs(updated);
          setActiveTabId(newId);
          saveTabsDebounced(updated);
        }}
      />

      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </div>
  );
}

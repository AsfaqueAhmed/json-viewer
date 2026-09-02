"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { ActiveView, AppTheme, DocumentTab } from "@/types";
import { SAMPLE_DATASETS } from "@/lib/sample-data";
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
import { SeoContentSection } from "@/components/SeoContentSection";
import { TOOLS_CONFIG } from "@/lib/seo-schemas";
import { trackEvent } from "@/lib/analytics";

const STORAGE_KEY_TABS = "json_studio_tabs_v1";
const STORAGE_KEY_THEME = "json_studio_theme_v1";

interface JsonStudioAppProps {
  initialView?: ActiveView;
  currentToolKey?: string;
}

export function JsonStudioApp({
  initialView = "editor",
  currentToolKey = "editor",
}: JsonStudioAppProps) {
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
  const [activeView, setActiveView] = useState<ActiveView>(initialView);
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

  // Load Saved Tabs & Theme from LocalStorage on mount
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

  // Save Tabs with debounce
  const saveTabsDebounced = useCallback((updatedTabs: DocumentTab[]) => {
    try {
      localStorage.setItem(STORAGE_KEY_TABS, JSON.stringify(updatedTabs));
    } catch {
      // ignore
    }
  }, []);

  const activeTabContent = activeTab?.content || "";

  // Parse active content
  const parseResult = useMemo(() => {
    return parseJson(activeTabContent);
  }, [activeTabContent]);

  // JSON Statistics
  const jsonStats = useMemo(() => {
    return calculateJsonStats(parseResult.data, activeTabContent);
  }, [activeTabContent, parseResult.data]);

  // Tab Operations
  const handleUpdateActiveContent = useCallback(
    (newContent: string) => {
      setTabs((prevTabs) => {
        const updated = prevTabs.map((tab) =>
          tab.id === activeTabId
            ? { ...tab, content: newContent, isModified: true }
            : tab
        );
        saveTabsDebounced(updated);
        return updated;
      });
    },
    [activeTabId, saveTabsDebounced]
  );

  const handleAddTab = useCallback(() => {
    const newId = `tab-${Date.now()}`;
    const newTab: DocumentTab = {
      id: newId,
      title: `document_${tabs.length + 1}.json`,
      content: "{\n  \n}",
      isModified: false,
    };
    const updated = [...tabs, newTab];
    setTabs(updated);
    setActiveTabId(newId);
    saveTabsDebounced(updated);
  }, [tabs, saveTabsDebounced]);

  const handleCloseTab = useCallback(
    (tabIdToClose: string) => {
      if (tabs.length === 1) {
        handleUpdateActiveContent("");
        return;
      }
      const newTabs = tabs.filter((t) => t.id !== tabIdToClose);
      setTabs(newTabs);
      saveTabsDebounced(newTabs);

      if (activeTabId === tabIdToClose) {
        const closedIndex = tabs.findIndex((t) => t.id === tabIdToClose);
        const nextIndex = Math.max(0, closedIndex - 1);
        setActiveTabId(newTabs[nextIndex].id);
      }
    },
    [tabs, activeTabId, handleUpdateActiveContent, saveTabsDebounced]
  );

  const handleRenameTab = useCallback(
    (tabId: string, newTitle: string) => {
      const updated = tabs.map((t) =>
        t.id === tabId ? { ...t, title: newTitle } : t
      );
      setTabs(updated);
      saveTabsDebounced(updated);
    },
    [tabs, saveTabsDebounced]
  );

  // Transformations
  const handleFormat = useCallback(() => {
    if (!parseResult.valid || parseResult.data === null) {
      const repaired = repairJsonString(activeTab.content);
      if (repaired.success && repaired.repaired) {
        handleUpdateActiveContent(repaired.repaired);
        trackEvent("json_format_auto_repaired");
        return;
      }
      return;
    }
    const formatted = formatJson(parseResult.data, indentation);
    handleUpdateActiveContent(formatted);
    trackEvent("json_format", { indentation: String(indentation) });
  }, [parseResult, activeTab.content, indentation, handleUpdateActiveContent]);

  const handleMinify = useCallback(() => {
    if (!parseResult.valid || parseResult.data === null) return;
    const minified = minifyJson(parseResult.data);
    handleUpdateActiveContent(minified);
    trackEvent("json_minify");
  }, [parseResult, handleUpdateActiveContent]);

  const handleSortKeys = useCallback(() => {
    if (!parseResult.valid || parseResult.data === null) return;
    const sorted = sortJsonKeys(parseResult.data);
    handleUpdateActiveContent(formatJson(sorted, indentation));
    trackEvent("json_sort_keys");
  }, [parseResult, indentation, handleUpdateActiveContent]);

  const handleAutoRepair = useCallback(() => {
    const repaired = repairJsonString(activeTab.content);
    if (repaired.success && repaired.repaired) {
      handleUpdateActiveContent(repaired.repaired);
      trackEvent("json_auto_repair", { success: true });
    }
  }, [activeTab.content, handleUpdateActiveContent]);

  const handleRemoveNulls = useCallback(() => {
    if (!parseResult.valid || parseResult.data === null) return;
    const cleaned = removeNullValues(parseResult.data);
    handleUpdateActiveContent(formatJson(cleaned, indentation));
    trackEvent("json_remove_nulls");
  }, [parseResult, indentation, handleUpdateActiveContent]);

  const handleTransformKeysCase = useCallback(
    (targetCase: "camel" | "snake" | "kebab" | "pascal") => {
      if (!parseResult.valid || parseResult.data === null) return;
      const transformed = transformKeysCase(parseResult.data, targetCase);
      handleUpdateActiveContent(formatJson(transformed, indentation));
      trackEvent("json_transform_case", { case: targetCase });
    },
    [parseResult, indentation, handleUpdateActiveContent]
  );

  // File Handlers
  const handleOpenFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const newId = `tab-${Date.now()}`;
        const newTab: DocumentTab = {
          id: newId,
          title: file.name,
          content,
          isModified: false,
        };
        const updated = [...tabs, newTab];
        setTabs(updated);
        setActiveTabId(newId);
        saveTabsDebounced(updated);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handlePasteJson = (text: string, asNewTab: boolean = false) => {
    if (asNewTab) {
      const newId = `tab-${Date.now()}`;
      const newTab: DocumentTab = {
        id: newId,
        title: `pasted_${tabs.length + 1}.json`,
        content: text,
        isModified: false,
      };
      const updated = [...tabs, newTab];
      setTabs(updated);
      setActiveTabId(newId);
      saveTabsDebounced(updated);
    } else {
      handleUpdateActiveContent(text);
    }
  };

  const handleClear = () => {
    handleUpdateActiveContent("");
  };

  const handleCopyAll = () => {
    navigator.clipboard.writeText(activeTab.content);
  };

  const handleDownload = () => {
    const blob = new Blob([activeTab.content], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = activeTab.title || "document.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLoadSampleById = (sampleId: string) => {
    const sample = SAMPLE_DATASETS.find((s) => s.id === sampleId);
    if (!sample) return;
    const newId = `tab-${Date.now()}`;
    const newTab: DocumentTab = {
      id: newId,
      title: `${sample.id}.json`,
      content: formatJson(sample.data, indentation),
      isModified: false,
    };
    const updated = [...tabs, newTab];
    setTabs(updated);
    setActiveTabId(newId);
    saveTabsDebounced(updated);
  };

  // Drag & Drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) {
          const newId = `tab-${Date.now()}`;
          const newTab: DocumentTab = {
            id: newId,
            title: file.name,
            content,
            isModified: false,
          };
          const updated = [...tabs, newTab];
          setTabs(updated);
          setActiveTabId(newId);
          saveTabsDebounced(updated);
        }
      };
      reader.readAsText(file);
    }
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Command Palette (Ctrl+P / Cmd+P)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "p") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
      // Shortcuts Modal (Ctrl+/ / Cmd+/)
      else if ((e.ctrlKey || e.metaKey) && e.key === "/") {
        e.preventDefault();
        setIsShortcutsOpen((prev) => !prev);
      }
      // Format (Alt+Shift+F)
      else if (e.altKey && e.shiftKey && e.key.toLowerCase() === "f") {
        e.preventDefault();
        handleFormat();
      }
      // Auto-Repair (Alt+Shift+R)
      else if (e.altKey && e.shiftKey && e.key.toLowerCase() === "r") {
        e.preventDefault();
        handleAutoRepair();
      }
      // New Tab (Ctrl+T / Cmd+T)
      else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "t" && !e.shiftKey) {
        e.preventDefault();
        handleAddTab();
      }
      // Switch Views with Alt+1..7
      else if (e.altKey && !e.ctrlKey && !e.metaKey) {
        if (e.key === "1") { e.preventDefault(); setActiveView("editor"); }
        else if (e.key === "2") { e.preventDefault(); setActiveView("tree"); }
        else if (e.key === "3") { e.preventDefault(); setActiveView("table"); }
        else if (e.key === "4") { e.preventDefault(); setActiveView("diff"); }
        else if (e.key === "5") { e.preventDefault(); setActiveView("schema"); }
        else if (e.key === "6") { e.preventDefault(); setActiveView("converter"); }
        else if (e.key === "7") { e.preventDefault(); setActiveView("repair"); }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleFormat, handleAutoRepair, handleAddTab]);

  // Primary View Renderer
  const renderPrimaryView = () => {
    switch (activeView) {
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
      case "tree":
        return (
          <TreeViewer
            data={parseResult.data}
            searchQuery={searchQuery}
            onSelectPath={setCurrentPath}
            onUpdateData={(newData: unknown) =>
              handleUpdateActiveContent(formatJson(newData, indentation))
            }
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
            onApplyRepaired={(repaired: string) => {
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
      className="flex flex-col min-h-screen w-full overflow-x-hidden bg-[var(--bg-primary)] text-[var(--text-primary)]"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* 100vh Full Desktop IDE Workspace */}
      <div className="flex flex-col h-screen w-full flex-shrink-0 overflow-hidden relative">
        {/* Page-specific H1 for SEO/accessibility — visually hidden to preserve the IDE layout */}
        <h1 className="sr-only">
          {(TOOLS_CONFIG[currentToolKey] ?? TOOLS_CONFIG.editor).headline}
        </h1>

        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".json,.txt,.yaml,.yml,.csv,.xml"
          aria-label="Upload JSON file"
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

        {/* Middle Layout: Activity Bar + Workspace Views */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Vertical Activity Bar */}
          <ActivityBar
            activeView={activeView}
            onViewChange={setActiveView}
            onOpenShortcuts={() => setIsShortcutsOpen(true)}
            hasErrors={!parseResult.valid}
          />

          {/* Main Work Area */}
          <main className="flex-1 flex flex-col overflow-hidden relative" role="main">
            {/* Document Tabs Bar */}
            <DocumentTabs
              tabs={tabs}
              activeTabId={activeTabId}
              onSelectTab={setActiveTabId}
              onCloseTab={handleCloseTab}
              onAddTab={handleAddTab}
              onRenameTab={handleRenameTab}
            />

            {/* Breadcrumbs & Search Toolbar */}
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

                  {/* Right Split: Selected Mode View */}
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
      </div>

      {/* Semantic SEO & Developer Guide Documentation Hub */}
      <SeoContentSection currentToolKey={currentToolKey} />

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

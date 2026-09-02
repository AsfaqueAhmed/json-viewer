export type ActiveView =
  | "tree"
  | "editor"
  | "table"
  | "diff"
  | "query"
  | "schema"
  | "converter"
  | "graph"
  | "repair";

export type AppTheme = "vscode-dark" | "tokyo-night" | "monokai" | "vscode-light";

export interface DocumentTab {
  id: string;
  title: string;
  content: string;
  isModified: boolean;
  history?: string[];
  historyIndex?: number;
}

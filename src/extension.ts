import * as vscode from "vscode";
import * as path from "path";
import { marked } from "marked";

export class PreviewManager {
  private panel: vscode.WebviewPanel | undefined;

  constructor(private context: vscode.ExtensionContext) {}

  // ---- OPEN PREVIEW WINDOW ----
  openPreview() {
    if (this.panel) {
      this.panel.reveal();
      return;
    }

    this.panel = vscode.window.createWebviewPanel(
      "markdownPreview",
      "Markdown Preview",
      vscode.ViewColumn.Beside,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
      }
    );

    this.loadHTML();
    this.updateContent(vscode.window.activeTextEditor?.document);

    this.panel.onDidDispose(() => {
      this.panel = undefined;
    });
  }

  // ---- LOAD PREVIEW.HTML ----
  private async loadHTML() {
    const htmlUri = vscode.Uri.joinPath(
      this.context.extensionUri,
      "src",
      "webview",
      "preview.html"
    );

    const bytes = await vscode.workspace.fs.readFile(htmlUri);
    const htmlText = new TextDecoder().decode(bytes);

    this.panel!.webview.html = htmlText;
    this.updateTheme();
  }

  // ---- UPDATE HTML WITH MARKDOWN ----
  updateContent(document?: vscode.TextDocument) {
    if (!this.panel || !document) return;

    const md = document.getText();
    const html = marked(md);

    this.panel.webview.postMessage({
      type: "update",
      html: html,
    });
  }

  // ---- SYNC DARK / LIGHT THEME ----
  updateTheme() {
    if (!this.panel) return;

    const theme =
      vscode.window.activeColorTheme.kind ===
      vscode.ColorThemeKind.Dark
        ? "dark"
        : "light";

    this.panel.webview.postMessage({
      type: "theme",
      theme,
    });
  }

  // ---- SYNC SCROLL ----
  syncScroll(editor: vscode.TextEditor) {
    if (!this.panel) return;

    const firstLine = editor.visibleRanges[0].start.line;

    this.panel.webview.postMessage({
      type: "scroll",
      line: firstLine,
    });
  }

  dispose() {
    this.panel?.dispose();
  }
}

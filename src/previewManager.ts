import * as vscode from 'vscode';
import { marked } from 'marked';
import { getDarkStyles, getLightStyles } from './webview/styles';

export class PreviewManager {
  private panel: vscode.WebviewPanel | undefined;
  private context: vscode.ExtensionContext;
  private currentDocument: vscode.TextDocument | undefined;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
  }

  public openPreview() {
    const editor = vscode.window.activeTextEditor;
    if (!editor || editor.document.languageId !== 'markdown') {
      vscode.window.showWarningMessage('Please open a Markdown file first.');
      return;
    }

    if (this.panel) {
      this.panel.reveal(vscode.ViewColumn.Beside);
    } else {
      this.panel = vscode.window.createWebviewPanel(
        'markdownPreview',
        'Markdown Preview',
        vscode.ViewColumn.Beside,
        {
          enableScripts: true,
          retainContextWhenHidden: true,
        }
      );

      this.panel.onDidDispose(() => {
        this.panel = undefined;
      });
    }

    this.currentDocument = editor.document;
    this.updateContent(editor.document);
  }

  public updateContent(document: vscode.TextDocument) {
    if (!this.panel || document.languageId !== 'markdown') {
      return;
    }

    this.currentDocument = document;
    const content = document.getText();
    const html = this.renderMarkdown(content);
    this.panel.webview.html = this.getWebviewContent(html);
  }

  public updateTheme() {
    if (!this.panel || !this.currentDocument) {
      return;
    }
    this.updateContent(this.currentDocument);
  }

  public syncScroll(editor: vscode.TextEditor) {
    if (!this.panel || !editor.visibleRanges.length) {
      return;
    }

    const range = editor.visibleRanges[0];
    const totalLines = editor.document.lineCount;
    const scrollPercentage = range.start.line / totalLines;

    this.panel.webview.postMessage({
      command: 'scroll',
      percentage: scrollPercentage,
    });
  }

  private renderMarkdown(content: string): string {
    marked.setOptions({
      breaks: true,
      gfm: true,
    });

    return marked.parse(content) as string;
  }

  private getWebviewContent(html: string): string {
    const theme = vscode.window.activeColorTheme.kind;
    const isDarkEditor =
      theme === vscode.ColorThemeKind.Dark ||
      theme === vscode.ColorThemeKind.HighContrast;

    // Inverted theme
    const styles = isDarkEditor ? getLightStyles() : getDarkStyles();

    return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<style>
${styles}
</style>

<!-- Highlight.js CDN -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/styles/default.min.css">
<script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/highlight.min.js"></script>

<!-- MathJax -->
<script>
MathJax = {
  tex: { inlineMath: [['$', '$']], displayMath: [['$$', '$$']] }
};
</script>
<script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>

</head>
<body>

<div class="markdown-body">
${html}
</div>

<script>
const vscode = acquireVsCodeApi();

// Highlight code blocks
document.querySelectorAll('pre code').forEach((block) => {
  hljs.highlightElement(block);
});

// Scroll sync
window.addEventListener('message', event => {
  const message = event.data;
  if (message.command === 'scroll') {
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo(0, scrollHeight * message.percentage);
  }
});
</script>

</body>
</html>
`;
  }

  public dispose() {
    if (this.panel) {
      this.panel.dispose();
    }
  }
}

"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.PreviewManager = void 0;
const vscode = __importStar(require("vscode"));
const marked_1 = require("marked");
const styles_1 = require("./webview/styles");
class PreviewManager {
    constructor(context) {
        this.context = context;
    }
    openPreview() {
        const editor = vscode.window.activeTextEditor;
        if (!editor || editor.document.languageId !== 'markdown') {
            vscode.window.showWarningMessage('Please open a Markdown file first.');
            return;
        }
        if (this.panel) {
            this.panel.reveal(vscode.ViewColumn.Beside);
        }
        else {
            this.panel = vscode.window.createWebviewPanel('markdownPreview', 'Markdown Preview', vscode.ViewColumn.Beside, {
                enableScripts: true,
                retainContextWhenHidden: true,
            });
            this.panel.onDidDispose(() => {
                this.panel = undefined;
            });
        }
        this.currentDocument = editor.document;
        this.updateContent(editor.document);
    }
    updateContent(document) {
        if (!this.panel || document.languageId !== 'markdown') {
            return;
        }
        this.currentDocument = document;
        const content = document.getText();
        const html = this.renderMarkdown(content);
        this.panel.webview.html = this.getWebviewContent(html);
    }
    updateTheme() {
        if (!this.panel || !this.currentDocument) {
            return;
        }
        this.updateContent(this.currentDocument);
    }
    syncScroll(editor) {
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
    renderMarkdown(content) {
        marked_1.marked.setOptions({
            breaks: true,
            gfm: true,
        });
        return marked_1.marked.parse(content);
    }
    getWebviewContent(html) {
        const theme = vscode.window.activeColorTheme.kind;
        const isDarkEditor = theme === vscode.ColorThemeKind.Dark ||
            theme === vscode.ColorThemeKind.HighContrast;
        // Inverted theme
        const styles = isDarkEditor ? (0, styles_1.getLightStyles)() : (0, styles_1.getDarkStyles)();
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
    dispose() {
        if (this.panel) {
            this.panel.dispose();
        }
    }
}
exports.PreviewManager = PreviewManager;
//# sourceMappingURL=previewManager.js.map
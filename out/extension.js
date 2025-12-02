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
class PreviewManager {
    constructor(context) {
        this.context = context;
    }
    // ---- OPEN PREVIEW WINDOW ----
    openPreview() {
        if (this.panel) {
            this.panel.reveal();
            return;
        }
        this.panel = vscode.window.createWebviewPanel("markdownPreview", "Markdown Preview", vscode.ViewColumn.Beside, {
            enableScripts: true,
            retainContextWhenHidden: true,
        });
        this.loadHTML();
        this.updateContent(vscode.window.activeTextEditor?.document);
        this.panel.onDidDispose(() => {
            this.panel = undefined;
        });
    }
    // ---- LOAD PREVIEW.HTML ----
    async loadHTML() {
        const htmlUri = vscode.Uri.joinPath(this.context.extensionUri, "src", "webview", "preview.html");
        const bytes = await vscode.workspace.fs.readFile(htmlUri);
        const htmlText = new TextDecoder().decode(bytes);
        this.panel.webview.html = htmlText;
        this.updateTheme();
    }
    // ---- UPDATE HTML WITH MARKDOWN ----
    updateContent(document) {
        if (!this.panel || !document)
            return;
        const md = document.getText();
        const html = (0, marked_1.marked)(md);
        this.panel.webview.postMessage({
            type: "update",
            html: html,
        });
    }
    // ---- SYNC DARK / LIGHT THEME ----
    updateTheme() {
        if (!this.panel)
            return;
        const theme = vscode.window.activeColorTheme.kind ===
            vscode.ColorThemeKind.Dark
            ? "dark"
            : "light";
        this.panel.webview.postMessage({
            type: "theme",
            theme,
        });
    }
    // ---- SYNC SCROLL ----
    syncScroll(editor) {
        if (!this.panel)
            return;
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
exports.PreviewManager = PreviewManager;
//# sourceMappingURL=extension.js.map
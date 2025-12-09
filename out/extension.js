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
exports.activate = activate;
const vscode = __importStar(require("vscode"));
const previewManager_1 = require("./previewManager");
let previewManager;
let autoOpenTimeout;
function activate(context) {
    console.log('Advanced Markdown Preview extension is now active');
    previewManager = new previewManager_1.PreviewManager(context);
    const openPreviewCommand = vscode.commands.registerCommand('markdown-preview.openPreview', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor || editor.document.languageId !== 'markdown') {
            vscode.window.showErrorMessage('Active file is not a Markdown file');
            return;
        }
        previewManager.showPreview(editor);
    });
    const togglePreviewCommand = vscode.commands.registerCommand('markdown-preview.togglePreview', () => {
        previewManager.togglePreview();
    });
    // Auto-open preview when markdown file becomes active
    const editorListener = vscode.window.onDidChangeActiveTextEditor(editor => {
        if (editor && editor.document.languageId === 'markdown') {
            previewManager.showPreview(editor);
        }
    });
    // Auto-open preview when user starts typing in markdown file
    const textChangeListener = vscode.workspace.onDidChangeTextDocument(e => {
        const editor = vscode.window.activeTextEditor;
        // Only auto-open for markdown files
        if (editor &&
            editor.document === e.document &&
            editor.document.languageId === 'markdown' &&
            !previewManager.hasPreview()) {
            // Clear existing timeout
            if (autoOpenTimeout) {
                clearTimeout(autoOpenTimeout);
            }
            // Debounce: open preview after a short delay when user types
            autoOpenTimeout = setTimeout(() => {
                previewManager.showPreview(editor);
            }, 300); // 300ms delay to avoid opening on every keystroke
        }
    });
    context.subscriptions.push(openPreviewCommand, togglePreviewCommand, editorListener, textChangeListener, previewManager);
}
//# sourceMappingURL=extension.js.map
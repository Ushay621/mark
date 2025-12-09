import * as vscode from 'vscode';
import { PreviewManager } from './previewManager';

let previewManager: PreviewManager;
let autoOpenTimeout: NodeJS.Timeout | undefined;

export function activate(context: vscode.ExtensionContext) {
    console.log('Advanced Markdown Preview extension is now active');

    previewManager = new PreviewManager(context);

    const openPreviewCommand = vscode.commands.registerCommand(
        'markdown-preview.openPreview',
        () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor || editor.document.languageId !== 'markdown') {
                vscode.window.showErrorMessage('Active file is not a Markdown file');
                return;
            }
            previewManager.showPreview(editor);
        }
    );

    const togglePreviewCommand = vscode.commands.registerCommand(
        'markdown-preview.togglePreview',
        () => {
            previewManager.togglePreview();
        }
    );

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

    context.subscriptions.push(
        openPreviewCommand,
        togglePreviewCommand,
        editorListener,
        textChangeListener,
        previewManager
    );
}
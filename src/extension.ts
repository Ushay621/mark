import * as vscode from 'vscode';
import { PreviewManager } from './previewManager';

let previewManager: PreviewManager;

export function activate(context: vscode.ExtensionContext) {
    console.log('Advanced Markdown Preview extension is now active');

    previewManager = new PreviewManager(context);

    // Register command to open preview
    const openPreviewCommand = vscode.commands.registerCommand(
        'markdown-preview.openPreview',
        () => {
            const editor = vscode.window.activeTextEditor;
            
            if (!editor) {
                vscode.window.showErrorMessage('No active editor found');
                return;
            }

            if (editor.document.languageId !== 'markdown') {
                vscode.window.showErrorMessage('Active file is not a Markdown file');
                return;
            }

            previewManager.showPreview(editor);
        }
    );

    // Register command to toggle preview
    const togglePreviewCommand = vscode.commands.registerCommand(
        'markdown-preview.togglePreview',
        () => {
            previewManager.togglePreview();
        }
    );

    context.subscriptions.push(
        openPreviewCommand,
        togglePreviewCommand,
        previewManager
    );
}

export function deactivate() {
    if (previewManager) {
        previewManager.dispose();
    }
}
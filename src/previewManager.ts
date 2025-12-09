// import * as vscode from 'vscode';
// import { marked } from 'marked';
// import hljs from 'highlight.js';
// import * as path from 'path';
// import TurndownService from 'turndown';

// export class PreviewManager implements vscode.Disposable {
//     private panel: vscode.WebviewPanel | undefined;
//     private currentEditor: vscode.TextEditor | undefined;
//     private disposables: vscode.Disposable[] = [];
//     private readonly context: vscode.ExtensionContext;
//     private turndownService: TurndownService;
//     private isEditMode: boolean = false;
//     private lastHtmlContent: string = '';

//     constructor(context: vscode.ExtensionContext) {
//         this.context = context;
//         this.setupMarked();
//         this.turndownService = this.setupTurndown();
//         this.registerListeners();
//     }

//     private setupTurndown(): TurndownService {
//         const turndownService = new TurndownService({
//             headingStyle: 'atx',
//             hr: '---',
//             bulletListMarker: '-',
//             codeBlockStyle: 'fenced',
//             emDelimiter: '_',
//             strongDelimiter: '**',
//             linkStyle: 'inlined'
//         });

//         // Add GitHub Flavored Markdown support manually
//         this.addGfmSupport(turndownService);

//         // Custom rules for better conversion
//         turndownService.addRule('previewImages', {
//             filter: ['img'],
//             replacement: function(content: string, node: any) {
//                 const img = node as HTMLImageElement;
//                 const alt = img.alt || '';
//                 const src = img.src || '';
//                 const title = img.title || '';
//                 return title ? `![${alt}](${src} "${title}")` : `![${alt}](${src})`;
//             }
//         });

//         turndownService.addRule('codeBlocks', {
//             filter: (node: HTMLElement) => {
//                 // Return boolean only, not null
//                 return node.nodeName === 'PRE' && 
//                        node.firstChild !== null && 
//                        node.firstChild.nodeName === 'CODE';
//             },
//             replacement: function(content: string, node: any) {
//                 const code = node as HTMLElement;
//                 const codeElement = code.querySelector('code');
//                 const language = Array.from(codeElement?.classList || [])
//                     .find(cls => cls.startsWith('language-'))?.replace('language-', '') || '';
//                 const codeContent = codeElement?.textContent || '';
//                 return `\`\`\`${language}\n${codeContent}\n\`\`\``;
//             }
//         });

//         return turndownService;
//     }

//     private addGfmSupport(turndownService: TurndownService): void {
//         // Add GitHub Flavored Markdown support manually
//         turndownService.addRule('strikethrough', {
//             filter: ['del', 's'],
//             replacement: function(content: string) {
//                 return '~~' + content + '~~';
//             }
//         });

//         turndownService.addRule('taskListItems', {
//             filter: (node: HTMLElement) => {
//                 // Check if it's an input checkbox inside an LI
//                 if (node.nodeName !== 'INPUT') return false;
//                 const input = node as HTMLInputElement;
//                 if (input.type !== 'checkbox') return false;
//                 if (!node.parentNode) return false;
//                 return node.parentNode.nodeName === 'LI';
//             },
//             replacement: function(content: string, node: any) {
//                 const input = node as HTMLInputElement;
//                 return (input.checked ? '[x]' : '[ ]') + ' ';
//             }
//         });

//         turndownService.addRule('tables', {
//             filter: ['table'],
//             replacement: function(content: string, node: any) {
//                 // Simple table conversion
//                 const table = node as HTMLTableElement;
//                 const rows = Array.from(table.rows);
//                 const markdownRows: string[] = [];

//                 if (rows.length === 0) return '';

//                 // Header row
//                 const headerCells = Array.from(rows[0]?.cells || []);
//                 const headerRow = '| ' + headerCells.map(cell => cell.textContent?.trim() || '').join(' | ') + ' |';
//                 markdownRows.push(headerRow);

//                 // Separator row
//                 const separatorRow = '| ' + headerCells.map(() => '---').join(' | ') + ' |';
//                 markdownRows.push(separatorRow);

//                 // Data rows
//                 for (let i = 1; i < rows.length; i++) {
//                     const cells = Array.from(rows[i].cells);
//                     const dataRow = '| ' + cells.map(cell => cell.textContent?.trim() || '').join(' | ') + ' |';
//                     markdownRows.push(dataRow);
//                 }

//                 return markdownRows.join('\n') + '\n';
//             }
//         });
//     }

//     private setupMarked() {
//         // Configure marked with custom renderer for code highlighting
//         const renderer = new marked.Renderer();
//         const originalCode = renderer.code.bind(renderer);

//         renderer.code = function(code: string, language: string | undefined, isEscaped: boolean) {
//             if (language && hljs.getLanguage(language)) {
//                 try {
//                     const highlighted = hljs.highlight(code, { language }).value;
//                     return `<pre><code class="hljs language-${language}">${highlighted}</code></pre>`;
//                 } catch (err) {
//                     console.error('Highlight error:', err);
//                 }
//             }

//             // Auto-detect language if not specified
//             try {
//                 const highlighted = hljs.highlightAuto(code).value;
//                 return `<pre><code class="hljs">${highlighted}</code></pre>`;
//             } catch (err) {
//                 // Fallback to original renderer
//                 return originalCode(code, language, isEscaped);
//             }
//         };

//         marked.setOptions({
//             renderer: renderer,
//             breaks: true,
//             gfm: true,
//             pedantic: false
//         });
//     }

//     private registerListeners() {
//         // Listen to text document changes
//         this.disposables.push(
//             vscode.workspace.onDidChangeTextDocument(e => {
//                 if (this.panel && this.currentEditor && e.document === this.currentEditor.document) {
//                     this.updatePreview();
//                 }
//             })
//         );

//         // Listen to active editor changes
//         this.disposables.push(
//             vscode.window.onDidChangeActiveTextEditor(editor => {
//                 if (editor && editor.document.languageId === 'markdown' && this.panel) {
//                     this.currentEditor = editor;
//                     this.updatePreview();
//                 }
//             })
//         );

//         // Listen to theme changes
//         this.disposables.push(
//             vscode.window.onDidChangeActiveColorTheme(() => {
//                 if (this.panel && this.currentEditor) {
//                     this.updatePreview();
//                 }
//             })
//         );

//         // Listen to visible range changes (scroll)
//         this.disposables.push(
//             vscode.window.onDidChangeTextEditorVisibleRanges(e => {
//                 if (this.panel && this.currentEditor && e.textEditor === this.currentEditor) {
//                     this.syncScroll();
//                 }
//             })
//         );

//         // Listen to document saves
//         this.disposables.push(
//             vscode.workspace.onDidSaveTextDocument(doc => {
//                 if (this.panel && this.currentEditor && doc === this.currentEditor.document) {
//                     this.updatePreview();
//                 }
//             })
//         );
//     }

//     public showPreview(editor: vscode.TextEditor) {
//         this.currentEditor = editor;

//         if (this.panel) {
//             this.panel.reveal(vscode.ViewColumn.Two);
//             this.updatePreview();
//         } else {
//             this.createPreviewPanel();
//         }
//     }

//     public togglePreview() {
//         if (this.panel) {
//             this.panel.dispose();
//             this.panel = undefined;
//             this.isEditMode = false;
//         } else {
//             const editor = vscode.window.activeTextEditor;
//             if (editor && editor.document.languageId === 'markdown') {
//                 this.showPreview(editor);
//             }
//         }
//     }

//     public toggleEditMode() {
//         if (!this.panel) return;

//         this.isEditMode = !this.isEditMode;
//         this.updatePreview();
//     }

//     private createPreviewPanel() {
//         this.panel = vscode.window.createWebviewPanel(
//             'markdownPreview',
//             'Markdown Preview',
//             vscode.ViewColumn.Two,
//             {
//                 enableScripts: true,
//                 retainContextWhenHidden: true,
//                 localResourceRoots: [
//                     vscode.Uri.file(path.join(this.context.extensionPath, 'media')),
//                     vscode.Uri.file(path.join(this.context.extensionPath, 'dist', 'webview'))
//                 ]
//             }
//         );

//         this.panel.iconPath = vscode.Uri.file(
//             path.join(this.context.extensionPath, 'media', 'preview-icon.svg')
//         );

//         this.panel.onDidDispose(() => {
//             this.panel = undefined;
//             this.isEditMode = false;
//         });

//         // Handle messages from webview
//         this.panel.webview.onDidReceiveMessage(
//             async message => {
//                 switch (message.command) {
//                     case 'alert':
//                         vscode.window.showInformationMessage(message.text);
//                         break;
//                     case 'error':
//                         vscode.window.showErrorMessage(message.text);
//                         break;
//                     case 'updateMarkdown':
//                         await this.updateEditorFromPreview(message.content);
//                         break;
//                     case 'htmlChanged':
//                         this.lastHtmlContent = message.html;
//                         await this.updateEditorFromHtml(message.html);
//                         break;
//                     case 'requestInitialContent':
//                         this.sendInitialContent();
//                         break;
//                     case 'toggleEditMode':
//                         this.toggleEditMode();
//                         break;
//                 }
//             },
//             undefined,
//             this.disposables
//         );

//         this.updatePreview();
//     }

//     private sendInitialContent() {
//         if (!this.panel || !this.currentEditor) return;

//         const text = this.currentEditor.document.getText();
//         const html = marked.parse(text) as string;

//         this.panel.webview.postMessage({
//             command: 'setInitialContent',
//             html: html,
//             isEditMode: this.isEditMode
//         });
//     }

//     private async updateEditorFromHtml(html: string): Promise<void> {
//         if (!this.currentEditor) return;

//         try {
//             // Convert HTML back to Markdown
//             let markdown = this.turndownService.turndown(html);

//             // Clean up the markdown
//             markdown = this.cleanupMarkdown(markdown);

//             await this.updateEditorFromPreview(markdown);
//         } catch (error) {
//             console.error('Error converting HTML to Markdown:', error);
//             vscode.window.showErrorMessage(`Failed to convert HTML: ${error}`);
//         }
//     }

//     private cleanupMarkdown(markdown: string): string {
//         // Remove extra newlines
//         markdown = markdown.replace(/\n{3,}/g, '\n\n');

//         // Fix code block formatting
//         markdown = markdown.replace(/```\s*\n\s*```/g, '');

//         // Ensure proper heading formatting
//         markdown = markdown.replace(/^(#+)\s*$/gm, '');

//         return markdown.trim() + '\n';
//     }

//     private updatePreview() {
//         if (!this.panel || !this.currentEditor) {
//             return;
//         }

//         const document = this.currentEditor.document;
//         const text = document.getText();

//         try {
//             const html = marked.parse(text) as string;
//             const isDarkEditor = this.isEditorThemeDark();

//             this.panel.webview.html = this.getWebviewContent(html, isDarkEditor, this.isEditMode);

//             // Update title with file name and mode
//             const modeText = this.isEditMode ? ' (Edit Mode)' : '';
//             this.panel.title = `Preview: ${path.basename(document.fileName)}${modeText}`;
//         } catch (error) {
//             console.error('Error rendering markdown:', error);
//             vscode.window.showErrorMessage(`Failed to render markdown: ${error}`);
//         }
//     }

//     private syncScroll() {
//         if (!this.panel || !this.currentEditor) {
//             return;
//         }

//         const visibleRange = this.currentEditor.visibleRanges[0];
//         if (!visibleRange) {
//             return;
//         }

//         const totalLines = this.currentEditor.document.lineCount;
//         const firstVisibleLine = visibleRange.start.line;
//         const scrollPercentage = totalLines > 0 ? firstVisibleLine / totalLines : 0;

//         this.panel.webview.postMessage({
//             command: 'scroll',
//             percentage: scrollPercentage
//         });
//     }

//     private async updateEditorFromPreview(markdownContent: string): Promise<void> {
//         if (!this.currentEditor) {
//             return;
//         }

//         const document = this.currentEditor.document;
//         const fullRange = new vscode.Range(
//             document.positionAt(0),
//             document.positionAt(document.getText().length)
//         );

//         const edit = new vscode.WorkspaceEdit();
//         edit.replace(document.uri, fullRange, markdownContent);

//         const success = await vscode.workspace.applyEdit(edit);
//         if (success) {
//             console.log('Editor updated from preview');
//         } else {
//             vscode.window.showErrorMessage('Failed to update editor from preview');
//         }
//     }

//     private isEditorThemeDark(): boolean {
//         const theme = vscode.window.activeColorTheme;
//         return theme.kind === vscode.ColorThemeKind.Dark || 
//                theme.kind === vscode.ColorThemeKind.HighContrast;
//     }

//     private getWebviewContent(html: string, editorIsDark: boolean, isEditMode: boolean): string {
//         const previewTheme = editorIsDark ? 'light' : 'dark';
//         const hlTheme = previewTheme === 'dark' ? 'github-dark' : 'github';

//         return `<!DOCTYPE html>
// <html lang="en">
// <head>
//     <meta charset="UTF-8">
//     <meta name="viewport" content="width=device-width, initial-scale=1.0">
//     <meta http-equiv="Content-Security-Policy" content="default-src 'none'; 
//         style-src 'unsafe-inline' https://cdnjs.cloudflare.com; 
//         script-src 'unsafe-inline' https://cdnjs.cloudflare.com; 
//         img-src vscode-resource: https: data:;">
//     <title>Markdown Preview ${isEditMode ? '(Edit Mode)' : ''}</title>
//     <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/${hlTheme}.min.css">
//     <style>${this.getStyles(previewTheme, isEditMode)}</style>
// </head>
// <body class="vscode-body theme-${previewTheme} ${isEditMode ? 'edit-mode' : 'preview-mode'}">
//     <div id="toolbar">
//         <button id="toggleEditBtn" title="Toggle Edit Mode">
//             ${isEditMode ? '👁️ View Mode' : '✏️ Edit Mode'}
//         </button>
//         <button id="saveBtn" title="Save Changes" ${isEditMode ? '' : 'style="display: none;"'}>
//             💾 Save
//         </button>
//         <button id="boldBtn" title="Bold" ${isEditMode ? '' : 'style="display: none;"'}>
//             <b>B</b>
//         </button>
//         <button id="italicBtn" title="Italic" ${isEditMode ? '' : 'style="display: none;"'}>
//             <i>I</i>
//         </button>
//         <button id="linkBtn" title="Insert Link" ${isEditMode ? '' : 'style="display: none;"'}>
//             🔗
//         </button>
//         <button id="codeBtn" title="Insert Code" ${isEditMode ? '' : 'style="display: none;"'}>
//             &lt;/&gt;
//         </button>
//     </div>

//     <div id="content-area">
//         ${isEditMode ? 
//             `<div id="editable-content" contenteditable="true" class="editable-preview">${html}</div>` :
//             `<div id="preview-container">${html}</div>`
//         }
//     </div>

//     <script src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/3.2.2/es5/tex-mml-chtml.min.js"></script>
//     <script>
//         (function() {
//             const vscode = acquireVsCodeApi();
//             let isScrolling = false;
//             let currentEditMode = ${isEditMode};
//             let saveTimeout = null;

//             // Initialize
//             if (currentEditMode) {
//                 setupEditMode();
//             } else {
//                 setupPreviewMode();
//             }

//             function setupEditMode() {
//                 const editableDiv = document.getElementById('editable-content');
//                 if (!editableDiv) return;

//                 // Focus and set cursor at end
//                 editableDiv.focus();
//                 if (window.getSelection) {
//                     const range = document.createRange();
//                     range.selectNodeContents(editableDiv);
//                     range.collapse(false);
//                     const selection = window.getSelection();
//                     selection.removeAllRanges();
//                     selection.addRange(range);
//                 }

//                 // Auto-save on changes
//                 editableDiv.addEventListener('input', debounce(() => {
//                     vscode.postMessage({
//                         command: 'htmlChanged',
//                         html: editableDiv.innerHTML
//                     });
//                 }, 500));

//                 // Handle paste event to clean up formatting
//                 editableDiv.addEventListener('paste', (e) => {
//                     e.preventDefault();
//                     const text = e.clipboardData.getData('text/plain');
//                     document.execCommand('insertText', false, text);
//                 });

//                 // Toolbar functionality
//                 document.getElementById('boldBtn').addEventListener('click', () => {
//                     document.execCommand('bold');
//                     editableDiv.focus();
//                 });

//                 document.getElementById('italicBtn').addEventListener('click', () => {
//                     document.execCommand('italic');
//                     editableDiv.focus();
//                 });

//                 document.getElementById('linkBtn').addEventListener('click', () => {
//                     const url = prompt('Enter URL:', 'https://');
//                     const text = prompt('Enter link text:', 'Link');
//                     if (url && text) {
//                         const link = '<a href="' + url + '">' + text + '</a>';
//                         document.execCommand('insertHTML', false, link);
//                     }
//                     editableDiv.focus();
//                 });

//                 document.getElementById('codeBtn').addEventListener('click', () => {
//                     const code = prompt('Enter code:');
//                     const language = prompt('Enter language (optional):');
//                     const codeHtml = language ? 
//                         '<pre><code class="language-' + language + '">' + code + '</code></pre>' :
//                         '<pre><code>' + code + '</code></pre>';
//                     document.execCommand('insertHTML', false, codeHtml);
//                     editableDiv.focus();
//                 });

//                 document.getElementById('saveBtn').addEventListener('click', () => {
//                     vscode.postMessage({
//                         command: 'htmlChanged',
//                         html: editableDiv.innerHTML
//                     });
//                     vscode.postMessage({
//                         command: 'alert',
//                         text: 'Changes saved!'
//                     });
//                 });
//             }

//             function setupPreviewMode() {
//                 // Handle clicks on links
//                 document.addEventListener('click', event => {
//                     const target = event.target;
//                     if (target.tagName === 'A' && target.href) {
//                         event.preventDefault();
//                         vscode.postMessage({
//                             command: 'alert',
//                             text: 'Link clicked: ' + target.href
//                         });
//                     }
//                 });
//             }

//             // Toggle edit mode button
//             document.getElementById('toggleEditBtn').addEventListener('click', () => {
//                 vscode.postMessage({
//                     command: 'toggleEditMode'
//                 });
//             });

//             // Handle scroll sync from editor
//             window.addEventListener('message', event => {
//                 const message = event.data;

//                 switch (message.command) {
//                     case 'scroll':
//                         if (!isScrolling) {
//                             syncScrollFromEditor(message.percentage);
//                         }
//                         break;
//                     case 'setInitialContent':
//                         if (currentEditMode && message.isEditMode) {
//                             const editableDiv = document.getElementById('editable-content');
//                             if (editableDiv) {
//                                 editableDiv.innerHTML = message.html;
//                             }
//                         }
//                         break;
//                 }
//             });

//             function syncScrollFromEditor(percentage) {
//                 const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
//                 const targetScroll = Math.max(0, scrollHeight * percentage);

//                 isScrolling = true;
//                 window.scrollTo({
//                     top: targetScroll,
//                     behavior: 'smooth'
//                 });

//                 setTimeout(() => {
//                     isScrolling = false;
//                 }, 100);
//             }

//             // Render math with MathJax
//             if (window.MathJax) {
//                 MathJax.typesetPromise().catch(err => {
//                     console.error('MathJax rendering error:', err);
//                 });
//             }

//             // Debounce function for auto-save
//             function debounce(func, wait) {
//                 return function executedFunction(...args) {
//                     const later = () => {
//                         clearTimeout(saveTimeout);
//                         func(...args);
//                     };
//                     clearTimeout(saveTimeout);
//                     saveTimeout = setTimeout(later, wait);
//                 };
//             }

//             // Send initial content request
//             vscode.postMessage({
//                 command: 'requestInitialContent'
//             });
//         })();
//     </script>
// </body>
// </html>`;
//     }

//     private getStyles(theme: string, isEditMode: boolean): string {
//         const isDark = theme === 'dark';

//         const colors = {
//             bg: isDark ? '#1e1e1e' : '#ffffff',
//             fg: isDark ? '#d4d4d4' : '#333333',
//             heading: isDark ? '#ffffff' : '#000000',
//             border: isDark ? '#404040' : '#e1e4e8',
//             codeBg: isDark ? '#2d2d2d' : '#f6f8fa',
//             codeText: isDark ? '#e6e6e6' : '#24292e',
//             quoteFg: isDark ? '#8e8e8e' : '#6a737d',
//             linkColor: isDark ? '#58a6ff' : '#0366d6',
//             tableBg: isDark ? '#252525' : '#f6f8fa',
//             tableHeaderBg: isDark ? '#2d2d2d' : '#f6f8fa',
//             toolbarBg: isDark ? '#252525' : '#f5f5f5',
//             toolbarBorder: isDark ? '#333' : '#ddd',
//             buttonBg: isDark ? '#333' : '#eee',
//             buttonHover: isDark ? '#444' : '#ddd'
//         };

//         const editModeStyles = isEditMode ? `
//             #toolbar {
//                 display: flex !important;
//                 align-items: center;
//                 gap: 8px;
//                 padding: 10px;
//                 background: ${colors.toolbarBg};
//                 border-bottom: 1px solid ${colors.toolbarBorder};
//                 position: sticky;
//                 top: 0;
//                 z-index: 1000;
//             }

//             #toolbar button {
//                 padding: 6px 12px;
//                 background: ${colors.buttonBg};
//                 border: 1px solid ${colors.border};
//                 border-radius: 4px;
//                 color: ${colors.fg};
//                 cursor: pointer;
//                 font-size: 14px;
//                 transition: background 0.2s;
//             }

//             #toolbar button:hover {
//                 background: ${colors.buttonHover};
//             }

//             .editable-preview {
//                 min-height: 500px;
//                 padding: 20px 30px;
//                 outline: none;
//                 max-width: 980px;
//                 margin: 0 auto;
//             }

//             .editable-preview:focus {
//                 outline: none;
//             }

//             .editable-preview h1,
//             .editable-preview h2,
//             .editable-preview h3,
//             .editable-preview h4,
//             .editable-preview h5,
//             .editable-preview h6 {
//                 cursor: text;
//             }

//             .editable-preview p,
//             .editable-preview li,
//             .editable-preview blockquote {
//                 cursor: text;
//             }

//             .editable-preview pre,
//             .editable-preview code {
//                 cursor: text;
//                 user-select: text;
//             }

//             .editable-preview a {
//                 cursor: pointer;
//             }

//             .editable-preview [contenteditable="false"] {
//                 cursor: default;
//             }
//         ` : `
//             #toolbar {
//                 display: flex !important;
//                 align-items: center;
//                 gap: 8px;
//                 padding: 10px;
//                 background: ${colors.toolbarBg};
//                 border-bottom: 1px solid ${colors.toolbarBorder};
//                 position: sticky;
//                 top: 0;
//                 z-index: 1000;
//             }

//             #toolbar button {
//                 padding: 6px 12px;
//                 background: ${colors.buttonBg};
//                 border: 1px solid ${colors.border};
//                 border-radius: 4px;
//                 color: ${colors.fg};
//                 cursor: pointer;
//                 font-size: 14px;
//                 transition: background 0.2s;
//             }

//             #toolbar button:hover {
//                 background: ${colors.buttonHover};
//             }

//             #saveBtn, #boldBtn, #italicBtn, #linkBtn, #codeBtn {
//                 display: none !important;
//             }
//         `;

//         return `
// * {
//     box-sizing: border-box;
// }

// html {
//     scroll-behavior: smooth;
// }

// body {
//     font-family: -apple-system, BlinkMacSystemFont, 'Segoe WPC', 'Segoe UI', system-ui, 'Ubuntu', 'Droid Sans', sans-serif;
//     font-size: 14px;
//     line-height: 1.6;
//     padding: 0;
//     margin: 0;
//     background-color: ${colors.bg};
//     color: ${colors.fg};
//     word-wrap: break-word;
// }

// #preview-container {
//     max-width: 980px;
//     margin: 0 auto;
//     padding: 20px 30px;
// }

// /* Headings */
// h1, h2, h3, h4, h5, h6 {
//     margin-top: 24px;
//     margin-bottom: 16px;
//     font-weight: 600;
//     line-height: 1.25;
//     color: ${colors.heading};
// }

// h1 { 
//     font-size: 2em; 
//     border-bottom: 1px solid ${colors.border};
//     padding-bottom: 0.3em;
//     margin-top: 0;
// }

// h2 { 
//     font-size: 1.5em; 
//     border-bottom: 1px solid ${colors.border};
//     padding-bottom: 0.3em;
// }

// h3 { font-size: 1.25em; }
// h4 { font-size: 1em; }
// h5 { font-size: 0.875em; }
// h6 { 
//     font-size: 0.85em; 
//     color: ${colors.quoteFg}; 
// }

// /* Paragraphs */
// p {
//     margin-top: 0;
//     margin-bottom: 16px;
// }

// /* Links */
// a {
//     color: ${colors.linkColor};
//     text-decoration: none;
// }

// a:hover {
//     text-decoration: underline;
// }

// /* Lists */
// ul, ol {
//     padding-left: 2em;
//     margin-top: 0;
//     margin-bottom: 16px;
// }

// li + li {
//     margin-top: 0.25em;
// }

// li > p {
//     margin-bottom: 0;
// }

// /* Code */
// code {
//     font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
//     font-size: 85%;
//     background-color: ${colors.codeBg};
//     padding: 0.2em 0.4em;
//     border-radius: 3px;
//     color: ${colors.codeText};
// }

// pre {
//     background-color: ${colors.codeBg};
//     border-radius: 6px;
//     padding: 16px;
//     overflow: auto;
//     line-height: 1.45;
//     margin-top: 0;
//     margin-bottom: 16px;
// }

// pre code {
//     background-color: transparent;
//     padding: 0;
//     font-size: 100%;
//     border-radius: 0;
//     display: block;
//     overflow-x: auto;
// }

// /* Blockquotes */
// blockquote {
//     margin: 0 0 16px 0;
//     padding: 0 1em;
//     color: ${colors.quoteFg};
//     border-left: 0.25em solid ${colors.border};
// }

// blockquote > :first-child {
//     margin-top: 0;
// }

// blockquote > :last-child {
//     margin-bottom: 0;
// }

// /* Tables */
// table {
//     border-collapse: collapse;
//     border-spacing: 0;
//     width: 100%;
//     overflow: auto;
//     margin-top: 0;
//     margin-bottom: 16px;
// }

// table th {
//     font-weight: 600;
//     background-color: ${colors.tableHeaderBg};
//     padding: 6px 13px;
//     border: 1px solid ${colors.border};
// }

// table td {
//     padding: 6px 13px;
//     border: 1px solid ${colors.border};
// }

// table tr {
//     background-color: ${colors.bg};
//     border-top: 1px solid ${colors.border};
// }

// table tr:nth-child(2n) {
//     background-color: ${colors.tableBg};
// }

// /* Horizontal rule */
// hr {
//     height: 0.25em;
//     padding: 0;
//     margin: 24px 0;
//     background-color: ${colors.border};
//     border: 0;
// }

// /* Images */
// img {
//     max-width: 100%;
//     height: auto;
//     display: block;
//     margin: 16px 0;
// }

// /* Task lists */
// input[type="checkbox"] {
//     margin-right: 0.5em;
// }

// /* Syntax highlighting override */
// .hljs {
//     background: ${colors.codeBg} !important;
//     color: ${colors.codeText};
// }

// /* Math */
// .MathJax {
//     font-size: 1.1em !important;
// }

// mjx-container {
//     overflow-x: auto;
//     overflow-y: hidden;
// }

// /* Ensure proper spacing */
// * + h1,
// * + h2,
// * + h3,
// * + h4,
// * + h5,
// * + h6 {
//     margin-top: 24px;
// }

// li > p + p {
//     margin-top: 16px;
// }

// ${editModeStyles}
//         `;
//     }

//     public dispose() {
//         if (this.panel) {
//             this.panel.dispose();
//         }

//         while (this.disposables.length) {
//             const disposable = this.disposables.pop();
//             if (disposable) {
//                 disposable.dispose();
//             }
//         }
//     }
// }


import * as vscode from 'vscode';
import { marked } from 'marked';
import hljs from 'highlight.js';
import * as path from 'path';
import TurndownService from 'turndown';

export class PreviewManager implements vscode.Disposable {
    private panel: vscode.WebviewPanel | undefined;
    private currentEditor: vscode.TextEditor | undefined;
    private disposables: vscode.Disposable[] = [];
    private readonly context: vscode.ExtensionContext;
    private turndownService: TurndownService;
    private isEditMode: boolean = false;
    private lastHtmlContent: string = '';

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.setupMarked();
        this.turndownService = this.setupTurndown();
        this.registerListeners();
    }

    private setupTurndown(): TurndownService {
        const turndownService = new TurndownService({
            headingStyle: 'atx',
            hr: '---',
            bulletListMarker: '-',
            codeBlockStyle: 'fenced',
            emDelimiter: '_',
            strongDelimiter: '**',
            linkStyle: 'inlined'
        });

        // Add GitHub Flavored Markdown support manually
        this.addGfmSupport(turndownService);

        // Custom rule for styled divs and spans (alignment)
        turndownService.addRule('alignedContent', {
            filter: (node: HTMLElement) => {
                if (!node || !(node as HTMLElement).style) return false;
                const s = (node as HTMLElement).style;
                return s.textAlign === 'center' || s.textAlign === 'left' || s.textAlign === 'right';
            },
            replacement: function (content: string, node: any) {
                const align = (node as HTMLElement).style.textAlign;
                if (align === 'center') {
                    return '\n<div align="center">\n\n' + content + '\n\n</div>\n';
                } else if (align === 'right') {
                    return '\n<div align="right">\n\n' + content + '\n\n</div>\n';
                }
                return content;
            }
        });

        // Custom rules for better conversion
        turndownService.addRule('previewImages', {
            filter: ['img'],
            replacement: function (content: string, node: any) {
                const img = node as HTMLImageElement;
                const alt = img.alt || '';
                const src = img.getAttribute('src') || '';
                const title = img.title || '';
                return title ? `![${alt}](${src} "${title}")` : `![${alt}](${src})`;
            }
        });

        turndownService.addRule('codeBlocks', {
            filter: (node: HTMLElement) => {
                return node.nodeName === 'PRE' &&
                    node.firstChild !== null &&
                    node.firstChild.nodeName === 'CODE';
            },
            replacement: function (content: string, node: any) {
                const code = node as HTMLElement;
                const codeElement = code.querySelector('code');
                const language = Array.from(codeElement?.classList || [])
                    .find(cls => cls.startsWith('language-'))?.replace('language-', '') || '';
                const codeContent = codeElement?.textContent || '';
                return '\n\n```' + language + '\n' + codeContent + '\n```\n\n';
            }
        });

        return turndownService;
    }

    private addGfmSupport(turndownService: TurndownService): void {
        // Add GitHub Flavored Markdown support manually
        turndownService.addRule('strikethrough', {
            filter: ['del', 's'],
            replacement: function (content: string) {
                return '~~' + content + '~~';
            }
        });

        turndownService.addRule('taskListItems', {
            filter: (node: HTMLElement) => {
                // Check if it's an input checkbox inside an LI
                if (!node || node.nodeName !== 'INPUT') return false;
                const input = node as HTMLInputElement;
                if (input.type !== 'checkbox') return false;
                if (!node.parentNode) return false;
                return node.parentNode.nodeName === 'LI' || node.parentNode.nodeName === 'LABEL';
            },
            replacement: function (content: string, node: any) {
                const input = node as HTMLInputElement;
                return (input.checked ? '[x]' : '[ ]') + ' ';
            }
        });

        turndownService.addRule('tables', {
            filter: ['table'],
            replacement: function (content: string, node: any) {
                // Simple table conversion
                const table = node as HTMLTableElement;
                const rows = Array.from(table.rows);
                const markdownRows: string[] = [];

                if (rows.length === 0) return '';

                // Header row
                const headerCells = Array.from(rows[0]?.cells || []);
                const headerRow = '| ' + headerCells.map(cell => cell.textContent?.trim() || '').join(' | ') + ' |';
                markdownRows.push(headerRow);

                // Separator row
                const separatorRow = '| ' + headerCells.map(() => '---').join(' | ') + ' |';
                markdownRows.push(separatorRow);

                // Data rows
                for (let i = 1; i < rows.length; i++) {
                    const cells = Array.from(rows[i].cells);
                    const dataRow = '| ' + cells.map(cell => cell.textContent?.trim() || '').join(' | ') + ' |';
                    markdownRows.push(dataRow);
                }

                return '\n\n' + markdownRows.join('\n') + '\n\n';
            }
        });
    }

    private setupMarked() {
        // Configure marked with custom renderer for code highlighting
        const renderer = new marked.Renderer();
        const originalCode = renderer.code.bind(renderer);

        renderer.code = function (code: string, language: string | undefined, isEscaped: boolean) {
            if (language && hljs.getLanguage(language)) {
                try {
                    const highlighted = hljs.highlight(code, { language }).value;
                    return `<pre><code class="hljs language-${language}">${highlighted}</code></pre>`;
                } catch (err) {
                    console.error('Highlight error:', err);
                }
            }

            // Auto-detect language if not specified
            try {
                const highlighted = hljs.highlightAuto(code).value;
                return `<pre><code class="hljs">${highlighted}</code></pre>`;
            } catch (err) {
                // Fallback to original renderer
                return originalCode(code, language, isEscaped);
            }
        };

        marked.setOptions({
            renderer: renderer,
            breaks: true,
            gfm: true,
            pedantic: false
        });
    }

    private registerListeners() {
        // Listen to text document changes
        this.disposables.push(
            vscode.workspace.onDidChangeTextDocument(e => {
                if (this.panel && this.currentEditor && e.document === this.currentEditor.document && !this.isEditMode) {
                    this.updatePreview();
                }
            })
        );

        // Listen to active editor changes
        this.disposables.push(
            vscode.window.onDidChangeActiveTextEditor(editor => {
                if (editor && editor.document.languageId === 'markdown' && this.panel) {
                    this.currentEditor = editor;
                    this.updatePreview();
                }
            })
        );

        // Listen to theme changes
        this.disposables.push(
            vscode.window.onDidChangeActiveColorTheme(() => {
                if (this.panel && this.currentEditor) {
                    this.updatePreview();
                }
            })
        );

        // Listen to visible range changes (scroll)
        this.disposables.push(
            vscode.window.onDidChangeTextEditorVisibleRanges(e => {
                if (this.panel && this.currentEditor && e.textEditor === this.currentEditor && !this.isEditMode) {
                    this.syncScroll();
                }
            })
        );

        // Listen to document saves
        this.disposables.push(
            vscode.workspace.onDidSaveTextDocument(doc => {
                if (this.panel && this.currentEditor && doc === this.currentEditor.document && !this.isEditMode) {
                    this.updatePreview();
                }
            })
        );
    }

    public showPreview(editor: vscode.TextEditor) {
        this.currentEditor = editor;

        if (this.panel) {
            this.panel.reveal(vscode.ViewColumn.Two);
            this.updatePreview();
        } else {
            this.createPreviewPanel();
        }
    }

    public togglePreview() {
        if (this.panel) {
            this.panel.dispose();
            this.panel = undefined;
            this.isEditMode = false;
        } else {
            const editor = vscode.window.activeTextEditor;
            if (editor && editor.document.languageId === 'markdown') {
                this.showPreview(editor);
            }
        }
    }

    public toggleEditMode() {
        if (!this.panel) return;

        this.isEditMode = !this.isEditMode;
        this.updatePreview();
    }

    public hasPreview(): boolean {
        return this.panel !== undefined;
    }

    private createPreviewPanel() {
        this.panel = vscode.window.createWebviewPanel(
            'markdownPreview',
            'Markdown Preview',
            vscode.ViewColumn.Two,
            {
                enableScripts: true,
                retainContextWhenHidden: true,
                localResourceRoots: [
                    vscode.Uri.file(path.join(this.context.extensionPath, 'media')),
                    vscode.Uri.file(path.join(this.context.extensionPath, 'dist', 'webview'))
                ]
            }
        );

        this.panel.iconPath = vscode.Uri.file(
            path.join(this.context.extensionPath, 'media', 'preview-icon.svg')
        );

        this.panel.onDidDispose(() => {
            this.panel = undefined;
            this.isEditMode = false;
        });

        // Handle messages from webview
        this.panel.webview.onDidReceiveMessage(
            async message => {
                switch (message.command) {
                    case 'alert':
                        vscode.window.showInformationMessage(message.text);
                        break;
                    case 'error':
                        vscode.window.showErrorMessage(message.text);
                        break;
                    case 'updateMarkdown':
                        await this.updateEditorFromPreview(message.content);
                        break;
                    case 'htmlChanged':
                        this.lastHtmlContent = message.html;
                        await this.updateEditorFromHtml(message.html);
                        break;
                    case 'requestInitialContent':
                        this.sendInitialContent();
                        break;
                    case 'toggleEditMode':
                        this.toggleEditMode();
                        break;
                }
            },
            undefined,
            this.disposables
        );

        this.updatePreview();
    }

    private sendInitialContent() {
        if (!this.panel || !this.currentEditor) return;

        const text = this.currentEditor.document.getText();
        const html = marked.parse(text) as string;

        this.panel.webview.postMessage({
            command: 'setInitialContent',
            html: html,
            isEditMode: this.isEditMode
        });
    }

    private async updateEditorFromHtml(html: string): Promise<void> {
        if (!this.currentEditor) return;

        try {
            // Convert HTML back to Markdown
            let markdown = this.turndownService.turndown(html);

            // Clean up the markdown
            markdown = this.cleanupMarkdown(markdown);

            await this.updateEditorFromPreview(markdown);
        } catch (error) {
            console.error('Error converting HTML to Markdown:', error);
            vscode.window.showErrorMessage(`Failed to convert HTML: ${error}`);
        }
    }

    private cleanupMarkdown(markdown: string): string {
        // Remove extra newlines
        markdown = markdown.replace(/\n{3,}/g, '\n\n');

        // Fix code block formatting
        markdown = markdown.replace(/```\s*\n\s*```/g, '');

        // Ensure proper heading formatting
        markdown = markdown.replace(/^(#+)\s*$/gm, '');

        // Clean up list items
        markdown = markdown.replace(/^(\s*)-\s*$/gm, '');

        return markdown.trim() + '\n';
    }

    private updatePreview() {
        if (!this.panel || !this.currentEditor) {
            return;
        }

        const document = this.currentEditor.document;
        const text = document.getText();

        try {
            const html = marked.parse(text) as string;
            const isDarkEditor = this.isEditorThemeDark();

            this.panel.webview.html = this.getWebviewContent(html, isDarkEditor, this.isEditMode);

            // Update title with file name and mode
            const modeText = this.isEditMode ? ' (Edit Mode)' : '';
            this.panel.title = `Preview: ${path.basename(document.fileName)}${modeText}`;
        } catch (error) {
            console.error('Error rendering markdown:', error);
            vscode.window.showErrorMessage(`Failed to render markdown: ${error}`);
        }
    }

    private syncScroll() {
        if (!this.panel || !this.currentEditor) {
            return;
        }

        const visibleRange = this.currentEditor.visibleRanges[0];
        if (!visibleRange) {
            return;
        }

        const totalLines = this.currentEditor.document.lineCount;
        const firstVisibleLine = visibleRange.start.line;
        const scrollPercentage = totalLines > 0 ? firstVisibleLine / totalLines : 0;

        this.panel.webview.postMessage({
            command: 'scroll',
            percentage: scrollPercentage
        });
    }

    private async updateEditorFromPreview(markdownContent: string): Promise<void> {
        if (!this.currentEditor) {
            return;
        }

        const document = this.currentEditor.document;
        const fullRange = new vscode.Range(
            document.positionAt(0),
            document.positionAt(document.getText().length)
        );

        const edit = new vscode.WorkspaceEdit();
        edit.replace(document.uri, fullRange, markdownContent);

        const success = await vscode.workspace.applyEdit(edit);
        if (success) {
            console.log('Editor updated from preview');
        } else {
            vscode.window.showErrorMessage('Failed to update editor from preview');
        }
    }

    private isEditorThemeDark(): boolean {
        const theme = vscode.window.activeColorTheme;
        return theme.kind === vscode.ColorThemeKind.Dark ||
            theme.kind === vscode.ColorThemeKind.HighContrast;
    }

    private getWebviewContent(html: string, editorIsDark: boolean, isEditMode: boolean): string {
        const previewTheme = editorIsDark ? 'light' : 'dark';
        const hlTheme = previewTheme === 'dark' ? 'github-dark' : 'github';

        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; 
        style-src 'unsafe-inline' https://cdnjs.cloudflare.com; 
        script-src 'unsafe-inline' https://cdnjs.cloudflare.com; 
        img-src vscode-resource: https: data:;">
    <title>Markdown Preview ${isEditMode ? '(Edit Mode)' : ''}</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/${hlTheme}.min.css">
    <style>${this.getStyles(previewTheme, isEditMode)}</style>
</head>
<body class="vscode-body theme-${previewTheme} ${isEditMode ? 'edit-mode' : 'preview-mode'}">
    <div id="toolbar">
        <button id="toggleEditBtn" title="Toggle Edit Mode">
            ${isEditMode ? '👁️ View' : '✏️ Edit'}
        </button>
        <div id="editTools" ${isEditMode ? '' : 'style="display: none;"'}>
            <select id="formatSelect" title="Text Format">
                <option value="">Normal</option>
                <option value="h1">H1</option>
                <option value="h2">H2</option>
                <option value="h3">H3</option>
                <option value="h4">H4</option>
                <option value="h5">H5</option>
                <option value="h6">H6</option>
                <option value="p">¶</option>
            </select>
            <div>
            <button id="boldBtn" title="Bold (Ctrl+B)">𝐁</button>
            <button id="italicBtn" title="Italic (Ctrl+I)">𝐼</button>
            <button id="bulletListBtn" title="Bullet List">•</button>
            <button id="numberListBtn" title="Numbered List">#</button>
            <button id="alignLeftBtn" title="Align Left">⬅</button>
            <button id="alignCenterBtn" title="Align Center">↔</button>
            <button id="alignRightBtn" title="Align Right">➡</button>
            <button id="saveBtn" title="Save (Ctrl+S)">Save</button>
            </div>
        </div>
    </div>
    
    <div id="content-area">
        ${isEditMode ?
                `<div id="editable-content" contenteditable="true" class="editable-preview">${html}</div>` :
                `<div id="preview-container">${html}</div>`
            }
    </div>
    
    <script src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/3.2.2/es5/tex-mml-chtml.min.js"></script>
    <script>
        (function() {
            const vscode = acquireVsCodeApi();
            let isScrolling = false;
            let currentEditMode = ${isEditMode};
            let saveTimeout = null;
            
            // Initialize
            if (currentEditMode) {
                setupEditMode();
            } else {
                setupPreviewMode();
            }
            
            function setupEditMode() {
                const editableDiv = document.getElementById('editable-content');
                if (!editableDiv) return;
                
                // Focus and set cursor at end
                setTimeout(() => {
                    editableDiv.focus();
                    if (window.getSelection) {
                        const range = document.createRange();
                        range.selectNodeContents(editableDiv);
                        range.collapse(false);
                        const selection = window.getSelection();
                        selection.removeAllRanges();
                        selection.addRange(range);
                    }
                }, 100);
                
                // Auto-save on changes (only sends htmlChanged, does NOT toggle view)
                editableDiv.addEventListener('input', debounce(() => {
                    vscode.postMessage({
                        command: 'htmlChanged',
                        html: editableDiv.innerHTML
                    });
                }, 1000));
                
                // Handle paste event to clean up formatting
                editableDiv.addEventListener('paste', (e) => {
                    e.preventDefault();
                    const text = e.clipboardData.getData('text/plain');
                    document.execCommand('insertText', false, text);
                });
                
                // Toolbar functionality (only for existing buttons)
                const boldBtn = document.getElementById('boldBtn');
                const italicBtn = document.getElementById('italicBtn');
                const bulletListBtn = document.getElementById('bulletListBtn');
                const numberListBtn = document.getElementById('numberListBtn');
                const alignLeftBtn = document.getElementById('alignLeftBtn');
                const alignCenterBtn = document.getElementById('alignCenterBtn');
                const alignRightBtn = document.getElementById('alignRightBtn');
                const formatSelect = document.getElementById('formatSelect');
                const saveBtn = document.getElementById('saveBtn');

                if (boldBtn) boldBtn.addEventListener('click', () => { document.execCommand('bold'); editableDiv.focus(); });
                if (italicBtn) italicBtn.addEventListener('click', () => { document.execCommand('italic'); editableDiv.focus(); });
                if (bulletListBtn) bulletListBtn.addEventListener('click', () => { document.execCommand('insertUnorderedList'); editableDiv.focus(); });
                if (numberListBtn) numberListBtn.addEventListener('click', () => { document.execCommand('insertOrderedList'); editableDiv.focus(); });

                if (alignLeftBtn) alignLeftBtn.addEventListener('click', () => { document.execCommand('justifyLeft'); editableDiv.focus(); });
                if (alignCenterBtn) alignCenterBtn.addEventListener('click', () => { document.execCommand('justifyCenter'); editableDiv.focus(); });
                if (alignRightBtn) alignRightBtn.addEventListener('click', () => { document.execCommand('justifyRight'); editableDiv.focus(); });

                if (formatSelect) {
                    formatSelect.addEventListener('change', (e) => {
                        const target = e.target;
                        // @ts-ignore
                        const format = target.value;
                        if (format) {
                            document.execCommand('formatBlock', false, format);
                            // @ts-ignore
                            target.value = '';
                        }
                        editableDiv.focus();
                    });
                }

                // SAVE: send htmlChanged, then toggle edit mode (so preview will show and toolbar collapses)
                if (saveBtn) {
                    saveBtn.addEventListener('click', () => {
                        vscode.postMessage({
                            command: 'htmlChanged',
                            html: editableDiv.innerHTML
                        });

                        // Let extension convert and then switch to preview (extension toggles isEditMode)
                        vscode.postMessage({
                            command: 'toggleEditMode'
                        });

                        // optional feedback
                        vscode.postMessage({
                            command: 'alert',
                            text: 'Changes saved!'
                        });
                    });
                }
                
                // Keyboard shortcuts inside editable area
                editableDiv.addEventListener('keydown', (e) => {
                    if (e.ctrlKey || e.metaKey) {
                        switch(e.key.toLowerCase()) {
                            case 'b':
                                e.preventDefault();
                                document.execCommand('bold');
                                break;
                            case 'i':
                                e.preventDefault();
                                document.execCommand('italic');
                                break;
                            case 'u':
                                e.preventDefault();
                                document.execCommand('underline');
                                break;
                            case 'k':
                                e.preventDefault();
                                const url = prompt('Enter URL:', 'https://');
                                if (url) {
                                    document.execCommand('createLink', false, url);
                                }
                                break;
                            case 's':
                                e.preventDefault();
                                // Save + switch to preview
                                vscode.postMessage({
                                    command: 'htmlChanged',
                                    html: editableDiv.innerHTML
                                });
                                vscode.postMessage({
                                    command: 'toggleEditMode'
                                });
                                vscode.postMessage({
                                    command: 'alert',
                                    text: 'Changes saved!'
                                });
                                break;
                        }
                    }
                });
            }
            
            function setupPreviewMode() {
                // Handle clicks on links
                document.addEventListener('click', event => {
                    const target = event.target;
                    // only react to real anchors
                    if (target && target.tagName === 'A' && target.href) {
                        event.preventDefault();
                        vscode.postMessage({
                            command: 'alert',
                            text: 'Link clicked: ' + target.href
                        });
                    }
                });
            }
            
            // Toggle edit mode button
            const toggleBtn = document.getElementById('toggleEditBtn');
            if (toggleBtn) {
                toggleBtn.addEventListener('click', () => {
                    vscode.postMessage({
                        command: 'toggleEditMode'
                    });
                });
            }
            
            // Handle scroll sync from editor
            window.addEventListener('message', event => {
                const message = event.data;
                
                switch (message.command) {
                    case 'scroll':
                        if (!isScrolling) {
                            syncScrollFromEditor(message.percentage);
                        }
                        break;
                    case 'setInitialContent':
                        if (currentEditMode && message.isEditMode) {
                            const editableDiv = document.getElementById('editable-content');
                            if (editableDiv) {
                                editableDiv.innerHTML = message.html;
                            }
                        }
                        break;
                    case 'setPreviewContent':
                        // if in preview, update preview html (used if extension wants to push new HTML)
                        const preview = document.getElementById('preview-container');
                        if (preview) preview.innerHTML = message.html || '';
                        break;
                }
            });
            
            function syncScrollFromEditor(percentage) {
                const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
                const targetScroll = Math.max(0, scrollHeight * percentage);
                
                isScrolling = true;
                window.scrollTo({
                    top: targetScroll,
                    behavior: 'smooth'
                });
                
                setTimeout(() => {
                    isScrolling = false;
                }, 100);
            }
            
            // Render math with MathJax
            if (window.MathJax) {
                MathJax.typesetPromise().catch(err => {
                    console.error('MathJax rendering error:', err);
                });
            }
            
            // Debounce function for auto-save
            function debounce(func, wait) {
                return function executedFunction(...args) {
                    const later = () => {
                        clearTimeout(saveTimeout);
                        func(...args);
                    };
                    clearTimeout(saveTimeout);
                    saveTimeout = setTimeout(later, wait);
                };
            }
            
            // Send initial content request
            vscode.postMessage({
                command: 'requestInitialContent'
            });
        })();
    </script>
</body>
</html>`;
    }

    private getStyles(theme: string, isEditMode: boolean): string {
        const isDark = theme === 'dark';

        const colors = {
            bg: isDark ? '#1e1e1e' : '#ffffff',
            fg: isDark ? '#d4d4d4' : '#333333',
            heading: isDark ? '#ffffff' : '#000000',
            border: isDark ? '#404040' : '#e1e4e8',
            codeBg: isDark ? '#2d2d2d' : '#f6f8fa',
            codeText: isDark ? '#e6e6e6' : '#24292e',
            quoteFg: isDark ? '#8e8e8e' : '#6a737d',
            linkColor: isDark ? '#58a6ff' : '#0366d6',
            tableBg: isDark ? '#252525' : '#f6f8fa',
            tableHeaderBg: isDark ? '#2d2d2d' : '#f6f8fa',
            toolbarBg: isDark ? '#252525' : '#f5f5f5',
            toolbarBorder: isDark ? '#333' : '#ddd',
            buttonBg: isDark ? '#333' : '#eee',
            buttonHover: isDark ? '#444' : '#ddd'
        };

        const editModeStyles = isEditMode ? `
            #toolbar {
                display: flex !important;
                align-items: center;
                gap: 8px;
                padding: 10px;
                background: ${colors.toolbarBg};
                border-bottom: 1px solid ${colors.toolbarBorder};
                position: sticky;
                top: 0;
                z-index: 1000;
                flex-wrap: wrap;
            }
            
            #toolbar button {
                padding: 6px 12px;
                background: ${colors.buttonBg};
                border: 1px solid ${colors.border};
                border-radius: 4px;
                color: ${colors.fg};
                cursor: pointer;
                font-size: 14px;
                transition: background 0.2s;
                min-width: 32px;
            }
            
            #toolbar button:hover {
                background: ${colors.buttonHover};
            }
            
            #toolbar button:active {
                transform: scale(0.95);
            }
            
            #formatSelect {
                padding: 6px 10px;
                background: ${colors.buttonBg};
                border: 1px solid ${colors.border};
                border-radius: 4px;
                color: ${colors.fg};
                cursor: pointer;
                font-size: 14px;
            }
            
            .separator {
                width: 1px;
                height: 24px;
                background: ${colors.border};
                margin: 0 4px;
            }
            
            #editTools {
                display: flex !important;
                align-items: center;
                gap: 8px;
                flex-wrap: wrap;
            }
            
            .editable-preview {
                min-height: 500px;
                padding: 20px 30px;
                outline: none;
                max-width: 980px;
                margin: 0 auto;
            }
            
            .editable-preview:focus {
                outline: 2px solid ${colors.linkColor};
                outline-offset: 4px;
            }
            
            .editable-preview h1,
            .editable-preview h2,
            .editable-preview h3,
            .editable-preview h4,
            .editable-preview h5,
            .editable-preview h6 {
                cursor: text;
            }
            
            .editable-preview p,
            .editable-preview li,
            .editable-preview blockquote {
                cursor: text;
            }
            
            .editable-preview pre,
            .editable-preview code {
                cursor: text;
                user-select: text;
            }
            
            .editable-preview a {
                cursor: pointer;
            }
            
            .editable-preview [contenteditable="false"] {
                cursor: default;
            }
        ` : `
            #toolbar {
                display: flex !important;
                align-items: center;
                gap: 8px;
                padding: 10px;
                background: ${colors.toolbarBg};
                border-bottom: 1px solid ${colors.toolbarBorder};
                position: sticky;
                top: 0;
                z-index: 1000;
            }
            
            #toolbar button {
                padding: 6px 12px;
                background: ${colors.buttonBg};
                border: 1px solid ${colors.border};
                border-radius: 4px;
                color: ${colors.fg};
                cursor: pointer;
                font-size: 14px;
                transition: background 0.2s;
            }
            
            #toolbar button:hover {
                background: ${colors.buttonHover};
            }
            
            #editTools {
                display: none !important;
            }
        `;

        return `
* {
    box-sizing: border-box;
}

html {
    scroll-behavior: smooth;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe WPC', 'Segoe UI', system-ui, 'Ubuntu', 'Droid Sans', sans-serif;
    font-size: 14px;
    line-height: 1.6;
    padding: 0;
    margin: 0;
    background-color: ${colors.bg};
    color: ${colors.fg};
    word-wrap: break-word;
}

#preview-container {
    max-width: 980px;
    margin: 0 auto;
    padding: 20px 30px;
}

/* Headings */
h1, h2, h3, h4, h5, h6 {
    margin-top: 24px;
    margin-bottom: 16px;
    font-weight: 600;
    line-height: 1.25;
    color: ${colors.heading};
}

h1 { 
    font-size: 2em; 
    border-bottom: 1px solid ${colors.border};
    padding-bottom: 0.3em;
    margin-top: 0;
}

h2 { 
    font-size: 1.5em; 
    border-bottom: 1px solid ${colors.border};
    padding-bottom: 0.3em;
}

h3 { font-size: 1.25em; }
h4 { font-size: 1em; }
h5 { font-size: 0.875em; }
h6 { 
    font-size: 0.85em; 
    color: ${colors.quoteFg}; 
}

/* Paragraphs */
p {
    margin-top: 0;
    margin-bottom: 16px;
}

/* Links */
a {
    color: ${colors.linkColor};
    text-decoration: none;
}

a:hover {
    text-decoration: underline;
}

/* Lists */
ul, ol {
    padding-left: 2em;
    margin-top: 0;
    margin-bottom: 16px;
}

li + li {
    margin-top: 0.25em;
}

li > p {
    margin-bottom: 0;
}

/* Code */
code {
    font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
    font-size: 85%;
    background-color: ${colors.codeBg};
    padding: 0.2em 0.4em;
    border-radius: 3px;
    color: ${colors.codeText};
}

pre {
    background-color: ${colors.codeBg};
    border-radius: 6px;
    padding: 16px;
    overflow: auto;
    line-height: 1.45;
    margin-top: 0;
    margin-bottom: 16px;
}

pre code {
    background-color: transparent;
    padding: 0;
    font-size: 100%;
    border-radius: 0;
    display: block;
    overflow-x: auto;
}

/* Blockquotes */
blockquote {
    margin: 0 0 16px 0;
    padding: 0 1em;
    color: ${colors.quoteFg};
    border-left: 0.25em solid ${colors.border};
}

blockquote > :first-child {
    margin-top: 0;
}

blockquote > :last-child {
    margin-bottom: 0;
}

/* Tables */
table {
    border-collapse: collapse;
    border-spacing: 0;
    width: 100%;
    overflow: auto;
    margin-top: 0;
    margin-bottom: 16px;
}

table th {
    font-weight: 600;
    background-color: ${colors.tableHeaderBg};
    padding: 6px 13px;
    border: 1px solid ${colors.border};
}

table td {
    padding: 6px 13px;
    border: 1px solid ${colors.border};
}

table tr {
    background-color: ${colors.bg};
    border-top: 1px solid ${colors.border};
}

table tr:nth-child(2n) {
    background-color: ${colors.tableBg};
}

/* Horizontal rule */
hr {
    height: 0.25em;
    padding: 0;
    margin: 24px 0;
    background-color: ${colors.border};
    border: 0;
}

/* Images */
img {
    max-width: 100%;
    height: auto;
    display: block;
    margin: 16px 0;
}

/* Task lists */
input[type="checkbox"] {
    margin-right: 0.5em;
}

/* Syntax highlighting override */
.hljs {
    background: ${colors.codeBg} !important;
    color: ${colors.codeText};
}

/* Math */
.MathJax {
    font-size: 1.1em !important;
}

mjx-container {
    overflow-x: auto;
    overflow-y: hidden;
}

/* Ensure proper spacing */
* + h1,
* + h2,
* + h3,
* + h4,
* + h5,
* + h6 {
    margin-top: 24px;
}

li > p + p {
    margin-top: 16px;
}

${editModeStyles}
        `;
    }

    public dispose() {
        if (this.panel) {
            this.panel.dispose();
        }

        while (this.disposables.length) {
            const disposable = this.disposables.pop();
            if (disposable) {
                disposable.dispose();
            }
        }
    }
}


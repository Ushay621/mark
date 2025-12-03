export function getPreviewStyles(theme: 'light' | 'dark'): string {
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
        linkHover: isDark ? '#79c0ff' : '#0550ae',
        tableBg: isDark ? '#252525' : '#f6f8fa',
        tableHeaderBg: isDark ? '#2d2d2d' : '#f6f8fa',
        inlineCodeBorder: isDark ? '#444444' : '#d1d5da',
        selectionBg: isDark ? '#264f78' : '#add6ff'
    };

    return `
/* Reset and Base Styles */
* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

html {
    scroll-behavior: smooth;
    font-size: 16px;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe WPC', 'Segoe UI', system-ui, 'Ubuntu', 'Droid Sans', sans-serif;
    font-size: 14px;
    line-height: 1.6;
    background-color: ${colors.bg};
    color: ${colors.fg};
    word-wrap: break-word;
    overflow-x: hidden;
}

::selection {
    background-color: ${colors.selectionBg};
}

/* Container */
#preview-container {
    max-width: 980px;
    margin: 0 auto;
    padding: 20px 30px 60px;
    min-height: 100vh;
}

/* Typography - Headings */
h1, h2, h3, h4, h5, h6 {
    margin-top: 24px;
    margin-bottom: 16px;
    font-weight: 600;
    line-height: 1.25;
    color: ${colors.heading};
}

h1:first-child,
h2:first-child,
h3:first-child,
h4:first-child,
h5:first-child,
h6:first-child {
    margin-top: 0;
}

h1 { 
    font-size: 2em; 
    border-bottom: 1px solid ${colors.border};
    padding-bottom: 0.3em;
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

/* Typography - Paragraphs */
p {
    margin-top: 0;
    margin-bottom: 16px;
}

/* Links */
a {
    color: ${colors.linkColor};
    text-decoration: none;
    background-color: transparent;
}

a:hover {
    text-decoration: underline;
    color: ${colors.linkHover};
}

a:active,
a:hover {
    outline-width: 0;
}

/* Emphasis */
strong {
    font-weight: 600;
}

em {
    font-style: italic;
}

/* Lists */
ul, ol {
    padding-left: 2em;
    margin-top: 0;
    margin-bottom: 16px;
}

ul ul,
ul ol,
ol ol,
ol ul {
    margin-top: 0;
    margin-bottom: 0;
}

li {
    word-wrap: break-all;
}

li > p {
    margin-top: 16px;
}

li + li {
    margin-top: 0.25em;
}

dl {
    padding: 0;
}

dl dt {
    padding: 0;
    margin-top: 16px;
    font-size: 1em;
    font-style: italic;
    font-weight: 600;
}

dl dd {
    padding: 0 16px;
    margin-bottom: 16px;
}

/* Code - Inline */
code {
    font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
    font-size: 85%;
    background-color: ${colors.codeBg};
    padding: 0.2em 0.4em;
    border-radius: 3px;
    color: ${colors.codeText};
    border: 1px solid ${colors.inlineCodeBorder};
}

/* Code - Blocks */
pre {
    background-color: ${colors.codeBg};
    border-radius: 6px;
    padding: 16px;
    overflow: auto;
    line-height: 1.45;
    margin-top: 0;
    margin-bottom: 16px;
    font-size: 85%;
    border: 1px solid ${colors.border};
}

pre code {
    background-color: transparent;
    padding: 0;
    margin: 0;
    font-size: 100%;
    border-radius: 0;
    display: block;
    overflow-x: auto;
    border: none;
    line-height: inherit;
    word-break: normal;
    word-wrap: normal;
}

pre > code {
    background: transparent;
    border: 0;
    display: inline;
    padding: 0;
    margin: 0;
    overflow: visible;
    line-height: inherit;
    word-wrap: normal;
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
    display: block;
}

table th {
    font-weight: 600;
    background-color: ${colors.tableHeaderBg};
    padding: 6px 13px;
    border: 1px solid ${colors.border};
    text-align: left;
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

table img {
    background-color: transparent;
}

/* Horizontal Rule */
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
    border-style: none;
}

/* Task Lists */
input[type="checkbox"] {
    margin-right: 0.5em;
    vertical-align: middle;
}

.task-list-item {
    list-style-type: none;
}

.task-list-item input {
    margin: 0 0.2em 0.25em -1.6em;
    vertical-align: middle;
}

/* Keyboard */
kbd {
    display: inline-block;
    padding: 3px 5px;
    font-size: 11px;
    line-height: 10px;
    color: ${colors.fg};
    vertical-align: middle;
    background-color: ${colors.codeBg};
    border: solid 1px ${colors.border};
    border-bottom-color: ${colors.border};
    border-radius: 3px;
    box-shadow: inset 0 -1px 0 ${colors.border};
}

/* Details/Summary */
details {
    margin-bottom: 16px;
}

summary {
    cursor: pointer;
    font-weight: 600;
}

/* Footnotes */
.footnotes {
    font-size: 0.9em;
    color: ${colors.quoteFg};
    border-top: 1px solid ${colors.border};
    padding-top: 16px;
    margin-top: 32px;
}

/* Syntax Highlighting Override */
.hljs {
    background: ${colors.codeBg} !important;
    color: ${colors.codeText} !important;
}

/* Math (MathJax) */
.MathJax {
    font-size: 1.1em !important;
    outline: 0;
}

mjx-container {
    overflow-x: auto;
    overflow-y: hidden;
    display: inline-block;
}

mjx-container[display="true"] {
    display: block;
    text-align: center;
    margin: 1em 0;
}

/* Spacing Rules */
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

/* Print Styles */
@media print {
    body {
        background: white;
        color: black;
    }
    
    a {
        color: blue;
    }
    
    pre,
    blockquote {
        page-break-inside: avoid;
    }
    
    table {
        page-break-inside: avoid;
    }
    
    img {
        max-width: 100% !important;
        page-break-inside: avoid;
    }
}

/* Scrollbar Styling */
::-webkit-scrollbar {
    width: 10px;
    height: 10px;
}

::-webkit-scrollbar-track {
    background: ${colors.bg};
}

::-webkit-scrollbar-thumb {
    background: ${colors.border};
    border-radius: 5px;
}

::-webkit-scrollbar-thumb:hover {
    background: ${colors.quoteFg};
}
    `;
}
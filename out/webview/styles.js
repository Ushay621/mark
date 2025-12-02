"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDarkStyles = getDarkStyles;
exports.getLightStyles = getLightStyles;
function getDarkStyles() {
    return `
    body {
      background-color: #1e1e1e;
      color: #d4d4d4;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      line-height: 1.6;
      padding: 20px;
      margin: 0;
    }

    .markdown-body {
      max-width: 900px;
      margin: 0 auto;
    }

    h1, h2, h3, h4, h5, h6 {
      color: #ffffff;
      margin-top: 24px;
      margin-bottom: 16px;
      font-weight: 600;
      line-height: 1.25;
    }

    h1 { font-size: 2em; border-bottom: 1px solid #404040; padding-bottom: 0.3em; }
    h2 { font-size: 1.5em; border-bottom: 1px solid #404040; padding-bottom: 0.3em; }
    h3 { font-size: 1.25em; }
    h4 { font-size: 1em; }

    a {
      color: #58a6ff;
      text-decoration: none;
    }

    a:hover {
      text-decoration: underline;
    }

    code {
      background-color: #2d2d2d;
      color: #f0f0f0;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
      font-size: 0.9em;
    }

    pre {
      background-color: #2d2d2d;
      padding: 16px;
      border-radius: 6px;
      overflow-x: auto;
    }

    pre code {
      background: none;
      padding: 0;
    }

    blockquote {
      border-left: 4px solid #58a6ff;
      padding-left: 16px;
      color: #8b949e;
      margin: 0;
      margin-bottom: 16px;
    }

    table {
      border-collapse: collapse;
      width: 100%;
      margin-bottom: 16px;
    }

    table th,
    table td {
      padding: 8px 13px;
      border: 1px solid #404040;
    }

    table th {
      background-color: #2d2d2d;
      font-weight: 600;
    }

    table tr:nth-child(even) {
      background-color: #252525;
    }

    img {
      max-width: 100%;
      height: auto;
    }

    ul, ol {
      padding-left: 2em;
    }

    hr {
      border: 0;
      border-top: 1px solid #404040;
      margin: 24px 0;
    }
  `;
}
function getLightStyles() {
    return `
    body {
      background-color: #ffffff;
      color: #24292f;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      line-height: 1.6;
      padding: 20px;
      margin: 0;
    }

    .markdown-body {
      max-width: 900px;
      margin: 0 auto;
    }

    h1, h2, h3, h4, h5, h6 {
      color: #24292f;
      margin-top: 24px;
      margin-bottom: 16px;
      font-weight: 600;
      line-height: 1.25;
    }

    h1 { font-size: 2em; border-bottom: 1px solid #d0d7de; padding-bottom: 0.3em; }
    h2 { font-size: 1.5em; border-bottom: 1px solid #d0d7de; padding-bottom: 0.3em; }
    h3 { font-size: 1.25em; }
    h4 { font-size: 1em; }

    a {
      color: #0969da;
      text-decoration: none;
    }

    a:hover {
      text-decoration: underline;
    }

    code {
      background-color: #f6f8fa;
      color: #24292f;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
      font-size: 0.9em;
    }

    pre {
      background-color: #f6f8fa;
      padding: 16px;
      border-radius: 6px;
      overflow-x: auto;
    }

    pre code {
      background: none;
      padding: 0;
    }

    blockquote {
      border-left: 4px solid #0969da;
      padding-left: 16px;
      color: #57606a;
      margin: 0;
      margin-bottom: 16px;
    }

    table {
      border-collapse: collapse;
      width: 100%;
      margin-bottom: 16px;
    }

    table th,
    table td {
      padding: 8px 13px;
      border: 1px solid #d0d7de;
    }

    table th {
      background-color: #f6f8fa;
      font-weight: 600;
    }

    table tr:nth-child(even) {
      background-color: #f6f8fa;
    }

    img {
      max-width: 100%;
      height: auto;
    }

    ul, ol {
      padding-left: 2em;
    }

    hr {
      border: 0;
      border-top: 1px solid #d0d7de;
      margin: 24px 0;
    }
  `;
}
//# sourceMappingURL=styles.js.map
/**
 * Generates a full HTML report from the entire chat history and triggers
 * a browser download of the .html file.
 */
export function exportChatAsHtml(messages, datasetFilename) {
  const now = new Date().toLocaleString();
  const assistantMessages = messages.filter(
    (m) => m.role === "assistant" && m.sql
  );

  if (assistantMessages.length === 0) return; // nothing to export

  const sections = messages
    .map((m, i) => {
      if (m.role === "user") {
        return `
          <div class="message user-message">
            <div class="bubble user-bubble">${escHtml(m.content)}</div>
          </div>`;
      }

      const hasData = m.columns?.length > 0 && m.rows?.length > 0;

      const tableHtml = hasData
        ? `
          <div class="table-wrap">
            <table>
              <thead><tr>${m.columns.map((c) => `<th>${escHtml(c)}</th>`).join("")}</tr></thead>
              <tbody>
                ${m.rows
                  .map(
                    (row) =>
                      `<tr>${m.columns.map((c) => `<td>${escHtml(String(row[c] ?? ""))}</td>`).join("")}</tr>`
                  )
                  .join("\n")}
              </tbody>
            </table>
          </div>`
        : "";

      const sqlHtml = m.sql
        ? `<div class="sql-block"><span class="label">SQL</span><pre><code>${escHtml(m.sql)}</code></pre></div>`
        : "";

      const warningHtml = m.warning
        ? `<div class="warning">⚠️ ${escHtml(m.warning)}</div>`
        : "";

      return `
        <div class="message ai-message">
          <div class="bubble ai-bubble">${escHtml(m.answer || m.content || "")}</div>
          ${warningHtml}
          ${sqlHtml}
          ${tableHtml}
        </div>`;
    })
    .join("\n");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Chat Report — ${escHtml(datasetFilename)}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
           background: #f8fafc; color: #1e293b; padding: 32px 20px; }
    .report-header { max-width: 860px; margin: 0 auto 32px; }
    .report-header h1 { font-size: 1.5rem; font-weight: 700; color: #0f172a; }
    .report-header p { margin-top: 4px; font-size: 0.85rem; color: #64748b; }
    .chat { max-width: 860px; margin: 0 auto; display: flex; flex-direction: column; gap: 16px; }
    .message { display: flex; flex-direction: column; }
    .user-message { align-items: flex-end; }
    .ai-message { align-items: flex-start; }
    .bubble { max-width: 80%; padding: 10px 14px; border-radius: 12px;
              font-size: 0.9rem; line-height: 1.55; word-break: break-word; }
    .user-bubble { background: #6366f1; color: #fff; border-bottom-right-radius: 4px; }
    .ai-bubble { background: #e2e8f0; color: #1e293b; border-bottom-left-radius: 4px; }
    .sql-block { margin-top: 8px; background: #1e293b; border-radius: 8px;
                 padding: 12px 14px; max-width: 100%; overflow-x: auto; }
    .sql-block .label { display: inline-block; font-size: 0.7rem; font-weight: 700;
                        letter-spacing: .05em; color: #94a3b8; margin-bottom: 6px; }
    .sql-block pre code { font-family: 'Fira Code', Consolas, monospace;
                          font-size: 0.8rem; color: #a5f3fc; white-space: pre-wrap; }
    .table-wrap { margin-top: 8px; overflow-x: auto; border-radius: 8px;
                  border: 1px solid #e2e8f0; }
    table { border-collapse: collapse; width: 100%; font-size: 0.8rem; }
    thead { background: #f1f5f9; }
    th { padding: 8px 12px; text-align: left; font-weight: 600; color: #475569;
         border-bottom: 1px solid #e2e8f0; white-space: nowrap; }
    td { padding: 6px 12px; color: #334155; border-bottom: 1px solid #f1f5f9;
         white-space: nowrap; max-width: 240px; overflow: hidden; text-overflow: ellipsis; }
    tr:nth-child(even) td { background: #f8fafc; }
    .warning { margin-top: 6px; background: #fef9c3; border: 1px solid #fde047;
               color: #854d0e; padding: 8px 12px; border-radius: 8px; font-size: 0.82rem; }
    @media print { body { background: #fff; } .sql-block { background: #f1f5f9; }
                   .sql-block pre code { color: #0f172a; } }
  </style>
</head>
<body>
  <div class="report-header">
    <h1>📊 Chat Report — ${escHtml(datasetFilename)}</h1>
    <p>Exported on ${escHtml(now)} · ${assistantMessages.length} query result${assistantMessages.length !== 1 ? "s" : ""}</p>
  </div>
  <div class="chat">
    ${sections}
  </div>
</body>
</html>`;

  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `chat-report-${datasetFilename.replace(/\.[^.]+$/, "")}.html`;
  a.click();
  URL.revokeObjectURL(url);
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

import React, { useState } from "react";

export default function SqlViewer({ sql }) {
  const [copied, setCopied] = useState(false);
  if (!sql) return null;

  const copy = async () => {
    await navigator.clipboard.writeText(sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
      <div className="flex items-center justify-between px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-xs">
        <span className="font-medium">Generated SQL</span>
        <button onClick={copy} className="hover:underline">
          {copied ? "Copied ✓" : "Copy"}
        </button>
      </div>
      <pre className="p-3 text-xs overflow-x-auto bg-gray-950 text-gray-100">
        <code>{sql}</code>
      </pre>
    </div>
  );
}

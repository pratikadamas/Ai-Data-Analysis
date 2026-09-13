import React, { useState } from "react";
import { Check, Copy } from "lucide-react";

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
        <button onClick={copy} className="inline-flex items-center gap-1 hover:underline cursor-pointer">
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-3 text-xs overflow-x-auto bg-gray-950 text-gray-100">
        <code>{sql}</code>
      </pre>
    </div>
  );
}

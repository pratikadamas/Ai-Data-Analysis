import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { getSchema, getSchemas, getDatasetPreview } from "../services/api";

const DatasetContext = createContext(null);

// ─── sessionStorage key ───────────────────────────────────────────────────────
const SESSION_KEY_ID = "ag_dataset_id";

function sessionReadId() {
  try { return sessionStorage.getItem(SESSION_KEY_ID) || null; } catch { return null; }
}
function sessionSaveId(datasetId) {
  try {
    if (datasetId) sessionStorage.setItem(SESSION_KEY_ID, datasetId);
    else sessionStorage.removeItem(SESSION_KEY_ID);
  } catch { /* ignore */ }
}
function sessionClear() {
  try { sessionStorage.removeItem(SESSION_KEY_ID); } catch { /* ignore */ }
}

// ─── Provider ────────────────────────────────────────────────────────────────
export function DatasetProvider({ children }) {
  // dataset shape:
  //   {
  //     dataset_id,          ← latest upload's id (used by AI chat)
  //     files: [             ← ALL files uploaded across ALL uploads
  //       { filename, file_type, table_name, schema, preview_rows, dataset_id }
  //     ],
  //     filename, schema, preview_rows  ← derived from activeFileIndex
  //   }
  const [dataset, setDatasetRaw] = useState(null);

  // Which file index is currently "active" (used in Preview & Chat)
  const [activeFileIndex, setActiveFileIndex] = useState(0);

  const [chatMessages, setChatMessages] = useState([]);
  const [sessionVerified, setSessionVerified] = useState(false);
  const verifyCalledRef = useRef(false);

  // ── Derived active file ───────────────────────────────────────────────────
  const activeFile = activeFileIndex === -1 ? null : (dataset?.files?.[activeFileIndex] ?? dataset?.files?.[0] ?? null);

  // ── On first mount: restore from the stored dataset_id ───────────────────
  useEffect(() => {
    if (verifyCalledRef.current) return;
    verifyCalledRef.current = true;

    const storedId = sessionReadId();
    if (!storedId) { setSessionVerified(true); return; }

    Promise.all([getSchemas(storedId), getDatasetPreview(storedId)])
      .then(([schemasRes, previewRes]) => {
        const schemasList = schemasRes.data || [];
        const previewMap = previewRes.data || {};
        const files = schemasList.map((schemaData) => ({
          filename: schemaData.table_name,
          file_type: "",
          table_name: schemaData.table_name,
          schema: schemaData,
          preview_rows: previewMap[schemaData.table_name] ?? [],
          dataset_id: storedId,
        }));

        if (files.length > 0) {
          setDatasetRaw({
            dataset_id: storedId,
            files,
            filename: files.length === 1 ? files[0].filename : `${files.length} files`,
            schema: files[0]?.schema,
            preview_rows: files[0]?.preview_rows || [],
          });
        }
        setSessionVerified(true);
      })
      .catch(() => { sessionClear(); setSessionVerified(true); });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Tab-close cleanup (only triggers when closing tab/navigating away) ───
  useEffect(() => {
    const handlePageHide = () => {
      const currentId = sessionReadId();
      if (currentId) {
        const baseUrl = import.meta.env.VITE_API_URL || "/api";
        try {
          navigator.sendBeacon(`${baseUrl}/dataset/${currentId}/cleanup`);
        } catch {
          /* ignore */
        }
      }
    };
    window.addEventListener("pagehide", handlePageHide);
    return () => window.removeEventListener("pagehide", handlePageHide);
  }, []);

  // ── Persist ONLY the dataset_id whenever it changes ──────────────────────
  useEffect(() => {
    if (!sessionVerified) return;
    sessionSaveId(dataset?.dataset_id ?? null);
  }, [dataset, sessionVerified]);

  // ── Public setDataset (replaces everything — used on first upload) ────────
  const setDataset = useCallback((data) => {
    if (!data) { setDatasetRaw(null); return; }
    const files = (data.files || []).map((f) => ({ ...f, dataset_id: data.dataset_id }));
    setDatasetRaw({
      dataset_id: data.dataset_id,
      files,
      filename: files.length === 1 ? files[0].filename : `${files.length} files`,
      schema: files[0]?.schema,
      preview_rows: files[0]?.preview_rows || [],
    });
    setActiveFileIndex(0);
  }, []);

  // ── appendDataset: merges a new upload into existing files list ────────────
  // Used when uploading individual files one-by-one so we don't lose earlier ones.
  const appendDataset = useCallback((data) => {
    if (!data) return;
    const newFiles = (data.files || []).map((f) => ({ ...f, dataset_id: data.dataset_id }));
    setDatasetRaw((prev) => {
      const existing = prev?.files || [];
      const merged = [...existing];
      for (const nf of newFiles) {
        const idx = merged.findIndex((f) => f.table_name === nf.table_name);
        if (idx >= 0) {
          merged[idx] = nf;
        } else {
          merged.push(nf);
        }
      }
      return {
        dataset_id: data.dataset_id, // latest upload id
        files: merged,
        filename: merged.length === 1 ? merged[0].filename : `${merged.length} files`,
        schema: merged[0]?.schema,
        preview_rows: merged[0]?.preview_rows || [],
      };
    });
  }, []);

  // ── Public clearDataset ───────────────────────────────────────────────────
  const clearDataset = useCallback(() => {
    setDatasetRaw(null);
    setChatMessages([]);
    setActiveFileIndex(0);
    sessionClear();
  }, []);

  // ── Public clearChat ──────────────────────────────────────────────────────
  const clearChat = useCallback(() => setChatMessages([]), []);

  return (
    <DatasetContext.Provider
      value={{
        dataset,
        setDataset,
        appendDataset,
        clearDataset,
        activeFile,
        activeFileIndex,
        setActiveFileIndex,
        chatMessages,
        setChatMessages,
        clearChat,
        sessionVerified,
      }}
    >
      {children}
    </DatasetContext.Provider>
  );
}

export function useDataset() {
  const ctx = useContext(DatasetContext);
  if (!ctx) throw new Error("useDataset must be used within a DatasetProvider");
  return ctx;
}

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { getSchema, getSchemas, getDatasetPreview, deleteDataset } from "../services/api";

const DatasetContext = createContext(null);

// ─── sessionStorage keys & helpers ───────────────────────────────────────────
const SESSION_KEY_ID = "ag_dataset_id";
const RELOAD_KEY = "ag_is_reloading";

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
  try {
    sessionStorage.removeItem(SESSION_KEY_ID);
    sessionStorage.removeItem(RELOAD_KEY);
  } catch { /* ignore */ }
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

  // ── Smart Tab-Close Cleanup (survives F5 refresh, cleans up on tab close) ───
  useEffect(() => {
    // Set flag when page is being refreshed / reloaded
    const handleBeforeUnload = () => {
      try {
        sessionStorage.setItem(RELOAD_KEY, "true");
      } catch {
        /* ignore */
      }
    };

    const handlePageHide = () => {
      const isReloading = sessionStorage.getItem(RELOAD_KEY) === "true";
      const currentId = sessionReadId();

      // If NOT a page refresh and a dataset exists, send beacon to clean up tab connection
      if (!isReloading && currentId) {
        const baseUrl = import.meta.env.VITE_API_URL || "/api";
        try {
          navigator.sendBeacon(`${baseUrl}/dataset/${currentId}/cleanup`);
        } catch {
          /* ignore */
        }
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("pagehide", handlePageHide);

    // Reset reload flag shortly after mount
    const timer = setTimeout(() => {
      try {
        sessionStorage.removeItem(RELOAD_KEY);
      } catch {
        /* ignore */
      }
    }, 1000);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("pagehide", handlePageHide);
      clearTimeout(timer);
    };
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
    const currentId = dataset?.dataset_id;
    if (currentId) {
      deleteDataset(currentId).catch(() => {});
    }
    setDatasetRaw(null);
    setChatMessages([]);
    setActiveFileIndex(0);
    sessionClear();
  }, [dataset]);

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

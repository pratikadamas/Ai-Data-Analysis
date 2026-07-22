import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { getSchema, getDatasetPreview } from "../services/api";

const DatasetContext = createContext(null);

// ─── sessionStorage key ───────────────────────────────────────────────────────
// We store ONLY the dataset_id (a 12-char hex string, ~12 bytes).
// preview_rows (can be MBs) and chatMessages are kept in React memory only and
// are intentionally NOT persisted — they are re-fetched from the backend on
// page refresh, so sessionStorage never grows large.
const SESSION_KEY_ID = "ag_dataset_id";

/** Read a raw string from sessionStorage safely. Returns null on any error. */
function sessionReadId() {
  try {
    return sessionStorage.getItem(SESSION_KEY_ID) || null;
  } catch {
    return null;
  }
}

/** Write the dataset_id string to sessionStorage safely. */
function sessionSaveId(datasetId) {
  try {
    if (datasetId) {
      sessionStorage.setItem(SESSION_KEY_ID, datasetId);
    } else {
      sessionStorage.removeItem(SESSION_KEY_ID);
    }
  } catch {
    // sessionStorage unavailable — silently continue
  }
}

/** Clear all keys written by this context. */
function sessionClear() {
  try {
    sessionStorage.removeItem(SESSION_KEY_ID);
  } catch {
    // ignore
  }
}

// ─── Provider ────────────────────────────────────────────────────────────────

export function DatasetProvider({ children }) {
  // dataset shape: { dataset_id, files: [{ filename, file_type, table_name, schema, preview_rows }] }
  // or null when nothing is uploaded.
  const [dataset, setDatasetRaw] = useState(null);

  // Chat messages live in memory only — not stored in sessionStorage.
  // They are cleared on every page load/refresh (intentional, keeps storage small).
  const [chatMessages, setChatMessages] = useState([]);

  // false while we're doing the async backend-verify + preview re-fetch on restore.
  const [sessionVerified, setSessionVerified] = useState(false);

  // Prevent double-verify on React StrictMode double-mount in development.
  const verifyCalledRef = useRef(false);

  // ── On first mount: restore from the stored dataset_id ──────────────────
  useEffect(() => {
    if (verifyCalledRef.current) return;
    verifyCalledRef.current = true;

    const storedId = sessionReadId();
    if (!storedId) {
      // No previous session — go straight to upload screen.
      setSessionVerified(true);
      return;
    }

    // Verify the backend still has this session (it won't after a server restart).
    // On success, also fetch fresh schema + preview rows so we never store large
    // data in sessionStorage.
    Promise.all([
      getSchema(storedId),
      getDatasetPreview(storedId),
    ])
      .then(([schemaRes, previewRes]) => {
        const schemaData = schemaRes.data;        // DatasetSchema for primary table
        const previewMap = previewRes.data;       // { table_name: [rows] }

        // Reconstruct the dataset object from fresh server data.
        // schemaData contains dataset_id, table_name, columns, row_count, etc.
        setDatasetRaw({
          dataset_id: storedId,
          // Minimal file info — we don't know original filenames after restore,
          // so we use table_name as a fallback display name.
          files: [{
            filename: schemaData.table_name,
            file_type: "",
            table_name: schemaData.table_name,
            schema: schemaData,
            preview_rows: previewMap[schemaData.table_name] ?? [],
          }],
          filename: schemaData.table_name,
          schema: schemaData,
          preview_rows: previewMap[schemaData.table_name] ?? [],
        });

        setSessionVerified(true);
      })
      .catch(() => {
        // Backend lost the session — clear the stored id and show upload screen.
        sessionClear();
        setSessionVerified(true);
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Tab-close cleanup ────────────────────────────────────────────────────
  //
  // visibilitychange + 5-second timer approach:
  //   - Tab hidden → start timer
  //   - Tab visible again before 5 s (F5 / window switch) → cancel timer, no cleanup
  //   - Tab stays hidden 5 s → it's truly gone →
  //       • Clear sessionStorage (belt-and-suspenders; browser already wipes it on close)
  //       • Fire sendBeacon to free the DuckDB connection on the backend
  useEffect(() => {
    let cleanupTimer = null;

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        cleanupTimer = setTimeout(() => {
          const currentId = sessionReadId();

          // Clear our sessionStorage entry explicitly.
          sessionClear();

          // Notify the backend to free the in-memory DuckDB connection.
          if (currentId) {
            const baseUrl = import.meta.env.VITE_API_URL || "/api";
            try {
              navigator.sendBeacon(`${baseUrl}/dataset/${currentId}/cleanup`);
            } catch {
              // sendBeacon not available (very old browser) — silently skip.
            }
          }

          cleanupTimer = null;
        }, 5000); // 5 s is well beyond any F5 reload time
      } else {
        // Tab became visible again → cancel pending cleanup.
        if (cleanupTimer !== null) {
          clearTimeout(cleanupTimer);
          cleanupTimer = null;
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (cleanupTimer !== null) clearTimeout(cleanupTimer);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Persist ONLY the dataset_id whenever it changes ─────────────────────
  useEffect(() => {
    if (!sessionVerified) return; // don't write until restore is complete
    sessionSaveId(dataset?.dataset_id ?? null);
  }, [dataset, sessionVerified]);

  // ── Public setDataset ─────────────────────────────────────────────────────
  const setDataset = useCallback((data) => {
    if (!data) {
      setDatasetRaw(null);
      return;
    }
    if (data.files) {
      setDatasetRaw({
        dataset_id: data.dataset_id,
        files: data.files,
        filename: data.files.length === 1
          ? data.files[0].filename
          : `${data.files.length} files`,
        schema: data.files[0]?.schema,
        preview_rows: data.files[0]?.preview_rows || [],
      });
    } else {
      setDatasetRaw(data);
    }
  }, []);

  // ── Public clearDataset ──────────────────────────────────────────────────
  const clearDataset = useCallback(() => {
    setDatasetRaw(null);
    setChatMessages([]);
    sessionClear();
  }, []);

  // ── Public clearChat ─────────────────────────────────────────────────────
  const clearChat = useCallback(() => setChatMessages([]), []);

  return (
    <DatasetContext.Provider
      value={{ dataset, setDataset, clearDataset, chatMessages, setChatMessages, clearChat, sessionVerified }}
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

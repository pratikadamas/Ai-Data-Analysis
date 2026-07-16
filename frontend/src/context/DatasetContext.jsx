import React, { createContext, useContext, useState, useCallback } from "react";

const DatasetContext = createContext(null);

export function DatasetProvider({ children }) {
  // dataset shape: { dataset_id, files: [{ filename, file_type, table_name, schema, preview_rows }] }
  // or null when nothing is uploaded
  const [dataset, setDatasetRaw] = useState(null);
  const [chatMessages, setChatMessages] = useState([]); // persists across tab switches

  const setDataset = useCallback((data) => {
    if (!data) {
      setDatasetRaw(null);
      return;
    }
    // Handle new multi-file response format
    if (data.files) {
      setDatasetRaw({
        dataset_id: data.dataset_id,
        files: data.files,
        // Backward-compat: use first file's data for existing components
        filename: data.files.length === 1
          ? data.files[0].filename
          : `${data.files.length} files`,
        schema: data.files[0]?.schema,
        preview_rows: data.files[0]?.preview_rows || [],
      });
    } else {
      // Legacy single-file format
      setDatasetRaw(data);
    }
  }, []);

  const clearDataset = useCallback(() => {
    setDatasetRaw(null);
    setChatMessages([]); // also wipe chat when dataset changes
  }, []);

  const clearChat = useCallback(() => setChatMessages([]), []);

  return (
    <DatasetContext.Provider
      value={{ dataset, setDataset, clearDataset, chatMessages, setChatMessages, clearChat }}
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

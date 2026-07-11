import React, { createContext, useContext, useState, useCallback } from "react";

const DatasetContext = createContext(null);

export function DatasetProvider({ children }) {
  const [dataset, setDataset] = useState(null); // { dataset_id, filename, schema, preview_rows }
  const [chatMessages, setChatMessages] = useState([]); // persists across tab switches

  const clearDataset = useCallback(() => {
    setDataset(null);
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

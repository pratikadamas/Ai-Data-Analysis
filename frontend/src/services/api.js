import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  timeout: 60000,
});

export const uploadDataset = (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return api.post("/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const getSchema = (datasetId) => api.get(`/dataset/${datasetId}/schema`);

export const deleteDataset = (datasetId) => api.delete(`/dataset/${datasetId}`);

export const askQuestion = (datasetId, question, conversationId = null) =>
  api.post("/chat", { dataset_id: datasetId, question, conversation_id: conversationId });

export const explore = (payload) => api.post("/explore", payload);

export const downloadCsv = (datasetId, sql) =>
  api.post(
    "/download/csv",
    { dataset_id: datasetId, sql },
    { responseType: "blob" }
  );

export const downloadExcel = (datasetId, sql) =>
  api.post(
    "/download/excel",
    { dataset_id: datasetId, sql },
    { responseType: "blob" }
  );

export default api;

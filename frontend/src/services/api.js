import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  timeout: 60000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const uploadDataset = (files, datasetId = null) => {
  const formData = new FormData();
  // Support both single file and array of files
  const fileList = Array.isArray(files) ? files : [files];
  fileList.forEach((file) => {
    formData.append("files", file);
  });
  if (datasetId) {
    formData.append("dataset_id", datasetId);
  }
  return api.post("/upload", formData);
};

export const getSchema = (datasetId) => api.get(`/dataset/${datasetId}/schema`);

export const getSchemas = (datasetId) => api.get(`/dataset/${datasetId}/schemas`);

export const getDatasetPreview = (datasetId) => api.get(`/dataset/${datasetId}/preview`);

export const deleteDataset = (datasetId) => api.delete(`/dataset/${datasetId}`);

export const askQuestion = (datasetId, question, conversationId = null, tableName = null) =>
  api.post("/chat", {
    dataset_id: datasetId,
    question,
    conversation_id: conversationId,
    table_name: tableName || null,
  });

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

export const runSqlQuery = (datasetId, sql) =>
  api.post("/sql-editor", { dataset_id: datasetId, sql });

export const getTableList = (datasetId) =>
  api.get(`/sql-editor/${datasetId}/tables`);

export default api;

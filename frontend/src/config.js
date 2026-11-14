// URL backenda se nastavi ob gradnji prek VITE_API_URL (npr. na Renderju).
export const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

export const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL || new URL(API_URL).origin;

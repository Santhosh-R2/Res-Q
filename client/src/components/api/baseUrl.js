import axios from 'axios';

// VITE_API_URL will be set in Vercel settings later
const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const axiosInstance = axios.create({
  baseURL: baseURL,
});

export default axiosInstance;
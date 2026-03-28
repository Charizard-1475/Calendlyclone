import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://calendlyclone-hq1g.onrender.com/api',
});

export default api;

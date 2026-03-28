import axios from 'axios';

const api = axios.create({
  baseURL: 'https://calendlyclone-hq1g.onrender.com/api',
});

export default api;

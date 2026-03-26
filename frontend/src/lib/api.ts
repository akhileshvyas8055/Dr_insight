import axios from 'axios'
export const api = axios.create({
  baseURL: 'https://dr-insights-backend.onrender.com/api/v1'
})

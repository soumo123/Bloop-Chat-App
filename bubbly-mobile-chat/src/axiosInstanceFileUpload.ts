import axios from 'axios'
const apiUrl = import.meta.env.VITE_API_LOCAL_BACKEND_URL;

const axiosInstanceFileUpload = axios.create({
    baseURL: apiUrl,
    headers: {
        "Content-Type": "multipart/form-data" 
    } 
})

axiosInstanceFileUpload.interceptors.request.use((config) => {
    const token = localStorage.getItem("token")
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

export default axiosInstanceFileUpload
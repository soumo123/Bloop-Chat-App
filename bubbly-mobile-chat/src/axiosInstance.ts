import axios from 'axios'
const apiUrl = import.meta.env.VITE_API_LOCAL_BACKEND_URL;

const axiosInstance = axios.create({
    baseURL:apiUrl,
    timeout:2000,
    headers:{
        'Content-Type':'application/json'
    }
})

axiosInstance.interceptors.request.use((config)=>{
    const token = localStorage.getItem("token")
    if(token){
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

export default axiosInstance
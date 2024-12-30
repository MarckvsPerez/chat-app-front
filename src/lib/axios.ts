import axios from "axios"

const api = axios.create({
    baseURL: "http://172.26.251.28:5001/api",
    withCredentials: true,
})

export default api
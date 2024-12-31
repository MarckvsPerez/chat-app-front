import axios from "axios"
import { getStoredTokens } from "./utils"

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getStoredTokens()}`,
    }
})

export default api
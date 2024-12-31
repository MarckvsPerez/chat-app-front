import { create } from "zustand"
import api from "../lib/axios"
import { User } from "../types/User"
import { SignupFormData } from "../pages/SignupPage";
import toast from "react-hot-toast";
import { LoginFormData } from "../pages/LoginPage";
import { UpdateProfileFormData } from "../pages/ProfilePage";
import { io, Socket } from "socket.io-client";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001" : "/";

type AuthStore = {
    authUser: User | null;
    isSigningUp: boolean;
    isLoggingIn: boolean;
    isUpdatingProfile: boolean;
    isCheckingAuth: boolean;
    onlineUsers: string[];
    socket: Socket | null;
    
    checkAuth: () => Promise<void>;
    signup: (data: SignupFormData) => Promise<void>;
    logout: () => Promise<void>;
    login: (data: LoginFormData) => Promise<void>;
    updateProfile: (data: UpdateProfileFormData) => Promise<void>;
    connectSocket: () => void;
    disconnectSocket: () => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
    authUser: null,
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,
    isCheckingAuth: true,
    onlineUsers: [],
    socket: null,

    checkAuth: async () => {
        try {
            const res = await api.get("/auth/check");

            set({ authUser: res.data.user });

            get().connectSocket()
        } catch (error) {
            console.log("Error in checkAuth:", error);
            set({ authUser: null });
        } finally {
            set({ isCheckingAuth: false });
        }
    },

    signup: async (data: SignupFormData) => {
        set({ isSigningUp: true })
        try {
            const response = await api.post("/auth/signup", data)
            toast.success("Signup successful")
            set({ authUser: response.data })
        } catch (error) {
            toast.error("Signup failed")
            console.error(error)
        } finally {
            set({ isSigningUp: false })
        }
    },

    logout: async () => {
        try {
            set({ authUser: null })
            localStorage.removeItem("token")
            toast.success("Logout successful")
            get().disconnectSocket()
        } catch (error) {
            toast.error("Logout failed")
            console.error(error)
        }
    },

    login: async (data: LoginFormData) => {
        set({ isLoggingIn: true })
        try {
            const response = await api.post("/auth/login", data)
            set({ authUser: response.data })
            localStorage.setItem("token", response.data.token)
            toast.success("Login successful")
            get().connectSocket()
        } catch (error) {
            toast.error("Login failed")
            console.error(error)
        } finally {
            set({ isLoggingIn: false })
        }
    },

    updateProfile: async (data) => {
        set({ isUpdatingProfile: true });
        try {
          const res = await api.put("/auth/update-profile", data);
          set({ authUser: res.data });
          toast.success("Profile updated successfully");
        } catch (error) {
          console.log("error in update profile:", error);
          toast.error("Error in update profile");
        } finally {
          set({ isUpdatingProfile: false });
        }
      },
    
      connectSocket: () => {
        const { authUser } = get();
        if (!authUser || get().socket?.connected) return;
    
        const socket = io(BASE_URL, {
          query: {
            userId: authUser._id,
          },
        });
        socket.connect();
    
        set({ socket: socket });
    
        socket.on("getOnlineUsers", (userIds) => {
          set({ onlineUsers: userIds });
        });
      },
      disconnectSocket: () => {
        const socket = get().socket;
        if (socket && socket.connected) socket.disconnect();
      },
    }));
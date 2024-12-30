import { create } from "zustand"
import api from "../lib/axios"
import { User } from "../types/User"
import { SignupFormData } from "../pages/SignupPage";
import toast from "react-hot-toast";
import { LoginFormData } from "../pages/LoginPage";
import { UpdateProfileFormData } from "../pages/ProfilePage";

type AuthStore = {
    authUser: User | null;
    isSigningUp: boolean;
    isLoggingIn: boolean;
    isUpdatingProfile: boolean;
    isCheckingAuth: boolean;

    checkAuth: () => Promise<void>;
    signup: (data: SignupFormData) => Promise<void>;
    logout: () => Promise<void>;
    login: (data: LoginFormData) => Promise<void>;
    updateProfile: (data: UpdateProfileFormData) => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
    authUser: null,
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,

    isCheckingAuth: true,

    checkAuth: async () => {
        try {
            const res = await api.get("/auth/check");

            set({ authUser: res.data.user });
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
            await api.get("/auth/logout")
            set({ authUser: null })
            toast.success("Logout successful")
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
    
}))
import { create } from "zustand";
import toast from "react-hot-toast";
import { AxiosError } from "axios";

import axiosInstance from "../lib/axios";

import { User } from "../types/User";
import { useAuthStore } from "./useAuthStore";

interface Message {
    _id: string;
    text: string;
    image: string | null;
    senderId: string;
    createdAt: string;
}

interface MessageData {
    text: string;
    image: string | null;
}

interface ChatStore {
    messages: Message[];
    users: User[];
    selectedUser: User | null;
    isUsersLoading: boolean;
    isMessagesLoading: boolean;

    getUsers: () => Promise<void>;
    getMessages: (userId: string) => Promise<void>;
    sendMessage: (messageData: MessageData) => Promise<void>;
    setSelectedUser: (selectedUser: User | null) => void;
    subscribeToMessages: () => void;
    unsubscribeFromMessages: () => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
    messages: [],
    users: [],
    selectedUser: null,
    isUsersLoading: false,
    isMessagesLoading: false,

    getUsers: async () => {
        set({ isUsersLoading: true });
        try {
            const res = await axiosInstance.get("/message/users");
            set({ users: res.data });
        } catch (error) {
            if (error instanceof AxiosError) {
                toast.error(error.response?.data.message || "An error occurred");
            } else {
                toast.error("An unexpected error occurred");
            }
        } finally {
            set({ isUsersLoading: false });
        }
    },

    getMessages: async (userId: string) => {
        set({ isMessagesLoading: true });
        try {
            const res = await axiosInstance.get(`/message/${userId}`);
            set({ messages: res.data });
        } catch (error) {
            if (error instanceof AxiosError) {
                toast.error(error.response?.data.message || "An error occurred");
            } else {
                toast.error("An unexpected error occurred");
            }
        } finally {
            set({ isMessagesLoading: false });
        }
    },
    sendMessage: async (messageData: MessageData) => {
        const { selectedUser, messages } = get();
        try {
            const res = await axiosInstance.post(`/message/send/${selectedUser?._id}`, messageData);
            set({ messages: [...messages, res.data] });
        } catch (error) {
            if (error instanceof AxiosError) {
                toast.error(error.response?.data.message || "An error occurred");
            } else {
                toast.error("An unexpected error occurred");
            }
        }
    },

    subscribeToMessages: () => {
        const { selectedUser } = get();
        if (!selectedUser) return;
    
        const socket = useAuthStore.getState().socket;
        if (!socket) return;
        socket.on("newMessage", (newMessage) => {
          const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
          if (!isMessageSentFromSelectedUser) return;
    
          set({
            messages: [...get().messages, newMessage],
          });
        });
      },
    
      unsubscribeFromMessages: () => {
        const socket = useAuthStore.getState().socket;
        if (socket) socket.off("newMessage");
      },

    setSelectedUser: (selectedUser) => set({ selectedUser }),
}));
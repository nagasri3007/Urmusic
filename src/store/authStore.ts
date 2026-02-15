import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Id } from "@convex/_generated/dataModel";

interface AuthStore {
    token: string | null;
    userId: Id<"users"> | null;
    email: string | null;
    name: string | null;
    isAuthenticated: boolean;

    setAuth: (data: {
        token: string;
        userId: Id<"users">;
        email: string;
        name?: string;
    }) => void;
    clearAuth: () => void;
}

export const useAuthStore = create<AuthStore>()(
    persist(
        (set) => ({
            token: null,
            userId: null,
            email: null,
            name: null,
            isAuthenticated: false,

            setAuth: (data) =>
                set({
                    token: data.token,
                    userId: data.userId,
                    email: data.email,
                    name: data.name || null,
                    isAuthenticated: true,
                }),

            clearAuth: () =>
                set({
                    token: null,
                    userId: null,
                    email: null,
                    name: null,
                    isAuthenticated: false,
                }),
        }),
        {
            name: "urmusic-auth",
        }
    )
);

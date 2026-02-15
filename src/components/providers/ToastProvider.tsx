"use client";

import { Toaster } from "react-hot-toast";

export default function ToastProvider() {
    return (
        <Toaster
            position="top-right"
            toastOptions={{
                duration: 3000,
                style: {
                    background: "rgba(26, 26, 46, 0.95)",
                    color: "#fff",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "12px",
                    backdropFilter: "blur(20px)",
                    fontSize: "14px",
                    padding: "12px 16px",
                },
                success: {
                    iconTheme: {
                        primary: "#e040fb",
                        secondary: "#fff",
                    },
                },
                error: {
                    iconTheme: {
                        primary: "#ff5252",
                        secondary: "#fff",
                    },
                },
            }}
        />
    );
}
